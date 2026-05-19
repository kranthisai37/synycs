from django.db import models
from django.contrib.auth.models import User

class VideoProject(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PARSING', 'Parsing'),
        ('RENDERING', 'Rendering'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    MODE_CHOICES = [
        ('NO_FACE', 'No-Face'),
        ('AVATAR', 'Avatar'),
    ]

    ENGINE_CHOICES = [
        ('PREMIUM', 'Premium'),
        ('COMMUNITY', 'Community'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='video_projects', null=True, blank=True)
    title = models.CharField(max_length=255)
    script = models.TextField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='NO_FACE')
    engine = models.CharField(max_length=20, choices=ENGINE_CHOICES, default='COMMUNITY')
    voice = models.CharField(max_length=50, default='bark_v2')
    avatar = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    progress = models.IntegerField(default=0)
    is_shared = models.BooleanField(default=False)
    video_url = models.URLField(max_length=500, null=True, blank=True)
    thumbnail_url = models.URLField(max_length=500, null=True, blank=True)
    duration = models.CharField(max_length=20, null=True, blank=True)
    slides = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
