from django.db import models
from user.models import User

# Create your models here.

class Category (models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    
    created_by = models.ForeignKey(
        User,on_delete=models.PROTECT,
        related_name="created_categories")
    created_at= models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name}"

class Product(models.Model):
    name = models.CharField(max_length= 100)
    category= models.ForeignKey(Category, on_delete=models.PROTECT,related_name="products")
    description= models.TextField()
    created_by = models.ForeignKey(
            User,on_delete=models.PROTECT,
            related_name="product_created")
    updated_by = models.ForeignKey(
                User,on_delete=models.PROTECT,
                related_name="product_updated",
                null=True,
                blank=True)
    created_at= models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} {self.category.name}"


class Income(models.Model):
    product=models.ForeignKey(Product, on_delete=models.PROTECT,related_name="incomes")
    quantity=models.DecimalField(max_digits=10,decimal_places=2)
    unit= models.CharField(max_length=30)
    unit_price= models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField( max_digits=10, decimal_places=2)
    date= models.DateTimeField(auto_now_add=True)
    note  = models.TextField()
    created_by = models.ForeignKey(
                User,on_delete=models.PROTECT,
                related_name="income_created")
    updated_by = models.ForeignKey(
                    User,on_delete=models.PROTECT,
                    related_name="income_updated",
                    null=True,
                    blank=True)
    created_at= models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.total_amount}"




class Expense(models.Model):

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="expenses"
    )
    expense_type = models.CharField( max_length=150)
    amount = models.DecimalField(max_digits=12,decimal_places=2)
    date = models.DateField()
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="created_expenses"
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="updated_expenses",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"{self.expense_type} - {self.amount}"



class Production(models.Model):

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="productions"
    )

    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    unit = models.CharField(
        max_length=30
    )

    date = models.DateField()

    note = models.TextField(
        blank=True
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="created_productions"
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="updated_productions",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.product.name} - {self.quantity} {self.unit}"    