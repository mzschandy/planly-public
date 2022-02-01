from djongo import models
from django.core.validators import MaxLengthValidator
from django.core.exceptions import ValidationError


def ValidateInteger(value):
    if not isinstance(value, int):
        raise ValidationError(
            ("%(value)s is not an even integer"),
            params={"value": value},
        )


# Create your models here.
class Item(models.Model):
    _id = models.ObjectIdField()
    name = models.CharField(max_length=30, validators=[MaxLengthValidator(30)])
    detail = models.CharField(max_length=100, validators=[MaxLengthValidator(100)])

    def _str_(self):
        return self.name


class EventInvitee(models.Model):
    _id = models.ObjectIdField()
    user_id = models.IntegerField(
        validators=[ValidateInteger]
    )  # id is used to search the user model
    isOwner = models.BooleanField()
    event_id = models.IntegerField(
        validators=[ValidateInteger]
    )  # id is used to search the events model
    objects = models.DjongoManager()


class Tasks(models.Model):
    _id = models.ObjectIdField()
    name = models.CharField(max_length=200, validators=[MaxLengthValidator(200)])
    priority = models.IntegerField(validators=[ValidateInteger])
    invitee_assigned = models.EmbeddedField(
        model_container=EventInvitee
    )  # currently a one-to-one relation but in future replace with ArrayReferenceField(many-to-many).
    completed = models.BooleanField(default=False)
    list_id = models.CharField(max_length=50, validators=[MaxLengthValidator(200)])
    objects = models.DjongoManager()

    def _str_(self):
        return self.name


class Lists(models.Model):
    _id = models.ObjectIdField()
    name = models.CharField(max_length=50, validators=[MaxLengthValidator(50)])
    description = models.CharField(max_length=300, validators=[MaxLengthValidator(300)])
    creator = models.EmbeddedField(
        model_container=EventInvitee
    )  # In future, make this an ArrayReferenceField()
    tasks = models.ArrayField(model_container=Tasks, default=[])
    objects = models.DjongoManager()

    def _str_(self):
        return self.description


class Event(models.Model):
    _id = models.ObjectIdField()
    creator = models.EmbeddedField(model_container=EventInvitee)
    description = models.CharField(max_length=300, validators=[MaxLengthValidator(300)])
    name = models.CharField(max_length=50, validators=[MaxLengthValidator(50)])
    location = models.CharField(max_length=300, validators=[MaxLengthValidator(300)])
    startDate = models.DateField(default=None)
    endDate = models.DateField(default=None)
    todo_lists = models.ArrayField(model_container=Lists, default=[])
    participants = models.ArrayField(model_container=EventInvitee, default=[])
    objects = models.DjongoManager()

    def _str_(self):
        return self.name
