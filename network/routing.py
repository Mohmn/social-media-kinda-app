from django.urls import re_path,path

from . import consumers

websocket_urlpatterns = [
    path('ws/dm/<str:name>',consumers.PrivateChat.as_asgi()),
    # path('ws/ntf/<str:name>',consumers.notifications_and_messages.as_asgi())
]