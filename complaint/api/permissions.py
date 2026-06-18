from rest_framework import status
from rest_framework.response import Response

from .models import Organization, normalize_organization_name


def get_organization_by_name(name):
    normalized = normalize_organization_name(name)
    if not normalized:
        return None
    return Organization.objects.filter(name=normalized).first()


def get_user_organization(user):
    profile = getattr(user, 'staff_profile', None)
    return profile.organization if profile else None


def staff_required_response(request):
    user = request.user
    if not user.is_authenticated or not user.is_staff:
        return Response(
            {'detail': 'Staff authentication required.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if not get_user_organization(user):
        return Response(
            {'detail': 'Staff account is not linked to an organization.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return None


def staff_organization_response(request):
    denied = staff_required_response(request)
    if denied:
        return denied, None
    return None, get_user_organization(request.user)
