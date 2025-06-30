from django.db import models

from accounts.models import *

class Request(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    clearance_type = models.ForeignKey(ClearanceType, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.student.username} - {self.clearance_type} ({self.status})"


class Comment(models.Model):
    request = models.ForeignKey(Request, on_delete=models.CASCADE) # so that it's specific to the request
    sender = models.ForeignKey(User, related_name='sent_comments', on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, related_name='received_comments', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"From {self.sender} to {self.recipient}: {self.content[:20]}"


class Report(models.Model):
    request = models.OneToOneField(Request, on_delete=models.CASCADE)
    staff = models.ForeignKey(User, on_delete=models.CASCADE)
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    remarks = models.TextField(blank=True, null=True)
    document = models.FileField(upload_to='reports/', null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.request} - {self.status}"