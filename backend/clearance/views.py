from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from accounts.models import User, ClearanceType
from accounts.serializers import UserSerializer
from django.core.exceptions import ObjectDoesNotExist

from accounts.models import *


########################################### STUDENT VIEWS #############################################




########################################### STAFF VIEWS #############################################

# for staff to get all students assigned to them based on clearance type of the request, and in some cases their department
class AssignedStudentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            if user.role != 'staff':
                return Response({'error': 'Only staff can view assigned students.'}, status=status.HTTP_403_FORBIDDEN)

            clearance_type_id = request.query_params.get('clearance_type')

            if not clearance_type_id:
                return Response({'error': 'Clearance type is required (e.g. ?clearance_type=1).'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                clearance_type = ClearanceType.objects.get(id=clearance_type_id)
            except ClearanceType.DoesNotExist:
                return Response({'error': 'Invalid clearance type.'}, status=status.HTTP_404_NOT_FOUND)

            # filter based on clearance type
            if clearance_type.clearance_type in ['Project', 'Lab']: # these two will need to happen in the specific department
                students = User.objects.filter(
                    role='student',
                    is_active=True,
                    clearance_type=clearance_type,
                    department=user.department
                )
            elif clearance_type.clearance_type == 'Library':
                students = User.objects.filter(
                    role='student',
                    is_active=True,
                    clearance_type=clearance_type
                )
            else:
                return Response({'error': 'Unsupported clearance type.'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserSerializer(students, many=True, context={'request': request})
            return Response(serializer.data)

        except Exception as e:
            return Response({'error': f'Unexpected server error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






########################################### ADMIN VIEWS #############################################