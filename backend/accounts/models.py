from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user so we can attach app-specific fields (default currency,
    monthly budget goal, etc.) without a painful migration later.
    """
    default_currency = models.CharField(max_length=3, default='INR')

    def __str__(self):
        return self.username
