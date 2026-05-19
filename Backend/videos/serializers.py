from rest_framework import serializers
from .models import VideoProject

class VideoProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoProject
        fields = '__all__'
