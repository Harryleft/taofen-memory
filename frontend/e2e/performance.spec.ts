import { test, expect } from '@playwright/test';
import { performance } from 'perf_hooks';

test.describe('数字报刊性能测试', () => {
  test('页面加载性能测试', async ({ page }) => {
    const startTime = performance.now();
    
    await page.goto('/newspapers');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.newspapers-integrated-container');
    
    const loadTime = performance.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms`);
    
    // 验证加载时间要求
    expect(loadTime).toBeLessThan(5000); // 5秒内完成加载
    
    // 获取Web Vitals指标
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {
          FCP: 0,
          LCP: 0,
          FID: 0,
          CLS: 0,
          TTI: 0
        };

        // 模拟First Contentful Paint
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              metrics.FCP = entry.startTime;
            }
          });
        });

        observer.observe({ entryTypes: ['paint'] });

        // 获取其他指标
        setTimeout(() => {
          resolve(metrics);
        }, 3000);
      });
    });

    console.log('Web Vitals:', vitals);
    expect(vitals.FCP).toBeLessThan(2000); // FCP < 2秒
  });

  test('内存使用测试', async ({ page }) => {
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');

    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // 执行一系列操作
    for (let i = 0; i < 10; i++) {
      await page.click('.newspapers-publication-item');
      await page.waitForTimeout(1000);
    }

    // 获取最终内存使用
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    const memoryIncrease = finalMemory - initialMemory;
    console.log(`内存增加: ${memoryIncrease} bytes`);

    // 验证内存增长在合理范围内
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });

  test('并发用户测试', async ({ page }) => {
    const concurrentUsers = 5;
    const loadTimeResults: number[] = [];

    // 模拟多个并发用户
    for (let i = 0; i < concurrentUsers; i++) {
      const startTime = performance.now();
      
      await page.goto('/newspapers');
      await page.waitForSelector('.newspapers-integrated-container');
      
      const loadTime = performance.now() - startTime;
      loadTimeResults.push(loadTime);
      
      // 清理并准备下一个用户
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }

    const averageLoadTime = loadTimeResults.reduce((a, b) => a + b, 0) / loadTimeResults.length;
    console.log(`平均加载时间: ${averageLoadTime}ms`);

    // 验证并发性能
    expect(averageLoadTime).toBeLessThan(8000); // 8秒内完成
  });

  test('大数据量处理测试', async ({ page }) => {
    // 模拟大量数据
    await page.route('**/iiif/**', async route => {
      if (route.request().url().includes('collection.json')) {
        const mockData = {
          items: Array.from({ length: 100 }, (_, i) => ({
            id: `https://example.com/publication${i}/collection.json`,
            label: { zh: [`测试刊物${i}`] }
          }))
        };
        await route.fulfill({ json: mockData });
      } else {
        await route.continue();
      }
    });

    const startTime = performance.now();
    
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');
    
    const loadTime = performance.now() - startTime;
    console.log(`大数据量加载时间: ${loadTime}ms`);

    // 验证大数据量处理能力
    expect(loadTime).toBeLessThan(10000); // 10秒内完成

    // 验证列表渲染性能
    const publications = await page.locator('.newspapers-publication-item').count();
    expect(publications).toBe(100);
  });

  test('滚动性能测试', async ({ page }) => {
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');

    // 等待数据加载
    await page.waitForSelector('.newspapers-publication-item');

    // 测试滚动性能
    const scrollMetrics = await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let lastTime = performance.now();
        let droppedFrames = 0;

        function countFrames() {
          frameCount++;
          const currentTime = performance.now();
          const deltaTime = currentTime - lastTime;

          if (deltaTime > 16.67) { // 60fps = 16.67ms per frame
            droppedFrames++;
          }

          lastTime = currentTime;
          requestAnimationFrame(countFrames);
        }

        countFrames();

        // 模拟滚动
        const container = document.querySelector('.newspapers-sidebar__content');
        if (container) {
          let scrollTop = 0;
          const scrollInterval = setInterval(() => {
            scrollTop += 100;
            container.scrollTop = scrollTop;
            
            if (scrollTop >= container.scrollHeight - container.clientHeight) {
              clearInterval(scrollInterval);
              setTimeout(() => {
                clearInterval(scrollInterval);
                resolve({
                  frameCount,
                  droppedFrames,
                  fps: frameCount / (performance.now() - lastTime) * 1000
                });
              }, 1000);
            }
          }, 50);
        }
      });
    });

    console.log('滚动性能:', scrollMetrics);
    expect(scrollMetrics.fps).toBeGreaterThan(30); // FPS > 30
    expect(scrollMetrics.droppedFrames / scrollMetrics.frameCount).toBeLessThan(0.1); // 丢帧率 < 10%
  });

  test('网络性能测试', async ({ page }) => {
    // 模拟慢速网络
    await page.context().setOffline(false);
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms延迟
      await route.continue();
    });

    const startTime = performance.now();
    
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');
    
    const loadTime = performance.now() - startTime;
    console.log(`慢速网络加载时间: ${loadTime}ms`);

    // 验证网络性能
    expect(loadTime).toBeLessThan(15000); // 15秒内完成

    // 恢复正常网络
    await page.unroute('**/*');
  });

  test('CPU使用率测试', async ({ page }) => {
    await page.goto('/newspapers');
    await page.waitForSelector('.newspapers-integrated-container');

    // 执行CPU密集型操作
    const cpuMetrics = await page.evaluate(async () => {
      return new Promise((resolve) => {
        const start = performance.now();
        let operations = 0;

        function heavyOperation() {
          // 模拟CPU密集型操作
          for (let i = 0; i < 1000000; i++) {
            Math.sqrt(i);
          }
          operations++;
        }

        const interval = setInterval(() => {
          heavyOperation();
          
          if (performance.now() - start > 5000) { // 5秒
            clearInterval(interval);
            resolve({
              operations,
              opsPerSecond: operations / 5
            });
          }
        }, 10);
      });
    });

    console.log('CPU性能:', cpuMetrics);
    expect(cpuMetrics.opsPerSecond).toBeGreaterThan(100); // 每秒操作数
  });
});