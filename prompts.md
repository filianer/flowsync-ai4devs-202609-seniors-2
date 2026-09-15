# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

Modelo: Opus 5 (1M context)
Herramienta: Claude Code

Lee el ticket FLOW-5 de mi tablero de Jira usando el MCP de Atlassian.

Quiero un plan de implementación para ese ticket en este repositorio, no la implementación.
No modifiques, crees ni borres ningún archivo, no instales dependencias y no hagas commits.
Puedes leer el código y ejecutar comandos de solo lectura para entender el proyecto.

El plan debe incluir:
1. Resumen del ticket en dos o tres frases, tal como lo has entendido.
2. Lista numerada de los archivos que crearías o modificarías, con la ruta completa y una línea
   de qué cambia en cada uno. Indica al final el total de archivos.
3. Pasos de implementación en orden, separando backend y frontend.
4. Cómo verificarías que funciona: comandos a ejecutar y pruebas que harías.
5. Dudas o huecos del ticket que necesitarías aclarar, y qué decisión tomarías por defecto
   en cada uno si no te respondo.
6. Riesgos o cosas que podrían romper algo que ya existe.

Si en algún momento necesitas una decisión mía para poder seguir, pregúntame antes de continuar.

**Qué salió:** (opcional, una línea) funcionó a la primera / tuve que insistir / me inventó una ruta que no existe.
