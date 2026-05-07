from rest_framework import viewsets, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from django.db.models import Count

from .models import College, Subject, QuestionPaper, Question
from .serializers import CollegeSerializer, SubjectSerializer, QuestionPaperSerializer, QuestionSerializer
from .services.pdf_parser import extract_questions_from_pdf

User = get_user_model()

class AdminDashboardView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        data = {
            "total_users": User.objects.count(),
            "total_colleges": College.objects.count(),
            "total_subjects": Subject.objects.count(),
            "total_papers": QuestionPaper.objects.count(),
            "total_questions": Question.objects.count()
        }
        return Response(data)

class CollegeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = College.objects.all()
    serializer_class = CollegeSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

class QuestionPaperViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = QuestionPaper.objects.all()
    serializer_class = QuestionPaperSerializer

    def create(self, request, *args, **kwargs):
        # Create the paper
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Trigger parsing
        paper = serializer.instance
        if paper.uploaded_pdf:
            extracted_count = extract_questions_from_pdf(paper)
        else:
            extracted_count = 0
            
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['extracted_count'] = extracted_count
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

class QuestionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminUser]
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
