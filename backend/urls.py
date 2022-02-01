"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from rest_framework import routers
from rest_framework_jwt.views import obtain_jwt_token
from core import views

from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

router = routers.DefaultRouter()
router.register(r"items", views.ItemView, "core")
router.register(r"event", views.EventView, "core")
router.register(r"lists", views.ToDoListView, "core")
router.register(r"tasks", views.TaskView, "core")
router.register(r"eventinvitee", views.EventInviteeView, "core")

schema_view = get_schema_view(
    openapi.Info(
        title="Planly API",
        default_version="v1",
        description="This provides a UI view of Plan.ly API where you get to see our methods, what the endpoints return and what datatype they accept",
        terms_of_service="https://development-planly.herokuapp.com/",
        contact=openapi.Contact(email="vibs97@bu.edu"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path("docs", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("docs/", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("token-auth/", obtain_jwt_token),
    path("core/", include("core.urls")),
    re_path(".*", TemplateView.as_view(template_name="index.html")),
]
