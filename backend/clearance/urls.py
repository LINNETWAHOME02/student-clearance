from django.contrib import admin
from django.urls import path

from clearance.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    
    ####################################### STUDENT URLS #######################################
    
    
    ####################################### STAFF URLS #######################################
    path('assigned-students/', AssignedStudentsView.as_view(), name='assigned-students'),
    
    
    ####################################### ADMIN URLS #######################################
]