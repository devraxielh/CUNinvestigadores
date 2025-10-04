from django.contrib import admin
from .models import CodigoUsuario
from .models import Producto

@admin.register(CodigoUsuario)
class CodigoUsuarioAdmin(admin.ModelAdmin):
    list_display = ("usuario", "codigo")

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("id_producto_pd", "nme_producto_pd", "nme_tipologia_pd", "nme_categoria_pd", "ano_convo")
    search_fields = ("id_producto_pd", "nme_producto_pd", "nme_grupo_gr", "nme_convocatoria")
    list_filter = ("nme_tipologia_pd", "nme_categoria_pd", "ano_convo")