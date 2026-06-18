# Generated manually for status choices

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_complaint_department'),
    ]

    operations = [
        migrations.AlterField(
            model_name='complaint',
            name='status',
            field=models.CharField(
                choices=[
                    ('Pending', 'Pending'),
                    ('In Review', 'In Review'),
                    ('Issue Escalated', 'Issue Escalated'),
                    ('Resolved', 'Resolved'),
                ],
                default='Pending',
                max_length=20,
            ),
        ),
    ]
