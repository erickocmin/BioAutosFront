import { expect, test } from '@playwright/test'

test('muestra el acceso y valida campos obligatorios', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Bienvenido a SISGETRAN' })).toBeVisible()
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByText('Ingresa tu usuario')).toBeVisible()
  await expect(page.getByText('Ingresa tu contraseña')).toBeVisible()
})

test('login integrado cuando existen credenciales E2E', async ({ page }) => {
  test.skip(!process.env.E2E_USER || !process.env.E2E_PASSWORD, 'Requiere credenciales ficticias E2E')
  await page.goto('/login')
  await page.getByLabel('Usuario').fill(process.env.E2E_USER!)
  await page.getByLabel('Contraseña').fill(process.env.E2E_PASSWORD!)
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Sistema operativo')).toBeVisible()
})
