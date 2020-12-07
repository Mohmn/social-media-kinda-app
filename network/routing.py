from django.urls import re_path,path

from . import consumers

websocket_urlpatterns = [
    path('ws/dm/<str:name>',consumers.PrivateChat.as_asgi()),
]