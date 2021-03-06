# Generated by Django 3.0.5 on 2021-03-26 17:10

import core.models
import django.core.validators
from django.db import migrations, models
import djongo.models.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Event",
            fields=[
                (
                    "_id",
                    djongo.models.fields.ObjectIdField(
                        auto_created=True, primary_key=True, serialize=False
                    ),
                ),
                (
                    "creator",
                    djongo.models.fields.EmbeddedField(
                        model_container=core.models.EventInvitee
                    ),
                ),
                ("description", models.CharField(max_length=300)),
                ("name", models.CharField(max_length=50)),
                ("location", models.CharField(max_length=300)),
                ("startDate", models.DateField(default=None)),
                ("endDate", models.DateField(default=None)),
                (
                    "todo_lists",
                    djongo.models.fields.ArrayField(
                        default=[], model_container=core.models.Lists
                    ),
                ),
                (
                    "participants",
                    djongo.models.fields.ArrayField(
                        default=[], model_container=core.models.EventInvitee
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="EventInvitee",
            fields=[
                (
                    "_id",
                    djongo.models.fields.ObjectIdField(
                        auto_created=True, primary_key=True, serialize=False
                    ),
                ),
                ("user_id", models.IntegerField()),
                ("isOwner", models.BooleanField()),
                ("event_id", models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name="Item",
            fields=[
                (
                    "_id",
                    djongo.models.fields.ObjectIdField(
                        auto_created=True, primary_key=True, serialize=False
                    ),
                ),
                (
                    "name",
                    models.CharField(
                        max_length=30,
                        validators=[django.core.validators.MaxLengthValidator],
                    ),
                ),
                ("detail", models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name="Lists",
            fields=[
                (
                    "_id",
                    djongo.models.fields.ObjectIdField(
                        auto_created=True, primary_key=True, serialize=False
                    ),
                ),
                ("name", models.CharField(max_length=50)),
                ("description", models.CharField(max_length=300)),
                (
                    "creator",
                    djongo.models.fields.EmbeddedField(
                        model_container=core.models.EventInvitee
                    ),
                ),
                (
                    "tasks",
                    djongo.models.fields.ArrayField(
                        default=[], model_container=core.models.Tasks
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Tasks",
            fields=[
                (
                    "_id",
                    djongo.models.fields.ObjectIdField(
                        auto_created=True, primary_key=True, serialize=False
                    ),
                ),
                ("name", models.CharField(max_length=200)),
                ("priority", models.IntegerField()),
                (
                    "invitee_assigned",
                    djongo.models.fields.EmbeddedField(
                        model_container=core.models.EventInvitee
                    ),
                ),
                ("completed", models.BooleanField(default=False)),
                ("list_id", models.IntegerField()),
            ],
        ),
    ]
