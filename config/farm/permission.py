from rest_framework.permissions import BasePermission


class IsAdminOrManager(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in ["ADMIN", "MANAGER"]
        )


class IsFarmDataUser(BasePermission):

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.user.role in ["ADMIN", "MANAGER"]:
            return True

        if request.user.role == "STAFF":
            return request.method in ["GET", "POST"]

        return False


class IsFarmDataReadOnlyForStaff(BasePermission):

    def has_permission(self, request, view):

        if not request.user.is_authenticated:
            return False

        if request.user.role in ["ADMIN", "MANAGER"]:
            return True

        if request.user.role == "STAFF":
            return request.method in ["GET", "HEAD", "OPTIONS"]

        return False    