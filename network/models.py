from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField('User',blank=True,null=True,related_name="followieng")
    followers = models.ManyToManyField('User',blank=True,null=True,related_name="followees")

class Posts(models.Model):
    post = models.TextField()
    uploaded_by = models.ForeignKey('User',on_delete=models.CASCADE,related_name="posts")
    likes = models.IntegerField(default=0)
    created_on = models.DateTimeField(auto_now_add=True)

class Preferences(models.Model):
    user = models.ForeignKey("User",on_delete=models.CASCADE,related_name="my_likes")
    post = models.ForeignKey("Posts",on_delete=models.CASCADE,related_name="p_likes")
    
class Messages(models.Model):
    sender    =   models.ForeignKey("User", on_delete=models.CASCADE,related_name="sended_messages")
    reciever  =   models.ForeignKey("User", on_delete=models.CASCADE,related_name="reciever_messages")
    text      =   models.CharField( max_length=1500)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text

