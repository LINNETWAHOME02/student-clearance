from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

# Set max_length to something MySQL allows for indexed fields
OutstandingToken._meta.get_field('jti').max_length = 191