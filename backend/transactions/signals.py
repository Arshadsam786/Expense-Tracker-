from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Category

DEFAULT_EXPENSE_CATEGORIES = [
    ('Food', '#f97316'),
    ('Rent', '#8b5cf6'),
    ('Transport', '#0ea5e9'),
    ('Utilities', '#14b8a6'),
    ('Entertainment', '#ec4899'),
    ('Health', '#ef4444'),
    ('Shopping', '#eab308'),
    ('Other', '#64748b'),
]
DEFAULT_INCOME_CATEGORIES = [
    ('Salary', '#22c55e'),
    ('Freelance', '#10b981'),
    ('Other Income', '#84cc16'),
]


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_categories(sender, instance, created, **kwargs):
    """Give every new user a starter set of categories so the app isn't
    empty on first login."""
    if not created:
        return
    Category.objects.bulk_create([
        Category(user=instance, name=name, kind=Category.Kind.EXPENSE, color=color)
        for name, color in DEFAULT_EXPENSE_CATEGORIES
    ])
    Category.objects.bulk_create([
        Category(user=instance, name=name, kind=Category.Kind.INCOME, color=color)
        for name, color in DEFAULT_INCOME_CATEGORIES
    ])
