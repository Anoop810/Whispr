import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from api.models import Organization, StaffProfile, build_staff_username, normalize_organization_name


class Command(BaseCommand):
    help = 'Create or update the staff admin user from environment variables.'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', '').strip()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '').strip()
        organization_name = normalize_organization_name(
            os.environ.get('DJANGO_SUPERUSER_ORGANIZATION', 'default')
        )

        if not username or not password:
            self.stdout.write('DJANGO_SUPERUSER_USERNAME/PASSWORD not set — skipping admin setup.')
            return

        organization, created = Organization.objects.get_or_create(
            name=organization_name,
            defaults={'display_name': organization_name.title()},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created organization: {organization.name}'))

        User = get_user_model()
        auth_username = build_staff_username(organization_name, username)
        user, user_created = User.objects.get_or_create(
            username=auth_username,
            defaults={'email': email or f'{username}@localhost'},
        )

        if email:
            user.email = email

        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()

        StaffProfile.objects.update_or_create(
            user=user,
            defaults={'organization': organization},
        )

        action = 'Created' if user_created else 'Updated'
        self.stdout.write(
            self.style.SUCCESS(
                f'{action} admin user: {username} @ {organization.name} ({auth_username})'
            )
        )
