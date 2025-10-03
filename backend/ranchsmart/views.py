from django.shortcuts import render
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Potrero, Pasto, Precipitacion,AforoPasto
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer,PotreroSerializer, PastoSerializer,PrecipitacionSerializer, AforoPastoSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PotreroViewSet(viewsets.ModelViewSet):
    queryset = Potrero.objects.all()
    serializer_class = PotreroSerializer

class PastoViewSet(viewsets.ModelViewSet):
    queryset = Pasto.objects.all()
    serializer_class = PastoSerializer

class PrecipitacionViewSet(viewsets.ModelViewSet):
    queryset = Precipitacion.objects.all().order_by('-fecha')
    serializer_class = PrecipitacionSerializer

class AforoPastoViewSet(viewsets.ModelViewSet):
    queryset = AforoPasto.objects.all()
    serializer_class = AforoPastoSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['potrero']