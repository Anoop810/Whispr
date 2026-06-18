from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Complaint
from django.contrib.auth import authenticate

@api_view(['GET', 'POST'])
def complaint_list_create(request):
    if request.method == 'GET':
        complaints = Complaint.objects.filter(status='Pending')
        data = [{
            'id': complaint.id,
            'title': complaint.title,
            'description': complaint.decrypt(complaint.description),
            'priority': complaint.priority,
            'status': complaint.status,
            'is_anonymous': complaint.is_anonymous,
            'submission_date': complaint.submission_date,
            'feedback': complaint.decrypt(complaint.feedback) if complaint.feedback else None,
            'token': complaint.token
        } for complaint in complaints]
        return Response(data)

    elif request.method == 'POST':
        data = request.data
        complaint = Complaint.objects.create(
            title=data.get('title'),
            description=data.get('description'),
            priority=data.get('priority', 'Medium'),
            is_anonymous=data.get('is_anonymous', True),
            feedback=data.get('feedback', ''),
            department = data.get('department', '')
        )
        return Response({'message': 'Complaint created', 'id': complaint.id, 'token': complaint.token}, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PUT', 'DELETE'])
def complaint_detail(request, id):
    try:
        complaint = Complaint.objects.get(id=id)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            'id': complaint.id,
            'title': complaint.title,
            'description': complaint.decrypt(complaint.description),
            'priority': complaint.priority,
            'status': complaint.status,
            'is_anonymous': complaint.is_anonymous,
            'submission_date': complaint.submission_date,
            'feedback': complaint.decrypt(complaint.feedback) if complaint.feedback else None,
            'token': complaint.token
        })

    elif request.method == 'PUT':
        data = request.data
        complaint.title = data.get('title', complaint.title)
        complaint.description = data.get('description', complaint.decrypt(complaint.description))
        complaint.priority = data.get('priority', complaint.priority)
        complaint.status = data.get('status', complaint.status)
        if data.get('feedback'):
            complaint.feedback = data.get('feedback')
        complaint.save()
        return Response({'message': 'Complaint updated'})

    elif request.method == 'DELETE':
        complaint.delete()
        return Response({'message': 'Complaint deleted'})


@api_view(['POST'])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None and user.is_staff:  # Checks if user is admin
        return Response({'success': True})
    else:
        return Response({'success': False}, status=401)


@api_view(['POST'])
def complaint_by_token(request):
    token = request.data.get('token')
    try:
        complaint = Complaint.objects.get(token=token)
        data = {
            'id': complaint.id,
            'title': complaint.title,
            'description': complaint.decrypt(complaint.description),
            'priority': complaint.priority,
            'status': complaint.status,
            'is_anonymous': complaint.is_anonymous,
            'submission_date': complaint.submission_date,
            'feedback': complaint.decrypt(complaint.feedback) if complaint.feedback else None,
            'token': complaint.token
        }
        return Response(data, status=200)
    except Complaint.DoesNotExist:
        return Response({'error': 'Complaint not found'}, status=404)


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Complaint

@csrf_exempt
@require_http_methods(["PATCH"])
def resolve_complaint(request, id):
    try:
        complaint = Complaint.objects.get(pk=id)
    except Complaint.DoesNotExist:
        return JsonResponse({'error': 'Complaint not found'}, status=404)

    try:
        data = json.loads(request.body)
        status_update = data.get('status')

        if not status_update:
            return JsonResponse({'error': 'Status is required'}, status=400)

        if status_update != 'Resolved':
            return JsonResponse({'error': 'Invalid status update'}, status=400)

        complaint.status = status_update
        complaint.save()

        return JsonResponse({'message': 'Complaint resolved successfully', 'id': complaint.id, 'status': complaint.status}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
