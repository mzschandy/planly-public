from rest_framework import serializers
from .models import Item, Event, EventInvitee, Lists, Tasks
from django.contrib.auth.models import User
from rest_framework_jwt.settings import api_settings
from django.core.exceptions import ValidationError


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ("name", "detail")


# serilaizer for a logged in user
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "id")


# serilaizer for a logged in user
class EventSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        print(validated_data)

    class Meta:
        model = Event
        fields = (
            "creator",
            "description",
            "name",
            "location",
            "startDate",
            "endDate",
            "participants",
        )


class EventInviteeSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        print(validated_data)

    class Meta:
        model = EventInvitee
        fields = ("user_id", "isOwner", "event_id")


class ListSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        print(validated_data)

    class Meta:
        model = Lists
        fields = ("name", "description", "creator", "tasks")


class TaskSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        print(validated_data)

    class Meta:
        model = Lists
        fields = ("name", "priority", "invitee_assigned", "completed", "list_id")


# serializer for a user that needs to sign up
# creates a token field for our user because it doesn't exist
class UserSerializerWithToken(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True)

    def get_token(self, obj):
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER

        payload = jwt_payload_handler(obj)
        token = jwt_encode_handler(payload)

        return token

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        instance = self.Meta.model(**validated_data)

        if password is not None:
            instance.set_password(password)
        instance.save()

        return instance

    class Meta:
        model = User
        fields = ("token", "username", "password", "email", "first_name", "last_name")
