import { expect, test } from '@playwright/test';

test.describe('editor smoke', () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test.afterEach(async () => {
    await test.info().attach('console-errors', {
      body: Buffer.from(consoleErrors.join('\n')),
      contentType: 'text/plain',
    });
    expect(consoleErrors).toEqual([]);
  });

  test('restores selected node, panel, and zoom from a project deep link', async ({ page }) => {
    await page.goto('/projects/demo/canvases/main?node=default-video&panel=selectedExpand&zoom=88');

    await expect(page.locator('.react-flow__node[data-id="default-video"]')).toHaveClass(/selected/);
    await expect(page.locator('.selected-expand-modal')).toBeVisible();
    await expect(page.locator('.selected-expand-modal')).toContainText('节点参数');
    await expect(page.getByText('88%')).toBeVisible();
    await expect(page.locator('.react-flow__node')).toHaveCount(12);
    await expect(page.locator('.pulse-edge')).not.toHaveCount(0);
  });

  test('syncs the URL and opens attributes after clicking an image node', async ({ page }) => {
    await page.goto('/editor');

    await page.locator('.react-flow__node[data-id="default-image-4"] .flow-node').click({ force: true });

    await expect(page).toHaveURL(/\/editor\?node=default-image-4$/);
    await expect(page.locator('.react-flow__node[data-id="default-image-4"]')).toHaveClass(/selected/);
    await expect(page.locator('.node-attribute-popover')).toBeVisible();
    await expect(page.locator('.node-attribute-popover')).toContainText('图片参考 4');
  });
});
