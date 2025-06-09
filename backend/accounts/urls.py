from django.contrib import admin
from django.urls import path

from accounts.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication
    path('activate/', ActivateAccountView.as_view(), name='activate'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # User details update
    path('update/', UpdateUserView.as_view(), name='update')
]