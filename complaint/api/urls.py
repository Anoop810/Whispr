from django.urls import path
from . import views

urlpatterns = [
    path('admin_login/', views.admin_login, name='admin_login'),
    path('complaint_by_token/', views.complaint_by_token, name='complaint_by_token'),
    path('complaints/', views.complaint_list_create, name='complaint_list_create'),
    path('complaints/<int:id>/', views.resolve_complaint, name='complaint_detail'),
]
