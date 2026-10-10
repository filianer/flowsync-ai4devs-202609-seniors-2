# Matriz de trazabilidad — Requisito: Lo que cada tarea muestra de su responsable

Scenarios en el requisito: 3 · Cubiertos: 2 (el tercero falla en la lista por un bug, pasa en la tarea suelta)

| Scenario | Test que lo cubre | Estado | Qué faltó |
|---|---|---|---|
| El assignee trae nombre e iniciales cuando el responsable tiene nombre | `el assignee trae nombre e iniciales cuando el responsable tiene nombre` | Cubierto | — |
| El assignee no incluye el email del responsable (suelta o en lista) | `el assignee en la lista no expone el email del responsable` / `el assignee de la tarea suelta no expone el email del responsable` | No cubierto en la lista · Cubierto en la tarea suelta | `TaskTransformer` delega en `UserTransformer`, que sí incluye email. `TaskDetailTransformer` usa `TaskAssigneeTransformer` (sin email), que es correcto. La spec es clara; el código no la cumple en el camino de la lista. |
| Responsable sin nombre llega con fullName nulo e iniciales presentes | `responsable sin nombre llega con fullName nulo e iniciales presentes` | Cubierto | — |

---

## Parte B: las tres líneas

Cuántos scenarios creía cubiertos antes de mirar: 0 · Cuántos lo estaban al terminar: 0 (no había ningún test de tasks).

El scenario en el que no supe si faltaba un test o faltaba la regla en la spec fue el segundo (la tarea no filtra datos de cuenta): vi que `TaskTransformer` usaba `UserTransformer` con email y dudé si la spec exigía algo que el código había decidido no implementar todavía, o si era simplemente un olvido; la existencia de `TaskAssigneeTransformer` sin email, que sí usa `TaskDetailTransformer`, me confirmó que la regla existe y el bug está en que `TaskTransformer` no usa el transformer correcto.

Algo que el scenario no determinaba y tuve que decidir al escribir el test fue qué afirmar exactamente para las iniciales del responsable sin nombre: el scenario solo dice "sus iniciales siguen llegando", sin indicar el valor ni el algoritmo; decidí comprobar solo que son una cadena no vacía, no el valor concreto derivado del email, porque eso habría ido más allá de lo que la spec especifica.
