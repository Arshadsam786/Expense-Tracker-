from django.conf import settings
from django.db import models


class Category(models.Model):
    """
    Expense/income categories. A small set of defaults is created per user
    on signup (see signals.py), but users can add their own.
    """
    class Kind(models.TextChoices):
        EXPENSE = 'expense', 'Expense'
        INCOME = 'income', 'Income'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=50)
    kind = models.CharField(max_length=10, choices=Kind.choices, default=Kind.EXPENSE)
    icon = models.CharField(max_length=30, blank=True, default='')  # e.g. 'utensils', 'home'
    color = models.CharField(max_length=7, blank=True, default='#6366f1')  # hex for charts

    class Meta:
        unique_together = ('user', 'name', 'kind')
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.kind})'


class Transaction(models.Model):
    class NeedWant(models.TextChoices):
        NEED = 'need', 'Need'
        WANT = 'want', 'Want'
        NA = 'na', 'Not applicable'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # always positive; sign comes from category.kind
    currency = models.CharField(max_length=3, default='INR')
    note = models.CharField(max_length=255, blank=True, default='')
    date = models.DateField()  # user-selectable, so past expenses can be logged
    need_or_want = models.CharField(max_length=4, choices=NeedWant.choices, default=NeedWant.NA)
    is_recurring_instance = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f'{self.category.name}: {self.amount} {self.currency} on {self.date}'


class Budget(models.Model):
    """
    A monthly spending limit per category, e.g. 'Food: 5000 INR / month'.
    Powers the visual budget-limit progress bars on the dashboard.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    monthly_limit = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        unique_together = ('user', 'category')

    def __str__(self):
        return f'{self.category.name} limit: {self.monthly_limit}'
