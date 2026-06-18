from django.contrib import admin

from .models import Complaint, Organization, StaffProfile


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_name', 'created_at')
    search_fields = ('name', 'display_name')


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'organization')
    list_filter = ('organization',)
    search_fields = ('user__username', 'organization__name')


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('title', 'organization', 'status', 'priority', 'submission_date')
    list_filter = ('organization', 'status', 'priority')
    search_fields = ('title', 'token', 'department')
