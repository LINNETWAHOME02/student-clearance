from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from .models import Request as ClearanceRequest
from rolepermissions.checkers import has_permission, has_role
from django.db.models import Q
import traceback
import logging

from accounts.serializers import UserSerializer
from accounts.models import *
from .serializers import *

logger = logging.getLogger(__name__)
########################################### STUDENT VIEWS #############################################
class SubmitClearanceRequestView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    clearance_type = None  # to be overridden in subclasses

    def post(self, request):
        user = request.user

        if not has_permission(user, 'submit_request'):
            return Response({'error': 'Permission denied! Only a student can submit a clearance request.'}, status=status.HTTP_403_FORBIDDEN)

        if not self.clearance_type:
            return Response({'error': 'No clearance type defined in view.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            file = request.data.get('file')
            if not file:
                return Response({'error': 'File is required.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                clearance_type = ClearanceType.objects.get(clearance_type__iexact=self.clearance_type)
            except ClearanceType.DoesNotExist:
                return Response({'error': 'Invalid clearance type.'}, status=status.HTTP_400_BAD_REQUEST)

            # Route to staff with specific clearance type and department for project and lab
            if clearance_type.clearance_type.lower() in ['project', 'lab']:
                staff_qs = User.objects.filter(
                    role='staff',
                    clearance_type=clearance_type,
                    department=user.department,
                    is_active=True
                )
            else: # Only check clearance_type if library clearance, student can be from any department
                staff_qs = User.objects.filter(
                    role='staff',
                    clearance_type=clearance_type,
                    is_active=True
                )

            if not staff_qs.exists():
                return Response({'error': 'No staff available to handle this type of clearance.'}, status=status.HTTP_404_NOT_FOUND)

            clearance_request = ClearanceRequest.objects.create(
                student=user,
                clearance_type=clearance_type,
                file=file
            )

            serializer = RequestSerializer(clearance_request, context={'request': request})
            return Response({'message': 'Request submitted successfully.', 'request': serializer.data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Subclasses for each type of clearance - each student can only submit each once
class ProjectClearanceView(SubmitClearanceRequestView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user
        clearance_type = ClearanceType.objects.get(clearance_type='project')

        # Check if the student already submitted a request for this clearance type
        if Request.objects.filter(student=student, clearance_type=clearance_type).exists():
            return Response({'error': 'You have already submitted a project clearance request.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Handle file & form data
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'Document is required.'}, status=status.HTTP_400_BAD_REQUEST)

        new_request = Request.objects.create(
            student=student,
            clearance_type=clearance_type,
            file=uploaded_file
        )
        return Response({'message': 'Request submitted successfully.'}, status=status.HTTP_201_CREATED)
class LabClearanceView(SubmitClearanceRequestView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user
        clearance_type = ClearanceType.objects.get(clearance_type='lab')

        # Check if the student already submitted a request for this clearance type
        if Request.objects.filter(student=student, clearance_type=clearance_type).exists():
            return Response({'error': 'You have already submitted a lab clearance request.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Handle file & form data
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'Document is required.'}, status=status.HTTP_400_BAD_REQUEST)

        new_request = Request.objects.create(
            student=student,
            clearance_type=clearance_type,
            file=uploaded_file
        )
        return Response({'message': 'Request submitted successfully.'}, status=status.HTTP_201_CREATED)
    
class LibraryClearanceView(SubmitClearanceRequestView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = request.user
        clearance_type = ClearanceType.objects.get(clearance_type='library')

        # Check if the student already submitted a request for this clearance type
        if Request.objects.filter(student=student, clearance_type=clearance_type).exists():
            return Response({'error': 'You have already submitted a library clearance request.'},
                            status=status.HTTP_400_BAD_REQUEST)

        # Handle file & form data
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'Document is required.'}, status=status.HTTP_400_BAD_REQUEST)

        new_request = Request.objects.create(
            student=student,
            clearance_type=clearance_type,
            file=uploaded_file
        )
        return Response({'message': 'Request submitted successfully.'}, status=status.HTTP_201_CREATED)

# For the student status
class RequestStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            if user.role != 'student':
                return Response(
                    {"error": "Only students can view their clearance requests."},
                    status=status.HTTP_403_FORBIDDEN
                )

            pending_requests = Request.objects.filter(student=user, status='pending')
            serializer = RequestSerializer(pending_requests, many=True, context={'request': request})

            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred while fetching pending requests: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
# student stats for the student banner
class StudentClearanceStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'student':
            return Response(
                {"error": "Only students can access their clearance stats."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            total_required = ClearanceType.objects.count()

            approved = Request.objects.filter(student=user, status='approved').count()
            pending = Request.objects.filter(student=user, status='pending').count()
            rejected = Request.objects.filter(student=user, status='rejected').count()

            total_attempted = approved + pending + rejected
            total = max(total_required, total_attempted)

            percentage = round((approved / total_required) * 100) if total_required > 0 else 0

            return Response({
                "completed": approved,
                "pending": pending,
                "total": total_required,
                "percentage": percentage
            }, status=200)

        except Exception as e:
            return Response(
                {"error": f"An error occurred while fetching stats: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
# student history api
class StudentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            if user.role != 'student':
                return Response(
                    {"error": "Access denied. Only students can view their history."},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validate user has a profile (based on email instead of broken relation)
            try:
                student_profile = ValidStudent.objects.get(university_email=user.email)
            except ValidStudent.DoesNotExist:
                return Response(
                    {"error": "Student profile not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Fetch completed requests
            completed_requests = Request.objects.filter(
                student=user,
                status__in=['approved', 'rejected']
            ).select_related('clearance_type')

            serializer = RequestSerializer(
                completed_requests, many=True, context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"An unexpected error occurred while fetching student history: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


########################################### STAFF VIEWS #############################################

# for staff to get all students assigned to them based on clearance type of the request, and in some cases their department
class AssignedStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            # Check permission
            if not has_permission(user, 'view_assigned_requests'):
                return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

            # Get clearance type from query params
            clearance_type_id = request.query_params.get('clearance_type')
            if not clearance_type_id:
                return Response({'error': 'clearance_type parameter is required (e.g. ?clearance_type=1).'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Validate clearance type
            try:
                clearance_type = ClearanceType.objects.get(id=clearance_type_id)
            except ClearanceType.DoesNotExist:
                return Response({'error': 'Invalid clearance type ID.'}, status=status.HTTP_404_NOT_FOUND)

            clearance_name = clearance_type.clearance_type.lower()
            department_filter_needed = clearance_name in ['project', 'lab']

            # Filter activated students (User model)
            user_filter = Q(role='student')
            if department_filter_needed:
                user_filter &= Q(department=user.department)

            activated_students = User.objects.filter(user_filter)

            # Convert activated users to dict for merging
            activated_serialized = UserSerializer(activated_students, many=True, context={'request': request}).data
            activated_ids = set(u['id_number'] for u in activated_serialized)

            # Filter unactivated students (ValidStudent model)
            valid_student_filter = Q(status='active')
            if department_filter_needed:
                valid_student_filter &= Q(department=user.department)

            unactivated_students = ValidStudent.objects.filter(valid_student_filter)

            # Prepare pseudo-User-like dicts for ValidStudents
            unactivated_serialized = [
                {
                    'id': None,
                    'username': vs.enrollment_number,
                    'first_name': vs.name.split()[0],
                    'last_name': ' '.join(vs.name.split()[1:]) if len(vs.name.split()) > 1 else '',
                    'email': vs.university_email,
                    'department': vs.department,
                    'avatar': request.build_absolute_uri(vs.avatar.url) if vs.avatar else None,
                    'phone': vs.phone,
                    'role': 'student',
                    'is_active': False,
                    'course': vs.course,
                    'gpa': str(vs.gpa),
                    'credits': vs.credits,
                    'admission_date': vs.admission_date,
                    'expected_graduation': vs.expected_graduation,
                    'year': vs.year,
                    'semester': vs.semester,
                    'bio': vs.bio,
                }
                for vs in unactivated_students
                if vs.enrollment_number not in activated_ids  # to avoid duplicates
            ]

            # Combine both
            combined_students = activated_serialized + unactivated_serialized

            return Response(combined_students, status=status.HTTP_200_OK)

        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': f'Unexpected server error: {str(e)}'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AssignedRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Permission check
        if not has_permission(user, 'view_assigned_requests'):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        if user.role != 'staff':
            return Response({'error': 'Only staff can view assigned requests.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            staff_clearance_type = user.clearance_type
            if not staff_clearance_type:
                return Response({'error': 'You are not assigned to any clearance type.'}, status=status.HTTP_400_BAD_REQUEST)

            if staff_clearance_type.clearance_type.lower() in ['project', 'lab']:
                requests = ClearanceRequest.objects.filter(
                    clearance_type=staff_clearance_type,
                    # normalizing case/spacing when comparing departments
                    student__department__iexact=user.department.strip()
                )
            else:
                requests = ClearanceRequest.objects.filter(clearance_type=staff_clearance_type)


            serializer = RequestSerializer(requests, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            traceback.print_exc()  # To show the full stack trace in terminal
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateRequestStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        user = request.user

        if not has_permission(user, 'approve_requests') and not has_permission(user, 'reject_requests'):
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            clearance_request = ClearanceRequest.objects.get(id=request_id)

            # Ensure staff is handling a request in their clearance_type
            if clearance_request.clearance_type != user.clearance_type:
                return Response({'error': 'You are not assigned to this clearance type.'}, status=status.HTTP_403_FORBIDDEN)

            if clearance_request.clearance_type.clearance_type.lower() in ['project', 'lab'] and \
                    clearance_request.student.department != user.department:
                return Response({'error': 'This request is not from your department.'}, status=status.HTTP_403_FORBIDDEN)

            # Get decision
            decision = request.data.get('status')
            remarks = request.data.get('remarks', '')

            if decision not in ['approved', 'rejected']:
                return Response({'error': 'Status must be "approved" or "rejected".'}, status=status.HTTP_400_BAD_REQUEST)

            # Save the report
            report, created = Report.objects.update_or_create(
                request=clearance_request,
                staff=user,
                defaults={'status': decision, 'remarks': remarks}
            )

            clearance_request.status = decision
            clearance_request.save()

            serializer = ReportSerializer(report, context={'request': request})
            return Response({'message': 'Request status updated.', 'report': serializer.data}, status=status.HTTP_200_OK)

        except ClearanceRequest.DoesNotExist:
            return Response({'error': 'Request not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Staff stats for their banner in front-end
class StaffClearanceStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # user has to have the 'staff' role
        if not has_role(user, 'staff'):
            return Response(
                {"error": "You do not have permission to access staff clearance statistics."},
                status=status.HTTP_403_FORBIDDEN
            )

        # user should have clearance_type assigned
        if not user.clearance_type:
            return Response(
                {"error": "No clearance type assigned to this staff member."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            clearance_type_id = user.clearance_type.id

            # filtering requests by clearance type
            request_queryset = Request.objects.filter(clearance_type_id=clearance_type_id)

            total_students = request_queryset.count()
            cleared_students = request_queryset.filter(status="approved").count()
            pending_students = request_queryset.filter(status="pending").count()

            percentage_cleared = (
                int((cleared_students / total_students) * 100) if total_students > 0 else 0
            )

            data = {
                "totalStudents": total_students,
                "clearedStudents": cleared_students,
                "pendingStudents": pending_students,
                "percentage": percentage_cleared
            }

            return Response(data, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            logger.exception("Failed to fetch request stats: Object not found.")
            return Response(
                {"error": "Requested data could not be found."},
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            logger.exception("An unexpected error occurred while fetching staff stats.")
            return Response(
                {"error": "An unexpected error occurred.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# staff history
class StaffHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != 'staff':
            return Response({'error': 'Only staff can access this endpoint.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            # only non-pending requests staff member has handled
            reports = Report.objects.filter(staff=user).exclude(status='pending')
            requests_handled = [report.request for report in reports]

            serializer = RequestSerializer(requests_handled, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f"Failed to fetch staff history. Reason: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


########################################### ADMIN VIEWS #############################################