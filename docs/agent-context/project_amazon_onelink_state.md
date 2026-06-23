# Estado Amazon OneLink

Última actualización: 2026-06-22

## Estado confirmado por el usuario

- El usuario ha registrado cuentas de Amazon Afiliados para todos los países disponibles que quería usar con OneLink.
- La configuración se está haciendo desde Amazon Afiliados España > OneLink.
- Captura de OneLink muestra ubicación principal: España.
- Captura posterior muestra 10 tiendas enlazadas: Alemania, Bélgica, Canadá, Estados Unidos, Francia, Italia, Países Bajos, Polonia, Reino Unido y Suecia.
- Captura de "Gestionar Mis ID De Seguimiento" confirma que `tuespaciodet-21` existe y está seleccionado en la cuenta de España; también existen `tuespaciodetrabajo-21` y `patasyhogar-21`.
- Captura de preferencias OneLink confirma guardado de IDs internacionales para la tienda española `patasyhogar-21`, no para `tuespaciodet-21`. Para esta web hay que repetir/verificar el mismo mapeo con `tuespaciodet-21`, salvo migración explícita del código.
- La guía de integración mostrada por Amazon no incluye script/OneTag; el flujo actual parece basarse en vincular tiendas y configurar tracking IDs predeterminados.
- Prueba OneLink con `https://www.amazon.es/dp/B0C3T865C2?tag=tuespaciodet-21` hacia Francia funciona: redirige a `https://www.amazon.fr/dp/B0C3T865C2?tag=patasyhogar0a-21`.
- Pruebas hacia Estados Unidos con `B0C3T865C2` y `B09DCNDGWB` devuelven "No se han encontrado registros"; interpretar como producto/equivalencia no encontrada para ese mercado, no como fallo global de OneLink.
- Prueba con URL de búsqueda Amazon (`/s?k=...`) hacia Estados Unidos devuelve "No se han encontrado registros", pero la misma clase de búsqueda hacia Reino Unido sí funciona: redirige a `amazon.co.uk/s/?tag=patasyhogar0c-21&field-keywords=...`. Conclusión: el comprobador puede validar búsquedas, pero el resultado depende del marketplace y la equivalencia disponible.
- Usuario confirma que OneLink funciona en todos los países configurados probados salvo Estados Unidos y Canadá. Tratar US/CA como excepción por catálogo/configuración regional pendiente, no como bloqueo para Europa.
- Investigación 2026-06-22: documentación pública de Amazon lista Amazon.com y Amazon.ca como programas internacionales; no hay evidencia oficial de que OneLink excluya US/CA. La causa pendiente debe aislarse entre: (a) preferencias OneLink no aplicadas a `tuespaciodet-21` en US/CA, (b) cuenta US/CA pendiente/incompleta, o (c) matching de catálogo/query para esos marketplaces.
- Captura US Associates (`StoreID: patasyhogar-20`) muestra preferencia inversa para tráfico de la tienda US hacia España: España -> `tuespaciodet-21`. Esto no prueba la ruta necesaria para la web, que es España (`tuespaciodet-21`) -> US (`patasyhogar-20`) / CA (`patasyhogar06-20`).
- Corrección de lectura: en Amazon Afiliados España, `patasyhogar-21` aparece como StoreID/tienda principal de la cuenta, mientras `tuespaciodet-21` es un ID de seguimiento dentro de esa tienda. La pantalla de OneLink puede decir "tráfico de la tienda `patasyhogar-21`" aunque el tráfico real de la web use el tracking ID `tuespaciodet-21`.
- Captura "Gestionar Mis ID De Seguimiento" muestra `tuespaciodet-21` seleccionado como ID de seguimiento disponible dentro de la cuenta española; no hay selector separado de tienda origen para OneLink.

## Tracking ID vigente en la web

- La web actualmente usa `tuespaciodet-21` como tag principal en componentes y helpers de Amazon.
- En la configuración de OneLink, las ID predeterminadas por país deben mapearse a `tuespaciodet-21` salvo que se haga una migración explícita del código a otro tracking ID.
- La captura muestra también `tuespaciodetrabajo-21` y `patasyhogar-21`; no asumir que son los tags activos de esta web sin revisar/actualizar código.

## Próximos pasos recomendados

1. Enlazar todas las cuentas internacionales con la cuenta de España desde OneLink.
2. Para cada ubicación geográfica, establecer el tracking ID predeterminado correspondiente a `tuespaciodet-21`.
3. Mantener `Coincidencia cercana` como preferencia de redirección por defecto.
4. Probar enlaces reales desde el validador de OneLink y desde Amazon Associates antes de desplegar cambios grandes.
5. No inventar ASIN por país; OneLink puede redirigir o buscar equivalentes, pero los ASIN internacionales deben verificarse si se usan explícitamente.
6. No añadir script OneLink en `Base.astro` salvo que Amazon vuelva a mostrar explícitamente un snippet en la guía de integración.
