from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import SignupView
from django.http import JsonResponse

urlpatterns = [
    path('', lambda r: JsonResponse({"endpoints": ["signup/", "login/", "token/refresh/"]}), name='auth-root'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
