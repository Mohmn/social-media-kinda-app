from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.db.models import Q
from django.urls import reverse
import json
from datetime import datetime
from .models import User, Posts,Messages ,LastMessageSeen


def index(request):
    # return render(request, "network/index.html")
    if request.method == "GET":
        if request.user.is_authenticated:
            posts = Posts.objects.order_by("-created_on").all()
            ids = request.user.reciever_messages.order_by('sender','-timestamp').distinct('sender') 
            messages_and_username = list(Messages.objects.filter(id__in=ids).order_by('-timestamp').values('sender__username','text')) 
            # print(posts,messages_and_username)
            [user.update({'unread_messages_count':number_of_unread_messages_between_two_users(request.user,User.objects.get(username=user['sender__username']))}) for user in messages_and_username]
            return render(request, "network/index.html",
                          {'posts': posts,
                          'messages_and_usernames':messages_and_username}
                        #   'number_of_unread_messages_between_two_users_list'
                          )
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))
    
def d(request):
    return render(request, "network/new design.html")

def spa(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return render(request, "network/spa.html")
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))


def update_last_message_seen(request,user2):
    if request.method == "GET":
        if request.user.is_authenticated:
            try:
                u2 = User.objects.filter(username=user2)[0]
                u1,u2 = request.user,u2
                 
                if LastMessageSeen.objects.filter(user1=u1,user2=u2).exists():
                    LastMessageSeen.objects.filter(user1=u1,user2=u2).update(last_time_read=datetime.now())
                else :
                    l = LastMessageSeen(user1=u1,user2=u2,last_time_read=datetime.now())
                    l.save()
                return JsonResponse({'successfull':True},status=200)
            except Exception as e:
                print(e)
                return JsonResponse({'successfull': False}, status=200)
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))

def message_history(request,second_user):
    if request.method == "GET":
        if request.user.is_authenticated:
            try:
                u = User.objects.filter(username=second_user)[0]
                condition = ( Q(sender=request.user, reciever=u) | Q(sender=u, reciever=request.user)  )  
                messages = Messages.objects.filter(condition).order_by('-timestamp').all()
                 
                return JsonResponse({'messages':[message.serialize() for message in messages]}, status=200)
            except Exception as e:
                print(e)
                return JsonResponse({'messages_and_username': False}, status=200)
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))


def post_update(request):
    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            p = Posts(post=data['post'], uploaded_by=request.user)
            p.save()
            return JsonResponse({'successfull': True}, status=200)
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))


def update_followers(request, verb):
    if request.method == "POST":
        if request.user.is_authenticated:
            data = json.loads(request.body)
            r_user = User.objects.filter(username=str(data['uname'])).first()
            print(r_user,data)
            if r_user != None:
                if str(verb) == 'follow':
                    request.user.following.add(r_user)
                    r_user.followers.add(request.user)
                    return JsonResponse({'successfull': True}, status=200)
                elif str(verb) == 'unfollow':
                    request.user.following.remove(r_user)
                    r_user.followers.remove(request.user)
                    return JsonResponse({'successfull': True}, status=200)
                else:
                    return JsonResponse({'successfull': False}, status=200)
            else:
                return JsonResponse({'successfull': False}, status=200)
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))


def posts(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            posts = Posts.objects.order_by("-created_on").all()
            return render(request, "network/posts.html",
                          {'posts': posts}
                          )
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))


def spa_posts(request):

    if request.method == "GET":
        if request.user.is_authenticated:
            posts = Posts.objects.order_by("-created_on").all()
            return JsonResponse([post.serialize() for post in posts], safe=False)
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))



def following_list(request,name):
    if request.method == "GET":
        if request.user.is_authenticated:

            user = User.objects.filter(username=str(name)).first()
            following_list = list(user.following.values_list('username',flat=True))
            all = request.user == user
            if all:
                return JsonResponse({'users':following_list,'all': all},status=200)
            else:
                follows= [request.user.following.filter(username=name).exists() for name in following_list]
                return JsonResponse({'users':following_list,'all': all,'if_loogedIn_user_follows':follows},status=200)
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))

def follower_list(request,name):
    if request.method == "GET":
        if request.user.is_authenticated: 
            user = User.objects.filter(username=str(name)).first()
            follower_list = list(user.followers.values_list('username',flat=True))
            follows= [request.user.following.filter(username=name).exists() for name in follower_list]
            return JsonResponse({'users':follower_list,'if_loogedIn_user_follows':follows,'all':False},status=200)
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))

def number_of_unread_messages_between_two_users(u1,u2):
    try:
        time_of_last_msg_seen = LastMessageSeen.objects.get(user1=u1,user2=u2).time_read()
    except Exception as e:
        return 0
    condition = ( Q(sender=u1, reciever=u2) | Q(sender=u2, reciever=u1)  )  
    unread_message_count = Messages.objects.filter(condition).filter(timestamp__range=[time_of_last_msg_seen,datetime.now()]).count()
    return unread_message_count

def user_profile(request, name):
    if request.method == "GET":
        if request.user.is_authenticated:

            r_user = User.objects.filter(username=str(name)).first()
            # print(user)
            if r_user != None:
                unread_messages = number_of_unread_messages_between_two_users(request.user,r_user)
                return render(request, "network/profile_page.html",
                              {'ruser': r_user,
                               'already_follows': request.user.following.filter(pk=r_user.pk).exists(),
                               'unread_messages':unread_messages,
                              })
            else:
                return JsonResponse({'successfull': False})
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))

def userProfileSpa(request, name):
    if request.method == "GET":
        if request.user.is_authenticated:
            r_user = User.objects.filter(username=str(name)).first()
            if r_user != None:
                return JsonResponse({'ruser_info': r_user.serialize(),
                    'already_follows': request.user.following.filter(pk=r_user.pk).exists(),
                    'ruser':r_user.username,'is_logged_in_user': request.user is r_user,
                    'user_posts':[post.serialize() for post in r_user.posts.all()]},status=200)
            else:
                return JsonResponse({'successfull': False})
        else:
            return redirect((reverse("login")))
    else:
        return redirect((reverse("index")))


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
