---
title: De la reunión a la presentación
description: "Un flujo con Zoom, Make o n8n y Gamma para convertir un resumen de reunión en una presentación."
date: 2026-10-18
order: 3
tags: [automatización, Make, n8n]
---

El final de una reunión no suele ser el final del trabajo: queda ordenar lo que se ha hablado y preparar el material que se compartirá después. Esta guía documenta un flujo que convierte el **resumen de Zoom en una presentación de Gamma**.

Un webhook recibe el evento de resumen completado. Make o n8n procesa el contenido y lo envía a la API de Gamma. Como la generación no es inmediata, el flujo consulta su estado hasta que puede recoger el enlace y la descarga del PDF.

El último paso envía el resultado por correo. La guía cubre autenticación, filtros y manejo de estados; los servicios necesitan sus propias cuentas y la configuración correspondiente.

[Ver el flujo paso a paso](https://madmikeprods.vercel.app/ia/zoomtogamma.html).
