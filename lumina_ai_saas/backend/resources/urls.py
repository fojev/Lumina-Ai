from django.urls import path
from .views import YouTubeResourceView
from django.http import JsonResponse

urlpatterns = [
    path('', lambda r: JsonResponse({"endpoints": ["youtube/"]}), name='resources-root'),
    path('youtube/', YouTubeResourceView.as_view(), name='youtube-resources'),
]
