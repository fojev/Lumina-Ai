from django.contrib import admin
from django.urls import path, include
from .views import api_root, home

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/auth/', include('accounts.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/ai/', include('ai_services.urls')),
    path('api/resources/', include('resources.urls')),
    path('api/admin/', include('intelligence.admin_urls')),
]
