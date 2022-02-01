## Database Architecture

### User Class
```
{
    "_id" : <DB generated id>,
    "user_name" : "Jon Doe",
    "password" : "$2y$12$6y874Qf4QaFvaGQMNa615ev",
    "email" : "Jon.doe@gmail.com",
    "first_name" : "Jon",
    "last_name" : "Doe",
}
```
### Event Class
```
{
    "_id" : <DB generated id>,
    "Name" : "My Sample Event",
    "Description" : "This is the sample description for my awesome event. Please be there. I need help...",
    "Location" : "Boston, Massachussetts",
    "Start_date" : Jan 26 2021 10:20:00 AM,
    "End_date" : Jan 30 2021 10:20:00 AM,
    "Participants" : [Event_invitee1_id, Event_invitee2_id, Event_invitee3_id, Event_invitee4_id...],
    "Creator" : Event_invitee_id,
    "Lists" : [todoList_1_id, todoList_2_id, todoList_3_id, todoList_4_id..],
}
```

### Event invitee
```
{
    "_id" : <DB generated id>,
    "user_id" : <_id from the user class>,
    "event_id" : <_id from the event class>,
    "isOwner" : True / False,
}
```

### List Class
```
{
    "_id" : <DB generated id>,
    "Name" : "List 1",
    "Description" : "This List is used for getting balloons for the party",
    "Creator" : [Event_invitee_id],
    "Tasks" : [Task_1_id, Task_2_id, Task_3_id, Task_4_id..],
}
```

### Task Class
```
{
    "_id" : <DB generated id>,
    "Name" : "Blow the Balloons.",
    "Priority" : 3, # 0: low, 1: can do later, 2 : Essential for event(not time sensitive), 3: Essential for event(Time Sensitive)
    "invitee_Assigned" : [Event_invitee_id],
    "List_Belongs_to" : <list_id>
    "Completed" : True / False
}
```
