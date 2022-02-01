from django.urls import path
from .views import current_user, UserList, send_email

urlpatterns = [
    path("current_user/", current_user),
    path("users/", UserList.as_view()),
    path("send_email/", send_email),
]
