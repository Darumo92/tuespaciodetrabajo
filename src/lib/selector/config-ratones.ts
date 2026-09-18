import type { SelectorCriterion, SelectorTypeConfig, LocalizedText } from './config';

const text = (es: string, en: string): LocalizedText => ({ 'es-ES': es, en });
const keywords: Record<string, LocalizedText> = {
  'specs.mano': text('mano', 'hand'), 'specs.formato': text('formato', 'shape'),
  'specs.bluetooth': text('Bluetooth', 'Bluetooth'), 'specs.cableDatos': text('cable', 'cable'),
  'specs.clicSilencioso': text('clics silenciosos', 'quiet clicks'),
  'specs.multidispositivo': text('equipos', 'devices'), 'specs.pesoG': text('peso', 'weight'),
  tramoPrecio: text('precio', 'price'),
};
const effect = (id: string, field: string, target: string | boolean | number,
  reason: LocalizedText, warning: LocalizedText, operator: SelectorCriterion['operator'] = 'equals'): SelectorCriterion => ({
  id: `raton-${id}`, field, target, operator, weight: 2, missingScore: 0,
  penalty: { factor: 0.15, cap: 20 }, reason, warning,
  editorialKeywords: { 'es-ES': [keywords[field]['es-ES']], en: [keywords[field].en] },
});
const neutral = { value: 'any', label: text('Sin preferencia', 'No preference'), effects: [] };

export const selectorConfig: SelectorTypeConfig = {
  tipo: 'raton',
  labels: { singular: text('Ratón', 'Mouse'), plural: text('Ratones', 'Mice'), icon: 'raton' },
  routes: { catalogType: { 'es-ES': 'raton', en: 'mice' }, editorialCategories: { 'es-ES': ['accesorios'], en: ['accessories'] } },
  questions: [
    {
      id: 'mano', kind: 'single', neutralValue: 'any',
      title: text('¿Con qué mano lo usarás?', 'Which hand will you use?'),
      help: text('Este primer lote contiene variantes para la mano derecha. Si eliges izquierda, los resultados avisarán de la incompatibilidad; no son recomendaciones de compra.', 'This first batch contains right-handed variants. Choosing left will flag incompatible results, which are not buying recommendations.'),
      options: [
        { value: 'derecha', label: text('Derecha', 'Right'), effects: [effect('mano-derecha', 'specs.mano', 'derecha', text('La variante está diseñada para la mano derecha.', 'This variant is designed for the right hand.'), text('La variante no está confirmada para la mano derecha.', 'This variant is not confirmed for right-handed use.'))] },
        { value: 'izquierda', label: text('Izquierda', 'Left'), effects: [effect('mano-izquierda', 'specs.mano', 'izquierda', text('La variante está diseñada para la mano izquierda.', 'This variant is designed for the left hand.'), text('Esta variante es diestra: no la compres como modelo para zurdos.', 'This is a right-handed variant: do not buy it as a left-handed model.'))] },
        neutral,
      ],
    },
    {
      id: 'formato', kind: 'single', neutralValue: 'any',
      title: text('¿Qué formato prefieres?', 'Which shape do you prefer?'),
      help: text('El formato es una preferencia de agarre, no una garantía de aliviar molestias.', 'Shape is a grip preference, not a guarantee of pain relief.'),
      options: [
        { value: 'vertical', label: text('Vertical', 'Vertical'), effects: [effect('formato-vertical', 'specs.formato', 'vertical', text('Tiene el formato vertical que buscas.', 'It has the vertical shape you want.'), text('No tiene formato vertical.', 'It is not a vertical mouse.'))] },
        { value: 'convencional', label: text('Convencional', 'Conventional'), effects: [effect('formato-convencional', 'specs.formato', 'convencional', text('Mantiene un formato convencional.', 'It uses a conventional shape.'), text('Su formato es vertical.', 'It has a vertical shape.'))] },
        neutral,
      ],
    },
    {
      id: 'conexion', kind: 'single', neutralValue: 'any',
      title: text('¿Necesitas alguna conexión concreta?', 'Do you need a specific connection?'),
      help: text('USB-C para cargar no implica que el cable transmita el movimiento del ratón.', 'USB-C charging does not necessarily mean the cable transmits mouse input.'),
      options: [
        { value: 'bluetooth', label: text('Bluetooth, sin ocupar un puerto', 'Bluetooth, without using a USB port'), effects: [effect('bluetooth', 'specs.bluetooth', true, text('La conexión Bluetooth está confirmada.', 'Bluetooth support is confirmed.'), text('Bluetooth no está disponible o no está verificado.', 'Bluetooth is unavailable or unverified.'), 'boolean')] },
        { value: 'cable', label: text('Uso por cable USB', 'USB wired use'), effects: [effect('cable', 'specs.cableDatos', true, text('Se ha confirmado el uso del ratón por cable USB.', 'USB wired mouse operation is confirmed.'), text('El uso por cable USB no está confirmado; no confundas carga con datos.', 'USB wired operation is not confirmed; charging is not the same as data.'), 'boolean')] },
        neutral,
      ],
    },
    {
      id: 'prioridad', kind: 'single', neutralValue: 'any',
      title: text('¿Qué función te importa más?', 'Which feature matters most?'),
      help: text('Comparamos especificaciones publicadas. No hay notas de comodidad ni pruebas de rendimiento inventadas.', 'We compare published specifications, without invented comfort ratings or performance tests.'),
      options: [
        { value: 'silencio', label: text('Clics silenciosos', 'Quiet clicks'), effects: [effect('silencio', 'specs.clicSilencioso', true, text('El fabricante especifica clics silenciosos.', 'The manufacturer specifies quiet clicks.'), text('No consta una función de clics silenciosos verificada.', 'A quiet-click feature has not been verified.'), 'boolean')] },
        { value: 'multidispositivo', label: text('Cambiar entre equipos', 'Switching between devices'), effects: [effect('multidispositivo', 'specs.multidispositivo', true, text('Tiene cambio entre dispositivos verificado.', 'Device switching is verified.'), text('El cambio rápido entre dispositivos no está confirmado.', 'Quick device switching has not been confirmed.'), 'boolean')] },
        { value: 'peso', label: text('Peso inferior a 80 g', 'Weight under 80 g'), effects: [effect('peso', 'specs.pesoG', 80, text('Su peso publicado es de 80 g o menos.', 'Its published weight is 80 g or less.'), text('Supera los 80 g de esta preferencia o no consta el peso.', 'It exceeds this 80 g preference or its weight is unknown.'), 'atMost')] },
        { value: 'precio', label: text('Tramo de precio económico', 'Budget price tier'), effects: [effect('precio', 'tramoPrecio', 1, text('Pertenece al tramo más económico de este catálogo.', 'It belongs to the lowest price tier in this catalog.'), text('Pertenece a un tramo de precio superior.', 'It belongs to a higher price tier.'), 'atMost')] },
        neutral,
      ],
    },
  ],
};
