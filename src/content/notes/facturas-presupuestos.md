---
title: De la factura al dato, con revisión humana
description: "Cómo conecto extracción de facturas con IA, revisión de datos y generación de presupuestos en un mismo sistema."
date: 2026-10-18
order: 2
tags: [automatización, IA, Python]
---

Registrar gastos y preparar presupuestos son dos tareas pequeñas que se repiten constantemente. Mi **App de Facturas & Presupuestos** las conecta: recibe fotos o PDF, extrae los datos relevantes y los organiza antes de enviarlos al registro de gastos.

El sistema usa FastAPI y Python para la lógica, modelos de visión mediante Groq con una alternativa en OpenRouter, y Make para conectar Google Drive y Google Sheets. Los campos dudosos se marcan para su revisión antes de confirmar el envío.

La otra parte genera presupuestos PDF con los datos del cliente, los conceptos y los impuestos. La documentación explica el flujo y su configuración; no es una aplicación de acceso público desde este portfolio.

[Leer la guía del sistema](https://madmikeprods.vercel.app/ia/guia_app_facturas.html).
