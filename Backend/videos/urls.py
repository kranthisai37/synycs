from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoProjectViewSet

router = DefaultRouter()
router.register(r'videos', VideoProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
