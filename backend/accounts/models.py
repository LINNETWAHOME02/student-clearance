from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('staff', 'Staff'),
        ('systemadmin', 'SystemAdmin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    clearance_type = models.CharField(
        max_length=50,
        choices=[
            ('project', 'Project'),
            ('lab', 'Lab'),
            ('library', 'Library'),
        ],
        blank=True,
        null=True,
        help_text='Applicable only for staff users'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
    
''' Only for validation during account activation '''
class ValidStudent(models.Model):
    enrollment_number = models.CharField(max_length=20, unique=True)
    university_email = models.EmailField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    
    # Eligible to activate (recognised by institution)
    status = models.CharField(max_length=20, default='active')

    def __str__(self):
        return f"{self.name} ({self.enrollment_number})"


class ValidStaff(models.Model):
    staff_id = models.CharField(max_length=20, unique=True)
    university_email = models.EmailField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    clearance_type = models.CharField(
        max_length=50,
        choices=[
            ('project', 'Project'),
            ('lab', 'Lab'),
            ('library', 'Library'),
        ],
        blank=True,
        null=True
    )
    role = models.CharField(
        max_length=20,
        choices=[
            ('staff', 'Staff'),
            ('admin', 'Admin'),  # No separate ValidAdmin model needed, instead, when the ValidStaff.role is set to'admin', it will represent the system admin(like a hod)
        ],
        default='staff'
    )
    # Eligible to activate (recognised by institution)
    status = models.CharField(max_length=20, default='active')

    def __str__(self):
        return f"{self.name} ({self.staff_id})"