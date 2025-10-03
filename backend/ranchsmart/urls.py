from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PotreroViewSet, PastoViewSet,PrecipitacionViewSet,CustomTokenObtainPairView,AforoPastoViewSet

router = DefaultRouter()
router.register(r'potreros', PotreroViewSet)
router.register(r'pastos', PastoViewSet)
router.register(r'precipitaciones', PrecipitacionViewSet)
router.register(r'aforos', AforoPastoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]