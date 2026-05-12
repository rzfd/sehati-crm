import { test, expect } from "@playwright/test"

test.describe("Smoke — public routes", () => {
  test("root redirects to /login", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/login(\?|$)/)
    await expect(page.getByRole("heading", { name: "Sehati CRM" })).toBeVisible()
  })

  test("login page renders form fields", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
    await expect(page.getByRole("button", { name: /masuk/i })).toBeVisible()
  })

  test("login shows error on wrong credentials", async ({ page }) => {
    await page.goto("/login")
    await page.getByLabel("Email").fill("notarealuser@example.com")
    await page.getByLabel("Password").fill("wrongpassword123")
    await page.getByRole("button", { name: /masuk/i }).click()
    await expect(page.getByText(/email atau password salah/i)).toBeVisible({ timeout: 10_000 })
  })

  test("register page renders all fields", async ({ page }) => {
    await page.goto("/register")
    await expect(page.getByLabel(/nama/i)).toBeVisible()
    await expect(page.getByLabel(/no.*telepon|nomor.*hp|telepon/i)).toBeVisible()
    await expect(page.getByLabel("Email")).toBeVisible()
    await expect(page.getByLabel("Password")).toBeVisible()
  })

  test("login → register link works", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("link", { name: /daftar/i }).click()
    await expect(page).toHaveURL(/\/register$/)
  })

  test("protected /inbox redirects unauth users to login", async ({ page }) => {
    await page.goto("/inbox")
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  })
})

test.describe("Smoke — public API", () => {
  test("GET /api/whoami returns 200 or 401", async ({ request }) => {
    const res = await request.get("/api/whoami")
    expect([200, 401]).toContain(res.status())
  })
})

test.describe("Smoke — PWA manifest", () => {
  test("manifest.json is served", async ({ request }) => {
    const res = await request.get("/manifest.json")
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.name || json.short_name).toBeTruthy()
  })

  test("icons are served", async ({ request }) => {
    const res = await request.get("/icons/icon-192.svg")
    expect(res.status()).toBe(200)
  })
})
