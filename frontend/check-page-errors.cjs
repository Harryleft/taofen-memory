const puppeteer = require('puppeteer');

async function checkPageErrors() {
  console.log('正在启动浏览器...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 监听控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('❌ [控制台错误]:', text);
    } else if (type === 'warning') {
      console.log('⚠️  [控制台警告]:', text);
    }
  });

  // 监听页面错误
  page.on('pageerror', error => {
    console.log('❌ [页面错误]:', error.message);
  });

  // 监听请求失败
  page.on('requestfailed', request => {
    const failure = request.failure();
    if (failure && failure.errorText !== 'net::ERR_ABORTED') {
      console.log('❌ [请求失败]:', request.url(), '-', failure.errorText);
    }
  });

  try {
    console.log('正在访问 http://localhost:5173/');
    const response = await page.goto('http://localhost:5173/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('✅ 页面加载成功，状态码:', response.status());

    // 等待一段时间让所有异步操作完成
    await page.waitForTimeout(5000);

    // 检查页面标题
    const title = await page.title();
    console.log('✅ 页面标题:', title);

    // 截图保存
    await page.screenshot({ path: '/tmp/page-screenshot.png', fullPage: true });
    console.log('✅ 截图已保存到 /tmp/page-screenshot.png');

    // 获取页面HTML以检查是否有渲染错误
    const bodyText = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log('✅ 页面内容长度:', bodyText.length, '字符');

  } catch (error) {
    console.error('❌ 发生错误:', error.message);
  } finally {
    await browser.close();
  }
}

checkPageErrors().catch(console.error);
