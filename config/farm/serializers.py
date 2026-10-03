from rest_framework import serializers

from .models import Category,Product,Income,Expense, Production



class CategorySerializers(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields =["id","name","description","created_by","created_at","updated_at",]
        read_only_fields = ["id","created_by","created_at","updated_at",]

       

        
class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "category",
            "description",
            "created_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
        ]

       


        
class IncomeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Income
        fields = [
            "id",
            "product",
            "quantity",
            "unit",
            "unit_price",
            "total_amount",
            "date",
            "note",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "total_amount",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):

        quantity = validated_data["quantity"]
        unit_price = validated_data["unit_price"]

        validated_data["total_amount"] = quantity * unit_price

        
        return Income.objects.create(**validated_data)

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Quantity must be greater than 0."
            )

        return value

    def validate_unit_price(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Unit price must be greater than 0."
            )

        return value

    def validate_unit(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Unit cannot be empty."
            )

        return value


class ExpenseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Expense

        fields = [
            "id",
            "category",
            "expense_type",
            "amount",
            "date",
            "note",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than 0."
            )

        return value

    def validate_expense_type(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Expense type cannot be empty."
            )

        return value

class ProductionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Production

        fields = [
            "id",
            "product",
            "quantity",
            "unit",
            "date",
            "note",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]

    def validate_quantity(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Production quantity must be greater than 0."
            )

        return value

    def validate_unit(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Unit cannot be empty."
            )

        return value