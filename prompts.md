# Prompts — Trazabilidad: responsable de la tarea

Modelo: claude-sonnet-4-6  
Herramienta: Claude Code (CLI)  
Rama: trazabilidad-cpl

---

## Prompt 1 — Arranque del ejercicio

*Pegado completo del enunciado del ejercicio (el texto de la tarea desde «La tarea» hasta el final de «📤 Cómo se entrega»)*

Objetivo: que el agente leyera el enunciado completo antes de empezar y entendiera qué se pedía exactamente — la matriz de trazabilidad del requisito «Lo que cada tarea muestra de su responsable», los tests que faltan, y la parte B.

---

## Prompt 2 — Lectura de la spec y los tests existentes

El agente buscó y leyó de forma autónoma:
- `openspec/specs/tasks/spec.md` — para identificar los tres scenarios del requisito objetivo
- `backend/tests/functional/auth/*.spec.ts` — para entender el estilo de los tests existentes
- `backend/app/transformers/task_transformer.ts`, `task_assignee_transformer.ts`, `task_detail_transformer.ts`, `user_transformer.ts` — para saber qué campos devuelve la API en el assignee
- `backend/app/controllers/tasks_controller.ts` — para confirmar qué transformer usa cada endpoint
- `backend/start/routes.ts` — para confirmar las rutas disponibles
- `backend/app/models/user.ts` — para entender cómo se calculan las iniciales sin nombre

---

## Lo que encontró (antes de escribir el test)

Con la lectura de los transformers quedó claro que:

- `TaskTransformer` (lista y creación) usa `UserTransformer`, que incluye `email` → viola el requisito
- `TaskDetailTransformer` (tarea suelta) usa `TaskAssigneeTransformer`, que solo incluye `id`, `fullName`, `initials` → correcto
- No existía ningún test en `backend/tests/functional/tasks/`

---

## Prompt 3 — Escritura del test file

El agente escribió `backend/tests/functional/tasks/assignee.spec.ts` con cuatro tests:

1. El assignee trae nombre e iniciales (scenario 1)
2. El assignee en la lista no expone el email — **esperado en rojo** por el bug en `TaskTransformer`
3. El assignee de la tarea suelta no expone el email — esperado en verde
4. Responsable sin nombre: fullName nulo e iniciales presentes (scenario 3)

---

## Resultado de `npm test -- --files=assignee`

```
Tests  3 passed, 1 failed (4)
```

El test en rojo: `el assignee en la lista no expone el email del responsable`
Error: `expected { id: 5, …(5) } to not have nested property 'email'`

Confirma el bug: `TaskTransformer` → `UserTransformer` → incluye email en la respuesta de la lista.

---

## Prompt 4 — Escritura de la matriz y la parte B

El agente escribió `docs/verificacion/cpl.md` con la matriz de trazabilidad y las tres líneas de la parte B, y `prompts.md` (este archivo).
