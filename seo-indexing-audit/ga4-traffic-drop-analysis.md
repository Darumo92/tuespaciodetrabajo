# GA4 - Analisis de caida de trafico organico

## Evidencia disponible en repo

| Dato | Evidencia |
|---|---|
| Impresiones Google a cero desde el 15 abr | `docs/PLAN_RECOVERY_INDEXACION_2026-05-06.md:193` |
| GSC 2026-05-06 a 2026-05-18 muestra solo 1 impresion | `docs/agent-context/project_recovery_session_state.md:18` |
| Consulta GA4 realizada para 2026-05-18 a hoy no devolvio filas | `docs/agent-context/project_recovery_session_state.md:19` |

## Patron inferido

- La caida parece centrada en organico Google, porque el dato principal es desindexacion/GSC.
- La home se mantiene, las internas pierden presencia.
- No hay evidencia en repo de una caida equivalente en otros canales.
- GA4 puede estar infra-midiendo por consentimiento RGPD: GA4 solo carga tras aceptar cookies (`Base.astro:195-223`). Esto no afecta indexacion, pero limita el analisis de trafico real.

## Paginas mas afectadas esperadas antes de la consulta live

Antes de consultar GA4 live, por prioridad SEO y GSC previo, las afectadas principales esperadas eran:

- `/sillas/mejor-silla-ergonomica-calidad-precio/`
- `/accesorios/mejor-monitor-trabajar-desde-casa/`
- `/escritorios/mejor-escritorio-elevable-electrico/`
- `/guias/ergonomia-teletrabajo-postura-correcta/`
- `/guias/dolor-espalda-trabajar-casa/`
- `/ambiente/mejor-lampara-escritorio-led/`
- `/accesorios/mejor-raton-vertical-ergonomico/`
- `/accesorios/mejor-teclado-ergonomico/`

## Hipotesis basada en datos

La caida de GA4 deberia verse como caida de landing pages organicas internas, no necesariamente de home. Si GA4 confirma que direct/referral/social no caen igual, reforzaria diagnostico de indexacion/calidad organica y no de disponibilidad tecnica.

## Consultas GA4 recomendadas

- Organic sessions por `landingPagePlusQueryString`, diario, 2026-03-24 a hoy.
- Comparativa antes/despues: 2026-03-24 a 2026-04-14 vs 2026-04-15 a hoy.
- Canal `Organic Search` vs Direct/Referral/Social.
- Landing pages por tipo: `/guias/`, `/sillas/`, `/escritorios/`, `/accesorios/`, `/ambiente/`.
- Eventos `affiliate_click` si existen despues de consentimiento.
- Engagement rate y average engagement time por landing page.

## Actualizacion GA4 live 2026-05-19

Propiedad consultada: `properties/529910113`.

Canales:

| Canal | Sesiones pre 2026-03-24 a 2026-04-14 | Sesiones post 2026-04-15 a 2026-05-19 | Cambio |
|---|---:|---:|---:|
| Organic Search | 11 | 2 | -81.8% |
| Direct | 86 | 34 | -60.5% |
| Referral | 7 | 0 | -100% |
| Organic Social | 0 | 2 | +2 |
| Unassigned | 2 | 1 | -50% |

Landing pages organicas:

| Landing | Sesiones pre | Sesiones post |
|---|---:|---:|
| `/sillas/mejor-silla-ergonomica-calidad-precio/` | 3 | 0 |
| `/accesorios/mejor-monitor-trabajar-desde-casa/` | 2 | 0 |
| `/` | 2 | 1 |
| `/accesorios/` | 1 | 0 |
| `/ambiente/` | 1 | 0 |
| `/guias/altura-correcta-escritorio-silla/` | 1 | 0 |
| `/guias/mi-setup-home-office-2026/` | 1 | 0 |

Eventos:

| Evento | Pre | Post |
|---|---:|---:|
| `page_view` | 295 | 243 |
| `user_engagement` | 186 | 113 |
| `affiliate_click` | 40 | 5 |
| `click` | 31 | 7 |

Lectura: GA4 confirma el patron de GSC. La home mantiene algo de organico, pero las landing internas principales caen a cero sesiones organicas medidas. La muestra es pequena y GA4 depende del consentimiento, pero la direccion del cambio es clara.
