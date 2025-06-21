from django.contrib import admin
from django.urls import path

from accounts.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication
    path('activate/', ActivateAccountView.as_view(), name='activate'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # User data
    path('user/me/', MeView.as_view(), name='user-profile'),
    
    # Authenticated user updates their own profile
    path('profile/update/', UpdateDetailsView.as_view(), name='self-update'),

    # Admin updates any user in their department using user ID
    path('admin/user/<int:pk>/update/', UpdateDetailsView.as_view(), name='admin-update-user'),
    # Get users for admin user only
    path('admin/users/', UsersInDepartmentView.as_view(), name='admin-user-list'),
    # Deactivate account for admin only
    path('admin/deactivate/', DeactivateUserView.as_view(), name='admin-deactivate-user'),
    
    # Change password for all authenticated users
    path('change_password/', ChangePasswordView.as_view(), name='change_password'),
]