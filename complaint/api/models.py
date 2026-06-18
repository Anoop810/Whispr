from django.db import models
import random
import string

from django.conf import settings
from django.contrib.auth.models import User
from cryptography.fernet import Fernet, InvalidToken

from .constants import ComplaintStatus

fernet = Fernet(settings.FERNET_KEY)


def normalize_organization_name(name):
    return ' '.join((name or '').strip().split()).lower()


def build_staff_username(organization_name, username):
    return f'{normalize_organization_name(organization_name)}::{username.strip().lower()}'


class Organization(models.Model):
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def save(self, *args, **kwargs):
        self.name = normalize_organization_name(self.name)
        if not self.display_name:
            self.display_name = self.name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.display_name or self.name


class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='staff_members',
    )

    def __str__(self):
        return f'{self.user.username} @ {self.organization.name}'


class Complaint(models.Model):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='complaints',
    )
    department = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, default='Medium')
    status = models.CharField(
        max_length=20,
        choices=ComplaintStatus.choices,
        default=ComplaintStatus.PENDING,
    )
    is_anonymous = models.BooleanField(default=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    feedback = models.TextField(blank=True, null=True)
    token = models.CharField(max_length=6, unique=True, editable=False, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()

        if self.description and not self.is_encrypted(self.description):
            self.description = self.encrypt(self.description)
        if self.feedback and not self.is_encrypted(self.feedback):
            self.feedback = self.encrypt(self.feedback)

        super().save(*args, **kwargs)

    def generate_token(self):
        for _ in range(20):
            token = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not Complaint.objects.filter(token=token).exists():
                return token
        raise RuntimeError('Unable to generate unique complaint token')

    def encrypt(self, data):
        return fernet.encrypt(data.encode()).decode()

    def decrypt(self, data):
        try:
            return fernet.decrypt(data.encode()).decode()
        except InvalidToken:
            return data

    def is_encrypted(self, data):
        try:
            fernet.decrypt(data.encode())
            return True
        except InvalidToken:
            return False

    def __str__(self):
        return self.title
