from rest_framework import serializers
from accounts.models import *

class ActivationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    id_number = serializers.CharField()
    name = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['student', 'staff', 'admin'])
    clearance_type = serializers.CharField(required=False, allow_blank=True)
    
# For get requests to view current details
class UserSerializer(serializers.ModelSerializer):
    id_number = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    studentId = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'name', 'email', 'studentId',
            'id_number', 'role', 'department', 'clearance_type', 'is_active',
            'phone', 'avatar', 'bio', 'course', 'year', 'semester',
            'admission_date', 'expected_graduation', 'gpa', 'credits', 'position'
        ]

    def get_id_number(self, obj):
        return obj.username

    def get_studentId(self, obj):
        return obj.username

    def get_name(self, obj):
        return obj.get_full_name()

    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None
    
# Simple serializer for user updates
class UserUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone', 'avatar', 'bio', 'gpa', 'credits', 'position']
        read_only_fields = ['semester', 'year']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # Remove student-only fields for non-students
        user = self.context.get('request').user
        if user.role != 'student':
            self.fields.pop('gpa', None)
            self.fields.pop('credits', None)
        
    def get_avatar(self, obj):
        request = self.context.get('request')
        if obj.avatar and hasattr(obj.avatar, 'url'):
            return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url
        return None
