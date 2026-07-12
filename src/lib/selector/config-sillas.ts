import type { SelectorTypeConfig } from './config';

export const selectorConfig = {
  tipo: 'silla',
  labels: {
    singular: { 'es-ES': 'Silla', en: 'Office chair' },
    plural: { 'es-ES': 'Sillas', en: 'Office chairs' },
    icon: 'sillas',
  },
  routes: {
    catalogType: { 'es-ES': 'silla', en: 'chairs' },
    editorialCategories: { 'es-ES': ['sillas'], en: ['chairs'] },
  },
  questions: [
    {
      id: 'presupuesto',
      kind: 'single',
      title: { 'es-ES': '¿Qué rango de presupuesto buscas?', en: 'What budget range are you considering?' },
      help: { 'es-ES': 'Los tramos son relativos al catálogo, sin mostrar precios que puedan quedar desactualizados.', en: 'Ranges are relative to the catalog, without showing prices that may become outdated.' },
      neutralValue: 'any',
      visibility: { always: true, fields: [], mode: 'all', minProducts: 0, minRatio: 0 },
      options: [
        {
          value: '1', label: { 'es-ES': 'Tramo 1 · ajustado', en: 'Tier 1 · budget' }, effects: [{
            id: 'silla-presupuesto-1', field: 'tramoPrecio', operator: 'atMost', target: 1,
            weight: 2, missingScore: 0.5, penalty: { factor: 0.65, cap: 70 },
            reason: { 'es-ES': 'Está dentro del tramo de presupuesto más ajustado.', en: 'It falls within the lowest budget tier.' },
            warning: { 'es-ES': 'Supera el tramo de presupuesto elegido.', en: 'It exceeds your selected budget tier.' },
            editorialKeywords: { 'es-ES': ['precio ajustado', 'económica'], en: ['budget', 'affordable'] },
          }],
        },
        {
          value: '2', label: { 'es-ES': 'Tramo 2 · medio', en: 'Tier 2 · mid-range' }, effects: [{
            id: 'silla-presupuesto-2', field: 'tramoPrecio', operator: 'atMost', target: 2,
            weight: 2, missingScore: 0.5, penalty: { factor: 0.65, cap: 70 },
            reason: { 'es-ES': 'Encaja en un presupuesto de tramo medio.', en: 'It fits a mid-range budget.' },
            warning: { 'es-ES': 'Supera el tramo de presupuesto elegido.', en: 'It exceeds your selected budget tier.' },
            editorialKeywords: { 'es-ES': ['gama media', 'calidad precio'], en: ['mid-range', 'value'] },
          }],
        },
        {
          value: '3', label: { 'es-ES': 'Tramo 3 · alto', en: 'Tier 3 · high-end' }, effects: [{
            id: 'silla-presupuesto-3', field: 'tramoPrecio', operator: 'atMost', target: 3,
            weight: 2, missingScore: 0.5, penalty: { factor: 0.65, cap: 70 },
            reason: { 'es-ES': 'Está dentro del tramo alto seleccionado.', en: 'It falls within your selected high-end tier.' },
            warning: { 'es-ES': 'Supera el tramo de presupuesto elegido.', en: 'It exceeds your selected budget tier.' },
            editorialKeywords: { 'es-ES': ['gama alta', 'premium'], en: ['high-end', 'premium'] },
          }],
        },
        {
          value: '4', label: { 'es-ES': 'Tramo 4 · sin límite práctico', en: 'Tier 4 · no practical limit' }, effects: [{
            id: 'silla-presupuesto-4', field: 'tramoPrecio', operator: 'atMost', target: 4,
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
      id: 'prioridad',
      kind: 'single',
      title: { 'es-ES': '¿Qué valoras más?', en: 'What matters most to you?' },
      help: { 'es-ES': 'Priorizaremos ese aspecto sin ignorar el ajuste físico.', en: 'We will prioritize it without overlooking physical fit.' },
      neutralValue: 'any',
      visibility: { always: true, fields: [], mode: 'all', minProducts: 0, minRatio: 0 },
      options: [
        {
          value: 'ergonomia', label: { 'es-ES': 'Ergonomía y ajustes', en: 'Ergonomics and adjustment' }, effects: [{
            id: 'silla-prioridad-ergonomia-preferencia', field: 'valoraciones.ergonomia', operator: 'axis', target: 10,
            weight: 1.5, missingScore: 0.5,
            reason: { 'es-ES': 'Su valoración ergonómica verificada destaca para esta prioridad.', en: 'Its verified ergonomics rating stands out for this priority.' },
            warning: { 'es-ES': 'Falta una valoración ergonómica comparable o queda por debajo de lo ideal.', en: 'A comparable ergonomics rating is missing or below the ideal level.' },
            editorialKeywords: { 'es-ES': ['ergonomía', 'ajustes'], en: ['ergonomics', 'adjustment'] },
          }],
        },
        {
          value: 'durabilidad', label: { 'es-ES': 'Durabilidad', en: 'Durability' }, effects: [
            {
              id: 'silla-prioridad-durabilidad-preferencia-materiales', field: 'valoraciones.materiales', operator: 'axis', target: 10,
              weight: 1.4, missingScore: 0.5,
              reason: { 'es-ES': 'La valoración de materiales respalda una compra orientada a durar.', en: 'Its materials rating supports a durability-focused choice.' },
              warning: { 'es-ES': 'La valoración de materiales es limitada o no está disponible.', en: 'Its materials rating is limited or unavailable.' },
              editorialKeywords: { 'es-ES': ['materiales', 'durabilidad'], en: ['materials', 'durability'] },
            },
            {
              id: 'silla-prioridad-durabilidad-preferencia-garantia', field: 'specs.garantiaAnios', operator: 'atLeast', target: 5,
              weight: 1.2, missingScore: 0.5,
              reason: { 'es-ES': 'La garantía verificada alcanza al menos cinco años.', en: 'The verified warranty covers at least five years.' },
              warning: { 'es-ES': 'La garantía es inferior a cinco años o no consta.', en: 'The warranty is under five years or is not documented.' },
              editorialKeywords: { 'es-ES': ['garantía larga', 'duradera'], en: ['long warranty', 'durable'] },
            },
          ],
        },
        {
          value: 'precio', label: { 'es-ES': 'Relación calidad-precio', en: 'Value for money' }, effects: [
            {
              id: 'silla-prioridad-precio-preferencia-calidad', field: 'valoraciones.calidadPrecio', operator: 'axis', target: 10,
              weight: 1.4, missingScore: 0.5,
              reason: { 'es-ES': 'Su valoración de calidad-precio encaja con tu prioridad.', en: 'Its value rating matches your priority.' },
              warning: { 'es-ES': 'La relación calidad-precio es limitada o no está valorada.', en: 'Its value for money is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['calidad precio', 'buena compra'], en: ['value for money', 'good buy'] },
            },
            {
              id: 'silla-prioridad-precio-preferencia-tramo', field: 'tramoPrecio', operator: 'atMost', target: 2,
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
      id: 'horas',
      kind: 'single',
      title: { 'es-ES': '¿Cuántas horas al día la usarás?', en: 'How many hours per day will you use it?' },
      help: { 'es-ES': 'El uso prolongado da más peso a soporte, comodidad y durabilidad.', en: 'Long sessions place more weight on support, comfort, and durability.' },
      neutralValue: 'unknown',
      visibility: { always: true, fields: [], mode: 'all', minProducts: 0, minRatio: 0 },
      options: [
        {
          value: 'lt4', label: { 'es-ES': 'Menos de 4 horas', en: 'Under 4 hours' }, effects: [{
            id: 'silla-horas-lt4-preferencia-comodidad', field: 'valoraciones.comodidad', operator: 'axis', target: 10,
            weight: 0.6, missingScore: 0.5,
            reason: { 'es-ES': 'Su comodidad verificada es adecuada para sesiones cortas.', en: 'Its verified comfort suits shorter sessions.' },
            warning: { 'es-ES': 'La comodidad es limitada o no está valorada.', en: 'Comfort is limited or not rated.' },
            editorialKeywords: { 'es-ES': ['uso ocasional', 'comodidad'], en: ['occasional use', 'comfort'] },
          }],
        },
        {
          value: '4-8', label: { 'es-ES': 'Entre 4 y 8 horas', en: '4 to 8 hours' }, effects: [
            {
              id: 'silla-horas-4-8-preferencia-ergonomia', field: 'valoraciones.ergonomia', operator: 'axis', target: 10,
              weight: 1.2, missingScore: 0.5,
              reason: { 'es-ES': 'La valoración ergonómica respalda jornadas medias.', en: 'Its ergonomics rating supports medium-length workdays.' },
              warning: { 'es-ES': 'La ergonomía es limitada o no está valorada para este uso.', en: 'Ergonomics are limited or not rated for this use.' },
              editorialKeywords: { 'es-ES': ['jornada laboral', 'ergonomía'], en: ['workday', 'ergonomics'] },
            },
            {
              id: 'silla-horas-4-8-preferencia-ajustabilidad', field: 'valoraciones.ajustabilidad', operator: 'axis', target: 10,
              weight: 1, missingScore: 0.5,
              reason: { 'es-ES': 'Ofrece una ajustabilidad bien valorada para varias horas de uso.', en: 'Its well-rated adjustability suits several hours of use.' },
              warning: { 'es-ES': 'La ajustabilidad es limitada o no está valorada.', en: 'Adjustability is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['ajustabilidad', 'regulable'], en: ['adjustability', 'adjustable'] },
            },
            {
              id: 'silla-horas-4-8-preferencia-materiales', field: 'valoraciones.materiales', operator: 'axis', target: 10,
              weight: 0.8, missingScore: 0.5,
              reason: { 'es-ES': 'Los materiales están bien valorados para un uso diario.', en: 'Its materials are well rated for daily use.' },
              warning: { 'es-ES': 'No hay una valoración sólida de los materiales.', en: 'A solid materials rating is unavailable.' },
              editorialKeywords: { 'es-ES': ['uso diario', 'materiales'], en: ['daily use', 'materials'] },
            },
          ],
        },
        {
          value: '8+', label: { 'es-ES': 'Más de 8 horas', en: 'Over 8 hours' }, effects: [
            {
              id: 'silla-horas-8-preferencia-ergonomia', field: 'valoraciones.ergonomia', operator: 'axis', target: 10,
              weight: 1.5, missingScore: 0.5,
              reason: { 'es-ES': 'Su ergonomía verificada destaca para jornadas largas.', en: 'Its verified ergonomics stand out for long workdays.' },
              warning: { 'es-ES': 'La ergonomía puede quedarse corta o no está valorada.', en: 'Ergonomics may fall short or are not rated.' },
              editorialKeywords: { 'es-ES': ['jornadas largas', 'ergonomía'], en: ['long workdays', 'ergonomics'] },
            },
            {
              id: 'silla-horas-8-preferencia-comodidad', field: 'valoraciones.comodidad', operator: 'axis', target: 10,
              weight: 1.2, missingScore: 0.5,
              reason: { 'es-ES': 'La comodidad está bien valorada para uso intensivo.', en: 'Comfort is well rated for intensive use.' },
              warning: { 'es-ES': 'La comodidad puede ser insuficiente o no está valorada.', en: 'Comfort may be insufficient or is not rated.' },
              editorialKeywords: { 'es-ES': ['uso intensivo', 'comodidad'], en: ['intensive use', 'comfort'] },
            },
            {
              id: 'silla-horas-8-preferencia-ajustabilidad', field: 'valoraciones.ajustabilidad', operator: 'axis', target: 10,
              weight: 1.2, missingScore: 0.5,
              reason: { 'es-ES': 'La ajustabilidad facilita cambiar de postura durante el día.', en: 'Its adjustability supports posture changes throughout the day.' },
              warning: { 'es-ES': 'La ajustabilidad puede ser limitada o no está valorada.', en: 'Adjustability may be limited or is not rated.' },
              editorialKeywords: { 'es-ES': ['cambio de postura', 'ajustes'], en: ['posture changes', 'adjustment'] },
            },
            {
              id: 'silla-horas-8-preferencia-materiales', field: 'valoraciones.materiales', operator: 'axis', target: 10,
              weight: 1, missingScore: 0.5,
              reason: { 'es-ES': 'Los materiales están valorados para soportar un uso exigente.', en: 'Its materials are rated for demanding use.' },
              warning: { 'es-ES': 'La resistencia de los materiales no está bien valorada.', en: 'Material durability is not well rated.' },
              editorialKeywords: { 'es-ES': ['resistencia', 'uso exigente'], en: ['durability', 'demanding use'] },
            },
          ],
        },
        { value: 'unknown', label: { 'es-ES': 'No lo sé todavía', en: 'Not sure yet' }, effects: [] },
      ],
    },
    {
      id: 'altura', kind: 'number',
      inputLabel: { 'es-ES': 'Estatura', en: 'Height' },
      unit: { 'es-ES': 'cm', en: 'cm' },
      title: { 'es-ES': '¿Cuánto mides?', en: 'How tall are you?' },
      help: { 'es-ES': 'Usamos el rango recomendado y, si falta, el rango de altura del asiento.', en: 'We use the recommended user-height range and fall back to seat-height range.' },
      neutralValue: null,
      validation: { min: 140, max: 210, step: 1 },
      visibility: {
        fieldGroups: [
          ['specs.alturaRecomendadaMinCm', 'specs.alturaRecomendadaMaxCm'],
          ['specs.alturaAsientoMinCm', 'specs.alturaAsientoMaxCm'],
        ],
        mode: 'any', minProducts: 2, minRatio: 0.15,
      },
      effects: [{
        id: 'silla-altura-ajuste', rangeFields: ['specs.alturaRecomendadaMinCm', 'specs.alturaRecomendadaMaxCm'],
        operator: 'containsRange', target: { source: 'answer' }, weight: 2, missingScore: 0.45,
        penalty: { factor: 0.6, cap: 60 },
        fallback: {
          rangeFields: ['specs.alturaAsientoMinCm', 'specs.alturaAsientoMaxCm'],
          operator: 'containsRange', target: { source: 'answer', multiply: 0.253 },
        },
        reason: { 'es-ES': 'El rango de ajuste verificado encaja con tu altura.', en: 'The verified adjustment range fits your height.' },
        warning: { 'es-ES': 'El rango verificado no encaja con tu altura o faltan medidas.', en: 'The verified range does not fit your height, or measurements are missing.' },
        editorialKeywords: { 'es-ES': ['rango de altura', 'altura del asiento'], en: ['height range', 'seat height'] },
      }],
    },
    {
      id: 'peso', kind: 'number',
      inputLabel: { 'es-ES': 'Peso', en: 'Weight' },
      unit: { 'es-ES': 'kg', en: 'kg' },
      title: { 'es-ES': '¿Cuánto pesas?', en: 'How much do you weigh?' },
      help: { 'es-ES': 'Buscamos 10 kg de margen sobre tu peso para evitar trabajar al límite declarado.', en: 'We look for 10 kg of headroom above your weight rather than using the stated limit.' },
      neutralValue: null,
      validation: { min: 40, max: 180, step: 1 },
      visibility: { fields: ['specs.pesoMaxKg'], mode: 'all', minProducts: 3, minRatio: 0.25 },
      effects: [{
        id: 'silla-peso-margen', field: 'specs.pesoMaxKg', operator: 'atLeast',
        target: { source: 'answer', add: 10 }, weight: 2.5, missingScore: 0.35,
        penalty: { factor: 0.5, cap: 49 },
        reason: { 'es-ES': 'La carga máxima verificada deja al menos 10 kg de margen.', en: 'The verified maximum load provides at least 10 kg of headroom.' },
        warning: { 'es-ES': 'La carga máxima no deja el margen recomendado o no está verificada.', en: 'The maximum load lacks the recommended headroom or is not verified.' },
        editorialKeywords: { 'es-ES': ['peso máximo', 'carga máxima'], en: ['maximum weight', 'load capacity'] },
      }],
    },
    {
      id: 'respaldo', kind: 'single',
      title: { 'es-ES': '¿Qué tipo de respaldo prefieres?', en: 'Which backrest material do you prefer?' },
      help: { 'es-ES': 'La malla ventila más; la espuma ofrece un apoyo acolchado.', en: 'Mesh improves airflow, while foam provides cushioned support.' },
      neutralValue: 'any',
      visibility: { fields: ['specs.respaldo'], mode: 'all', minProducts: 3, minRatio: 0.25, minDistinct: 2 },
      options: [
        {
          value: 'malla', label: { 'es-ES': 'Malla', en: 'Mesh' }, effects: [{
            id: 'silla-respaldo-malla', field: 'specs.respaldo', operator: 'equals', target: 'malla', weight: 1.2, missingScore: 0.5,
            reason: { 'es-ES': 'El respaldo verificado es de malla, como prefieres.', en: 'The verified backrest uses your preferred mesh construction.' },
            warning: { 'es-ES': 'El respaldo no es de malla o el material no está verificado.', en: 'The backrest is not mesh, or its material is not verified.' },
            editorialKeywords: { 'es-ES': ['respaldo de malla', 'transpirable'], en: ['mesh backrest', 'breathable'] },
          }],
        },
        {
          value: 'espuma', label: { 'es-ES': 'Espuma acolchada', en: 'Padded foam' }, effects: [{
            id: 'silla-respaldo-espuma', field: 'specs.respaldo', operator: 'equals', target: 'espuma', weight: 1.2, missingScore: 0.5,
            reason: { 'es-ES': 'El respaldo verificado ofrece el acolchado que buscas.', en: 'The verified backrest provides your preferred cushioning.' },
            warning: { 'es-ES': 'El respaldo no es acolchado o el material no está verificado.', en: 'The backrest is not padded, or its material is not verified.' },
            editorialKeywords: { 'es-ES': ['respaldo acolchado', 'espuma'], en: ['padded backrest', 'foam'] },
          }],
        },
        {
          value: 'mixto', label: { 'es-ES': 'Mixto', en: 'Hybrid' }, effects: [{
            id: 'silla-respaldo-mixto', field: 'specs.respaldo', operator: 'equals', target: 'mixto', weight: 1.2, missingScore: 0.5,
            reason: { 'es-ES': 'El respaldo verificado combina ventilación y acolchado.', en: 'The verified backrest combines airflow and cushioning.' },
            warning: { 'es-ES': 'El respaldo no es mixto o el material no está verificado.', en: 'The backrest is not hybrid, or its material is not verified.' },
            editorialKeywords: { 'es-ES': ['respaldo mixto', 'malla y cojín'], en: ['hybrid backrest', 'mesh and cushion'] },
          }],
        },
        { value: 'any', label: { 'es-ES': 'Sin preferencia', en: 'No preference' }, effects: [] },
      ],
    },
    {
      id: 'molestias', kind: 'multi',
      title: { 'es-ES': '¿Dónde necesitas más apoyo?', en: 'Where do you need more support?' },
      help: { 'es-ES': 'Puedes elegir hasta tres zonas.', en: 'You can select up to three areas.' },
      neutralValue: ['ninguna'], validation: { maxSelections: 3 },
      visibility: {
        fields: ['specs.lumbar', 'specs.reposacabezas', 'specs.reclinacionMaxGrados', 'specs.profundidadRegulable'],
        mode: 'any', minProducts: 3, minRatio: 0.2,
      },
      options: [
        {
          value: 'lumbar', label: { 'es-ES': 'Zona lumbar', en: 'Lower back' }, effects: [
            {
              id: 'silla-lumbar-ajuste', field: 'specs.lumbar', operator: 'ranked', target: 'altura',
              rank: { fijo: 0, presion: 1, altura: 2, dinamico: 3, '5d': 4 }, weight: 1.5, missingScore: 0.4,
              reason: { 'es-ES': 'El soporte lumbar verificado ofrece regulación en altura o superior.', en: 'The verified lumbar support offers height adjustment or better.' },
              warning: { 'es-ES': 'El soporte lumbar es más básico de lo recomendado o no está verificado.', en: 'Lumbar support is more basic than recommended or is not verified.' },
              editorialKeywords: { 'es-ES': ['soporte lumbar', 'lumbar regulable'], en: ['lumbar support', 'adjustable lumbar'] },
            },
            {
              id: 'silla-lumbar-ergonomia', field: 'valoraciones.ergonomia', operator: 'axis', target: 10,
              weight: 0.8, missingScore: 0.5,
              reason: { 'es-ES': 'La valoración ergonómica acompaña al soporte lumbar.', en: 'Its ergonomics rating supports the lumbar specification.' },
              warning: { 'es-ES': 'La ergonomía es limitada o no está valorada.', en: 'Ergonomics are limited or not rated.' },
              editorialKeywords: { 'es-ES': ['ergonomía lumbar', 'espalda'], en: ['lumbar ergonomics', 'back support'] },
            },
          ],
        },
        {
          value: 'cervical', label: { 'es-ES': 'Cuello y cervicales', en: 'Neck' }, effects: [
            {
              id: 'silla-cervical-reposacabezas', field: 'specs.reposacabezas', operator: 'ranked', target: 'ajustable',
              rank: { ninguno: 0, fijo: 1, ajustable: 2 }, weight: 1.5, missingScore: 0.4,
              reason: { 'es-ES': 'Incluye un reposacabezas ajustable verificado.', en: 'It has a verified adjustable headrest.' },
              warning: { 'es-ES': 'El reposacabezas no es ajustable o no está verificado.', en: 'The headrest is not adjustable or is not verified.' },
              editorialKeywords: { 'es-ES': ['reposacabezas ajustable', 'cervicales'], en: ['adjustable headrest', 'neck support'] },
            },
            {
              id: 'silla-cervical-reclinacion', field: 'specs.reclinacionMaxGrados', operator: 'atLeast', target: 120,
              weight: 0.9, missingScore: 0.45,
              reason: { 'es-ES': 'La reclinación verificada alcanza al menos 120 grados.', en: 'The verified recline reaches at least 120 degrees.' },
              warning: { 'es-ES': 'La reclinación es menor de 120 grados o no está verificada.', en: 'Recline is under 120 degrees or is not verified.' },
              editorialKeywords: { 'es-ES': ['reclinación', 'descanso cervical'], en: ['recline', 'neck relief'] },
            },
          ],
        },
        {
          value: 'cadera', label: { 'es-ES': 'Cadera y piernas', en: 'Hips and legs' }, effects: [
            {
              id: 'silla-cadera-profundidad', field: 'specs.profundidadRegulable', operator: 'boolean', target: true,
              weight: 1.5, missingScore: 0.4,
              reason: { 'es-ES': 'La profundidad del asiento es regulable según la ficha verificada.', en: 'The verified specification includes adjustable seat depth.' },
              warning: { 'es-ES': 'La profundidad no es regulable o no está verificada.', en: 'Seat depth is not adjustable or is not verified.' },
              editorialKeywords: { 'es-ES': ['profundidad regulable', 'asiento'], en: ['adjustable seat depth', 'seat'] },
            },
            {
              id: 'silla-cadera-comodidad', field: 'valoraciones.comodidad', operator: 'axis', target: 10,
              weight: 0.8, missingScore: 0.5,
              reason: { 'es-ES': 'La comodidad está bien valorada para aliviar presión al sentarse.', en: 'Comfort is well rated for reducing seated pressure.' },
              warning: { 'es-ES': 'La comodidad es limitada o no está valorada.', en: 'Comfort is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['comodidad del asiento', 'cadera'], en: ['seat comfort', 'hip support'] },
            },
          ],
        },
        { value: 'ninguna', label: { 'es-ES': 'Ninguna molestia concreta', en: 'No specific discomfort' }, effects: [] },
      ],
    },
    {
      id: 'compartida', kind: 'single',
      title: { 'es-ES': '¿La usarán varias personas?', en: 'Will several people use it?' },
      help: { 'es-ES': 'Una silla compartida se beneficia de ajustes rápidos y amplios.', en: 'A shared chair benefits from quick, broad adjustments.' },
      neutralValue: 'any',
      visibility: {
        fields: ['specs.profundidadRegulable', 'valoraciones.ajustabilidad'], mode: 'any', minProducts: 3, minRatio: 0.2,
      },
      options: [
        {
          value: 'si', label: { 'es-ES': 'Sí', en: 'Yes' }, effects: [
            {
              id: 'silla-compartida-profundidad', field: 'specs.profundidadRegulable', operator: 'boolean', target: true,
              weight: 1.4, missingScore: 0.45,
              reason: { 'es-ES': 'La profundidad regulable facilita compartir la silla.', en: 'Adjustable seat depth makes the chair easier to share.' },
              warning: { 'es-ES': 'No consta profundidad regulable para adaptar el asiento.', en: 'Adjustable seat depth is not documented for fitting different users.' },
              editorialKeywords: { 'es-ES': ['silla compartida', 'profundidad regulable'], en: ['shared chair', 'adjustable seat depth'] },
            },
            {
              id: 'silla-compartida-ajustabilidad', field: 'valoraciones.ajustabilidad', operator: 'axis', target: 10,
              weight: 1, missingScore: 0.5,
              reason: { 'es-ES': 'La ajustabilidad está bien valorada para varios usuarios.', en: 'Adjustability is well rated for multiple users.' },
              warning: { 'es-ES': 'La ajustabilidad es limitada o no está valorada.', en: 'Adjustability is limited or not rated.' },
              editorialKeywords: { 'es-ES': ['varios usuarios', 'ajustabilidad'], en: ['multiple users', 'adjustability'] },
            },
          ],
        },
        { value: 'no', label: { 'es-ES': 'No', en: 'No' }, effects: [] },
        { value: 'any', label: { 'es-ES': 'No importa', en: 'No preference' }, effects: [] },
      ],
    },
  ],
} satisfies SelectorTypeConfig;
