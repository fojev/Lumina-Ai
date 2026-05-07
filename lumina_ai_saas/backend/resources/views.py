from rest_framework import views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .youtube_service import get_youtube_videos

class YouTubeResourceView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic = request.data.get('topic')
        if not topic:
            return Response({"error": "Topic is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        videos = get_youtube_videos(topic)
        return Response({"topic": topic, "videos": videos}, status=status.HTTP_200_OK)
