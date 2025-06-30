from rest_framework import serializers
from .models import Request, Comment, Report
from accounts.serializers import *

# Serializer for request status/decision by staff
class ReportSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)
    staff_email = serializers.EmailField(source='staff.email', read_only=True)
    request_id = serializers.PrimaryKeyRelatedField(source='request', read_only=True)
    remarks = serializers.CharField(read_only=True)
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M", read_only=True)
    document = serializers.FileField(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'request_id',
            'staff',
            'staff_name',
            'staff_email',
            'status',
            'remarks',
            'timestamp',
            'document'
        ]
        read_only_fields = ['id', 'request_id', 'staff_name', 'timestamp', 'remarks', 'document']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        if user and user.role != 'staff':
            raise serializers.ValidationError("Only staff can submit or update reports.")
        return data

# Serializer for submitting/viewing a clearance request
class RequestSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    clearance_type = serializers.CharField(source='clearance_type_id.clearance_type', read_only=True)
    file = serializers.FileField(required=True)
    type = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    report = ReportSerializer(read_only=True)

    class Meta:
        model = Request
        fields = [
            'id',
            'student',
            'clearance_type_id',
            'clearance_type',
            'type',
            'file',
            'documents',
            'date',
            'priority',
            'created_at',
            'status',
            'comments',
            'report'
        ]
        read_only_fields = ['id', 'created_at', 'status', 'clearance_type', 'type', 'priority', 'date', 'documents', 'comments']

    def get_type(self, obj):
        return obj.clearance_type.clearance_type

    def get_date(self, obj):
        return obj.created_at.strftime('%Y-%m-%d')

    def get_priority(self, obj):
        clearance_type = obj.clearance_type.clearance_type.lower()

        if clearance_type == 'project':
            return 'high'
        elif clearance_type == 'lab' or clearance_type == 'library':
            return 'medium'
        return 'low'


    def get_comments(self, obj):
        return []

    def get_documents(self, obj):
        return [obj.file.name] if obj.file else []

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        if user and user.role != 'student':
            raise serializers.ValidationError("Only students can submit clearance requests.")
        return data


# Serializer for staff/student comments on a request
class CommentSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    recipient_name = serializers.CharField(source='recipient.get_full_name', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'sender', 'sender_name', 'recipient', 'recipient_name', 'content', 'timestamp', 'is_read']
        read_only_fields = ['id', 'timestamp', 'sender_name', 'recipient_name', 'is_read']