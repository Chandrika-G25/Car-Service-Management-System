from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterCustomerView, CustomLoginView, LogoutView

urlpatterns = [
    path('register/', RegisterCustomerView.as_view(), name='auth-register'),
    path('login/', CustomLoginView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
]
