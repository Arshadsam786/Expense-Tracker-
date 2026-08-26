from datetime import date

from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Transaction, Budget
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer


class IsOwner(permissions.IsAuthenticated):
    """Objects are always scoped to request.user in get_queryset, so this
    just guards against anonymous access — kept explicit for clarity."""
    pass


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'category__kind', 'need_or_want', 'date']

    def get_queryset(self):
        qs = Transaction.objects.filter(user=self.request.user).select_related('category')
        # Optional date-range filtering: /api/transactions/?start=2026-08-01&end=2026-08-31
        start = self.request.query_params.get('start')
        end = self.request.query_params.get('end')
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        GET /api/transactions/summary/?year=2026&month=8
        Powers the dashboard: totals + per-category breakdown for the pie chart.
        """
        today = timezone.now().date()
        year = int(request.query_params.get('year', today.year))
        month = int(request.query_params.get('month', today.month))

        qs = Transaction.objects.filter(user=request.user, date__year=year, date__month=month)

        income = qs.filter(category__kind=Category.Kind.INCOME).aggregate(total=Sum('amount'))['total'] or 0
        expense = qs.filter(category__kind=Category.Kind.EXPENSE).aggregate(total=Sum('amount'))['total'] or 0

        by_category = (
            qs.filter(category__kind=Category.Kind.EXPENSE)
            .values('category__id', 'category__name', 'category__color')
            .annotate(total=Sum('amount'))
            .order_by('-total')
        )

        return Response({
            'year': year,
            'month': month,
            'total_income': income,
            'total_expense': expense,
            'net': income - expense,
            'by_category': list(by_category),
        })


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsOwner]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user).select_related('category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
