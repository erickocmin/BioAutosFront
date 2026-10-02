import { expect, test } from '@playwright/test'

test('muestra el formulario de registro de empleado', async ({ page }) => {
  test.skip(!process.env.E2E_USER || !process.env.E2E_PASSWORD, 'Requiere credenciales ficticias E2E')
  await page.goto('/login')
  await page.getByLabel('Usuario').fill(process.env.E2E_USER!)
  await page.getByLabel('Contraseña').fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL('/')
  await page.goto('/attendance/registro')

  await expect(page.getByRole('heading', { name: 'Registrar empleado', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Datos del empleado' })).toBeVisible()
  await expect(page.locator('.state-card--error')).toHaveCount(0)
  await page.screenshot({ path: 'test-results/visual-registrar-empleado.png', fullPage: true })
})

test('muestra la configuración local y el monitor de reconocimiento', async ({ page }) => {
  test.skip(!process.env.E2E_USER || !process.env.E2E_PASSWORD, 'Requiere credenciales ficticias E2E')
  await page.goto('/login')
  await page.getByLabel('Usuario').fill(process.env.E2E_USER!)
  await page.getByLabel('Contraseña').fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL('/')
  await page.goto('/attendance/biometric')

  await expect(page.getByRole('heading', { name: 'Reconocimiento biométrico', level: 1 })).toBeVisible()
  await expect(page.getByLabel('Número de serie')).toHaveValue('CMYD231760447')
  await expect(page.getByRole('heading', { name: 'Entradas y salidas recientes' })).toBeVisible()
  await expect(page.locator('.state-card--error')).toHaveCount(0)
  await page.screenshot({ path: 'test-results/visual-reconocimiento.png', fullPage: true })
})
