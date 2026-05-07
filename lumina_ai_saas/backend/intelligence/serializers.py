from rest_framework import serializers
from .models import College, Subject, QuestionPaper, Question

class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'

class SubjectSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    
    class Meta:
        model = Subject
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class QuestionPaperSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = QuestionPaper
        fields = '__all__'

    def get_questions_count(self, obj):
        return obj.questions.count()
