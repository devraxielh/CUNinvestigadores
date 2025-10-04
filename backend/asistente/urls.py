from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView,CodigoUsuarioViewSet,ProductoViewSet

router = DefaultRouter()
router.register(r'codigos', CodigoUsuarioViewSet)
router.register(r"productos", ProductoViewSet, basename="producto")

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]