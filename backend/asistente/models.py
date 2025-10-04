from django.db import models
from django.contrib.auth.models import User

class CodigoUsuario(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name="codigo_usuario")
    codigo = models.CharField(max_length=100, unique=True)  # opcional que el código sea único

    def __str__(self):
        return f"{self.usuario.username} - {self.codigo}"


class Producto(models.Model):
    id = models.AutoField(primary_key=True)
    id_producto_pd = models.CharField(max_length=500, blank=True, default="", null=True)
    ano_convo = models.CharField(max_length=500, blank=True, default="", null=True)
    cod_grupo_gr = models.CharField(max_length=500, blank=True, default="", null=True)
    fcreacion_pd = models.CharField(max_length=500, blank=True, default="", null=True)
    id_convocatoria = models.CharField(max_length=500, blank=True, default="", null=True)
    id_persona_pd = models.CharField(max_length=500, blank=True, default="", null=True)
    id_tipo_pd_med = models.CharField(max_length=500, blank=True, default="", null=True)
    nme_categoria_pd = models.CharField(max_length=500, blank=True, default="", null=True)
    nme_clase_pd = models.CharField(max_length=500, blank=True, default="", null=True)
    nme_convocatoria = models.CharField(max_length=500, blank=True, default="", null=True)
    nme_grupo_gr = models.CharField(max_length=500, blank=True, default="", null=True)
    nme_producto_pd = models.CharField(max_length=1000, blank=True, default="", null=True)
    nme_tipo_medicion_pd = models.CharField(max_length=500, blank=True, default="", null=True)
    nme_tipologia_pd = models.CharField(max_length=500, blank=True, default="", null=True)

    class Meta:
        db_table = "Productos"

    def __str__(self):
        return f"{self.id_producto_pd} - {self.nme_producto_pd[:60]}"