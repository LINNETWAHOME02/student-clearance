from rest_framework import serializers
from accounts.models import *

class ActivationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    id_number = serializers.CharField()
    name = serializers.CharField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['student', 'staff', 'systemadmin'])
    clearance_type = serializers.CharField(required=False, allow_blank=True)
    
# Simple serializer for user updates
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'id_number', 'email', 'name', 'clearance_type']
        extra_kwargs = {
            'email': {'required': False},
            'name': {'required': False},
        }