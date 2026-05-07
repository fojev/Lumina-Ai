from django.urls import path
from .views import NotesGeneratorView, PYQPredictorView
from django.http import JsonResponse

urlpatterns = [
    path('', lambda r: JsonResponse({"endpoints": ["notes/", "pyq/"]}), name='ai-root'),
    path('notes/', NotesGeneratorView.as_view(), name='notes-generator'),
    path('pyq/', PYQPredictorView.as_view(), name='pyq-predictor'),
]
