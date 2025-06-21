from django.contrib.auth.models import AbstractUser
from django.db import models

from datetime import date, timedelta
from django.utils import timezone

class ClearanceType(models.Model):
    clearance_type = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.clearance_type
class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('staff', 'Staff'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    clearance_type = models.ForeignKey(ClearanceType, on_delete=models.SET_NULL, blank=True, null=True)
    department = models.CharField(max_length=100)
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    course = models.CharField(max_length=100, blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    semester = models.CharField(max_length=50, blank=True, null=True)
    admission_date = models.DateField(blank=True, null=True)
    expected_graduation = models.DateField(blank=True, null=True)
    gpa = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    credits = models.CharField(max_length=20, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
    
''' Only for validation during account activation '''
class ValidStudent(models.Model):
    enrollment_number = models.CharField(max_length=20, unique=True)
    university_email = models.EmailField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    
    course = models.CharField(max_length=100)
    admission_date = models.DateField()
    gpa = models.DecimalField(max_digits=4, decimal_places=2)
    credits = models.CharField(max_length=20)
    phone = models.CharField(max_length=20)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, default='active')

    def save(self, *args, **kwargs):
        # To auto-set graduation (admission + 4 years)
        if not self.expected_graduation:
            self.expected_graduation = self.admission_date.replace(year=self.admission_date.year + 4)

        # Auto-calculate current year and semester based on current date
        today = timezone.now().date()
        if self.admission_date:
            delta = (today.year - self.admission_date.year) * 12 + (today.month - self.admission_date.month)
            self.year = min(4, (delta // 12) + 1)
            self.semester = min(8, (delta // 6) + 1)

        super().save(*args, **kwargs)

    expected_graduation = models.DateField(blank=True, null=True)
    year = models.PositiveSmallIntegerField(blank=True, null=True)
    semester = models.PositiveSmallIntegerField(blank=True, null=True)


class ValidStaff(models.Model):
    staff_id = models.CharField(max_length=20, unique=True)
    university_email = models.EmailField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    clearance_type = models.ForeignKey(ClearanceType, on_delete=models.SET_NULL, blank=True, null=True)
    
    phone = models.CharField(max_length=20, blank=False, null=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    
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