from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .admin_views import (
    AdminDashboardView, 
    CollegeViewSet, 
    SubjectViewSet, 
    QuestionPaperViewSet, 
    QuestionViewSet
)
from accounts.admin_views import UserAdminViewSet

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet, basename='admin-colleges')
router.register(r'subjects', SubjectViewSet, basename='admin-subjects')
router.register(r'papers', QuestionPaperViewSet, basename='admin-papers')
router.register(r'questions', QuestionViewSet, basename='admin-questions')
router.register(r'users', UserAdminViewSet, basename='admin-users')

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', include(router.urls)),
]
