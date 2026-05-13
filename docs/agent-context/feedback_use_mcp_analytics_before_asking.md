---
name: Usar MCP Analytics/GSC/Cloudflare antes de pedir datos
description: Para diagnosticos SEO, trafico, indexacion y prioridades, consultar primero Google Search Console, Google Analytics y Cloudflare via MCP.
type: feedback
updated: 2026-05-13
---

# Usar MCP Analytics/GSC/Cloudflare antes de pedir datos

Desde 2026-05-13 hay configuracion MCP versionada para Google Search Console, Google Analytics y Cloudflare.

Para cualquier revision de plan SEO, diagnostico de trafico, priorizacion, rutina diaria, evaluacion de contenidos existentes, indexacion, clicks, impresiones, CTR, posiciones, rendimiento tecnico o validacion de si el plan actual tiene sentido, consultar primero estas fuentes mediante MCP antes de pedir datos al usuario:

- Google Search Console MCP
- Google Analytics MCP
- Cloudflare MCP/API

Antes de decir "necesito que me pases los datos", comprobar si el dato esta accesible por esos MCP.

Si un MCP falla, no tiene permisos o no expone el dato concreto, indicar el intento realizado y pedir solo el dato faltante.

Propiedades validadas:

- GSC: `sc-domain:tuespaciodetrabajo.com`
- GA4: `properties/529910113` (`Tuespaciodetrabajo`)
