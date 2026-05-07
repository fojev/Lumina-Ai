from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "online",
        "message": "Lumina AI Backend API is running",
        "endpoints": {
            "auth": "/api/auth/",
            "chat": "/api/chat/",
            "ai": "/api/ai/",
            "resources": "/api/resources/"
        }
    })

def home(request):
    return JsonResponse({
        "project": "Lumina AI",
        "version": "1.0.0",
        "documentation": "/api/"
    })
