from django.db import models

class Pasto(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Potrero(models.Model):
    ESTADOS = [
        (0, 'Inactivo'),
        (1, 'En descanso'),
        (2, 'Ocupado'),
    ]

    nombre = models.CharField(max_length=100)
    coordenadas = models.JSONField()
    pasto = models.ForeignKey(
        Pasto,
        on_delete=models.SET_NULL,
        related_name='potreros',
        null=True,
        blank=True
    )
    estado = models.CharField(
        max_length=10,
        choices=ESTADOS,
        default=0
    )
    area_m2 = models.FloatField(default=0)

    def __str__(self):
        return self.nombre

class Precipitacion(models.Model):
    fecha = models.DateField()
    milimetros = models.FloatField(help_text="Cantidad de lluvia en mm")
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.fecha} - {self.milimetros} mm"

class AforoPasto(models.Model):
    potrero = models.ForeignKey(Potrero, on_delete=models.CASCADE, related_name="aforos")
    fecha = models.DateField()
    materia_seca_kg_ha = models.FloatField()
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.potrero.nombre} - {self.fecha}"