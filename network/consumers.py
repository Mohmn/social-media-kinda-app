import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import *

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("connected--privete")
        print(self.scope['url_route']['kwargs'])
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room lf
        print(self.room_group_name,self.channel_name)
        await self.channel_layer.group_add(self.room_group_name,self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name,self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))


class PrivateChat(AsyncWebsocketConsumer):
    async def connect(self):

        self.room_name = self.scope['url_route']['kwargs']['name']
        if self.scope['user'].username > self.room_name:
            self.room_group_name = 'chat_%s' % (self.room_name+self.scope['user'].username)
        else:
            self.room_group_name = 'chat_%s' % (self.scope['user'].username + self.room_name)

        # Join room lf
        print(self.room_group_name,self.channel_name)
        await self.channel_layer.group_add(self.room_group_name,self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name,self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender  = text_data_json['sender']
        reciever = text_data_json['reciever']
        if len(message)>0:
            add_chat = await self.add_chat(self.room_name, message, user1=sender, user2=reciever)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender':sender,
                'reciever':reciever,
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        # Send message to WebSocket
        sender = event['sender']
        reciever = event['reciever']
        await self.send(text_data=json.dumps({
            'message': message,
            'sender':sender,
            'reciever':reciever,
        }))

    @database_sync_to_async
    def add_chat(self, id, message, user1, user2):
        sender = User.objects.filter(username=user1)[0]
        receiver = User.objects.filter(username=user2)[0]

        m = Messages.objects.create(
            text=message, sender=sender, reciever=receiver
        )

        m.save()