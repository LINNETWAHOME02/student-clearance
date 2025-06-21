from django.db import models

from accounts.models import *

# The request model itself, student places the request through respective forms in frontend, and from the specific form filled, it sends the request to the respective staff
class Request(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, blank=False)
    clearance_type_id = models.ForeignKey(ClearanceType, on_delete=models.CASCADE)
    
    # For uploaded files
    file = models.FileField(upload_to='documents/')

    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='active')
    
# Staff can comment on clearance request, student can see comment and comment as well and vice versa
class Comment(models.Model):
    sender = models.ForeignKey(User, related_name= 'sender', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name= 'recipient', on_delete=models.CASCADE)
    # Actual message content
    content = models.TextField()
    
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender} to {self.recipient}: {self.content[:20]}"
    
# For status of the request for both user roles to see the status of the application
class Report(models.Model):
    report = models.ForeignKey(Request, on_delete=models.CASCADE)
    staff = models.ForeignKey(User, on_delete=models.CASCADE)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('rejected',  'Rejected'),
    ]
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )