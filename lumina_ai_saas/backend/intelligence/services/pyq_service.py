from django.db.models import Count, Q
from ..models import Question, QuestionPaper

class PYQService:
    @staticmethod
    def analyze_topic(topic, college=None):
        """
        Searches for questions related to a topic and returns analytical data.
        """
        if not topic:
            return None
        
        # Search questions using keyword matching
        query = Q(question_text__icontains=topic) | Q(topic_tags__icontains=topic)
        if college:
            query &= Q(question_paper__college__name__icontains=college)
            
        questions = Question.objects.filter(query).select_related('question_paper', 'question_paper__subject')
        
        if not questions.exists():
            return None
        
        # Calculate Frequency
        frequency = questions.count()
        
        # Detect occurrences
        occurrences = []
        for q in questions:
            occurrences.append({
                'exam_type': q.question_paper.get_exam_type_display(),
                'year': q.question_paper.year,
                'college': q.question_paper.college.name
            })
            
        # Importance scoring logic
        # 1-3: Low, 4-6: Medium, 7+: High
        importance = "LOW"
        if frequency >= 7:
            importance = "HIGH"
        elif frequency >= 4:
            importance = "MEDIUM"
            
        # Format exact questions (limit to 10)
        formatted_questions = [q.question_text.strip() for q in questions[:10]]
        
        return {
            'topic': topic,
            'frequency': frequency,
            'importance': importance,
            'occurrences': occurrences,
            'questions': formatted_questions
        }
