from django.db import models
import random
import string
from django.conf import settings
from cryptography.fernet import Fernet, InvalidToken

# Initialize Fernet with the key from settings
fernet = Fernet(settings.FERNET_KEY)

class Complaint(models.Model):
    department = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, default='Medium')
    status = models.CharField(max_length=20, default='Pending')
    is_anonymous = models.BooleanField(default=True)
    submission_date = models.DateTimeField(auto_now_add=True)
    feedback = models.TextField(blank=True, null=True)
    token = models.CharField(max_length=6, unique=True, editable=False, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()

        # Encrypt fields before saving
        if self.description and not self.is_encrypted(self.description):
            self.description = self.encrypt(self.description)
        if self.feedback and not self.is_encrypted(self.feedback):
            self.feedback = self.encrypt(self.feedback)

        super().save(*args, **kwargs)

    def generate_token(self):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    def encrypt(self, data):
        return fernet.encrypt(data.encode()).decode()

    def decrypt(self, data):
        try:
            return fernet.decrypt(data.encode()).decode()
        except InvalidToken:
            return data  # Return raw data if already decrypted or invalid

    def is_encrypted(self, data):
        try:
            fernet.decrypt(data.encode())
            return True
        except InvalidToken:
            return False

    def __str__(self):
        return self.title
