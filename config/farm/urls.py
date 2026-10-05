from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CategoryViewSet,
    ProductViewSet,
    IncomeViewSet,
    ExpenseViewSet,
    DashboardView,
    CategoryReportView,
    MonthlyReportView,
    DateRangeReportView,
    IncomeExcelExportView,
    ExpenseExcelExportView,
    ProductionViewSet,
    ProductionReportView,
    ProductionSummaryView,
    DashboardChartView,
    CategoryProfitabilityView,
    ProductSalesReportView,
    ProductProductionSalesView,
)


router = DefaultRouter()

router.register("categories", CategoryViewSet)
router.register("products", ProductViewSet)
router.register("incomes", IncomeViewSet)
router.register("expenses", ExpenseViewSet)
router.register("production", ProductionViewSet)


urlpatterns = [
    path(
        "dashboard/",
        DashboardView.as_view(),
        name="dashboard"
    ),
    path(
    "dashboard/chart/",
    DashboardChartView.as_view(),
    name="dashboard-chart"
),
path(
    "reports/product-production-sales/",
    ProductProductionSalesView.as_view(),
    name="product-production-sales"
),
path(
    "reports/product-sales/",
    ProductSalesReportView.as_view(),
    name="product-sales-report"
),
path(
    "reports/category-profitability/",
    CategoryProfitabilityView.as_view(),
    name="category-profitability"
),
     path(
        "reports/category/",
        CategoryReportView.as_view(),
        name="category-report"
    ),
    path(
    "reports/production-summary/",
    ProductionSummaryView.as_view(),
    name="production-summary"
),

    path(
        "reports/monthly/",
        MonthlyReportView.as_view(),
        name="monthly-report"
    ),
    path(
    "reports/date-range/",
    DateRangeReportView.as_view(),
    name="date-range-report"
),
path(
    "reports/income/export/",
    IncomeExcelExportView.as_view(),
    name="income-excel-export"
),

path (
    "reports/expense/export/",
    ExpenseExcelExportView.as_view(),
    name="expense-excel-export"
    ),


path(
    "reports/production/",
    ProductionReportView.as_view(),
    name="production-report"
),


]

urlpatterns += router.urls