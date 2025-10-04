from django.shortcuts import render
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import CodigoUsuario,Producto
from .serializers import CustomTokenObtainPairSerializer,CodigoUsuarioSerializer,ProductoSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CodigoUsuarioViewSet(viewsets.ModelViewSet):
    queryset = CodigoUsuario.objects.all()
    serializer_class = CodigoUsuarioSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        usuario_id = self.request.query_params.get('usuario')
        if usuario_id:
            queryset = queryset.filter(usuario_id=usuario_id)
        return queryset

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        persona_id = self.request.query_params.get("id_persona_pd")
        if persona_id:
            queryset = queryset.filter(id_persona_pd=persona_id)
        return queryset