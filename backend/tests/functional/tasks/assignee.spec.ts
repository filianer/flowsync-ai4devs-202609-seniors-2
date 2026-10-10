import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Responsable en la tarea. Cubre los tres scenarios del requisito «Lo que
 * cada tarea muestra de su responsable» de `openspec/specs/tasks/spec.md`.
 *
 * NOTA: el test «el assignee en la lista no expone el email» está en rojo
 * porque `TaskTransformer` delega en `UserTransformer`, que sí incluye el
 * email. `TaskDetailTransformer` usa `TaskAssigneeTransformer` (sin email)
 * y ese camino pasa. El fallo no se corrige aquí: quien verifica no arregla.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function crearTareaConResponsable(
    client: any,
    fullName: string | null,
    email = 'ada@example.com'
  ) {
    await User.create({ fullName, email, password: 'secreto123' })
    const login = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })
    const token = login.body().data.token as string
    await client
      .post('/api/v1/tasks')
      .json({ title: 'Tarea de prueba' })
      .header('Authorization', `Bearer ${token}`)
    return token
  }

  // Scenario: Responsable identificable
  test('el assignee trae nombre e iniciales cuando el responsable tiene nombre', async ({
    client,
    assert,
  }) => {
    const token = await crearTareaConResponsable(client, 'Ada Lovelace')
    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const tarea = response.body().data[0]
    assert.equal(tarea.assignee.fullName, 'Ada Lovelace')
    assert.equal(tarea.assignee.initials, 'AL')
  })

  // Scenario: La tarea no filtra datos de cuenta — lista
  // FALLO ESPERADO: TaskTransformer usa UserTransformer, que incluye email.
  test('el assignee en la lista no expone el email del responsable', async ({
    client,
    assert,
  }) => {
    const token = await crearTareaConResponsable(client, 'Ada Lovelace')
    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const tarea = response.body().data[0]
    assert.notProperty(tarea.assignee, 'email')
  })

  // Scenario: La tarea no filtra datos de cuenta — tarea suelta
  test('el assignee de la tarea suelta no expone el email del responsable', async ({
    client,
    assert,
  }) => {
    const token = await crearTareaConResponsable(client, 'Ada Lovelace')
    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
    const tareaId = lista.body().data[0].id

    const response = await client
      .get(`/api/v1/tasks/${tareaId}`)
      .qs({ today: '2026-10-10' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.notProperty(response.body().data.assignee, 'email')
  })

  // Scenario: Responsable sin nombre
  test('responsable sin nombre llega con fullName nulo e iniciales presentes', async ({
    client,
    assert,
  }) => {
    const token = await crearTareaConResponsable(client, null, 'sin-nombre@example.com')
    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    const tarea = response.body().data[0]
    assert.isNull(tarea.assignee.fullName)
    assert.isString(tarea.assignee.initials)
    assert.isNotEmpty(tarea.assignee.initials)
  })
})
