from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate

from .models import Complaint, Organization, build_staff_username, normalize_organization_name
from .constants import ACTIVE_STATUSES, ALL_STATUSES, ComplaintStatus
from .permissions import (
    get_organization_by_name,
    get_user_organization,
    staff_organization_response,
    staff_required_response,
)


def serialize_organization(organization):
    return {
        'name': organization.name,
        'display_name': organization.display_name,
    }


def serialize_complaint(complaint):
    return {
        'id': complaint.id,
        'organization': serialize_organization(complaint.organization),
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


def resolve_organization_from_request(data):
    organization_name = data.get('organization', '')
    organization = get_organization_by_name(organization_name)
    if not organization:
        return None, Response(
            {'detail': 'Organization not found.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return organization, None


def get_staff_complaint(request, complaint_id):
    denied, organization = staff_organization_response(request)
    if denied:
        return denied, None

    try:
        complaint = Complaint.objects.get(pk=complaint_id, organization=organization)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND), None

    return None, complaint


@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def complaint_list_create(request):
    if request.method == 'GET':
        denied, organization = staff_organization_response(request)
        if denied:
            return denied

        view = request.query_params.get('view', 'active')
        complaints = Complaint.objects.filter(organization=organization)
        if view == 'resolved':
            complaints = complaints.filter(status=ComplaintStatus.RESOLVED)
        else:
            complaints = complaints.filter(status__in=ACTIVE_STATUSES)

        complaints = complaints.order_by('-submission_date')
        return Response([serialize_complaint(c) for c in complaints])

    organization, error = resolve_organization_from_request(request.data)
    if error:
        return error

    data = request.data
    complaint = Complaint.objects.create(
        organization=organization,
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
    error, complaint = get_staff_complaint(request, id)
    if error:
        return error

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
    organization, error = resolve_organization_from_request(request.data)
    if error:
        return error

    username = (request.data.get('username') or '').strip()
    password = request.data.get('password') or ''

    user = authenticate(
        username=build_staff_username(organization.name, username),
        password=password,
    )
    user_org = get_user_organization(user) if user else None

    if user is not None and user.is_staff and user_org and user_org.id == organization.id:
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'access': str(refresh.access_token),
            'organization': serialize_organization(organization),
        })

    return Response(
        {'detail': 'Invalid organization, credentials, or permissions.'},
        status=status.HTTP_401_UNAUTHORIZED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def complaint_by_token(request):
    token = request.data.get('token')
    try:
        complaint = Complaint.objects.select_related('organization').get(token=token)
        return Response(serialize_complaint(complaint), status=200)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=404)


@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([AllowAny])
def complaint_feedback(request, id):
    error, complaint = get_staff_complaint(request, id)
    if error:
        return error

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
    error, complaint = get_staff_complaint(request, id)
    if error:
        return error

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
