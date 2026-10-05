from django.shortcuts import render

# Create your views here.
from .models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer,UserManagementSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .permission import IsAdminOrManager
from rest_framework.exceptions import PermissionDenied

class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.save()

            return Response(
                {
                    "message": "Registration successful",
                    "username": user.username,
                    "phone": user.phone,
                    "role": user.role,
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


    


class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():

            phone = serializer.validated_data["phone"]
            password = serializer.validated_data["password"]

            try:
                user = User.objects.get(
                    phone=phone
                )

            except User.DoesNotExist:

                return Response(
                    {
                        "errors": "Invalid phone or password"
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            if not user.check_password(password):

                return Response(
                    {
                        "errors": "Invalid phone or password"
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            token = get_token_for_user(user)

            return Response(
                {
                    "message": "Login successfully",
                    "token": token,
                    "username": user.username,
                    "role": user.role,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


def get_token_for_user(user):

    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }    

class UserManagementViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all()

    serializer_class = UserManagementSerializer

    permission_classes = [IsAdminOrManager]

    def perform_update(self, serializer):

        target_user = self.get_object()
        current_user = self.request.user

        # Manager cannot modify Admin or another Manager
        if current_user.role == "MANAGER":

            if target_user.role in ["ADMIN", "MANAGER"]:
                raise PermissionDenied(
                    "Manager cannot modify Admin or Manager."
                )

            # Manager cannot promote Staff to Admin/Manager
            new_role = self.request.data.get("role")

            if new_role and new_role != "STAFF":
                raise PermissionDenied(
                    "Manager can only keep users as Staff."
                )

        serializer.save()

    def destroy(self, request, *args, **kwargs):

        # Only Admin can delete users
        if request.user.role != "ADMIN":
            raise PermissionDenied(
                "Only Admin can delete users."
            )

        target_user = self.get_object()

        # Admin cannot delete himself
        if target_user.id == request.user.id:
            raise PermissionDenied(
                "You cannot delete your own account."
            )

        return super().destroy(request, *args, **kwargs)

class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        return Response(
            {
                "message": "Logout successfully."
            },
            status=status.HTTP_200_OK
        )