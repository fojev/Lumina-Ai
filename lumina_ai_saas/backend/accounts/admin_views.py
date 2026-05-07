from rest_framework import viewsets, permissions, serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'college_name', 'is_active', 'date_joined')

class UserAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserAdminSerializer
