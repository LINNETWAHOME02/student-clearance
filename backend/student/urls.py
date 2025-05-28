from django.urls import path
from django.contrib import admin

from . import views
from .views import *

app_name = 'student'

urlpatterns = [
    path('admin/', admin.site.urls),

]