from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Sum,Avg
from farm.permission import IsFarmDataUser,IsFarmDataReadOnlyForStaff
from django.utils import timezone
from .models import Category, Product, Income, Expense,Production
from rest_framework.views import APIView
from .pagination import FarmPagination
from openpyxl import Workbook
from django.http import HttpResponse
from django.db.models.functions import TruncMonth
from datetime import datetime
from django.db.models.deletion import ProtectedError
from .serializers import (
    CategorySerializers,
    ProductSerializer,
    IncomeSerializer,
    ExpenseSerializer,
    ProductionSerializer
)





class ProductProductionSalesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        year = request.query_params.get("year")
        month = request.query_params.get("month")

        # --------------------------------
        # Validate Year
        # --------------------------------

        if year:

            try:
                year = int(year)

            except ValueError:
                return Response(
                    {
                        "success": False,
                        "error": "Year must be a number."
                    },
                    status=400
                )

            if year < 2000 or year > 2100:
                return Response(
                    {
                        "success": False,
                        "error": "Invalid year."
                    },
                    status=400
                )

        # --------------------------------
        # Validate Month
        # --------------------------------

        if month:

            try:
                month = int(month)

            except ValueError:
                return Response(
                    {
                        "success": False,
                        "error": "Month must be a number."
                    },
                    status=400
                )

            if month < 1 or month > 12:
                return Response(
                    {
                        "success": False,
                        "error": "Month must be between 1 and 12."
                    },
                    status=400
                )

        # --------------------------------
        # Products
        # --------------------------------

        products = Product.objects.select_related(
            "category"
        ).all()

        report = []

        for product in products:

            # --------------------------------
            # Production
            # --------------------------------

            productions = Production.objects.filter(
                product=product
            )

            if year:
                productions = productions.filter(
                    date__year=year
                )

            if month:
                productions = productions.filter(
                    date__month=month
                )

            production_data = productions.aggregate(
                total_quantity=Sum("quantity")
            )

            total_production = (
                production_data["total_quantity"] or 0
            )

            # --------------------------------
            # Sales / Income
            # --------------------------------

            incomes = Income.objects.filter(
                product=product
            )

            if year:
                incomes = incomes.filter(
                    date__year=year
                )

            if month:
                incomes = incomes.filter(
                    date__month=month
                )

            sales_data = incomes.aggregate(
                total_quantity=Sum("quantity"),
                total_income=Sum("total_amount")
            )

            total_sales = (
                sales_data["total_quantity"] or 0
            )

            total_income = (
                sales_data["total_income"] or 0
            )

            # --------------------------------
            # Skip products with no activity
            # --------------------------------

            if total_production == 0 and total_sales == 0:
                continue

            # --------------------------------
            # Remaining
            # --------------------------------

            remaining = total_production - total_sales

            # --------------------------------
            # Unit
            # --------------------------------

            production_unit = (
                productions
                .values_list(
                    "unit",
                    flat=True
                )
                .first()
            )

            sales_unit = (
                incomes
                .values_list(
                    "unit",
                    flat=True
                )
                .first()
            )

            # --------------------------------
            # Response data
            # --------------------------------

            report.append({
                "product_id": product.id,
                "product_name": product.name,
                "category_name": product.category.name,

                "production_unit": production_unit,
                "sales_unit": sales_unit,

                "total_production": total_production,
                "total_sales": total_sales,
                "remaining": remaining,

                "total_income": total_income,
            })

        # --------------------------------
        # Final Response
        # --------------------------------

        return Response({
            "success": True,
            "year": year,
            "month": month,
            "product_production_sales": report
        })


class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        today = timezone.localdate()

        # =========================
        # TOTAL INCOME
        # =========================

        total_income = (
            Income.objects.aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        # =========================
        # TOTAL EXPENSE
        # =========================

        total_expense = (
            Expense.objects.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        # =========================
        # TOTAL PROFIT / LOSS
        # =========================

        total_profit = total_income - total_expense

        # =========================
        # TODAY'S INCOME
        # =========================

        today_income = (
            Income.objects.filter(
                date__date=today
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        # =========================
        # TODAY'S EXPENSE
        # =========================

        today_expense = (
            Expense.objects.filter(
                date=today
            ).aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        today_profit = today_income - today_expense

        # =========================
        # CURRENT MONTH INCOME
        # =========================

        month_income = (
            Income.objects.filter(
                date__year=today.year,
                date__month=today.month
            ).aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        # =========================
        # CURRENT MONTH EXPENSE
        # =========================

        month_expense = (
            Expense.objects.filter(
                date__year=today.year,
                date__month=today.month
            ).aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        month_profit = month_income - month_expense

        # =========================
        # PRODUCTION
        # =========================

        total_production = (
            Production.objects.aggregate(
                total=Sum("quantity")
            )["total"] or 0
        )

        today_production = (
            Production.objects.filter(
                date=today
            ).aggregate(
                total=Sum("quantity")
            )["total"] or 0
        )

        month_production = (
            Production.objects.filter(
                date__year=today.year,
                date__month=today.month
            ).aggregate(
                total=Sum("quantity")
            )["total"] or 0
        )

        # =========================
        # COUNTS
        # =========================

        total_products = Product.objects.count()

        total_categories = Category.objects.count()

        # =========================
        # RECENT INCOME
        # =========================

        recent_income = (
            Income.objects
            .select_related("product")
            .order_by("-created_at")[:5]
        )

        recent_income_data = []

        for income in recent_income:

            recent_income_data.append({
                "id": income.id,
                "product": income.product.name,
                "quantity": income.quantity,
                "unit": income.unit,
                "total_amount": income.total_amount,
                "date": income.date,
            })

        # =========================
        # RECENT EXPENSE
        # =========================

        recent_expense = (
            Expense.objects
            .select_related("category")
            .order_by("-created_at")[:5]
        )

        recent_expense_data = []

        for expense in recent_expense:

            recent_expense_data.append({
                "id": expense.id,
                "category": expense.category.name,
                "expense_type": expense.expense_type,
                "amount": expense.amount,
                "date": expense.date,
            })

        # =========================
        # RECENT PRODUCTION
        # =========================

        recent_production = (
            Production.objects
            .select_related("product")
            .order_by("-created_at")[:5]
        )

        recent_production_data = []

        for production in recent_production:

            recent_production_data.append({
                "id": production.id,
                "product": production.product.name,
                "quantity": production.quantity,
                "unit": production.unit,
                "date": production.date,
            })

        # =========================
        # RESPONSE
        # =========================

        return Response({

            "total": {

                "income": total_income,

                "expense": total_expense,

                "profit_loss": total_profit,

                "production": total_production,

            },

            "today": {

                "income": today_income,

                "expense": today_expense,

                "profit_loss": today_profit,

                "production": today_production,

            },

            "this_month": {

                "income": month_income,

                "expense": month_expense,

                "profit_loss": month_profit,

                "production": month_production,

            },

            "counts": {

                "products": total_products,

                "categories": total_categories,

            },

            "recent_income": recent_income_data,

            "recent_expense": recent_expense_data,

            "recent_production": recent_production_data,

        })

class ProductSalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        year = request.query_params.get("year")
        month = request.query_params.get("month")

        incomes = Income.objects.select_related(
            "product",
            "product__category"
        ).all()

        # Year filter
        if year:
            incomes = incomes.filter(
                date__year=year
            )

        # Month filter
        if month:
            incomes = incomes.filter(
                date__month=month
            )

        report = (
            incomes
            .values(
                "product_id",
                "product__name",
                "product__category__name",
                "unit"
            )
            .annotate(
                total_quantity=Sum("quantity"),
                total_income=Sum("total_amount"),
                average_unit_price=Avg("unit_price")
            )
            .order_by("product__name")
        )

        data = []

        for item in report:

            data.append({
                "product_id": item["product_id"],
                "product_name": item["product__name"],
                "category_name": item["product__category__name"],
                "unit": item["unit"],
                "total_quantity": item["total_quantity"],
                "total_income": item["total_income"],
                "average_unit_price": item["average_unit_price"],
            })

        return Response({
            "year": year,
            "month": month,
            "product_sales_report": data
        })


class DashboardChartView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        year = request.query_params.get(
            "year",
            timezone.localdate().year
        )

        # -------------------------
        # Validate Year
        # -------------------------

        try:
            year = int(year)

        except ValueError:

            return Response(
                {
                    "success": False,
                    "error": "Year must be a number."
                },
                status=400
            )

        if year < 2000 or year > 2100:

            return Response(
                {
                    "success": False,
                    "error": "Invalid year."
                },
                status=400
            )

        # -------------------------
        # Monthly Income
        # -------------------------

        income_data = (
            Income.objects
            .filter(date__year=year)
            .annotate(
                month=TruncMonth("date")
            )
            .values("month")
            .annotate(
                total_income=Sum("total_amount")
            )
            .order_by("month")
        )

        income_dict = {
            item["month"].month: item["total_income"]
            for item in income_data
        }

        # -------------------------
        # Monthly Expense
        # -------------------------

        expense_data = (
            Expense.objects
            .filter(date__year=year)
            .annotate(
                month=TruncMonth("date")
            )
            .values("month")
            .annotate(
                total_expense=Sum("amount")
            )
            .order_by("month")
        )

        expense_dict = {
            item["month"].month: item["total_expense"]
            for item in expense_data
        }

        # -------------------------
        # Prepare Chart Data
        # -------------------------

        chart_data = []

        for month in range(1, 13):

            income = income_dict.get(month, 0)

            expense = expense_dict.get(month, 0)

            profit_loss = income - expense

            chart_data.append({
                "month": month,
                "income": income,
                "expense": expense,
                "profit_loss": profit_loss,
            })

        # -------------------------
        # Response
        # -------------------------

        return Response({

            "success": True,

            "year": year,

            "chart_data": chart_data

        })


class CategoryProfitabilityView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        categories = Category.objects.all()

        report = []

        for category in categories:

            # Category-এর সব Product থেকে Income
            income = (
                category.products
                .aggregate(
                    total=Sum("incomes__total_amount")
                )["total"] or 0
            )

            # Category-এর direct Expense
            expense = (
                category.expenses
                .aggregate(
                    total=Sum("amount")
                )["total"] or 0
            )

            profit_loss = income - expense

            report.append({
                "category_id": category.id,
                "category_name": category.name,
                "income": income,
                "expense": expense,
                "profit_loss": profit_loss,
            })

        return Response({
            "category_profitability": report
        })



class IncomeExcelExportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        incomes = Income.objects.select_related(
            "product",
            "product__category"
        ).all()

        workbook = Workbook()
        worksheet = workbook.active

        worksheet.title = "Income Report"

        # Header
        worksheet.append([
            "ID",
            "Product",
            "Category",
            "Quantity",
            "Unit",
            "Unit Price",
            "Total Amount",
            "Date",
            "Note",
            "Created By",
        ])

        # Data
        for income in incomes:

            worksheet.append([
                income.id,
                income.product.name,
                income.product.category.name,
                float(income.quantity),
                income.unit,
                float(income.unit_price),
                float(income.total_amount),
                income.date.strftime("%Y-%m-%d %H:%M"),
                income.note,
                income.created_by.username,
            ])

        response = HttpResponse(
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response["Content-Disposition"] = (
            'attachment; filename="income_report.xlsx"'
        )

        workbook.save(response)

        return response


class ExpenseExcelExportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        expenses = Expense.objects.select_related(
            "category"
        ).all()

        workbook = Workbook()
        worksheet = workbook.active

        worksheet.title = "Expense Report"

        worksheet.append([
            "ID",
            "Category",
            "Expense Type",
            "Amount",
            "Date",
            "Note",
            "Created By",
        ])

        for expense in expenses:

            worksheet.append([
                expense.id,
                expense.category.name,
                expense.expense_type,
                float(expense.amount),
                expense.date.strftime("%Y-%m-%d"),
                expense.note,
                expense.created_by.username,
            ])

        response = HttpResponse(
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            )
        )

        response["Content-Disposition"] = (
            'attachment; filename="expense_report.xlsx"'
        )

        workbook.save(response)

        return response    

class DateRangeReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        # --------------------------------
        # Check required parameters
        # --------------------------------

        if not start_date or not end_date:

            return Response(
                {
                    "success": False,
                    "error": "start_date and end_date are required.",
                    "example": (
                        "/api/reports/date-range/"
                        "?start_date=2026-09-01"
                        "&end_date=2026-09-29"
                    )
                },
                status=400
            )

        # --------------------------------
        # Validate date format
        # --------------------------------

        try:

            start_date = datetime.strptime(
                start_date,
                "%Y-%m-%d"
            ).date()

            end_date = datetime.strptime(
                end_date,
                "%Y-%m-%d"
            ).date()

        except ValueError:

            return Response(
                {
                    "success": False,
                    "error": "Date must be in YYYY-MM-DD format."
                },
                status=400
            )

        # --------------------------------
        # Validate date range
        # --------------------------------

        if start_date > end_date:

            return Response(
                {
                    "success": False,
                    "error": "start_date cannot be greater than end_date."
                },
                status=400
            )

        # --------------------------------
        # Income
        # --------------------------------

        income = (
            Income.objects
            .filter(
                date__date__range=[
                    start_date,
                    end_date
                ]
            )
            .aggregate(
                total=Sum("total_amount")
            )["total"] or 0
        )

        # --------------------------------
        # Expense
        # --------------------------------

        expense = (
            Expense.objects
            .filter(
                date__range=[
                    start_date,
                    end_date
                ]
            )
            .aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        # --------------------------------
        # Profit / Loss
        # --------------------------------

        profit_loss = income - expense

        # --------------------------------
        # Response
        # --------------------------------

        return Response(
            {
                "success": True,
                "start_date": start_date,
                "end_date": end_date,
                "income": income,
                "expense": expense,
                "profit_loss": profit_loss
            }
        )
class MonthlyReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        year = request.query_params.get("year")

        if not year:
            year = timezone.localdate().year

        year = int(year)

        report = []

        for month in range(1, 13):

            income = (
                Income.objects
                .filter(
                    date__year=year,
                    date__month=month
                )
                .aggregate(
                    total=Sum("total_amount")
                )["total"] or 0
            )

            expense = (
                Expense.objects
                .filter(
                    date__year=year,
                    date__month=month
                )
                .aggregate(
                    total=Sum("amount")
                )["total"] or 0
            )

            profit_loss = income - expense

            report.append({
                "month": month,
                "income": income,
                "expense": expense,
                "profit_loss": profit_loss,
            })

        return Response({
            "year": year,
            "monthly_report": report
        })

class CategoryReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        categories = Category.objects.all()

        report = []

        for category in categories:

            # Category-এর সব Product-এর Income
            income = (
                category.products
                .aggregate(
                    total=Sum("incomes__total_amount")
                )["total"] or 0
            )

            # Category-এর Expense
            expense = (
                category.expenses
                .aggregate(
                    total=Sum("amount")
                )["total"] or 0
            )

            profit_loss = income - expense

            report.append({
                "category_id": category.id,
                "category_name": category.name,
                "income": income,
                "expense": expense,
                "profit_loss": profit_loss,
            })

        return Response(report)
class CategoryViewSet(viewsets.ModelViewSet):

    queryset = Category.objects.all()
    serializer_class = CategorySerializers
    permission_classes = [IsFarmDataReadOnlyForStaff]

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )


    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        try:
           instance.delete()

        except ProtectedError:
          return Response(
            {
                "success": False,
                "message": "This category cannot be deleted because it is being used by a product."
            },
            status=status.HTTP_400_BAD_REQUEST
           )

        return Response(
        {
            "success": True,
            "message": "Category deleted successfully."
        },
        status=status.HTTP_200_OK
    )    


class ProductViewSet(viewsets.ModelViewSet):

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsFarmDataReadOnlyForStaff]

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )
class ProductionViewSet(viewsets.ModelViewSet):

    queryset = Production.objects.all()
    serializer_class = ProductionSerializer
    permission_classes = [IsFarmDataUser]

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):

        serializer.save(
            updated_by=self.request.user
        )
class ProductionReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        year = request.query_params.get("year")
        month = request.query_params.get("month")

        productions = Production.objects.select_related(
            "product"
        ).all()

        # Filter by year
        if year:
            productions = productions.filter(
                date__year=year
            )

        # Filter by month
        if month:
            productions = productions.filter(
                date__month=month
            )

        report = (
            productions
            .values(
                "product_id",
                "product__name",
                "unit"
            )
            .annotate(
                total_quantity=Sum("quantity")
            )
            .order_by("product__name")
        )

        data = []

        for item in report:

            data.append({
                "product_id": item["product_id"],
                "product_name": item["product__name"],
                "unit": item["unit"],
                "total_quantity": item["total_quantity"],
            })

        return Response({
            "year": year,
            "month": month,
            "production_report": data
        })



class ProductionSummaryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        period = request.query_params.get("period", "monthly")

        # =========================
        # Dashboard Summary
        # =========================
        if period == "dashboard":

            today = timezone.localdate()

            # -------------------------
            # Lifetime Production
            # -------------------------

            lifetime_report = (
                Production.objects
                .values(
                    "product_id",
                    "product__name",
                    "unit"
                )
                .annotate(
                    total_quantity=Sum("quantity")
                )
                .order_by(
                    "product__name",
                    "unit"
                )
            )

            lifetime_data = []

            for item in lifetime_report:

                lifetime_data.append({
                    "product_id": item["product_id"],
                    "product_name": item["product__name"],
                    "unit": item["unit"],
                    "total_quantity": item["total_quantity"],
                })


            # -------------------------
            # This Month Production
            # -------------------------

            monthly_report = (
                Production.objects
                .filter(
                    date__year=today.year,
                    date__month=today.month
                )
                .values(
                    "product_id",
                    "product__name",
                    "unit"
                )
                .annotate(
                    total_quantity=Sum("quantity")
                )
                .order_by(
                    "product__name",
                    "unit"
                )
            )

            monthly_data = []

            for item in monthly_report:

                monthly_data.append({
                    "product_id": item["product_id"],
                    "product_name": item["product__name"],
                    "unit": item["unit"],
                    "total_quantity": item["total_quantity"],
                })


            return Response({
                "period": "dashboard",

                "lifetime_production": lifetime_data,

                "this_month_production": monthly_data
            })


        # =========================
        # Daily Summary
        # =========================
        if period == "daily":

            report = (
                Production.objects
                .values(
                    "date",
                    "product_id",
                    "product__name",
                    "unit"
                )
                .annotate(
                    total_quantity=Sum("quantity")
                )
                .order_by(
                    "date",
                    "product__name"
                )
            )

            data = []

            for item in report:

                data.append({
                    "date": item["date"],
                    "product_id": item["product_id"],
                    "product_name": item["product__name"],
                    "unit": item["unit"],
                    "total_quantity": item["total_quantity"],
                })

            return Response({
                "period": "daily",
                "production_summary": data
            })


        # =========================
        # Monthly Summary
        # =========================

        report = (
            Production.objects
            .annotate(
                month=TruncMonth("date")
            )
            .values(
                "month",
                "product_id",
                "product__name",
                "unit"
            )
            .annotate(
                total_quantity=Sum("quantity")
            )
            .order_by(
                "month",
                "product__name"
            )
        )

        data = []

        for item in report:

            data.append({
                "month": item["month"].strftime("%Y-%m"),
                "product_id": item["product_id"],
                "product_name": item["product__name"],
                "unit": item["unit"],
                "total_quantity": item["total_quantity"],
            })

        return Response({
            "period": "monthly",
            "production_summary": data
        })
class IncomeViewSet(viewsets.ModelViewSet):

    queryset = Income.objects.all().order_by("-created_at")
    serializer_class = IncomeSerializer
    permission_classes = [IsFarmDataUser]
    pagination_class = FarmPagination

    filterset_fields = [
        "product",
        "unit",
        "date",
    ]

    search_fields = [
        "product__name",
        "unit",
        "note",
    ]

    ordering_fields = [
        "quantity",
        "unit_price",
        "total_amount",
        "date",
        "created_at",
    ]

    def perform_create(self, serializer):

        quantity = serializer.validated_data["quantity"]
        unit_price = serializer.validated_data["unit_price"]

        total_amount = quantity * unit_price

        serializer.save(
            created_by=self.request.user,
            total_amount=total_amount
        )

    def perform_update(self, serializer):

        quantity = serializer.validated_data.get(
            "quantity",
            serializer.instance.quantity
        )

        unit_price = serializer.validated_data.get(
            "unit_price",
            serializer.instance.unit_price
        )

        total_amount = quantity * unit_price

        serializer.save(
            updated_by=self.request.user,
            total_amount=total_amount
        )

class ExpenseViewSet(viewsets.ModelViewSet):

    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsFarmDataUser]
    pagination_class = FarmPagination

    filterset_fields = [
        "category",
        "date",
    ]

    search_fields = [
        "expense_type",
        "category__name",
        "note",
    ]

    ordering_fields = [
        "amount",
        "date",
        "created_at",
    ]

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )

    def perform_update(self, serializer):

        serializer.save(
            updated_by=self.request.user
        )