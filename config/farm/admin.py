from django.contrib import admin
from .models import Category, Product, Income, Expense,Production
# Register your models here.
admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Income)
admin.site.register(Expense)
admin.site.register(Production)
