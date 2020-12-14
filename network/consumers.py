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
        # if self.scope['user'].username > self.room_name:
        #     self.room_group_name = 'chat_%s' % (self.room_name+self.scope['user'].username)
        # else:
        #     self.room_group_name = 'chat_%s' % (self.scope['user'].username + self.room_name)

        # Join room lf
        self.room_group_name = 'chat_%s' % (self.room_name)
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
        typee    =  text_data_json['type']
        # print(text_data_json['type'])
        if len(message)>0:
            msg_id = await self.add_chat(message, user1=sender, user2=reciever)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':typee,
                'message': message,
                'sender':sender,
                'reciever':reciever,
                'msg_id':msg_id,
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        print(event['type'],'eeeer')
        message = event['message']
        # Send message to WebSocket
        sender = event['sender']
        reciever = event['reciever']
        await self.send(text_data=json.dumps({
            'message': message,
            'sender':sender,
            'reciever':reciever,
        }))

    async def notific_chat(self,event):
        pass

    @database_sync_to_async
    def add_chat(self, message, user1, user2):
        sender = User.objects.filter(username=user1)[0]
        receiver = User.objects.filter(username=user2)[0]

        m = Messages.objects.create(
            text=message, sender=sender, reciever=receiver
        )

        m.save()
        return m.id

    @database_sync_to_async
    def set_read(self, msg_id):

        m = Messages.objects.get(
            id=msg_id
        )
        m.read = True
        m.save()

# class notifications_and_messages(AsyncWebsocketConsumer):
#     async def connect(self):

#         self.room_name = self.scope['url_route']['kwargs']['name']
#         self.room_group_name = 'chat_%s' % (self.scope['user'].username)
#         print(self.room_group_name,self.channel_name)
#         await self.channel_layer.group_add(self.room_group_name,self.channel_name)

#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(self.room_group_name,self.channel_name)

#     # Receive message from WebSocket
#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         message = text_data_json['message']
#         sender  = text_data_json['sender']
#         reciever = text_data_json['reciever']
#         if len(message)>0:
#             msg_id = await self.add_chat(message, user1=sender, user2=reciever)

#         # Send message to room group
#         await self.channel_layer.group_send(
#             self.room_group_name,
#             {
#                 'type': 'chat_message',
#                 'message': message,
#                 'sender':sender,
#                 'reciever':reciever,
#                 'msg_id':msg_id,
#             }
#         )

#     # Receive message from room group
#     async def chat_message(self, event):
#         await self.set_read(event['msg_id'])
#         message = event['message']
#         # Send message to WebSocket
#         sender = event['sender']
#         reciever = event['reciever']
#         await self.send(text_data=json.dumps({
#             'message': message,
#             'sender':sender,
#             'reciever':reciever,
#         }))

#     @database_sync_to_async
#     def add_chat(self, message, user1, user2):
#         sender = User.objects.filter(username=user1)[0]
#         receiver = User.objects.filter(username=user2)[0]

#         m = Messages.objects.create(
#             text=message, sender=sender, reciever=receiver
#         )

#         m.save()
#         return m.id

#     @database_sync_to_async
#     def set_read(self, msg_id):

#         m = Messages.objects.get(
#             id=msg_id
#         )
#         m.read = True
#         m.save()