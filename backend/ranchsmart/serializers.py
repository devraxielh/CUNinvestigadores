from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from .models import Potrero, Pasto, Precipitacion, AforoPasto

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'username': self.user.username,
            'email': self.user.email,
        }
        return data

class PastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pasto
        fields = '__all__'


class PotreroSerializer(serializers.ModelSerializer):
    pasto_info = PastoSerializer(source='pasto', read_only=True)
    class Meta:
        model = Potrero
        fields = '__all__'

    def validate_coordenadas(self, value):
        if not isinstance(value, list) or len(value) < 3:
            raise serializers.ValidationError("Se requieren al menos 3 coordenadas válidas.")
        for punto in value:
            if not (isinstance(punto, list) and len(punto) == 2 and all(isinstance(c, (int, float)) for c in punto)):
                raise serializers.ValidationError("Cada coordenada debe ser [lat, lng].")
        return value

class PrecipitacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Precipitacion
        fields = '__all__'

class AforoPastoSerializer(serializers.ModelSerializer):
    potrero_nombre = serializers.CharField(source='potrero.nombre', read_only=True)

    class Meta:
        model = AforoPasto
        fields = '__all__'