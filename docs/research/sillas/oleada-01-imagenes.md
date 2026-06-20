# Oleada 01 — Imágenes pendientes (7 fichas premium)

Las fichas se publicaron con `imagen: ""`. El humano descarga la imagen oficial de producto, la guarda en `public/img/productos/<archivo>` y luego se actualiza el campo `imagen` de cada ficha a `/img/productos/<archivo>`.

Recomendación: usar fondo blanco/lienzo cuadrado uniforme como el resto del catálogo (ver commits recientes de normalización de imágenes).

| slug | fuente sugerida (URL de imagen oficial del producto) | archivo destino | alt sugerido |
|------|------------------------------------------------------|-----------------|--------------|
| herman-miller-sayl | https://images.hermanmiller.group/m/37240250314b7974/W-HM_2294_100209035_fog_studio_white_cadet_hghtadjs_a.png (de store.hermanmiller.com/office-chairs-ergonomic-chairs/sayl-chair/2294.html) | herman-miller-sayl.jpg | Silla ergonómica Herman Miller Sayl con respaldo de suspensión |
| herman-miller-mirra-2 | Imagen de producto en store.hermanmiller.com/office-chairs-ergonomic-chairs/mirra-2-chair/1453.html | herman-miller-mirra-2.jpg | Silla ergonómica Herman Miller Mirra 2 con respaldo TriFlex |
| herman-miller-cosm | Imagen de producto en store.hermanmiller.com/office-chairs-ergonomic-chairs/cosm-chair/2515454.html | herman-miller-cosm.jpg | Silla ergonómica Herman Miller Cosm con basculación Auto-Harmonic |
| steelcase-think | Imagen de producto en eu.steelcase.com/products/think (o steelcase.com/products/office-chairs/think) | steelcase-think.jpg | Silla ergonómica Steelcase Think con sistema LiveBack |
| haworth-zody | //store.haworth.com/cdn/shop/products/ZodyII_CH-55_X4-2_PL-No-Lumbar-34_bf87aeb8-0585-4d21-a269-e50a64aa3bc3.jpg (de store.haworth.com/products/zody-office-chair) | haworth-zody.jpg | Silla ergonómica Haworth Zody con soporte lumbar PAL |
| humanscale-diffrient-smart | Imagen de producto en humanscale.com/products/seating/diffrient-smart-task-office-chair/custom | humanscale-diffrient-smart.jpg | Silla ergonómica Humanscale Diffrient Smart con malla form-sensing |
| hag-sofi | Imagen de producto en hag-office.com/products/hag-sofi-7500 | hag-sofi.jpg | Silla ergonómica HÅG SoFi con sistema inBalance |

## Notas

- Las URLs de imagen de Herman Miller Sayl y Haworth Zody se obtuvieron directamente de la página oficial fetcheada (URL directa al asset). Las demás apuntan a la página oficial del producto: hay que abrir y descargar la imagen principal del producto desde ahí (los CDN cambian el path con frecuencia).
- Herman Miller usa `images.hermanmiller.group` como CDN; Haworth usa `store.haworth.com/cdn/shop/products`.
- Verificar que la imagen descargada corresponde al modelo de oficina (no a la variante gaming en el caso de la Sayl).
