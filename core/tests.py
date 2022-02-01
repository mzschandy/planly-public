from django.test import TestCase
import unittest
from core.models import *
from django.contrib.auth.models import User
import datetime

# Create your tests here.
class TestDatabaseMethods(unittest.TestCase):
    def testSum(self):
        assert sum([1, 2, 3]) == 6

    def testItem(self):
        item_sample = {"name": "item1", "detail": "something about this item."}
        item_sample_wrong = {
            "name": "item1blehhesfdfsdfsefesfsfsefsdfsdfsdfsefsdfsdfs",
            "detail": "something about this item.",
        }
        flag = False
        item = Item(**item_sample)
        try:
            a = item.full_clean()
        except ValidationError:
            flag = True
        self.assertEqual(flag, False)

        item = Item(**item_sample_wrong)
        self.assertRaises(ValidationError, item.full_clean)

    def testUser(self):
        user_sample = {
            "id": 100,
            "first_name": "Something",
            "last_name": "Beatles",
            "username": "Revolver",
            "email": "hey@jude.com",
            "password": "something",
        }
        user_sample_wrong_id = {
            "id": "sdfdf",
            "first_name": "Something",
            "last_name": "Beatles",
            "username": "Revolver",
            "email": "hey@jude.com",
            "password": "something",
        }
        user_sample_wrong_first_name = {
            "id": 100,
            "first_name": "Something",
            "last_name": "Beatles",
            "username": "Revolver",
            "email": "hey@jude.com",
            "password": "something",
        }
        flag = False
        user = User(**user_sample)
        try:
            user.full_clean()
        except ValidationError:
            flag = True
        self.assertEqual(flag, False)

        user = User(**user_sample_wrong_id)
        self.assertRaises(ValidationError, ValidateInteger, user.full_clean)

        user = User(**user_sample_wrong_first_name)
        self.assertRaises(ValidationError, ValidateInteger, user.full_clean)

    def testEventInvitee(self):
        event_invitee = {"user_id": 100, "event_id": 100, "isOwner": False}
        event_invitee_wrong = {
            "user_id": "some2",
            "event_id": "some3",
            "isOwner": False,
        }
        flag = False
        ei = EventInvitee(**event_invitee)
        try:
            a = ei.full_clean()
        except ValidationError:
            flag = True
        self.assertEqual(flag, False)

        ei = EventInvitee(**event_invitee_wrong)
        self.assertRaises(ValidationError, ei.full_clean)

    def testTask(self):
        ei = dict(
            EventInvitee.objects.mongo_find_one({"user_id": 100})
        )  # Saved this earlier
        task_sample = {
            "_id": 101,
            "name": "Blackbird",
            "invitee_assigned": ei,
            "priority": 3,
            "completed": False,
            "list_id": 100,
        }
        task_sample_wrong = {
            "_id": 101,
            "name": "dasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd",
            "invitee_assigned": ei,
            "priority": "asd",
            "completed": False,
            "list_id": "sdff",
        }
        flag = False
        task = Tasks(**task_sample)
        try:
            task.full_clean()
        except ValidationError:
            flag = True
        self.assertEqual(flag, False)

        task = Tasks(**task_sample_wrong)
        self.assertRaises(ValidationError, task.full_clean)

    def testList(self):
        ei = dict(
            EventInvitee.objects.mongo_find_one({"user_id": 100})
        )  # Saved this earlier
        task_sample = dict(
            Tasks.objects.mongo_find_one({"_id": 100})
        )  # Saved this earlier
        list_sample = {
            "_id": 101,
            "name": "Hey Jude",
            "description": "dont make it bad, take a sad song and make it better",
            "creator": ei,
            "tasks": [task_sample],
        }
        list_sample_wrong = {
            "_id": 101,
            "name": "Hey Judeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            "description": "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdas"
            + "dasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd",
            "creator": ei,
            "tasks": [task_sample],
        }
        flag = False
        lis = Lists(**list_sample)
        try:
            lis.full_clean()
        except ValidationError:
            flag = True
        self.assertEqual(flag, False)

        lis = Lists(**list_sample_wrong)
        self.assertRaises(ValidationError, lis.full_clean)

    def testEvent(self):
        ei = dict(
            EventInvitee.objects.mongo_find_one({"user_id": 100})
        )  # Saved this earlier
        task_sample = dict(
            Tasks.objects.mongo_find_one({"_id": 100})
        )  # Saved this earlier
        list_sample = dict(
            Lists.objects.mongo_find_one({"_id": 100})
        )  # Saved this earlier
        event_sample = {
            "_id": 100,
            "creator": ei,
            "description": "Will you still need me, will you still feed me when im 64?",
            "name": "Hold on John",
            "location": "Liverpool",
            "startDate": datetime.datetime(2020, 9, 1),
            "participants": [ei],
            "endDate": datetime.datetime(2020, 9, 6),
            "todo_lists": [list_sample],
        }
        event_sample_wrong = {
            "_id": 100,
            "creator": ei,
            "description": "dasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "dasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd",
            "name": "dasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd"
            + "asdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd",
            "location": "dasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasdasd",
            "startDate": datetime.datetime(2020, 9, 1),
            "participants": [ei],
            "endDate": datetime.datetime(2020, 9, 6),
            "todo_lists": [list_sample],
        }
        flag = False
        eve = Event(**event_sample)
        eve.full_clean()
        try:
            eve.full_clean()
        except ValidationError:
            flag = True
        self.assertEqual(flag, False)

        eve = Event(**event_sample_wrong)
        self.assertRaises(ValidationError, eve.full_clean)
