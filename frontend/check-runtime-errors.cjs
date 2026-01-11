const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  const warnings = [];

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      errors.push(`[控制台错误]: ${text}`);
    } else if (type === 'warning') {
      warnings.push(`[控制台警告]: ${text}`);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    errors.push(`[页面错误]: ${error.message}`);
  });

  try {
    console.log('🔍 正在检查首页 http://localhost:5173/');
    await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // 等待React应用加载
    await page.waitForSelector('#root', { timeout: 5000 });
    await page.waitForTimeout(3000);

    console.log('✅ 页面加载成功');

    // 检查页面标题
    const title = await page.title();
    console.log(`✅ 页面标题: ${title}`);

    // 截图
    await page.screenshot({ path: '/tmp/page-runtime-check.png', fullPage: true });
    console.log('✅ 截图已保存到 /tmp/page-runtime-check.png');

    // 检查各个路由
    const routes = ['/timeline', '/bookstore', '/handwriting', '/newspapers', '/relationships'];
    for (const route of routes) {
      console.log(`\n🔍 检查路由: ${route}`);
      try {
        await page.goto(`http://localhost:5173${route}`, {
          waitUntil: 'networkidle',
          timeout: 15000
        });
        await page.waitForTimeout(2000);
        console.log(`✅ ${route} - 正常`);
      } catch (e) {
        errors.push(`[路由错误] ${route}: ${e.message}`);
        console.log(`❌ ${route} - 错误: ${e.message}`);
      }
    }

  } catch (error) {
    errors.push(`[致命错误]: ${error.message}`);
    console.error('❌ 发生错误:', error.message);
  } finally {
    await browser.close();
  }

  // 输出错误和警告汇总
  console.log('\n' + '='.repeat(60));
  console.log('📊 错误和警告汇总');
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log(`\n❌ 发现 ${errors.length} 个错误:`);
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  } else {
    console.log('\n✅ 未发现错误');
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  发现 ${warnings.length} 个警告:`);
    warnings.forEach((warn, i) => console.log(`  ${i + 1}. ${warn}`));
  } else {
    console.log('\n✅ 未发现警告');
  }

  console.log('\n' + '='.repeat(60));

  if (errors.length === 0) {
    console.log('🎉 项目运行正常，未发现运行时错误！');
  } else {
    console.log(`⚠️  发现 ${errors.length} 个错误需要修复`);
    process.exit(1);
  }
})();
