from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from django.contrib.auth.models import User
from rest_framework.response import Response
from .serializer import (
    ItemSerializer,
    UserSerializer,
    UserSerializerWithToken,
    EventSerializer,
    EventInviteeSerializer,
    ListSerializer,
    TaskSerializer,
)
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from .models import Item, Event, EventInvitee, Lists, Tasks
from django.views import View
from django.http import HttpResponse, HttpResponseNotFound, HttpResponseRedirect
import os
import json
from rest_framework.decorators import action
import datetime
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from bson import json_util
import json
from bson.objectid import ObjectId

# Create your views here.

# Contains all get/put/post/delete requests for our items api
class ItemView(viewsets.ModelViewSet):
    serializer_class = ItemSerializer
    queryset = Item.objects.all()


# Contains all get/put/post/delete requests for our events api
class EventView(viewsets.ModelViewSet):

    queryset = ""

    def list(self, request):
        """
        Return all events in the system.
        """
        queryset = Event.objects.all()
        serializer_class = EventSerializer(queryset)
        return Response(serializer_class.data)

    # def date_to_yyyymmdd(self, original_date):
    # dateArray = [int(ele) for ele in original_date.split("-")]
    # return datetime.datetime(dateArray[2], dateArray[0], dateArray[1])

    def date_to_mmddyyyy(self, original_date):
        converted_date = original_date.strftime("%m/%d/%Y")
        return converted_date

    def create(self, request):  # Here is the new update comes <<<<
        """
        Create a new event based on the information passed in request.data.
        """
        data = request.data
        start = [int(ele) for ele in data["startDate"].split("-")]
        end = [int(ele) for ele in data["endDate"].split("-")]
        event_data = {
            "name": data["name"],
            "description": data["description"],
            "location": data["location"],
            "startDate": datetime.date(start[0], start[1], start[2]),
            "endDate": datetime.date(end[0], end[1], end[2]),
        }
        eve = Event(**event_data)
        try:
            eve.save()
            event_id = eve._id
        except:
            return Response({"status": "-1"}, status=status.HTTP_400_BAD_REQUEST)
        inviteeData = {
            "user_id": data["user_id"],
            "event_id": event_id,
            "isOwner": True,
        }
        eveInvitee = EventInvitee(**inviteeData)
        try:
            eveInvitee.save()
        except:
            return Response({"status": "-1"}, status=status.HTTP_400_BAD_REQUEST)
        event_invitee_id = eveInvitee._id
        eveInvitee = dict(
            EventInvitee.objects.mongo_find_one({"_id": event_invitee_id})
        )
        Event.objects.mongo_update_one(
            {"id": event_id},
            {"$set": {"creator": eveInvitee}, "$push": {"participants": eveInvitee}},
        )
        return Response({"status": "1"}, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        """
        Return all events being attended by the supplied userId
        """
        print("finding all events for userId " + str(pk))
        queryset = EventInvitee.objects.filter(user_id=pk)
        res = EventInviteeSerializer(queryset, many=True)
        res_json = [dict(i) for i in res.data]
        event_data = []
        for i in range(len(res_json)):
            print("trying to find event record for " + str(res_json[i]["event_id"]))
            event = dict(Event.objects.mongo_find_one({"id": res_json[i]["event_id"]}))
            user = User.objects.get(id=event["creator"]["user_id"])
            start = event["startDate"]
            end = event["endDate"]
            conv_date = self.date_to_mmddyyyy(start)
            event["startDate"] = conv_date
            conv_date = self.date_to_mmddyyyy(end)
            event["endDate"] = conv_date
            event["creator"] = dict(event["creator"])
            event["creator"]["username"] = user.username
            new_participants = list()
            for p in event["participants"]:
                u = User.objects.get(id=p["user_id"])
                p["name"] = u.first_name + " " + u.last_name
                new_participants.append(p)
            event["participants"] = new_participants
            print(event["participants"])
            event = json.dumps(event, default=str)
            event_data.append(event)
        return Response(event_data)

    @action(detail=True, methods=["get"])
    def refresh(self, request, pk=None):
        """
        Get the latest information for an event (in case new changes were just made)
        """
        event = Event.objects.mongo_find_one({"id": int(pk)})
        new_participants_refresh = list()
        for p in event["participants"]:
            u = User.objects.get(id=p["user_id"])
            p["name"] = u.first_name + " " + u.last_name
            new_participants_refresh.append(p)
        event["participants"] = new_participants_refresh
        event = json.dumps(event, default=str)
        print("respond to refresh for " + pk + " with " + event)
        return Response(event)

    def partial_update(self, request, pk=None):
        """
        Update an event with the data passed in request.data
        """
        pk = int(pk)
        converted_start_date = self.date_to_yyyymmdd(request.data.get("startDate"))
        request.data.update({"startDate": converted_start_date})
        converted_end_date = self.date_to_yyyymmdd(request.data.get("endDate"))
        request.data.update({"endDate": converted_end_date})
        Event.objects.mongo_update_one({"id": pk}, {"$set": request.data})
        print(Event.objects.mongo_find_one({"id": pk}))
        return Response({"status": "1"}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        """
        Delete an event, its attendees, its task lists, and their tasks.
        """
        print("Trying to delete " + str(pk))
        event = Event.objects.mongo_find_one({"id": int(pk)})
        if event is not None:
            task_lists = Lists.objects.mongo_find({"creator.event_id": event["id"]})
            list_ids = [
                l["_id"]
                for l in Lists.objects.mongo_find({"creator.event_id": event["id"]})
            ]
            print(
                "Found the following list IDs tied to this event: "
                + ",".join([str(i) for i in list_ids])
            )
            for l_id in list_ids:
                Tasks.objects.mongo_delete_many({"list_id": str(l_id)})
            Lists.objects.mongo_delete_many({"creator.event_id": event["id"]})
            EventInvitee.objects.mongo_delete_many({"event_id": int(pk)})
            Event.objects.mongo_delete_many({"id": int(pk)})
            return Response({"status": "1"}, status=status.HTTP_200_OK)
        return Response({"status": "1"}, status=status.HTTP_200_OK)


# Contains all get/put/post/delete requests for our events api
class ToDoListView(viewsets.ModelViewSet):

    queryset = ""

    def list(self, request):
        """
        Return all task lists in the system.
        """
        queryset = Lists.objects.all()
        serializer_class = ListSerializer(queryset)
        return Response(serializer_class.data)

    def create(self, request):  # Here is the new update comes
        """
        Make a new task list with supplied name and description. Add it to the nested task lists in the parent Event record.
        """
        print(request.data)
        data = request.data
        eventInviteeRecord = EventInvitee.objects.mongo_find_one(
            {"user_id": data["user_id"], "event_id": data["event_id"]}
        )
        eventInviteeRecord = dict(eventInviteeRecord)
        todolist_record = {}  # Create a new todo list here.
        todolist_record["name"] = data["name"]
        todolist_record["description"] = data["description"]
        todolist_record["creator"] = eventInviteeRecord
        todolist_record["tasks"] = []
        todolist = Lists(**todolist_record)
        todolist.save()
        list_id = todolist._id
        list_one = dict(
            Lists.objects.mongo_find_one({"_id": list_id})
        )  # Push this list onto the event.
        Event.objects.mongo_update_one(
            {"id": data["event_id"]}, {"$push": {"todo_lists": list_one}}
        )
        return Response({"status": "1"}, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        """
        Find and return task lists tied to the supplied eventId
        """
        pk = int(pk)
        lists_with_key = Lists.objects.mongo_find({"creator.event_id": pk})
        res_json = [dict(i) for i in lists_with_key]
        for i in range(len(res_json)):
            res_json[i]["creator"] = json.dumps(res_json[i]["creator"], default=str)
            res_json[i] = json.dumps(res_json[i], default=str)
        return Response(res_json, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        """
        Update a task list record, as well as the instance of that record nested in the parent event.
        """
        pk = int(pk)
        Lists.objects.mongo_update_one({"id": pk}, {"$set": request.data})
        list_one2 = dict(Lists.objects.mongo_find_one({"id": pk}))
        Event.objects.mongo_update_one(
            {"id": list_one2["creator"]["event_id"], "todo_lists.id": pk},
            {"$set": {"todo_lists.$": list_one2}},
        )
        print(Lists.objects.mongo_find_one({"id": pk}))
        return Response({"status": "1"}, status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        """
        Delete task list by deleting the record, removing it from being nested in the Event, and deleting associated Tasks.
        """
        list_selected = dict(Lists.objects.mongo_find_one({"_id": ObjectId(pk)}))
        list_selected["creator"] = dict(list_selected["creator"])
        try:
            print("here")
            Event.objects.mongo_update(
                {"id": list_selected["creator"]["event_id"]},
                {"$pull": {"todo_lists": {"_id": ObjectId(pk)}}},
            )
        except Exception as e:
            print("here4")
            return Response(
                {"status": "-1", "message": e, "stage": "list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            Tasks.objects.mongo_delete_many({"list_id": pk})
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            print("here3")
            Lists.objects.mongo_delete_one({"_id": ObjectId(pk)})
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "list"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"status": "1"}, status=status.HTTP_200_OK)


# Contains all get/put/post/delete requests for our events api
class TaskView(viewsets.ModelViewSet):

    queryset = ""

    def list(self, request):
        """
        Return all tasks in the system.
        """
        queryset = Tasks.objects.all()
        serializer_class = TaskSerializer(queryset)
        return Response(serializer_class.data)

    def create(self, request):
        """
        This function creates a new task that is a part of a todo list.
        Arguments:
        request : contains task data.
        """
        data = request.data
        if "invitee_assigned" in data:
            eventInviteeRecord = EventInvitee.objects.mongo_find_one(
                {
                    "user_id": data["invitee_assigned"]["user_id"],
                    "event_id": data["invitee_assigned"]["event_id"],
                }
            )
            eventInviteeRecord = dict(eventInviteeRecord)
        task_record = {}
        task_record["name"] = data["name"]
        task_record["priority"] = data["priority"]
        task_record["completed"] = data["completed"]
        task_record["list_id"] = str(data["list_id"])
        if "invitee_assigned" in data:
            task_record["invitee_assigned"] = eventInviteeRecord
        task = Tasks(**task_record)
        print(task_record)
        task.save()
        task_one = dict(Tasks.objects.mongo_find_one({"_id": task._id}))
        Lists.objects.mongo_update_one(
            {"_id": ObjectId(task_record["list_id"])}, {"$push": {"tasks": task_one}}
        )
        list_one = dict(
            Lists.objects.mongo_find_one({"_id": ObjectId(task_record["list_id"])})
        )
        Event.objects.mongo_update_one(
            {
                "id": data["invitee_assigned"]["event_id"],
                "todo_lists._id": ObjectId(task_record["list_id"]),
            },
            {"$set": {"todo_lists.$": list_one}},
        )
        return Response(
            {"status": "1", "task": json.dumps(task_one, default=str)},
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        """
        This function will give tasks which a user is assigned to. (use in dashboard component)
        Arguments:
        pk : userid
        """
        tasks_with_user = Tasks.objects.mongo_find(
            {"invitee_assigned": {"user_id": pk}}
        )
        res_json = [dict(i) for i in tasks_with_user]
        print(res_json)
        return Response(res_json, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def refresh(self, request, pk=None):
        """
        Return all tasks tied to an event
        """
        tasks_with_list = Tasks.objects.mongo_find({"list_id": pk})
        res_json = [json.dumps(dict(i), default=str) for i in tasks_with_list]
        print(res_json)
        return Response(res_json, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def changeOwner(self, request, pk=None):
        """
        Assign a task to a responsible user, specified by a userId
        """
        req_body = json.loads(request.body)[0]
        task_requested = dict(Tasks.objects.mongo_find_one({"_id": ObjectId(pk)}))
        new_eventInvitee = EventInvitee.objects.mongo_find_one(
            {"user_id": req_body["user_id"], "event_id": req_body["event_id"]}
        )
        Lists.objects.mongo_update_one(
            {"_id": ObjectId(task_requested["list_id"]), "tasks._id": ObjectId(pk)},
            {"$set": {"tasks.$.invitee_assigned": new_eventInvitee}},
        )
        list_updated = dict(
            Lists.objects.mongo_find_one({"_id": ObjectId(task_requested["list_id"])})
        )
        Event.objects.mongo_update_one(
            {
                "id": req_body["event_id"],
                "todo_lists._id": ObjectId(task_requested["list_id"]),
            },
            {"$set": {"todo_lists.$": list_updated}},
        )
        Tasks.objects.mongo_update_one(
            {"_id": ObjectId(pk)}, {"$set": {"invitee_assigned": new_eventInvitee}}
        )
        task_updated = dict(Tasks.objects.mongo_find_one({"_id": ObjectId(pk)}))
        lists_updated = [
            dict(ele)
            for ele in Lists.objects.mongo_find(
                {"creator.event_id": req_body["event_id"]}
            )
        ]
        return Response(
            json.dumps(lists_updated, default=str), status=status.HTTP_200_OK
        )

    def partial_update(self, request, pk=None):
        """
        Update task as a record and as a nested object.
        """
        pk = int(pk)
        Tasks.objects.mongo_update_one({"id": pk}, {"$set": request.data})
        task_one = dict(Tasks.objects.mongo_find_one({"id": pk}))
        Lists.objects.mongo_update_one(
            {"id": task_one["list_id"], "tasks.id": pk}, {"$set": {"tasks.$": task_one}}
        )
        list_one = dict(Lists.objects.mongo_find_one({"id": task_one["list_id"]}))
        Event.objects.mongo_update_one(
            {"id": list_one["creator"]["event_id"], "todo_lists.id": pk},
            {"$set": {"todo_lists.$": list_one}},
        )
        print(Lists.objects.mongo_find_one({"id": pk}))
        return Response({"status": "1"}, status=status.HTTP_200_OK)

    # /api/tasks/ObjID/complete
    @action(detail=True, methods=["PATCH"], name="Task complete")
    def complete(self, request, pk=None):
        """
        Mark task as complete
        """
        myTask = dict(Tasks.objects.mongo_find_one({"_id": ObjectId(pk)}))
        myTask["invitee_assigned"] = dict(myTask["invitee_assigned"])
        myTask["completed"] = True if myTask["completed"] == False else False
        try:
            Tasks.objects.mongo_update_one(
                {"_id": ObjectId(pk)}, {"$set": {"completed": myTask["completed"]}}
            )
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "task"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            Lists.objects.mongo_update_one(
                {"_id": ObjectId(myTask["list_id"]), "tasks._id": ObjectId(pk)},
                {"$set": {"tasks.$.completed": myTask["completed"]}},
            )
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        list_updated = dict(
            Lists.objects.mongo_find_one({"_id": ObjectId(myTask["list_id"])})
        )
        list_updated["creator"] = dict(list_updated["creator"])
        list_updated["tasks"] = [dict(ele) for ele in list_updated["tasks"]]
        for index in range(len(list_updated["tasks"])):
            list_updated["tasks"][index]["invitee_assigned"] = dict(
                list_updated["tasks"][index]["invitee_assigned"]
            )
        try:
            Event.objects.mongo_update_one(
                {
                    "id": list_updated["creator"]["event_id"],
                    "todo_lists._id": ObjectId(myTask["list_id"]),
                },
                {"$set": {"todo_lists.$": list_updated}},
            )
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "event"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            {"status": "1", "task": json.dumps(list_updated, default=str)},
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, pk=None):
        """
        Remove a task from the database, its nesting in the list, and its nesting in the Event
        """
        task_one = dict(Tasks.objects.mongo_find_one({"_id": ObjectId(pk)}))
        try:
            Lists.objects.mongo_update(
                {"_id": ObjectId(task_one["list_id"])},
                {"$pull": {"tasks": {"_id": task_one["_id"]}}},
            )
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "list"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            Event.objects.mongo_update(
                {"id": task_one["invitee_assigned"]["event_id"]},
                {"$pull": {"todo_lists.$[].tasks": {"_id": task_one["_id"]}}},
            )
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "event"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            Tasks.objects.mongo_delete_one({"_id": task_one["_id"]})
        except Exception as e:
            return Response(
                {"status": "-1", "message": e, "stage": "task"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"status": "1"}, status=status.HTTP_200_OK)


class EventInviteeView(viewsets.ModelViewSet):
    @action(detail=False, methods=["post"])
    def validate(self, request):
        """
        Check if an email address is valid to be added as an event invitee
        """
        try:
            user = User.objects.get(email=request.data["email"])
            existing_invitee_record = EventInvitee.objects.mongo_find_one(
                {"event_id": int(request.data["eventId"]), "user_id": int(user.id)}
            )
            if existing_invitee_record is None:
                return Response(
                    {"status": "1", "body": "Email is valid."},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {"status": "2", "body": "User has already been invited."},
                    status=status.HTTP_200_OK,
                )
        except ObjectDoesNotExist:
            return Response(
                {
                    "status": "3",
                    "body": "User with email address {email} does not exist.".format(
                        email=request.data["email"]
                    ),
                },
                status=status.HTTP_200_OK,
            )
        return Response(
            {"status": "4", "body": "An unknown error occurred."},
            status=status.HTTP_200_OK,
        )

    # def destroy(self, request, pk=None):
    #     pk = int(pk)
    #     print("Trying to delete " + str(pk))
    #     event = Event.objects.mongo_find_one({"id": int(pk)})
    #     if event is not None:
    #         task_lists = Lists.objects.mongo_find({"creator.event_id": event["id"]})
    #         list_ids = [
    #             l["_id"]
    #             for l in Lists.objects.mongo_find({"creator.event_id": event["id"]})
    #         ]
    #         print(
    #             "Found the following list IDs tied to this event: "
    #             + ",".join([str(i) for i in list_ids])
    #         )
    #         for l_id in list_ids:
    #             Tasks.objects.mongo_delete_many({"list_id": str(l_id)})
    #         Lists.objects.mongo_delete_many({"creator.event_id": event["id"]})
    #         EventInvitee.objects.mongo_delete_many({"event_id": int(pk)})
    #         Event.objects.mongo_delete_many({"id": int(pk)})
    #         return Response({"status": "1"}, status=status.HTTP_200_OK)
    #     return Response({"status": "1"}, status=status.HTTP_200_OK)

    def create(self, request):
        """
        Add a new event invitee. Email them if they haven't been invited yet.
        """
        eventId = request.data["eventId"]
        print("Attempting to add invitees to event " + str(eventId))

        already_invited = list()
        does_not_exist = list()
        invited = list()

        for emailAddress in request.data["emails"]:
            try:
                # Try and except for check if user exist in database
                user = User.objects.get(email=emailAddress)
                # If the user exists, and they have not already been added as an invitee, add them as an invitee
                existing_invitee_record = EventInvitee.objects.mongo_find_one(
                    {"event_id": int(eventId), "user_id": int(user.id)}
                )
                if existing_invitee_record is None:
                    event_invite_data = {
                        "user_id": int(user.id),
                        "event_id": int(eventId),
                        "isOwner": False,
                    }
                    event_invitee = EventInvitee(**event_invite_data)
                    event_invitee.save()
                    event_invitee = dict(
                        EventInvitee.objects.mongo_find_one({"_id": event_invitee._id})
                    )
                    Event.objects.mongo_update_one(
                        {"id": int(eventId)},
                        {"$push": {"participants": event_invitee}},
                    )
                    send_email(
                        "You have been invited to eventId " + str(eventId), user.email
                    )
                    invited.append(user.email)
                else:
                    # User has already been invited
                    already_invited.append(user.email)

            except ObjectDoesNotExist:
                user = None
                does_not_exist.append(emailAddress)

        response = {
            "invited": invited,
            "already_invited": already_invited,
            "does_not_exist": does_not_exist,
        }

        return Response({"status": "1", "body": response}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["delete"])
    def uninvite(self, request):
        """
        Remove an invitee and un-nest them from the parent event record.
        """
        req_dict = json.loads(request.data)
        print(req_dict)
        all_tasks_with_this_invitee = [
            dict(ele)
            for ele in Tasks.objects.mongo_find(
                {
                    "invitee_assigned.event_id": req_dict["event_id"],
                    "invitee_assigned.user_id": req_dict["user_id"],
                }
            )
        ]
        if len(all_tasks_with_this_invitee) > 0:
            print("here")
            return Response(
                {
                    "status": "-1",
                    "body": "Tasks associated with this person, first unassign them",
                },
                status=status.HTTP_200_OK,
            )
        else:
            existing_invitee_record = EventInvitee.objects.mongo_find_one_and_delete(
                {
                    "event_id": int(req_dict["event_id"]),
                    "user_id": int(req_dict["user_id"]),
                }
            )
            if existing_invitee_record is not None:
                Event.objects.mongo_update_one(
                    {"id": req_dict["event_id"]},
                    {
                        "$pull": {
                            "participants": {
                                "user_id": req_dict["user_id"],
                                "event_id": req_dict["event_id"],
                            }
                        }
                    },
                )
                return Response(
                    {"status": "1", "body": "Uninvited"}, status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"status": "2", "body": "Not found"}, status=status.HTTP_200_OK
                )

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        """
        Toggle an event invitee between owner/non-owner status.
        """
        req_dict = json.loads(request.data)
        existing_invitee_record = EventInvitee.objects.filter(
            event_id=req_dict["event_id"], user_id=req_dict["user_id"]
        )[0]
        if existing_invitee_record is not None:
            if existing_invitee_record.isOwner:
                print("Is currently an owner, will downgrade to a guest")
                existing_invitee_record.isOwner = False
            else:
                print("Is currently a guest, will upgrade to an owner")
                existing_invitee_record.isOwner = True
            Event.objects.mongo_update_one(
                {
                    "id": req_dict["event_id"],
                    "participants.user_id": req_dict["user_id"],
                },
                {"$set": {"participants.$.isOwner": existing_invitee_record.isOwner}},
            )
            existing_invitee_record.save()
            return Response(
                {"status": "1", "body": "Toggled"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"status": "2", "body": "Not found"}, status=status.HTTP_200_OK
            )


# prevents a MIME type error for static files
class Assets(View):
    def get(self, _request, filename):
        path = os.path.join(os.path.dirname(__file__), "static", filename)

        if os.path.isfile(path):
            with open(path, "rb") as file:
                return HttpResponse(file.read(), content_type="application/javascript")
        else:
            return HttpResponseNotFound()


# Authentication Views

# gets the current user by their token and returns their data
@api_view(["GET"])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


def send_email(text, recipient):
    # print("Test123")
    # emails = []
    # body_unicode = request.body.decode("utf-8")
    # body_unicode = body_unicode.split("[")
    # body_unicode = "".join(body_unicode)
    # body_unicode = body_unicode.split("]")
    # body_unicode = "".join(body_unicode)
    # body_unicode = body_unicode.split(",")
    # body_unicode = "".join(body_unicode)
    # body_unicode = body_unicode.split('"')
    # for email in body_unicode:
    #     if len(email):
    #         emails.append(email)
    send_mail(
        "Subject here",
        text,
        "planly.events@gmail.com",
        [recipient],
        fail_silently=False,
    )
    # return HttpResponse("Here's the text of the Web page.")


# creates a new user
class UserList(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, format=None):
        username = [user.email for user in User.objects.all()]
        return Response(username)

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
