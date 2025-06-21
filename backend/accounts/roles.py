from rolepermissions.roles import AbstractUserRole

class Student(AbstractUserRole):
    available_permissions = {
        'submit_request': True,
        'upload_documents': True,
        'view_own_requests': True,
        'communicate_with_staff': True,
        'view_request_history': True,
    }

class Staff(AbstractUserRole):
    available_permissions = {
        'view_assigned_requests': True,
        'approve_requests': True,
        'reject_requests': True,
        'communicate_with_student': True,
        'view_request_history': True,
    }

class Admin(AbstractUserRole):
    available_permissions = {
        'view_all_requests': True,
        'override_decisions': True,
        'manage_staff_accounts': True,
        'view_system_activities': True,
    }