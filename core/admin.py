from django.contrib import admin
from .models import Item, Event
from django.contrib.sites.models import Site

# Register your models here.
# admin.site.register(User)
admin.site.register(Item)
admin.site.register(Event)


class SiteAdmin(admin.ModelAdmin):
    list_display = ("id", "domain", "name")


# admin.site.register(Site, SiteAdmin)
