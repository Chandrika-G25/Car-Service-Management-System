from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Notification.objects.filter(user=user)
        unread = self.request.query_params.get("unread")
        if unread and unread.lower() in ["true", "1"]:
            queryset = queryset.filter(is_read=False)
        return queryset.order_by("-created_at")


class MarkNotificationReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)


class MarkAllNotificationsReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)


class UnreadNotificationCountView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count}, status=status.HTTP_200_OK)
