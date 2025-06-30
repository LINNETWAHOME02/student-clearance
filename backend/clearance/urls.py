from django.contrib import admin
from django.urls import path

from clearance.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    
    ####################################### STUDENT URLS #######################################
    path('project/', ProjectClearanceView.as_view(), name='submit-project-clearance'),
    path('lab/', LabClearanceView.as_view(), name='submit-lab-clearance'),
    path('library/', LibraryClearanceView.as_view(), name='submit-library-clearance'),
    path('student-stats/', StudentClearanceStatsView.as_view(), name='student-clearance-stats'),
    path('my-requests/', RequestStatusView.as_view(), name='my-requests'),
    path('student-history/', StudentHistoryView.as_view(), name='student-history'),
    
    ####################################### STAFF URLS #######################################
    path('assigned-students/', AssignedStudentsView.as_view(), name='assigned-students'),
    path('assigned-requests/', AssignedRequestsView.as_view(), name='assigned-requests'),
    path('update-request/<int:request_id>/', UpdateRequestStatusView.as_view(), name='update-request-status'),
    path('stats/', StaffClearanceStatsView.as_view(), name='staff-clearance-stats'),
    path('staff-history/', StaffHistoryView.as_view(), name='student-history'),
    
    ####################################### ADMIN URLS #######################################
]