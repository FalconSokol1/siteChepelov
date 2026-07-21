from rest_framework.permissions import BasePermission


class IsStaffUser(BasePermission):
    """Only authenticated staff/superusers can manage site content."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_staff)
