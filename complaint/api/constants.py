from django.db import models


class ComplaintStatus(models.TextChoices):
    PENDING = 'Pending', 'Pending'
    IN_REVIEW = 'In Review', 'In Review'
    ESCALATED = 'Issue Escalated', 'Issue Escalated'
    RESOLVED = 'Resolved', 'Resolved'


ACTIVE_STATUSES = [
    ComplaintStatus.PENDING,
    ComplaintStatus.IN_REVIEW,
    ComplaintStatus.ESCALATED,
]

ALL_STATUSES = [choice.value for choice in ComplaintStatus]
