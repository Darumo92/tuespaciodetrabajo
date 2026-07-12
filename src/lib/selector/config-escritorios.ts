import type { SelectorTypeConfig } from './config';

export const selectorConfig = {
  tipo: 'escritorio',
  labels: {
    singular: { 'es-ES': 'Escritorio elevable', en: 'Standing desk' },
    plural: { 'es-ES': 'Escritorios elevables', en: 'Standing desks' },
    icon: 'escritorios',
  },
  routes: {
    catalogType: { 'es-ES': 'escritorio', en: 'standing-desks' },
    editorialCategories: { 'es-ES': ['escritorios'], en: ['desks'] },
  },
  questions: [
    {
      id: 'presupuesto', kind: 'single',
      title: { 'es-ES': '¿Qué rango de presupuesto buscas?', en: 'What budget range are you considering?' },
      help: { 'es-ES': 'Los tramos son relativos al catálogo, sin mostrar precios que puedan quedar desactualizados.', en: 'Ranges are relative to the catalog, without showing prices that may become outdated.' },
      neutralValue: 'any',
      visibility: { always: true, fields: [], mode: 'all', minProducts: 0, minRatio: 0 },
      options: [
        {
          value: '1', label: { 'es-ES': 'Tramo 1 · ajustado', en: 'Tier 1 · budget' }, effects: [{
            id: 'escritorio-presupuesto-1', field: 'tramoPrecio', operator: 'atMost', target: 1,
            weight: 2, missingScore: 0.5, penalty: { factor: 0.65, cap: 70 },
            reason: { 'es-ES': 'Está dentro del tramo de presupuesto más ajustado.', en: 'It falls within the lowest budget tier.' },
            warning: { 'es-ES': 'Supera el tramo de presupuesto elegido.', en: 'It exceeds your selected budget tier.' },
            editorialKeywords: { 'es-ES': ['precio ajustado', 'económico'], en: ['budget', 'affordable'] },
          }],
        },
        {
          value: '2', label: { 'es-ES': 'Tramo 2 · medio', en: 'Tier 2 · mid-range' }, effects: [{
            id: 'escritorio-presupuesto-2', field: 'tramoPrecio', operator: 'atMost', target: 2,
            weight: 2, missingScore: 0.5, penalty: { factor: 0.65, cap: 70 },
            reason: { 'es-ES': 'Encaja en un presupuesto de tramo medio.', en: 'It fits a mid-range budget.' },
            warning: { 'es-ES': 'Supera el tramo de presupuesto elegido.', en: 'It exceeds your selected budget tier.' },
            editorialKeywords: { 'es-ES': ['gama media', 'calidad precio'], en: ['mid-range', 'value'] },
          }],
        },
        {
          value: '3', label: { 'es-ES': 'Tramo 3 · alto', en: 'Tier 3 · high-end' }, effects: [{
            id: 'escritorio-presupuesto-3', field: 'tramoPrecio', operator: 'atMost', target: 3,
            weight: 2, missingScore: 0.5, penalty: { factor: 0.65, cap: 70 },
            reason: { 'es-ES': 'Está dentro del tramo alto seleccionado.', en: 'It falls within your selected high-end tier.' },
            warning: { 'es-ES': 'Supera el tramo de presupuesto elegido.', en: 'It exceeds your selected budget tier.' },
            editorialKeywords: { 'es-ES': ['gama alta', 'premium'], en: ['high-end', 'premium'] },
          }],
        },
        {
          value: '4', label: { 'es-ES': 'Tramo 4 · sin límite práctico', en: 'Tier 4 · no practical limit' }, effects: [{
            id: 'escritorio-presupuesto-4', field: 'tramoPrecio', operator: 'atMost', target: 4,
            weight: 2, missingScore: 0.5, penalty: { factor: 0.65, cap: 70 },
            reason: { 'es-ES': 'Está dentro del tramo de presupuesto más amplio.', en: 'It falls within the broadest budget tier.' },
            warning: { 'es-ES': 'El tramo de precio no encaja con tu selección.', en: 'Its price tier does not fit your selection.' },
            editorialKeywords: { 'es-ES': ['sin límite', 'máxima gama'], en: ['no budget limit', 'top tier'] },
          }],
        },
        { value: 'any', label: { 'es-ES': 'Me da igual', en: 'No preference' }, effects: [] },
      ],
    },
    {
      id: 'prioridad', kind: 'single',
      title: { 'es-ES': '¿Qué valoras más?', en: 'What matters most to you?' },
      help: { 'es-ES': 'Priorizaremos ese aspecto sin ignorar medidas y compatibilidad.', en: 'We will prioritize it without overlooking dimensions and compatibility.' },
      neutralValue: 'any',
      visibility: { always: true, fields: [], mode: 'all', minProducts: 0, minRatio: 0 },
      options: [
        {
          value: 'ergonomia', label: { 'es-ES': 'Ergonomía al alternar postura', en: 'Sit-stand ergonomics' }, effects: [
            {
              id: 'escritorio-prioridad-ergonomia-preferencia-rango', field: 'valoraciones.rangoAltura', operator: 'axis', target: 10,
              weight: 1.5, missingScore: 0.5,
              reason: { 'es-ES': 'El rango de altura está bien valorado para alternar postura.', en: 'Its height range is well rated for switching posture.' },
              warning: { 'es-ES': 'El rango de altura es limitado o no está valorado.', en: 'The height range is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['rango de altura', 'sentado de pie'], en: ['height range', 'sit stand'] },
            },
            {
              id: 'escritorio-prioridad-ergonomia-preferencia-velocidad', field: 'valoraciones.velocidad', operator: 'axis', target: 10,
              weight: 0.9, missingScore: 0.5,
              reason: { 'es-ES': 'La velocidad está bien valorada para cambiar de postura.', en: 'Its speed is well rated for changing posture.' },
              warning: { 'es-ES': 'La velocidad es limitada o no está valorada.', en: 'Speed is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['cambio de altura', 'velocidad'], en: ['height changes', 'speed'] },
            },
          ],
        },
        {
          value: 'durabilidad', label: { 'es-ES': 'Durabilidad y estabilidad', en: 'Durability and stability' }, effects: [
            {
              id: 'escritorio-prioridad-durabilidad-preferencia-estabilidad', field: 'valoraciones.estabilidad', operator: 'axis', target: 10,
              weight: 1.5, missingScore: 0.5,
              reason: { 'es-ES': 'La estabilidad está bien valorada para una compra duradera.', en: 'Its stability is well rated for a lasting purchase.' },
              warning: { 'es-ES': 'La estabilidad es limitada o no está valorada.', en: 'Stability is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['estabilidad', 'estructura robusta'], en: ['stability', 'robust frame'] },
            },
            {
              id: 'escritorio-prioridad-durabilidad-preferencia-materiales', field: 'valoraciones.materiales', operator: 'axis', target: 10,
              weight: 1.2, missingScore: 0.5,
              reason: { 'es-ES': 'Los materiales están bien valorados para uso continuado.', en: 'Its materials are well rated for continued use.' },
              warning: { 'es-ES': 'Los materiales tienen una valoración limitada o ausente.', en: 'Its materials rating is limited or unavailable.' },
              editorialKeywords: { 'es-ES': ['materiales', 'durabilidad'], en: ['materials', 'durability'] },
            },
            {
              id: 'escritorio-prioridad-durabilidad-preferencia-garantia', field: 'specs.garantiaAnios', operator: 'atLeast', target: 5,
              weight: 1.2, missingScore: 0.5,
              reason: { 'es-ES': 'La garantía verificada alcanza al menos cinco años.', en: 'The verified warranty covers at least five years.' },
              warning: { 'es-ES': 'La garantía es inferior a cinco años o no consta.', en: 'The warranty is under five years or is not documented.' },
              editorialKeywords: { 'es-ES': ['garantía larga', 'duradero'], en: ['long warranty', 'durable'] },
            },
          ],
        },
        {
          value: 'precio', label: { 'es-ES': 'Relación calidad-precio', en: 'Value for money' }, effects: [
            {
              id: 'escritorio-prioridad-precio-preferencia-calidad', field: 'valoraciones.calidadPrecio', operator: 'axis', target: 10,
              weight: 1.4, missingScore: 0.5,
              reason: { 'es-ES': 'Su valoración de calidad-precio encaja con tu prioridad.', en: 'Its value rating matches your priority.' },
              warning: { 'es-ES': 'La relación calidad-precio es limitada o no está valorada.', en: 'Its value for money is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['calidad precio', 'buena compra'], en: ['value for money', 'good buy'] },
            },
            {
              id: 'escritorio-prioridad-precio-preferencia-tramo', field: 'tramoPrecio', operator: 'atMost', target: 2,
              weight: 1, missingScore: 0.5,
              reason: { 'es-ES': 'Se mantiene en los tramos de precio más contenidos.', en: 'It stays within the lower price tiers.' },
              warning: { 'es-ES': 'Pertenece a un tramo de precio alto para esta prioridad.', en: 'It sits in a high price tier for this priority.' },
              editorialKeywords: { 'es-ES': ['precio contenido', 'asequible'], en: ['lower price', 'affordable'] },
            },
          ],
        },
        { value: 'any', label: { 'es-ES': 'Equilibrio general', en: 'Balanced overall' }, effects: [] },
      ],
    },
    {
      id: 'horas', kind: 'single',
      title: { 'es-ES': '¿Cuántas horas al día lo usarás?', en: 'How many hours per day will you use it?' },
      help: { 'es-ES': 'Para jornadas largas damos más peso al rango, estabilidad y resistencia.', en: 'For long workdays, height range, stability, and durability matter more.' },
      neutralValue: 'unknown',
      visibility: { always: true, fields: [], mode: 'all', minProducts: 0, minRatio: 0 },
      options: [
        {
          value: 'lt4', label: { 'es-ES': 'Menos de 4 horas', en: 'Under 4 hours' }, effects: [{
            id: 'escritorio-horas-lt4-preferencia-rango', field: 'valoraciones.rangoAltura', operator: 'axis', target: 10,
            weight: 0.6, missingScore: 0.5,
            reason: { 'es-ES': 'El rango de altura está bien valorado para un uso ocasional.', en: 'Its height range is well rated for occasional use.' },
            warning: { 'es-ES': 'El rango de altura es limitado o no está valorado.', en: 'The height range is limited or not rated.' },
            editorialKeywords: { 'es-ES': ['uso ocasional', 'rango de altura'], en: ['occasional use', 'height range'] },
          }],
        },
        {
          value: '4-8', label: { 'es-ES': 'Entre 4 y 8 horas', en: '4 to 8 hours' }, effects: [
            {
              id: 'escritorio-horas-4-8-preferencia-rango', field: 'valoraciones.rangoAltura', operator: 'axis', target: 10,
              weight: 1.2, missingScore: 0.5,
              reason: { 'es-ES': 'El rango de altura está bien valorado para una jornada normal.', en: 'Its height range is well rated for a regular workday.' },
              warning: { 'es-ES': 'El rango de altura es limitado o no está valorado.', en: 'The height range is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['jornada laboral', 'rango de altura'], en: ['workday', 'height range'] },
            },
            {
              id: 'escritorio-horas-4-8-preferencia-estabilidad', field: 'valoraciones.estabilidad', operator: 'axis', target: 10,
              weight: 1, missingScore: 0.5,
              reason: { 'es-ES': 'La estabilidad está bien valorada para el uso diario.', en: 'Its stability is well rated for daily use.' },
              warning: { 'es-ES': 'La estabilidad es limitada o no está valorada.', en: 'Stability is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['uso diario', 'estabilidad'], en: ['daily use', 'stability'] },
            },
            {
              id: 'escritorio-horas-4-8-preferencia-velocidad', field: 'valoraciones.velocidad', operator: 'axis', target: 10,
              weight: 0.8, missingScore: 0.5,
              reason: { 'es-ES': 'La velocidad está bien valorada para alternar varias veces.', en: 'Its speed is well rated for several posture changes.' },
              warning: { 'es-ES': 'La velocidad es limitada o no está valorada.', en: 'Speed is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['alternar postura', 'velocidad'], en: ['posture changes', 'speed'] },
            },
          ],
        },
        {
          value: '8+', label: { 'es-ES': 'Más de 8 horas', en: 'Over 8 hours' }, effects: [
            {
              id: 'escritorio-horas-8-preferencia-rango', field: 'valoraciones.rangoAltura', operator: 'axis', target: 10,
              weight: 1.5, missingScore: 0.5,
              reason: { 'es-ES': 'El rango de altura destaca para alternar durante jornadas largas.', en: 'Its height range stands out for long sit-stand workdays.' },
              warning: { 'es-ES': 'El rango de altura puede quedarse corto o no está valorado.', en: 'The height range may fall short or is not rated.' },
              editorialKeywords: { 'es-ES': ['jornada larga', 'sentado de pie'], en: ['long workday', 'sit stand'] },
            },
            {
              id: 'escritorio-horas-8-preferencia-estabilidad', field: 'valoraciones.estabilidad', operator: 'axis', target: 10,
              weight: 1.3, missingScore: 0.5,
              reason: { 'es-ES': 'La estabilidad está bien valorada para uso intensivo.', en: 'Its stability is well rated for intensive use.' },
              warning: { 'es-ES': 'La estabilidad puede ser limitada o no está valorada.', en: 'Stability may be limited or is not rated.' },
              editorialKeywords: { 'es-ES': ['uso intensivo', 'estabilidad'], en: ['intensive use', 'stability'] },
            },
            {
              id: 'escritorio-horas-8-preferencia-capacidad', field: 'valoraciones.capacidadCarga', operator: 'axis', target: 10,
              weight: 1.1, missingScore: 0.5,
              reason: { 'es-ES': 'La capacidad de carga está bien valorada para un equipo permanente.', en: 'Its load capacity is well rated for a permanent setup.' },
              warning: { 'es-ES': 'La capacidad de carga es limitada o no está valorada.', en: 'Load capacity is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['capacidad de carga', 'equipo pesado'], en: ['load capacity', 'heavy setup'] },
            },
            {
              id: 'escritorio-horas-8-preferencia-materiales', field: 'valoraciones.materiales', operator: 'axis', target: 10,
              weight: 1, missingScore: 0.5,
              reason: { 'es-ES': 'Los materiales están bien valorados para un uso exigente.', en: 'Its materials are well rated for demanding use.' },
              warning: { 'es-ES': 'Los materiales tienen una valoración limitada o ausente.', en: 'Its materials rating is limited or unavailable.' },
              editorialKeywords: { 'es-ES': ['materiales', 'uso exigente'], en: ['materials', 'demanding use'] },
            },
          ],
        },
        { value: 'unknown', label: { 'es-ES': 'No lo sé todavía', en: 'Not sure yet' }, effects: [] },
      ],
    },
    {
      id: 'espacio', kind: 'dimensions',
      title: { 'es-ES': '¿Qué espacio máximo tienes?', en: 'What is your maximum available space?' },
      help: { 'es-ES': 'Indica ancho y fondo en centímetros. Solo afectan a la puntuación si necesitas un escritorio con tablero incluido; si aún no lo has decidido, no se aplican.', en: 'Enter width and depth in centimeters. They affect scoring only if you require a desk with an included tabletop; if you are undecided, they do not apply.' },
      neutralValue: null,
      validation: {
        components: {
          ancho: { min: 60, max: 240, step: 1, label: { 'es-ES': 'Ancho disponible', en: 'Available width' }, unit: { 'es-ES': 'cm', en: 'cm' } },
          fondo: { min: 40, max: 120, step: 1, label: { 'es-ES': 'Fondo disponible', en: 'Available depth' }, unit: { 'es-ES': 'cm', en: 'cm' } },
        },
      },
      visibility: {
        fieldGroups: [['specs.tableroAnchoCm', 'specs.tableroFondoCm']],
        mode: 'any', minProducts: 3, minRatio: 0.2, minDistinct: 2,
      },
      effects: [
        {
          id: 'escritorio-espacio-ancho', field: 'specs.tableroAnchoCm', operator: 'atMost',
          target: { source: 'answer', answerKey: 'ancho' }, weight: 2, missingScore: 0.55,
          when: { answerId: 'tablero', in: ['incluido'] }, penalty: { factor: 0.65, cap: 65 },
          reason: { 'es-ES': 'El ancho verificado cabe en el espacio disponible.', en: 'The verified width fits your available space.' },
          warning: { 'es-ES': 'El ancho supera tu espacio o la medida no está verificada.', en: 'The width exceeds your space, or the measurement is not verified.' },
          editorialKeywords: { 'es-ES': ['ancho del tablero', 'espacio compacto'], en: ['desktop width', 'compact space'] },
        },
        {
          id: 'escritorio-espacio-fondo', field: 'specs.tableroFondoCm', operator: 'atMost',
          target: { source: 'answer', answerKey: 'fondo' }, weight: 2, missingScore: 0.55,
          when: { answerId: 'tablero', in: ['incluido'] }, penalty: { factor: 0.65, cap: 65 },
          reason: { 'es-ES': 'El fondo verificado cabe en el espacio disponible.', en: 'The verified depth fits your available space.' },
          warning: { 'es-ES': 'El fondo supera tu espacio o la medida no está verificada.', en: 'The depth exceeds your space, or the measurement is not verified.' },
          editorialKeywords: { 'es-ES': ['fondo del tablero', 'espacio disponible'], en: ['desktop depth', 'available space'] },
        },
      ],
    },
    {
      id: 'motor', kind: 'single',
      title: { 'es-ES': '¿Qué mecanismo prefieres?', en: 'Which lifting mechanism do you prefer?' },
      help: { 'es-ES': 'El doble motor suele priorizar capacidad y suavidad; el manual evita electrónica.', en: 'Dual motors tend to prioritize capacity and smoothness; manual frames avoid electronics.' },
      neutralValue: 'any',
      visibility: { fields: ['specs.motor'], mode: 'all', minProducts: 3, minRatio: 0.25, minDistinct: 2 },
      options: [
        {
          value: 'doble', label: { 'es-ES': 'Doble motor', en: 'Dual motor' }, effects: [{
            id: 'escritorio-motor-doble', field: 'specs.motor', operator: 'equals', target: 'doble', weight: 1.5, missingScore: 0.45,
            reason: { 'es-ES': 'La ficha verificada confirma un sistema de doble motor.', en: 'The verified specification confirms a dual-motor system.' },
            warning: { 'es-ES': 'No usa doble motor o el mecanismo no está verificado.', en: 'It does not use dual motors, or the mechanism is not verified.' },
            editorialKeywords: { 'es-ES': ['doble motor', 'motor eléctrico'], en: ['dual motor', 'electric motor'] },
          }],
        },
        {
          value: 'simple', label: { 'es-ES': 'Motor simple', en: 'Single motor' }, effects: [{
            id: 'escritorio-motor-simple', field: 'specs.motor', operator: 'equals', target: 'simple', weight: 1.5, missingScore: 0.45,
            reason: { 'es-ES': 'La ficha verificada confirma un sistema de motor simple.', en: 'The verified specification confirms a single-motor system.' },
            warning: { 'es-ES': 'No usa motor simple o el mecanismo no está verificado.', en: 'It does not use a single motor, or the mechanism is not verified.' },
            editorialKeywords: { 'es-ES': ['motor simple', 'eléctrico'], en: ['single motor', 'electric'] },
          }],
        },
        {
          value: 'manual', label: { 'es-ES': 'Manual', en: 'Manual crank' }, effects: [{
            id: 'escritorio-motor-manual', field: 'specs.motor', operator: 'equals', target: 'manual', weight: 1.5, missingScore: 0.45,
            reason: { 'es-ES': 'La ficha verificada confirma un ajuste manual sin motor.', en: 'The verified specification confirms manual adjustment without a motor.' },
            warning: { 'es-ES': 'No es manual o el mecanismo no está verificado.', en: 'It is not manual, or the mechanism is not verified.' },
            editorialKeywords: { 'es-ES': ['manivela', 'sin motor'], en: ['manual crank', 'no motor'] },
          }],
        },
        { value: 'any', label: { 'es-ES': 'Sin preferencia', en: 'No preference' }, effects: [] },
      ],
    },
    {
      id: 'tablero', kind: 'single',
      title: { 'es-ES': '¿Necesitas que incluya tablero?', en: 'Do you need a desktop included?' },
      help: { 'es-ES': 'Una estructura sola permite reutilizar o elegir tu propio tablero.', en: 'A frame-only option lets you reuse or choose your own desktop.' },
      neutralValue: 'any',
      visibility: { fields: ['specs.tableroIncluido'], mode: 'all', minProducts: 3, minRatio: 0.25, minDistinct: 2 },
      options: [
        {
          value: 'incluido', label: { 'es-ES': 'Sí, completo', en: 'Yes, complete desk' }, effects: [{
            id: 'escritorio-tablero-incluido', field: 'specs.tableroIncluido', operator: 'boolean', target: true,
            weight: 2, missingScore: 0.45, penalty: { factor: 0.7, cap: 70 },
            reason: { 'es-ES': 'La ficha verificada confirma que incluye tablero.', en: 'The verified specification confirms that a desktop is included.' },
            warning: { 'es-ES': 'Se vende sin tablero o ese dato no está verificado.', en: 'It is sold without a desktop, or inclusion is not verified.' },
            editorialKeywords: { 'es-ES': ['tablero incluido', 'escritorio completo'], en: ['desktop included', 'complete desk'] },
          }],
        },
        {
          value: 'estructura', label: { 'es-ES': 'No, solo estructura', en: 'No, frame only' }, effects: [{
            id: 'escritorio-tablero-estructura', field: 'specs.tableroIncluido', operator: 'boolean', target: false,
            weight: 2, missingScore: 0.45,
            reason: { 'es-ES': 'La ficha verificada confirma que se vende como estructura.', en: 'The verified specification confirms a frame-only product.' },
            warning: { 'es-ES': 'Incluye tablero o ese dato no está verificado.', en: 'It includes a desktop, or the configuration is not verified.' },
            editorialKeywords: { 'es-ES': ['solo estructura', 'tablero propio'], en: ['frame only', 'custom desktop'] },
          }],
        },
        { value: 'any', label: { 'es-ES': 'Me da igual', en: 'No preference' }, effects: [] },
      ],
    },
    {
      id: 'accesorios', kind: 'multi',
      title: { 'es-ES': '¿Qué extras necesitas?', en: 'Which extras do you need?' },
      help: { 'es-ES': 'Puedes elegir hasta tres funciones verificables.', en: 'You can select up to three verifiable features.' },
      neutralValue: ['ninguno'], validation: { maxSelections: 3 },
      visibility: { fields: ['specs.memorias', 'specs.anticolision', 'specs.puertoUsb'], mode: 'any', minProducts: 3, minRatio: 0.2 },
      options: [
        {
          value: 'memorias', label: { 'es-ES': 'Memorias de altura', en: 'Height presets' }, effects: [{
            id: 'escritorio-accesorio-memorias', field: 'specs.memorias', operator: 'atLeast', target: 2,
            weight: 1.2, missingScore: 0.4,
            reason: { 'es-ES': 'El panel verificado guarda al menos dos alturas.', en: 'The verified controller stores at least two heights.' },
            warning: { 'es-ES': 'Tiene menos de dos memorias o el dato no está verificado.', en: 'It has fewer than two presets, or the feature is not verified.' },
            editorialKeywords: { 'es-ES': ['memorias de altura', 'posiciones guardadas'], en: ['height presets', 'saved positions'] },
          }],
        },
        {
          value: 'anticolision', label: { 'es-ES': 'Anticolisión', en: 'Anti-collision' }, effects: [{
            id: 'escritorio-accesorio-anticolision', field: 'specs.anticolision', operator: 'boolean', target: true,
            weight: 1.2, missingScore: 0.4,
            reason: { 'es-ES': 'La función anticolisión está confirmada en la ficha verificada.', en: 'Anti-collision protection is confirmed in the verified specification.' },
            warning: { 'es-ES': 'No consta función anticolisión verificada.', en: 'Verified anti-collision protection is not documented.' },
            editorialKeywords: { 'es-ES': ['anticolisión', 'seguridad'], en: ['anti-collision', 'safety'] },
          }],
        },
        {
          value: 'usb', label: { 'es-ES': 'Carga USB', en: 'USB charging' }, effects: [{
            id: 'escritorio-accesorio-usb', field: 'specs.puertoUsb', operator: 'boolean', target: true,
            weight: 1, missingScore: 0.4,
            reason: { 'es-ES': 'La carga USB está confirmada en la ficha verificada.', en: 'USB charging is confirmed in the verified specification.' },
            warning: { 'es-ES': 'No consta carga USB verificada.', en: 'Verified USB charging is not documented.' },
            editorialKeywords: { 'es-ES': ['carga USB', 'puerto USB'], en: ['USB charging', 'USB port'] },
          }],
        },
        { value: 'ninguno', label: { 'es-ES': 'Ninguno imprescindible', en: 'No essential extras' }, effects: [] },
      ],
    },
  ],
} satisfies SelectorTypeConfig;
