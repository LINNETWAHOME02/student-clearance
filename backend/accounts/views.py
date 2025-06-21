from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rolepermissions.roles import assign_role
from .models import ValidStudent, ValidStaff
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser

from accounts.serializers import *

User = get_user_model()

class ActivateAccountView(APIView):
    def post(self, request):
        data = request.data

        # Get input from frontend
        email = data.get('email')
        user_id = data.get('id_number')  # enrollment number for student or staff ID for staff or admin ID for admin
        password = data.get('password')
        role = data.get('role')

        # Check all required fields are provided
        if not all([email, user_id, password,role]):
            return Response(
                {'error': 'All fields (email, id_number, password, role) are required.'},
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
                        'department': valid_student.department,
                        'phone': valid_student.phone,
                        'avatar': valid_student.avatar or 'avatars/default.png',
                        'bio': valid_student.bio,
                        'year': valid_student.year,
                        'semester': valid_student.semester,
                        'admission_date': valid_student.admission_date,
                        'expected_graduation': valid_student.expected_graduation,
                        'gpa': valid_student.gpa,
                        'credits': valid_student.credits,
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
                        'department': valid_staff.department,
                        'phone': valid_staff.phone,
                        'avatar': valid_staff.avatar or 'avatars/default.png',
                        'bio': valid_staff.bio,
                        'position': valid_staff.position,
                        'role': 'staff',
                        'clearance_type': valid_staff.clearance_type
                    }
                )

                if not created:
                    return Response({'message': 'Staff account already activated.'}, status=status.HTTP_200_OK)

                user.set_password(password)
                user.save()

                assign_role(user, 'staff')

                return Response({'message': 'Staff account activated successfully!'}, status=status.HTTP_201_CREATED)

            except ValidStaff.DoesNotExist:
                return Response({'error': 'Staff record not found or not eligible for activation.'}, status=400)

        # System Admin Activation
        elif role == 'admin':
            try:
                # Check - system admin is valid (uses ValidStaff with role='admin')
                valid_admin = ValidStaff.objects.get(
                    staff_id=user_id,
                    university_email=email,
                    role='admin',
                    status='active'
                )

                # Use name from database
                full_name = valid_admin.name
                first_name, *last_name = full_name.split()

                user, created = User.objects.get_or_create(
                    username=user_id,
                    defaults={
                        'email': email,
                        'first_name': first_name,
                        'last_name': ' '.join(last_name) if last_name else '',
                        'department': valid_admin.department,
                        'phone': valid_admin.phone,
                        'avatar': valid_admin.avatar or 'avatars/default.png',
                        'bio': valid_admin.bio,
                        'position': valid_admin.position,
                        'role': 'admin'
                    }
                )

                if not created:
                    return Response({'message': 'System Admin account already activated.'}, status=status.HTTP_200_OK)

                user.set_password(password)
                user.save()

                assign_role(user, 'admin')

                return Response({'message': 'System Admin account activated successfully!'}, status=status.HTTP_201_CREATED)

            except ValidStaff.DoesNotExist:
                return Response({'error': 'Admin record not found or not eligible for activation.'}, status=400)

        return Response({'error': 'Invalid role specified.'}, status=400)


class LoginView(APIView):
    def post(self, request):
        try:
            username = request.data.get('id_number')
            password = request.data.get('password')

            if not username or not password:
                return Response(
                    {'error': 'Both ID number and password are required.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(username=username, password=password)

            if user is None:
                return Response(
                    {'error': 'Invalid credentials. Please check your ID number and password.'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Ensure user is active
            if not user.is_active:
                return Response(
                    {'error': 'This account has been deactivated. Please contact your administrator.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Serialize full user data (with context to build avatar URL)
            serializer = UserSerializer(user, context={'request': request})

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token required"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({"error": "Invalid or expired refresh token."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Logout failed."}, status=status.HTTP_400_BAD_REQUEST)
        
# User details update
class UpdateDetailsView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return User.objects.all()

    def get_serializer_class(self):
        return UserSerializer if self.request.user.role == 'admin' else UserUpdateSerializer

    def get_object(self):
        user = self.request.user
        requested_id = self.kwargs.get('pk')

        try:
            if user.role in ['student', 'staff']:
                if str(user.id) != requested_id:
                    raise PermissionError("You can only update your own profile.")
                return user

            if user.role == 'admin':
                target_user = User.objects.get(id=requested_id)

                if (
                    target_user.department == user.department or
                    str(user.id) == requested_id
                ):
                    return target_user
                raise PermissionError("Admin access is restricted to users within your department.")

            raise PermissionError("You are not authorized to access this resource.")

        except User.DoesNotExist:
            raise serializers.ValidationError({'error': 'User not found.'})
        except PermissionError as e:
            raise serializers.ValidationError({'error': str(e)})
        except Exception as e:
            raise serializers.ValidationError({'error': f"Unexpected error: {str(e)}"})

# Get all users for specific department - Admin only 
class UsersInDepartmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            # Ensure only admin users can access this view
            if user.role != 'admin':
                return Response(
                    {"detail": "Only admin users are allowed to view department users."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Get all users in the same department
            department_users = User.objects.filter(department=user.department).exclude(id=user.id)

            if not department_users.exists():
                return Response(
                    {"detail": "No users found in your department."},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = UserSerializer(department_users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"detail": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# Deactivate account -  Only admin can deactivate an account
class DeactivateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can deactivate users.'}, status=403)

        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

        # Only allow deactivating users in the same department
        if user.department != request.user.department:
            return Response({'error': 'You can only deactivate users in your department.'}, status=403)

        user.is_active = False
        user.save()
        return Response({'message': 'User deactivated successfully.'})
    
#  Change password - All users
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not user.check_password(current_password):
            return Response({'error': 'Current password is incorrect.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password updated successfully.'})
    
# Get all user data for user dashboard to be populated
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)