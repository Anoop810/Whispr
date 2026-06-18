from rest_framework import status
from rest_framework.response import Response


def staff_required_response(request):
    user = request.user
    if not user.is_authenticated or not user.is_staff:
        return Response(
            {'detail': 'Staff authentication required.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return None
