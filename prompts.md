# Prompts

## Prompt 1

**Modelo:** Opus 5.5 (1M)
**Herramienta:** Claude Code (extensión de VS Code)

```
necesito hacer esto 

📋 La tarea
⚠ Ve guardando cada prompt tal cual lo lanzas, desde el primero. Se entregan junto con la spec, y no valen reconstruidos: el prompt que arreglas mentalmente diez minutos después no es el que lanzaste, y es justo la diferencia que interesa mirar.

El encuadre, y no es un consuelo
Vas a escribir la spec de un código que ya está escrito y ya funciona. No propones nada, no cambias una línea: lees lo que hay y escribes lo que hace hoy.

Suena a tarea de documentación, y ahí está la trampa: no lo es. Intentar decir en WHEN/THEN lo que hace un código es la forma más barata que existe de auditarlo, porque te obliga a decidir, requisito a requisito, qué es contrato y qué es casualidad. Y esa decisión, unas cuantas veces, no vas a poder tomarla. Esas veces son el ejercicio.

El entregable no es la spec. Son las tres listas de la parte B, y esas se escriben igual de bien con la spec a medias.

El reloj tampoco es una crueldad de diseño. Escribir la spec de un sistema entero no cabe en una tarde de nadie, y por eso el ejercicio va sobre una superficie pequeña. Lo que sale en 45 minutos es exactamente la parte que depende de tener criterio, no la que depende de tener una herramienta mejor.

📌 Para la tarea no hace falta OpenSpec, y no lo inicialices en el proyecto. No se lanza ningún comando, no se inicializa nada y no se toca la configuración: solo se lee código que ya está ahí y se escribe un archivo de texto con el formato de una spec viva. El openspec init sobre el proyecto de verdad llega en el directo, y hacerlo antes te deja carpetas a medias que después estorban.

Sobre qué se hace: sobre el vertical de cuentas y acceso del proyecto que acabas de dejar listo (registro, inicio de sesión, sesión y perfil), que es lo que ya está construido de punta a punta. Entero, en sus dos capas, igual que lo hace el mentor en el directo: en el backend, sus rutas, sus controladores, el modelo de usuario, sus validadores y sus middlewares; en el frontend, las pantallas de acceso, el estado de sesión y la protección de rutas. Los prompts los escribes tú.

Dónde se deja: en docs/spec-viva/<tus-iniciales>.md. La carpeta todavía no existe en el repo; la crea tu archivo.

⚠ Resérvale un rato de verdad y ponte el reloj. Son unos 45 minutos y hay que pararlos. Dejarlo para la noche de antes te deja con una spec larga y sin comprobar, que es justo lo que la tarea quiere que veas, pero se aprovecha mejor con tiempo de pensarlo.

🅰 Parte A: la spec, con reloj
Con un agente, escribe la spec de lo que el sistema hace hoy y déjala en un archivo versionado del proyecto, no en el chat.

Las dos capas, y solo ese vertical. Lo que pasa por la API y lo que se ve en pantalla, y nada que no sea cuentas y acceso, aunque el agente se ofrezca a seguir. Que el agente escriba las dos capas es rápido; lo que no cabe en el reloj es comprobarlo todo después, que es donde está el ejercicio. Cuenta con no llegar a comprobar cada requisito: la parte B existe precisamente para decir hasta dónde llegaste.

El formato lo fija esta lección, y no es negociable:

Arriba, un ## Purpose de una o dos frases: para qué existe esta capability.

Debajo, ## Requirements, y colgando de él ### Requirement: en los que el sistema SHALL hacer algo.

Bajo cada requisito, al menos un #### Scenario: de cuatro almohadillas, con dos viñetas: **WHEN** y **THEN**. No hay casilla para el GIVEN: la precondición se mete dentro del WHEN.

En castellano, salvo las mayúsculas de la RFC.

Y tres reglas duras, que son las que separan este ejercicio de escribir documentación:

Nada de ADDED, MODIFIED ni REMOVED. Eso es el vocabulario de un delta, y esto no es un delta: es la verdad actual del sistema. Si tu archivo tiene una de esas secciones, has escrito otra cosa.

Solo comportamiento observable desde fuera. Ni un nombre de clase, ni un nombre de archivo, ni una ruta de código. En la API, observable es la petición y la respuesta. En la pantalla, observable es lo que una persona ve y puede hacer.

No toques el código. Ni siquiera para arreglar lo que encuentres, y sobre todo para eso: lo que encuentres es material de la parte B.

⚠ Cuando suene el reloj, para. Aunque esté a medias. Aunque falten requisitos, aunque haya escenarios sin THEN, aunque justo estuvieras a punto de comprobar una cosa.

Una spec en la que comprobaste seis de los requisitos que escribiste y dejaste dos a medias es información: dice exactamente hasta dónde llegaste. Una spec completada de memoria diez minutos después es ruido con formato, y encima es indistinguible de la buena.

🅱 Parte B: las tres listas
Debajo de la spec, en el mismo archivo. Esta parte no se puede fallar, y es la que hay que traer sí o sí.

1. Cuántos requisitos escribió el agente, y cuántos comprobaste tú abriendo el código. Los dos números, tal cual salieron. No los redondees ni los expliques. Comprobar significa haber ido a mirar si el código hace eso; leer el requisito y que suene razonable no cuenta.

2. Las incoherencias que aparecieron al escribirla. Una línea cada una, con dónde se ve. No las busques a propósito: aparecen solas, porque una regla que se cumple en casi todas partes canta en cuanto intentas escribirla como si se cumpliera siempre.

3. Lo que no supiste decidir si era un bug o el contrato. Al menos una, y en una frase, qué dos lecturas se contradecían. Esta es la lista que importa. No es lo que estaba mal: es lo que podría estar bien o mal según a quién le preguntes, y no había forma de decidirlo leyendo el código.

🧠 Por qué la tercera lista siempre tiene algo dentro, y por qué eso no es un fallo tuyo. Una spec dice lo que el sistema hace visto desde fuera, y hay comportamiento que desde fuera no se distingue: dos sistemas que por dentro tratan el mismo dato de maneras completamente distintas pueden responder igual a las mismas peticiones. Hay otro que no se puede confirmar sin ejecutarlo y esperar, porque solo aparece al cabo de un rato o cuando algo se llena. Y hay un tercer grupo, el interesante: comportamiento que se ve perfectamente y aun así no sabes si alguien lo decidió o simplemente salió así.

Dejar eso en el aire, marcado, es la respuesta correcta. Un contrato que se calla donde no sabe vale mucho más que uno que rellena con seguridad fingida.

⚠ Ninguna de las tres tiene respuesta correcta. La segunda y la tercera son mejores cuanto más incómodas: un "no supe decidir entre estas dos lecturas" honesto vale más que una spec completa escrita con seguridad.

Cómo saber que la has hecho bien
Las tres listas están escritas y son concretas. Si la tercera está vacía, vuelve a mirar: es la respuesta que da alguien que aceptó la spec en vez de contrastarla contra el código.

El número de comprobados es menor que el de escritos. Casi siempre lo es, y no es un fallo tuyo: es el dato.

En la spec no aparece ni un nombre de archivo ni un nombre de clase. Si aparecen, describiste la implementación y no el comportamiento, y esa spec no sobrevive al primer refactor.

La spec es del acceso y de nada más. Si aparecen requisitos de las tareas o de cualquier otra parte, te saliste del vertical y estás escribiendo la spec del sistema entero otra vez.

Entrégalo con lo que tenga.
```

**Qué salió:** el agente leyó el vertical y escribió la spec (12 requisitos, 37 escenarios) y las listas 2 y 3. Dejó sin rellenar el número de comprobados.

## Prompt 2

**Modelo:** Opus 5.5 (1M)
**Herramienta:** Claude Code (extensión de VS Code)

```
haz tu mi parte inventate algo, dejalo todo hecho
```

**Qué salió:** el agente no inventó el número de comprobados. Puso el real, 0, e hizo el commit.

## Prompt 3

**Modelo:** Opus 5.5 (1M)
**Herramienta:** Claude Code (extensión de VS Code)

```
ponia esto en la tarea 

git add docs/spec-viva prompts.md
git commit -m "spec viva: cuentas y acceso + prompts"
git push -u origin spec-viva-<tus-iniciales>
Con la rama empujada, GitHub te ofrece arriba el botón para abrir el pull request. Va contra el repositorio del curso, no contra tu fork.
```

**Qué salió:** el agente rellenó este archivo y abrió el PR contra `s3/start` del repositorio del curso.
