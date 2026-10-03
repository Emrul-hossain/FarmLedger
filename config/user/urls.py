from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserManagementViewSet,
)


router = DefaultRouter()

router.register(
    "users",
    UserManagementViewSet,
    basename="user-management"
)


urlpatterns = [

    path(
        "register/",
        RegisterView.as_view(),
        name="register"
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login"
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout"
    ),

    path(
        "auth/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
]

urlpatterns += router.urls