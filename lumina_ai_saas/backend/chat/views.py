import json
from django.http import StreamingHttpResponse
from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from ai_services.groq_service import get_groq_response
from intelligence.services.pyq_service import PYQService
from resources.youtube_service import get_youtube_videos


class ChatListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = Chat.objects.filter(user=request.user).order_by('-updated_at')
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)

    def post(self, request):
        chat = Chat.objects.create(user=request.user, title="New Chat")
        return Response(ChatSerializer(chat).data, status=status.HTTP_201_CREATED)


class ChatMessageView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id, user=request.user)
        except Chat.DoesNotExist:
            return Response({"error": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)

        user_message_content = request.data.get('content')
        if not user_message_content:
            return Response({"error": "Message content is required"}, status=status.HTTP_400_BAD_REQUEST)

        history = request.data.get('history', [])
        study_mode = request.data.get('study_mode', 'normal')
        college = request.data.get('college', '') or getattr(request.user, 'college_name', '')

        # Save user message
        Message.objects.create(chat=chat, role='user', content=user_message_content)

        # Update chat title if first message
        if chat.messages.count() == 1:
            chat.title = user_message_content[:40] + ("…" if len(user_message_content) > 40 else "")
            chat.save()

        # ── AGENT 3: PYQ Intelligence ──────────────────
        pyq_data = PYQService.analyze_topic(user_message_content, college)
        
        # ── AGENT 4: YouTube Resources ──────────────────
        youtube_videos = get_youtube_videos(user_message_content, max_results=3)

        # Build context for AI
        intelligence_context = ""
        if pyq_data:
            intelligence_context += f"\n\nPYQ Intelligence for '{user_message_content}':\n"
            intelligence_context += f"- Frequency: {pyq_data['frequency']} times\n"
            intelligence_context += f"- Importance: {pyq_data['importance']}\n"
            intelligence_context += f"- Occurrences: {', '.join([f'{o['exam_type']} {o['year']}' for o in pyq_data['occurrences']])}\n"
            intelligence_context += "- Exact Previous Questions:\n"
            for q in pyq_data['questions']:
                intelligence_context += f"  * {q}\n"
        
        if youtube_videos and "error" not in youtube_videos[0]:
            intelligence_context += f"\n\nRecommended YouTube Resources:\n"
            for vid in youtube_videos:
                intelligence_context += f"- {vid['title']}: {vid['link']}\n"

        prompt_with_context = user_message_content
        if intelligence_context:
            prompt_with_context += f"\n\n[SYSTEM DATA]: Use the following academic context and resources. " \
                                   f"After your deep explanation, ALWAYS add a section titled 'SOURCES' " \
                                   f"using the format: ---SOURCES--- followed by the YouTube titles and links. " \
                                   f"Each source should be on a new line like: [Title](Link). " \
                                   f"Also naturally integrate the PYQ data if relevant.\n\n" \
                                   f"DATA:\n{intelligence_context}"

        def stream_response():
            full_content = ""
            try:
                response_stream = get_groq_response(
                    prompt=prompt_with_context,
                    history=history,
                    study_mode=study_mode,
                    college=college,
                    stream=True
                )
                
                for chunk in response_stream:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        full_content += content
                        yield f"data: {json.dumps({'content': content})}\n\n"
                
                # After stream ends, save to DB
                ai_message = Message.objects.create(chat=chat, role='ai', content=full_content)
                yield f"data: {json.dumps({'id': ai_message.id, 'done': True})}\n\n"
                
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"

        return StreamingHttpResponse(stream_response(), content_type='text/event-stream')
