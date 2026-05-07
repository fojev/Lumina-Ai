from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .groq_service import get_groq_response

class NotesGeneratorView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic')
        if not topic:
            return Response({"error": "Topic is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        context = (
            f"You are a professional tutor. The user is from '{request.user.college_name}'. "
            f"Generate highly structured, detailed notes on the topic '{topic}'. "
            f"Use markdown, headings, and bullet points. Make it easy for a student to quickly learn."
        )
        
        notes = get_groq_response(f"Generate notes for: {topic}", context=context)
        return Response({"topic": topic, "notes": notes}, status=status.HTTP_200_OK)

class PYQPredictorView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subject = request.data.get('subject')
        if not subject:
            return Response({"error": "Subject is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        context = (
            f"You are an exam predictor. The user is from '{request.user.college_name}'. "
            f"Based on historical patterns for similar engineering/college curriculums, predict the top 5 most likely "
            f"Previous Year Questions (PYQs) for the subject '{subject}'. "
            f"Return them as a numbered list with an estimated probability percentage for each."
        )
        
        predictions = get_groq_response(f"Predict PYQs for: {subject}", context=context)
        return Response({"subject": subject, "predictions": predictions}, status=status.HTTP_200_OK)
