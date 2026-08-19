import { test, expect } from "@playwright/test"

test.describe("Anonymous reporting", () => {
  test("visitor can report a published note without logging in", async ({
    page,
  }) => {
    await page.goto("/notes/some-published-note-slug")

    await page.getByRole("button", { name: "Report this note" }).click()
    await page.getByRole("combobox", { name: /reason/i }).click()
    await page.getByRole("option", { name: "Spam" }).click()
    await page.getByRole("button", { name: "Submit Report" }).click()

    await expect(page.getByText("Report submitted successfully.")).toBeVisible()
  })
})

test.describe("Authenticated reporting", () => {
  test.skip(
    true,
    "requires an authenticated test fixture/session helper — wire up before running"
  )

  test("logged-in user can report a note", async ({ page }) => {
    // await loginAs(page, testUser)
    await page.goto("/notes/some-published-note-slug")
    await page.getByRole("button", { name: "Report this note" }).click()
    await page.getByRole("combobox", { name: /reason/i }).click()
    await page.getByRole("option", { name: "Incorrect information" }).click()
    await page.getByRole("button", { name: "Submit Report" }).click()
    await expect(page.getByText("Report submitted successfully.")).toBeVisible()
  })
})

test.describe("Admin moderation", () => {
  test.skip(
    true,
    "requires an authenticated admin test fixture — wire up before running"
  )

  test("admin can open a report and resolve it", async ({ page }) => {
    // await loginAs(page, testAdmin)
    await page.goto("/admin/reports?status=OPEN")
    await page.getByRole("link", { name: "More" }).first().click()
    await page.getByRole("button", { name: "Resolve Report" }).click()
    await page
      .getByLabel("Resolution note")
      .fill("Verified and removed the note.")
    await page.getByRole("button", { name: "Resolve Report" }).click()
    await expect(page.getByText("Report resolved.")).toBeVisible()
  })

  test("unauthorized user cannot reach /admin/reports", async ({ page }) => {
    // await loginAs(page, testRegularUser)
    const response = await page.goto("/admin/reports")
    expect(response?.status()).toBe(404)
  })
})
