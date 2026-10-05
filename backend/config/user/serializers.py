from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):

    phone = serializers.CharField(
        required=True
    )

    class Meta:
        model = User
        fields = [
            "username",
            "phone",
            "password",
            "role",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True
            },
            "role": {
                "read_only": True
            }
        }

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            phone=validated_data["phone"],
            password=validated_data["password"],
            role="STAFF"
        )

        return user



class LoginSerializer(serializers.Serializer):

    phone = serializers.CharField(
        required=True
    )

    password = serializers.CharField(
        required=True,
        write_only=True
    )    


class UserManagementSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=False,
        min_length=6
    )

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "phone",
            "role",
            "password",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):

        password = validated_data.pop("password", None)

        user = User(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save()

        return user

    def update(self, instance, validated_data):

        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance