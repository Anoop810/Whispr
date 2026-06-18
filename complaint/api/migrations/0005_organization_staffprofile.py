from django.db import migrations, models
import django.db.models.deletion


def create_default_organization(apps, schema_editor):
    Organization = apps.get_model('api', 'Organization')
    Complaint = apps.get_model('api', 'Complaint')

    organization, _ = Organization.objects.get_or_create(
        name='default',
        defaults={'display_name': 'Default'},
    )
    Complaint.objects.filter(organization__isnull=True).update(organization=organization)


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_complaint_status_choices'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('display_name', models.CharField(blank=True, max_length=150)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['name'],
            },
        ),
        migrations.AddField(
            model_name='complaint',
            name='organization',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='complaints',
                to='api.organization',
            ),
        ),
        migrations.RunPython(create_default_organization, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='complaint',
            name='organization',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='complaints',
                to='api.organization',
            ),
        ),
        migrations.CreateModel(
            name='StaffProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='staff_members', to='api.organization')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='staff_profile', to='auth.user')),
            ],
        ),
    ]
