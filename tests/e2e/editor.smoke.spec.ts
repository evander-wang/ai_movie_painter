import { expect, test } from '@playwright/test';
import { buildCanvasExportPayload } from '../../src/application/canvas/importExportCanvas';

test.describe('editor smoke', () => {
  let consoleErrors: string[];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await page.goto('/editor');
    await page.evaluate(() => {
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

  test('keeps the attribute popover closed after pressing its close button', async ({ page }) => {
    await page.goto('/editor?node=default-text&zoom=135');

    await expect(page.locator('.node-attribute-popover')).toBeVisible();
    await page.locator('.node-attribute-popover .attribute-head button').click();

    await expect(page).toHaveURL(/\/editor\?zoom=135$/);
    await expect(page.locator('.node-attribute-popover')).toBeHidden();
  });

  test('adds a workflow node from the node menu without crashing', async ({ page }) => {
    await page.goto('/editor');

    await page.getByTitle('添加节点').click();
    await page.getByRole('button', { name: /风格参考/ }).click();

    await expect(page).toHaveURL(/\/editor\?node=styleReference-/);
    await expect(page.locator('.app-shell')).toBeVisible();
    await expect(page.locator('.react-flow__node')).toHaveCount(13);
    await expect(page.locator('.node-attribute-popover')).toContainText('风格参考');
  });

  test('adds a workflow node after selecting an existing node without crashing', async ({ page }) => {
    await page.goto('/editor');

    await page.locator('.react-flow__node[data-id="default-image-4"] .flow-node').click({ force: true });
    await expect(page).toHaveURL(/\/editor\?node=default-image-4$/);

    await page.getByTitle('添加节点').click();
    await page.getByRole('button', { name: /风格参考/ }).click();

    await expect(page).toHaveURL(/\/editor\?node=styleReference-/);
    await expect(page.locator('.editor-error-panel')).toHaveCount(0);
    await expect(page.locator('.react-flow__node')).toHaveCount(13);
    await expect(page.locator('.react-flow__edge')).toHaveCount(16);
    await expect(page.locator('.node-attribute-popover')).toContainText('风格参考');
  });

  test('keeps a draft node selectable from a route URL without a render loop', async ({ page }) => {
    await page.goto('/editor');

    await page.getByTitle('添加节点').click();
    await page.getByRole('button', { name: /风格参考/ }).click();
    const draftNodeId = new URL(page.url()).searchParams.get('node');
    expect(draftNodeId).toContain('styleReference-');

    await page.waitForFunction(
      (nodeId) => window.localStorage.getItem('short-flow.canvasDraft.v1')?.includes(nodeId as string),
      draftNodeId,
    );
    await page.goto(`/editor?node=${draftNodeId}&zoom=139`);

    await expect(page.locator(`.react-flow__node[data-id="${draftNodeId}"]`)).toHaveClass(/selected/);
    await page.locator(`.react-flow__node[data-id="${draftNodeId}"] .flow-node`).evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });

    await expect(page.locator('.editor-error-panel')).toHaveCount(0);
    await expect(page.locator('.node-attribute-popover')).toContainText('风格参考');
  });

  test('restores a saved canvas draft after refresh', async ({ page }) => {
    await page.goto('/editor');

    await page.getByTitle('添加节点').click();
    await page.getByRole('button', { name: /风格参考/ }).click();
    const draftNodeId = new URL(page.url()).searchParams.get('node');
    expect(draftNodeId).toContain('styleReference-');

    await page.waitForFunction(
      (nodeId) => window.localStorage.getItem('short-flow.canvasDraft.v1')?.includes(nodeId as string),
      draftNodeId,
    );
    await page.reload();

    await expect(page.locator(`.react-flow__node[data-id="${draftNodeId}"]`)).toBeVisible();
    await expect(page.locator('.react-flow__node')).toHaveCount(13);
  });

  test('restores the default canvas and clears the saved draft', async ({ page }) => {
    await page.goto('/editor');

    await page.getByTitle('添加节点').click();
    await page.getByRole('button', { name: /风格参考/ }).click();
    await page.waitForFunction(() => Boolean(window.localStorage.getItem('short-flow.canvasDraft.v1')));

    await page.getByTitle('恢复默认画布').click();

    await expect(page.locator('.react-flow__node')).toHaveCount(12);
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('short-flow.canvasDraft.v1'))).toBeNull();
  });

  test('persists an imported canvas json as the active draft', async ({ page }) => {
    const payload = buildCanvasExportPayload({
      appName: 'AI Movie Painter',
      edges: [],
      nodes: [
        {
          id: 'imported-text',
          type: 'mediaNode',
          position: { x: -120, y: 80 },
          data: {
            title: 'Imported Prompt',
            kind: 'text',
            nodeType: 'prompt',
            status: 'ready',
          },
        },
      ],
      updatedAt: '2026-07-09T00:00:00.000Z',
      viewport: { x: 24, y: 48, zoom: 0.75 },
    });

    await page.goto('/editor');
    await page.locator('input[type="file"]').setInputFiles({
      buffer: Buffer.from(JSON.stringify(payload)),
      mimeType: 'application/json',
      name: 'imported-canvas.json',
    });

    await expect(page.locator('.react-flow__node[data-id="imported-text"]')).toBeVisible();
    await page.waitForFunction(() => window.localStorage.getItem('short-flow.canvasDraft.v1')?.includes('imported-text'));
    await page.reload();

    await expect(page.locator('.react-flow__node[data-id="imported-text"]')).toBeVisible();
    await expect(page.locator('.react-flow__node')).toHaveCount(1);
  });
});
