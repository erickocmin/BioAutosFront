import { expect, test } from '@playwright/test'

test('recorre los módulos verdes y abre formularios principales', async ({ page }) => {
  test.setTimeout(60_000)
  test.skip(!process.env.E2E_USER || !process.env.E2E_PASSWORD, 'Requiere credenciales ficticias E2E')
  await page.goto('/login')
  await page.getByLabel('Usuario').fill(process.env.E2E_USER!)
  await page.getByLabel('Contraseña').fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL('/')

  const pages = [
    ['/core/empresas', 'Empresas'], ['/core/sucursales', 'Sucursales'], ['/accounts/usuarios', 'Usuarios'],
    ['/accounts/empleados', 'Empleados'], ['/accounts/permisos', 'Matriz de permisos'],
    ['/inventory/productos', 'Productos y stock'], ['/inventory/movimientos', 'Movimientos'], ['/inventory/kardex', 'Kardex'],
    ['/treasury/cajas', 'Cajas'], ['/treasury/arqueos', 'Arqueos'],
    ['/attendance/events', 'Marcaciones'], ['/attendance/daily', 'Asistencia diaria'], ['/attendance/devices', 'Dispositivos de asistencia'],
  ] as const
  for (const [url, heading] of pages) {
    await page.goto(url)
    await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible()
    await expect(page.locator('.state-card--error')).toHaveCount(0)
  }

  await page.goto('/inventory/movimientos')
  await page.getByRole('button', { name: 'Registrar movimiento' }).click()
  let dialog = page.getByRole('dialog', { name: 'Registrar movimiento' })
  await expect(dialog).toBeVisible()
  await page.screenshot({ path: 'test-results/visual-movimiento.png', fullPage: true })
  await dialog.getByLabel('Sucursal').selectOption({ label: 'Sucursal Demo' })
  await dialog.getByRole('combobox', { name: 'Almacén', exact: true }).selectOption({ label: 'Almacén Demo' })
  await dialog.getByLabel('Proveedor').selectOption({ label: 'Proveedor Demo SAC' })
  await dialog.getByLabel('Referencia').fill(`E2E-COMPRA-${Date.now()}`)
  await dialog.getByLabel('Producto').selectOption({ label: 'Producto demostrativo' })
  await dialog.getByLabel('Unidad').selectOption({ label: 'Unidad' })
  await dialog.getByLabel('Cantidad').fill('3')
  await dialog.getByLabel('Costo').fill('5.50')
  await dialog.getByRole('button', { name: 'Registrar', exact: true }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: 'Registrar movimiento' }).click()
  dialog = page.getByRole('dialog', { name: 'Registrar movimiento' })
  await dialog.getByLabel('Tipo').selectOption('output')
  await dialog.getByLabel('Sucursal').selectOption({ label: 'Sucursal Demo' })
  await dialog.getByRole('combobox', { name: 'Almacén', exact: true }).selectOption({ label: 'Almacén Demo' })
  await dialog.getByLabel('Motivo').fill('Salida E2E')
  await dialog.getByLabel('Producto').selectOption({ label: 'Producto demostrativo' })
  await dialog.getByLabel('Unidad').selectOption({ label: 'Unidad' })
  await dialog.getByLabel('Cantidad').fill('1')
  await dialog.getByRole('button', { name: 'Registrar', exact: true }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole('button', { name: 'Registrar movimiento' }).click()
  dialog = page.getByRole('dialog', { name: 'Registrar movimiento' })
  await dialog.getByLabel('Tipo').selectOption('transfer')
  await dialog.getByLabel('Sucursal').selectOption({ label: 'Sucursal Demo' })
  await dialog.getByLabel('Almacén origen').selectOption({ label: 'Almacén Demo' })
  await dialog.getByLabel('Almacén destino').selectOption({ label: 'Almacén Secundario Demo' })
  await dialog.getByLabel('Producto').selectOption({ label: 'Producto demostrativo' })
  await dialog.getByLabel('Unidad').selectOption({ label: 'Unidad' })
  await dialog.getByLabel('Cantidad').fill('1')
  await dialog.getByRole('button', { name: 'Registrar', exact: true }).click()
  await expect(dialog).toBeHidden()
  await page.goto('/treasury/arqueos')
  await page.getByRole('button', { name: 'Abrir arqueo' }).click()
  let cashDialog = page.getByRole('dialog', { name: 'Abrir arqueo' })
  await expect(cashDialog).toBeVisible()
  await page.screenshot({ path: 'test-results/visual-arqueo.png', fullPage: true })
  const seed = Math.floor(Date.now() / 1000)
  const uniqueDate = `${2030 + (seed % 20)}-${String(1 + (seed % 12)).padStart(2, '0')}-${String(1 + (seed % 27)).padStart(2, '0')}`
  await cashDialog.getByLabel('Caja').selectOption({ label: 'Caja Demo' })
  await cashDialog.getByLabel('Fecha').fill(uniqueDate)
  await cashDialog.getByRole('button', { name: 'Abrir', exact: true }).click()
  await expect(cashDialog).toBeHidden()
  await page.getByRole('button', { name: 'Abierto' }).first().click()
  cashDialog = page.getByRole('dialog', { name: /Arqueo #/ })
  await cashDialog.getByLabel('Forma de pago').selectOption({ label: 'Efectivo' })
  await cashDialog.getByLabel('Descripción').fill('Fondo E2E')
  await cashDialog.getByLabel('Importe').fill('100')
  await cashDialog.getByRole('button', { name: 'Agregar', exact: true }).click()
  await expect(cashDialog.getByText('S/ 100.00').first()).toBeVisible()
  await cashDialog.getByLabel('S/ 20.00').fill('5')
  await cashDialog.getByRole('button', { name: 'Guardar conteo' }).click()
  page.once('dialog', (confirmation) => confirmation.accept())
  await cashDialog.getByRole('button', { name: 'Cerrar arqueo' }).click()
  await expect(cashDialog.getByText('Cerrado')).toBeVisible()
})
