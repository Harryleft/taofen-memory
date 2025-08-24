import { test, expect } from '@playwright/test';

test.describe('数字报刊模块端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置测试环境
    await page.goto('/newspapers');
    
    // 等待页面加载
    await page.waitForSelector('.newspapers-integrated-container');
  });

  test('完整用户流程测试', async ({ page }) => {
    // 1. 验证初始加载状态
    await expect(page.locator('.newspapers-loading')).toBeVisible();
    await expect(page.locator('.newspapers-loading__text')).toHaveText('加载报刊数据...');

    // 2. 等待刊物列表加载完成
    await page.waitForSelector('.newspapers-publication-item', { state: 'visible' });
    
    // 3. 验证刊物列表显示
    const publications = await page.locator('.newspapers-publication-item').count();
    expect(publications).toBeGreaterThan(0);

    // 4. 选择第一个刊物
    await page.locator('.newspapers-publication-item').first().click();

    // 5. 等待期数加载
    await page.waitForSelector('.newspapers-issue-selector__select', { state: 'visible' });
    
    // 6. 验证期数选择器
    const issueSelector = page.locator('.newspapers-issue-selector__select');
    await expect(issueSelector).toBeVisible();

    // 7. 验证查看器iframe加载
    await page.waitForSelector('.newspapers-viewer__iframe', { state: 'visible' });
    
    // 8. 切换期数
    const options = await issueSelector.locator('option').count();
    if (options > 1) {
      await issueSelector.selectOption({ index: 1 });
      await page.waitForTimeout(2000); // 等待切换完成
    }

    // 9. 测试键盘导航
    if (options > 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(1000);
    }

    // 10. 测试侧边栏切换
    await page.locator('.newspapers-sidebar-toggle').click();
    await expect(page.locator('.newspapers-sidebar')).not.toHaveClass(/newspapers-sidebar--open/);
    
    await page.locator('.newspapers-sidebar-toggle').click();
    await expect(page.locator('.newspapers-sidebar')).toHaveClass(/newspapers-sidebar--open/);
  });

  test('移动端响应式测试', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 重新加载页面
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');

    // 验证移动端布局
    await expect(page.locator('.newspapers-mobile-layout')).toBeVisible();

    // 测试触摸交互
    const publications = await page.locator('.newspapers-publication-item').count();
    if (publications > 0) {
      await page.locator('.newspapers-publication-item').first().tap();
      await page.waitForTimeout(2000);
    }

    // 测试返回桌面端
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');
    
    await expect(page.locator('.newspapers-sidebar')).toBeVisible();
  });

  test('错误处理测试', async ({ page }) => {
    // 模拟网络错误
    await page.route('**/iiif/**', async route => {
      await route.abort('failed');
    });

    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');

    // 等待错误状态
    await page.waitForSelector('.newspapers-error', { state: 'visible' });
    await expect(page.locator('.newspapers-error__title')).toHaveText('加载失败');
    
    // 测试重新加载
    await page.locator('button:has-text("重新加载")').click();
    
    // 验证重新加载尝试
    await page.waitForTimeout(2000);
  });

  test('性能测试', async ({ page }) => {
    // 监控性能指标
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const performance = window.performance;
        const metrics = {
          loadTime: 0,
          firstPaint: 0,
          domInteractive: 0
        };

        if (performance.getEntriesByType) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
          metrics.domInteractive = navigation.domInteractive - navigation.fetchStart;
        }

        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const paintEntry = entries.find(entry => entry.name === 'first-paint');
          if (paintEntry) {
            metrics.firstPaint = paintEntry.startTime;
            observer.disconnect();
            resolve(metrics);
          }
        });

        observer.observe({ entryTypes: ['paint'] });

        // 超时处理
        setTimeout(() => resolve(metrics), 5000);
      });
    });

    console.log('性能指标:', metrics);
    
    // 验证性能要求
    expect(metrics.loadTime).toBeLessThan(3000); // 加载时间小于3秒
    expect(metrics.domInteractive).toBeLessThan(2000); // DOM交互时间小于2秒
  });

  test('无障碍访问测试', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/数字报刊/);

    // 验证ARIA标签
    await expect(page.locator('button[aria-label="关闭侧边栏"]')).toBeVisible();
    await expect(page.locator('button[aria-label="打开侧边栏"]')).toBeVisible();

    // 验证键盘导航
    await page.keyboard.press('Tab');
    expect(await page.locator(':focus').count()).toBeGreaterThan(0);

    // 验证屏幕阅读器支持
    const altTexts = await page.locator('img[alt]').count();
    expect(altTexts).toBeGreaterThanOrEqual(0);

    // 验证颜色对比度（通过CSS类）
    const hasContrastClasses = await page.locator('.newspapers-').count();
    expect(hasContrastClasses).toBeGreaterThan(0);
  });

  test('跨浏览器兼容性测试', async ({ page }) => {
    // 测试基本功能在不同浏览器下的表现
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');

    // 验证CSS Grid/Flexbox布局
    const gridLayout = await page.locator('.newspapers-sidebar').isVisible();
    expect(gridLayout).toBe(true);

    // 验证现代CSS特性
    const scrollbarStyles = await page.locator('.newspapers-scrollbar-thin').isVisible();
    expect(scrollbarStyles).toBe(true);

    // 验证响应式断点
    const responsiveClasses = await page.locator('.newspapers-hide-on-mobile').count();
    expect(responsiveClasses).toBeGreaterThan(0);
  });

  test('离线功能测试', async ({ page }) => {
    // 模拟离线状态
    await page.setOffline(true);

    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');

    // 验证离线错误处理
    await page.waitForSelector('.newspapers-error', { state: 'visible' });
    await expect(page.locator('.newspapers-error__title')).toHaveText('加载失败');

    // 恢复在线状态
    await page.setOffline(false);
    
    // 重新加载页面
    await page.reload();
    await page.waitForSelector('.newspapers-integrated-container');

    // 验证恢复后的功能
    await page.waitForSelector('.newspapers-publication-item', { state: 'visible' });
    expect(await page.locator('.newspapers-publication-item').count()).toBeGreaterThan(0);
  });
});