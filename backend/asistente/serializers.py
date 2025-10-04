from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import CodigoUsuario,Producto
class CodigoUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodigoUsuario
        fields = "__all__"

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id_user': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        return data

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = "__all__"