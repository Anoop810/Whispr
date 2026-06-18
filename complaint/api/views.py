from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Complaint
from .constants import ACTIVE_STATUSES, ALL_STATUSES, ComplaintStatus
from .permissions import staff_required_response


def serialize_complaint(complaint):
    return {
        'id': complaint.id,
        'title': complaint.title,
        'description': complaint.decrypt(complaint.description),
        'department': complaint.department,
        'priority': complaint.priority,
        'status': complaint.status,
        'is_anonymous': complaint.is_anonymous,
        'submission_date': complaint.submission_date,
        'feedback': complaint.decrypt(complaint.feedback) if complaint.feedback else None,
        'token': complaint.token,
    }


@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def complaint_list_create(request):
    if request.method == 'GET':
        denied = staff_required_response(request)
        if denied:
            return denied

        view = request.query_params.get('view', 'active')
        if view == 'resolved':
            complaints = Complaint.objects.filter(
                status=ComplaintStatus.RESOLVED
            ).order_by('-submission_date')
        else:
            complaints = Complaint.objects.filter(
                status__in=ACTIVE_STATUSES
            ).order_by('-submission_date')

        return Response([serialize_complaint(c) for c in complaints])

    data = request.data
    complaint = Complaint.objects.create(
        title=data.get('title'),
        description=data.get('description'),
        priority=data.get('priority', 'Medium'),
        is_anonymous=data.get('is_anonymous', True),
        feedback=data.get('feedback', ''),
        department=data.get('department', ''),
    )
    return Response(
        {'message': 'Complaint created', 'id': complaint.id, 'token': complaint.token},
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def complaint_detail(request, id):
    denied = staff_required_response(request)
    if denied:
        return denied

    try:
        complaint = Complaint.objects.get(id=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(serialize_complaint(complaint))

    if request.method == 'PUT':
        data = request.data
        complaint.title = data.get('title', complaint.title)
        complaint.description = data.get('description', complaint.decrypt(complaint.description))
        complaint.priority = data.get('priority', complaint.priority)
        complaint.status = data.get('status', complaint.status)
        if data.get('feedback'):
            complaint.feedback = data.get('feedback')
        complaint.save()
        return Response({'message': 'Complaint updated'})

    complaint.delete()
    return Response({'message': 'Complaint deleted'})


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    user = authenticate(username=username, password=password)

    if user is not None and user.is_staff:
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
        })

    return Response(
        {'detail': 'Invalid credentials or insufficient permissions.'},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def complaint_by_token(request):
    token = request.data.get('token')
    try:
        complaint = Complaint.objects.get(token=token)
        return Response(serialize_complaint(complaint), status=200)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=404)


@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def complaint_feedback(request, id):
    denied = staff_required_response(request)
    if denied:
        return denied

    try:
        complaint = Complaint.objects.get(pk=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

    feedback = request.data.get('feedback')
    if feedback is None or not str(feedback).strip():
        return Response({'error': 'Feedback is required'}, status=status.HTTP_400_BAD_REQUEST)

    complaint.feedback = str(feedback).strip()
    complaint.save()

    return Response({
        'message': 'Feedback saved',
        'id': complaint.id,
        'feedback': complaint.decrypt(complaint.feedback),
    })


@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def update_complaint_status(request, id):
    denied = staff_required_response(request)
    if denied:
        return denied

    try:
        complaint = Complaint.objects.get(pk=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

    status_update = request.data.get('status')
    feedback = request.data.get('feedback')

    if status_update not in ALL_STATUSES:
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

    if feedback is not None and str(feedback).strip():
        complaint.feedback = str(feedback).strip()

    complaint.status = status_update
    complaint.save()

    return Response({
        'message': 'Status updated',
        'id': complaint.id,
        'status': complaint.status,
        'feedback': complaint.decrypt(complaint.feedback) if complaint.feedback else None,
    })
