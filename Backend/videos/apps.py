from django.apps import AppConfig
import os

class VideosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'videos'
    path = os.path.dirname(os.path.abspath(__file__))
