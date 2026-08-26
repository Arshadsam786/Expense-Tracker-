from rest_framework import serializers
from .models import Category, Transaction, Budget


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'kind', 'icon', 'color')


class TransactionSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_kind = serializers.CharField(source='category.kind', read_only=True)

    class Meta:
        model = Transaction
        fields = (
            'id', 'category', 'category_name', 'category_kind',
            'amount', 'currency', 'note', 'date', 'need_or_want',
            'is_recurring_instance', 'created_at',
        )
        read_only_fields = ('id', 'created_at')

    def validate_category(self, category):
        request = self.context['request']
        if category.user_id != request.user.id:
            raise serializers.ValidationError("That category doesn't belong to you.")
        return category


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent_this_month = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ('id', 'category', 'category_name', 'monthly_limit', 'spent_this_month')

    def get_spent_this_month(self, obj):
        from django.utils import timezone
        from django.db.models import Sum
        today = timezone.now().date()
        total = obj.category.transactions.filter(
            user=obj.user, date__year=today.year, date__month=today.month,
        ).aggregate(total=Sum('amount'))['total']
        return total or 0
