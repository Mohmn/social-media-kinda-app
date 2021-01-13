from django.contrib import admin
from .models import Posts,User,Messages,LastMessageSeen
# Register your models here.

admin.site.register(Posts)
admin.site.register(User)
admin.site.register(Messages)
admin.site.register(LastMessageSeen)

