
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("profile/<str:name>", views.user_profile, name="profile"),
    path("update_followers/<str:verb>", views.update_followers),
    path("following/<str:name>", views.following_list),
    path("followers/<str:name>", views.follower_list),
    path("update_post", views.post_update),
    path("posts", views.posts, name="all-postes"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
