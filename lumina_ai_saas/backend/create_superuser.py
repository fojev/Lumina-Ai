import os
import django
import sys

sys.path.append(r'c:\Users\hp\stitch_lumina_ai_interface\lumina_ai_saas\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created successfully (username: admin, password: admin123)")
else:
    print("Superuser 'admin' already exists.")
