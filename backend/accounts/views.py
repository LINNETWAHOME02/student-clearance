from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rolepermissions.roles import assign_role
from .models import ValidStudent, ValidStaff
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView

from accounts.serializers import *

User = get_user_model()

class ActivateAccountView(APIView):
    def post(self, request):
        data = request.data

        # Get input from frontend
        email = data.get('email')
        user_id = data.get('id_number')  # enrollment number for student or staff ID for staff
        password = data.get('password')
        name = data.get('name')
        role = data.get('role')

        # Check all required fields are provided
        if not all([email, user_id, password, name, role]):
            return Response(
                {'error': 'All fields (email, id_number, password, name, role) are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Student Activation
        if role == 'student':
            try:
                # Check if student is valid
                valid_student = ValidStudent.objects.get(
                    enrollment_number=user_id,
                    university_email=email,
                    status='active'
                )

                # Use name from the DB instead of trusting user input
                full_name = valid_student.name
                first_name, *last_name = full_name.split()

                # Create or fetch the user
                user, created = User.objects.get_or_create(
                    username=user_id, 
                    defaults={
                        'email': email,
                        'first_name': first_name,
                        'last_name': ' '.join(last_name) if last_name else '',
                        'role': 'student'
                    }
                )

                # If user already exists, return early
                if not created:
                    return Response({'message': 'Student account already activated.'}, status=status.HTTP_200_OK)

                # Set and hash password
                user.set_password(password)
                user.save()

                # Assign permissions
                assign_role(user, 'student')

                return Response({'message': 'Student account activated successfully!'}, status=status.HTTP_201_CREATED)

            except ValidStudent.DoesNotExist:
                return Response({'error': 'Student record not found or not eligible for activation.'}, status=400)

        # Staff Activation
        elif role == 'staff':
            try:
                # Check if staff is valid
                valid_staff = ValidStaff.objects.get(
                    staff_id=user_id,
                    university_email=email,
                    role='staff',
                    status='active'
                )

                # Get full name from DB
                full_name = valid_staff.name
                first_name, *last_name = full_name.split()

                # Create or fetch user
                user, created = User.objects.get_or_create(
                    username=user_id,
                    defaults={
                        'email': email,
                        'first_name': first_name,
                        'last_name': ' '.join(last_name) if last_name else '',
                        'role': 'staff',
                        'clearance_type': valid_staff.clearance_type
                    }
                )

                if not created:
                    return Response({'message': 'Staff account already activated.'}, status=status.HTTP_200_OK)

                user.set_password(password)
                user.save()

                # Assign sub-role based on clearance_type
                if valid_staff.clearance_type == 'project':
                    assign_role(user, 'projectsupervisor')
                elif valid_staff.clearance_type == 'lab':
                    assign_role(user, 'labstaff')
                elif valid_staff.clearance_type == 'library':
                    assign_role(user, 'librarystaff')

                return Response({'message': 'Staff account activated successfully!'}, status=status.HTTP_201_CREATED)

            except ValidStaff.DoesNotExist:
                return Response({'error': 'Staff record not found or not eligible for activation.'}, status=400)

        # System Admin Activation
        elif role == 'systemadmin':
            try:
                # Check if system admin is valid (uses ValidStaff with role='admin')
                valid_admin = ValidStaff.objects.get(
                    staff_id=user_id,
                    university_email=email,
                    role='admin',
                    status='active'
                )

                # Use name from DB
                full_name = valid_admin.name
                first_name, *last_name = full_name.split()

                user, created = User.objects.get_or_create(
                    username=user_id,
                    defaults={
                        'email': email,
                        'first_name': first_name,
                        'last_name': ' '.join(last_name) if last_name else '',
                        'role': 'systemadmin'
                    }
                )

                if not created:
                    return Response({'message': 'System Admin account already activated.'}, status=status.HTTP_200_OK)

                user.set_password(password)
                user.save()

                assign_role(user, 'systemadmin')

                return Response({'message': 'System Admin account activated successfully!'}, status=status.HTTP_201_CREATED)

            except ValidStaff.DoesNotExist:
                return Response({'error': 'Admin record not found or not eligible for activation.'}, status=400)

        # If the role is invalid
        return Response({'error': 'Invalid role specified.'}, status=400)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('id_number')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'username': user.username,
            })
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # No server-side token blacklisting
        return Response({"message": "Logged out (token will expire automatically)."}, status=status.HTTP_200_OK)

    # def post(self, request):
    #     try:
    #         refresh_token = request.data["refresh"]
    #         token = RefreshToken(refresh_token)
    #         token.blacklist()
    #         return Response({"message": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
    #     except Exception as e:
    #         return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)
        
class UpdateUserView(RetrieveUpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def put(self, request, *args, **kwargs):
        """Full update — all fields must be provided"""
        return self.update(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        """Partial update — only some fields"""
        return self.partial_update(request, *args, **kwargs)