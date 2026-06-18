import os

from django.core.management.base import BaseCommand

from api.management.commands.ensure_admin import Command as EnsureAdminCommand


class Command(BaseCommand):
    help = 'Create an organization and its staff admin from environment variables.'

    def add_arguments(self, parser):
        parser.add_argument('--organization', required=True)
        parser.add_argument('--username', required=True)
        parser.add_argument('--password', required=True)
        parser.add_argument('--email', default='')

    def handle(self, *args, **options):
        os.environ['DJANGO_SUPERUSER_ORGANIZATION'] = options['organization']
        os.environ['DJANGO_SUPERUSER_USERNAME'] = options['username']
        os.environ['DJANGO_SUPERUSER_PASSWORD'] = options['password']
        os.environ['DJANGO_SUPERUSER_EMAIL'] = options['email']
        EnsureAdminCommand().handle()
