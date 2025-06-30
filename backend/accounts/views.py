from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError as DjangoValidationError

from rolepermissions.roles import assign_role
from .models import ValidStudent, ValidStaff
from .serializers import *

User = get_user_model()

########################################## ACCOUNT ACTIVATION ############################################

class ActivateAccountView(APIView):
    def post(self, request):
        data = request.data
        email = data.get('email')
        id_number = data.get('id_number')
        password = data.get('password')
        role = data.get('role')

        if not all([email, id_number, password, role]):
            return Response({'error': 'All fields are required.'}, status=400)

        try:
            if role == 'student':
                student = ValidStudent.objects.get(enrollment_number=id_number, university_email=email, status='active')
                full_name = student.name
                first_name, *last_name = full_name.split()

                user, created = User.objects.get_or_create(
                    username=id_number,
                    defaults={
                        'email': email,
                        'first_name': first_name,
                        'last_name': ' '.join(last_name),
                        'department': student.department,
                        'phone': student.phone,
                        'avatar': student.avatar,
                        'bio': student.bio,
                        'year': student.year,
                        'semester': student.semester,
                        'admission_date': student.admission_date,
                        'expected_graduation': student.expected_graduation,
                        'gpa': student.gpa,
                        'credits': student.credits,
                        'role': 'student'
                    }
                )

                if not created:
                    return Response({'message': 'Account already activated.'}, status=200)

                user.set_password(password)
                user.save()
                assign_role(user, 'student')

                return Response({'message': 'Student account activated successfully!'}, status=201)

            elif role == 'staff' or role == 'admin':
                staff = ValidStaff.objects.get(staff_id=id_number, university_email=email, role=role, status='active')
                full_name = staff.name
                first_name, *last_name = full_name.split()

                user, created = User.objects.get_or_create(
                    username=id_number,
                    defaults={
                        'email': email,
                        'first_name': first_name,
                        'last_name': ' '.join(last_name),
                        'department': staff.department,
                        'phone': staff.phone,
                        'avatar': staff.avatar,
                        'bio': staff.bio,
                        'position': staff.position,
                        'clearance_type': staff.clearance_type,
                        'role': role
                    }
                )

                if not created:
                    return Response({'message': 'Account already activated.'}, status=200)

                user.set_password(password)
                user.save()
                assign_role(user, role)

                return Response({'message': f'{role.capitalize()} account activated successfully!'}, status=201)

            else:
                return Response({'error': 'Invalid role.'}, status=400)

        except (ValidStudent.DoesNotExist, ValidStaff.DoesNotExist):
            return Response({'error': f"{role.capitalize()} record not found or not eligible for activation."}, status=400)
        except Exception as e:
            return Response({'error': f"Unexpected error during activation: {str(e)}"}, status=500)


###################################### LOGIN / LOGOUT ############################################

class LoginView(APIView):
    def post(self, request):
        try:
            username = request.data.get('id_number')
            password = request.data.get('password')

            if not username or not password:
                return Response({'error': 'ID number and password are required.'}, status=400)

            user = authenticate(username=username, password=password)

            if not user:
                return Response({'error': 'Invalid credentials.'}, status=401)
            if not user.is_active:
                return Response({'error': 'Account is deactivated.'}, status=403)

            serializer = UserSerializer(user, context={'request': request})
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': serializer.data
            }, status=200)

        except Exception as e:
            return Response({'error': f"Login failed: {str(e)}"}, status=500)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token required."}, status=400)

            RefreshToken(refresh_token).blacklist()
            return Response({"message": "Logged out successfully."}, status=205)

        except TokenError:
            return Response({"error": "Invalid or expired token."}, status=400)
        except Exception as e:
            return Response({"error": f"Logout failed: {str(e)}"}, status=500)


######################################### PROFILE MANAGEMENT ######################################

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            serializer = UserSerializer(request.user, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': f"Could not retrieve user data: {str(e)}"}, status=500)


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
            if not requested_id:
                return user

            if user.role in ['student', 'staff']:
                if str(user.id) != str(requested_id):
                    raise PermissionError("You can only update your own profile.")
                return user

            if user.role == 'admin':
                target = User.objects.get(id=requested_id)
                if target.department != user.department and str(user.id) != str(requested_id):
                    raise PermissionError("Admins can only edit users in their department.")
                return target

            raise PermissionError("You are not authorized to access this resource.")

        except User.DoesNotExist:
            raise serializers.ValidationError({'error': 'User not found.'})
        except PermissionError as e:
            raise serializers.ValidationError({'error': str(e)})
        except Exception as e:
            raise serializers.ValidationError({'error': f"Unexpected error: {str(e)}"})

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


################################### ADMIN VIEWS ########################################

class UsersInDepartmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Access denied. Admins only.'}, status=403)
        try:
            users = User.objects.filter(department=request.user.department).exclude(id=request.user.id)
            serializer = UserSerializer(users, many=True, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': f"Error fetching users: {str(e)}"}, status=500)


class DeactivateUserView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Only admins can deactivate users.'}, status=403)

        try:
            user = User.objects.get(id=pk)

            if user.department != request.user.department:
                return Response({'error': 'Cannot deactivate users from other departments.'}, status=403)

            user.is_active = False
            user.save()
            return Response({'message': 'User deactivated successfully.'})

        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)
        except Exception as e:
            return Response({'error': f"Deactivation failed: {str(e)}"}, status=500)

######################################## CHANGE PASSWORD ###########################################
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password or not new_password:
            return Response({'error': 'Both current and new passwords are required.'}, status=400)

        if not user.check_password(current_password):
            return Response({'error': 'Incorrect current password.'}, status=400)

        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password updated successfully.'})