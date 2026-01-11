#!/usr/bin/env node

/**
 * 前端性能自动化测试脚本
 * 用于测试前端服务器启动和首页加载性能
 */

const { spawn, exec } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class PerformanceTestRunner {
  constructor() {
    this.results = {
      serverStartup: {},
      pageLoad: {},
      images: {},
      rendering: {},
      network: {},
      memory: {},
      custom: {},
      summary: {}
    };
    this.browser = null;
    this.page = null;
    this.serverProcess = null;
    this.testStartTime = performance.now();
  }

  // =============== 服务器启动测试 ===============

  async testServerStartup() {
    console.log('🚀 开始测试服务器启动性能...');
    
    const serverStartTime = performance.now();
    
    return new Promise((resolve, reject) => {
      // 启动开发服务器
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, '..', 'frontend'),
        stdio: 'pipe'
      });

      let output = '';
      let serverReady = false;
      let firstResponseTime = null;

      this.serverProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log('[Server]', data.toString().trim());
        
        // 检测服务器启动完成
        if (output.includes('Local:') && !serverReady) {
          serverReady = true;
          const serverEndTime = performance.now();
          
          // 测试首次响应时间
          this.testFirstResponse().then((responseTime) => {
            this.results.serverStartup = {
              startTime: serverStartTime,
              endTime: serverEndTime,
              duration: serverEndTime - serverStartTime,
              firstResponseTime: responseTime,
              success: true
            };
            
            console.log(`✅ 服务器启动完成，耗时: ${serverEndTime - serverStartTime}ms`);
            console.log(`✅ 首次响应时间: ${responseTime}ms`);
            resolve();
          }).catch(reject);
        }
      });

      this.serverProcess.stderr.on('data', (data) => {
        console.error('[Server Error]', data.toString().trim());
      });

      this.serverProcess.on('error', (error) => {
        console.error('服务器启动失败:', error);
        reject(error);
      });

      // 超时处理
      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('服务器启动超时'));
        }
      }, 30000); // 30秒超时
    });
  }

  async testFirstResponse() {
    return new Promise((resolve, reject) => {
      const startTime = performance.now();
      
      const healthCheck = setInterval(() => {
        fetch('http://localhost:5173')
          .then(response => {
            if (response.ok) {
              clearInterval(healthCheck);
              const endTime = performance.now();
              resolve(endTime - startTime);
            }
          })
          .catch(() => {
            // 继续等待
          });
      }, 100);

      // 10秒超时
      setTimeout(() => {
        clearInterval(healthCheck);
        reject(new Error('首次响应测试超时'));
      }, 10000);
    });
  }

  // =============== 浏览器性能测试 ===============

  async initializeBrowser() {
    console.log('🌐 初始化浏览器...');
    
    this.browser = await puppeteer.launch({
      headless: false, // 设置为true以无头模式运行
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    this.page = await this.browser.newPage();
    
    // 启用性能指标收集
    await this.page.setCacheEnabled(false); // 禁用缓存以测试首次加载
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // 监听控制台消息
    this.page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('[Performance Monitor]') || text.includes('[HeroBackdrop]')) {
        console.log('[Browser]', text);
      }
    });

    // 监听页面错误
    this.page.on('pageerror', (error) => {
      console.error('[Page Error]', error);
    });

    console.log('✅ 浏览器初始化完成');
  }

  async testPageLoadPerformance() {
    console.log('📄 开始测试页面加载性能...');
    
    const pageLoadStartTime = performance.now();
    
    // 监听性能指标
    const metrics = await this.page.metrics();
    const performanceMetrics = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        const data = {
          timing: {},
          resources: [],
          memory: {},
          network: {}
        };

        // 收集导航时间
        if (window.performance && window.performance.timing) {
          data.timing = {
            navigationStart: window.performance.timing.navigationStart,
            redirectStart: window.performance.timing.redirectStart,
            redirectEnd: window.performance.timing.redirectEnd,
            fetchStart: window.performance.timing.fetchStart,
            domainLookupStart: window.performance.timing.domainLookupStart,
            domainLookupEnd: window.performance.timing.domainLookupEnd,
            connectStart: window.performance.timing.connectStart,
            connectEnd: window.performance.timing.connectEnd,
            requestStart: window.performance.timing.requestStart,
            responseStart: window.performance.timing.responseStart,
            responseEnd: window.performance.timing.responseEnd,
            domLoading: window.performance.timing.domLoading,
            domInteractive: window.performance.timing.domInteractive,
            domContentLoadedEventStart: window.performance.timing.domContentLoadedEventStart,
            domContentLoadedEventEnd: window.performance.timing.domContentLoadedEventEnd,
            domComplete: window.performance.timing.domComplete,
            loadEventStart: window.performance.timing.loadEventStart,
            loadEventEnd: window.performance.timing.loadEventEnd
          };
        }

        // 收集资源时间
        if (window.performance && window.performance.getEntriesByType) {
          data.resources = window.performance.getEntriesByType('resource').map(entry => ({
            name: entry.name,
            initiatorType: entry.initiatorType,
            startTime: entry.startTime,
            duration: entry.duration,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize
          }));
        }

        // 收集内存信息
        if (window.performance && window.performance.memory) {
          data.memory = window.performance.memory;
        }

        // 收集网络信息
        if (navigator.connection) {
          data.network = navigator.connection;
        }

        resolve(data);
      });
    });

    const pageLoadEndTime = performance.now();

    this.results.pageLoad = {
      startTime: pageLoadStartTime,
      endTime: pageLoadEndTime,
      duration: pageLoadEndTime - pageLoadStartTime,
      metrics,
      performanceMetrics,
      success: true
    };

    console.log(`✅ 页面加载完成，耗时: ${pageLoadEndTime - pageLoadStartTime}ms`);
  }

  async testImageLoadingPerformance() {
    console.log('🖼️ 开始测试图片加载性能...');
    
    const imageMetrics = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const imagePromises = images.map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve({
              src: img.src,
              loadTime: 0,
              cached: true,
              success: true,
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          } else {
            const startTime = performance.now();
            img.onload = () => {
              const endTime = performance.now();
              resolve({
                src: img.src,
                loadTime: endTime - startTime,
                cached: false,
                success: true,
                width: img.naturalWidth,
                height: img.naturalHeight
              });
            };
            img.onerror = () => {
              resolve({
                src: img.src,
                loadTime: 0,
                cached: false,
                success: false,
                width: 0,
                height: 0
              });
            };
          }
        });
      });
      
      return Promise.all(imagePromises);
    });

    // 分析图片性能数据
    const totalImages = imageMetrics.length;
    const loadedImages = imageMetrics.filter(img => img.success).length;
    const failedImages = totalImages - loadedImages;
    const cachedImages = imageMetrics.filter(img => img.cached).length;
    const averageLoadTime = imageMetrics
      .filter(img => img.success && !img.cached)
      .reduce((sum, img) => sum + img.loadTime, 0) / Math.max(1, loadedImages - cachedImages);

    this.results.images = {
      totalImages,
      loadedImages,
      failedImages,
      cachedImages,
      averageLoadTime,
      imageDetails: imageMetrics,
      success: true
    };

    console.log(`✅ 图片加载测试完成，总计: ${totalImages}, 成功: ${loadedImages}, 失败: ${failedImages}, 缓存: ${cachedImages}`);
    console.log(`✅ 平均加载时间: ${averageLoadTime}ms`);
  }

  async testRenderingPerformance() {
    console.log('🎨 开始测试渲染性能...');
    
    const renderingMetrics = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        // 等待一段时间以确保所有组件都已完成渲染
        setTimeout(() => {
          const heroBackdrop = document.querySelector('[data-testid="hero-backdrop"]');
          const images = document.querySelectorAll('img');
          const columns = document.querySelectorAll('.flex-1.space-y-4');
          
          resolve({
            heroBackdropExists: !!heroBackdrop,
            totalImages: images.length,
            loadedImages: images.filter(img => img.complete).length,
            totalColumns: columns.length,
            renderTime: performance.now() - window.performance.timing.navigationStart,
            domElements: document.querySelectorAll('*').length
          });
        }, 2000);
      });
    });

    this.results.rendering = {
      ...renderingMetrics,
      success: true
    };

    console.log(`✅ 渲染性能测试完成，DOM元素: ${renderingMetrics.domElements}, 图片: ${renderingMetrics.loadedImages}/${renderingMetrics.totalImages}`);
  }

  async testNetworkPerformance() {
    console.log('🌐 开始测试网络性能...');
    
    const networkMetrics = await this.page.evaluate(() => {
      if (!window.performance || !window.performance.getEntriesByType) {
        return {};
      }

      const resources = window.performance.getEntriesByType('resource');
      const totalRequests = resources.length;
      const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
      const averageLoadTime = totalRequests > 0 
        ? resources.reduce((sum, resource) => sum + resource.duration, 0) / totalRequests 
        : 0;
      const cachedRequests = resources.filter(resource => resource.transferSize === 0).length;

      return {
        totalRequests,
        totalSize,
        averageLoadTime,
        cachedRequests,
        resources: resources.map(r => ({
          name: r.name,
          type: r.initiatorType,
          size: r.transferSize,
          duration: r.duration
        }))
      };
    });

    this.results.network = {
      ...networkMetrics,
      success: true
    };

    console.log(`✅ 网络性能测试完成，请求: ${networkMetrics.totalRequests}, 大小: ${networkMetrics.totalSize}bytes, 平均时间: ${networkMetrics.averageLoadTime}ms`);
  }

  async testMemoryUsage() {
    console.log('💾 开始测试内存使用...');
    
    const memoryMetrics = await this.page.evaluate(() => {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        return {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        };
      }
      return null;
    });

    this.results.memory = {
      ...memoryMetrics,
      success: memoryMetrics !== null
    };

    if (memoryMetrics) {
      console.log(`✅ 内存使用测试完成，使用: ${Math.round(memoryMetrics.usedJSHeapSize / 1024 / 1024)}MB, 占比: ${memoryMetrics.usedPercentage.toFixed(2)}%`);
    } else {
      console.log('⚠️ 内存信息不可用');
    }
  }

  // =============== 运行完整测试 ===============

  async runFullTest() {
    try {
      console.log('🔥 开始完整性能测试...');
      
      // 1. 测试服务器启动
      await this.testServerStartup();
      
      // 2. 初始化浏览器
      await this.initializeBrowser();
      
      // 3. 导航到页面
      console.log('📍 导航到首页...');
      const navigationStartTime = performance.now();
      await this.page.goto('http://localhost:5173', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      const navigationEndTime = performance.now();
      
      console.log(`✅ 页面导航完成，耗时: ${navigationEndTime - navigationStartTime}ms`);
      
      // 4. 等待HeroBackdrop组件加载
      console.log('⏳ 等待HeroBackdrop组件加载...');
      await this.page.waitForSelector('[data-testid="hero-backdrop"]', { timeout: 10000 });
      console.log('✅ HeroBackdrop组件加载完成');
      
      // 5. 运行各项性能测试
      await Promise.all([
        this.testPageLoadPerformance(),
        this.testImageLoadingPerformance(),
        this.testRenderingPerformance(),
        this.testNetworkPerformance(),
        this.testMemoryUsage()
      ]);
      
      // 6. 收集自定义性能指标
      await this.collectCustomMetrics();
      
      // 7. 生成汇总报告
      this.generateSummary();
      
      console.log('🎉 性能测试完成！');
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error);
      throw error;
    }
  }

  async collectCustomMetrics() {
    console.log('📊 收集自定义性能指标...');
    
    const customMetrics = await this.page.evaluate(() => {
      // 尝试获取自定义性能数据
      const metrics = {};
      
      // 检查是否有PerformanceMonitor实例
      if (window.PerformanceMonitor) {
        try {
          const performanceData = window.PerformanceMonitor.getMetrics();
          metrics.heroBackdrop = performanceData;
        } catch (e) {
          console.warn('无法获取HeroBackdrop性能数据:', e);
        }
      }
      
      return metrics;
    });

    this.results.custom = customMetrics;
    console.log('✅ 自定义性能指标收集完成');
  }

  generateSummary() {
    const testEndTime = performance.now();
    const totalTestTime = testEndTime - this.testStartTime;
    
    this.results.summary = {
      totalTestTime,
      testStartTime: this.testStartTime,
      testEndTime,
      serverStartupTime: this.results.serverStartup.duration || 0,
      pageLoadTime: this.results.pageLoad.duration || 0,
      totalImages: this.results.images.totalImages || 0,
      loadedImages: this.results.images.loadedImages || 0,
      averageImageLoadTime: this.results.images.averageLoadTime || 0,
      totalNetworkRequests: this.results.network.totalRequests || 0,
      totalNetworkSize: this.results.network.totalSize || 0,
      memoryUsage: this.results.memory.usedJSHeapSize || 0,
      success: true
    };

    console.log('📋 测试汇总:');
    console.log(`   总测试时间: ${totalTestTime}ms`);
    console.log(`   服务器启动: ${this.results.summary.serverStartupTime}ms`);
    console.log(`   页面加载: ${this.results.summary.pageLoadTime}ms`);
    console.log(`   图片加载: ${this.results.summary.loadedImages}/${this.results.summary.totalImages}`);
    console.log(`   平均图片加载时间: ${this.results.summary.averageImageLoadTime}ms`);
    console.log(`   网络请求: ${this.results.summary.totalNetworkRequests}个`);
    console.log(`   内存使用: ${Math.round(this.results.summary.memoryUsage / 1024 / 1024)}MB`);
  }

  // =============== 报告生成 ===============

  async generateReport() {
    console.log('📄 生成性能测试报告...');
    
    const reportPath = path.join(__dirname, '..', 'diss', 'performance-test-report.json');
    const summaryPath = path.join(__dirname, '..', 'diss', 'performance-test-summary.md');
    
    // 确保目录存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // 生成详细JSON报告
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`✅ 详细报告已保存到: ${reportPath}`);
    
    // 生成Markdown汇总报告
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync(summaryPath, markdownReport);
    console.log(`✅ 汇总报告已保存到: ${summaryPath}`);
  }

  generateMarkdownReport() {
    const summary = this.results.summary;
    
    return `# 前端性能测试报告

## 测试概览
- **测试时间**: ${new Date(summary.testStartTime).toLocaleString()}
- **总测试时间**: ${summary.totalTestTime.toFixed(2)}ms
- **测试状态**: ${summary.success ? '✅ 成功' : '❌ 失败'}

## 服务器性能
- **启动时间**: ${summary.serverStartupTime.toFixed(2)}ms
- **首次响应时间**: ${this.results.serverStartup.firstResponseTime?.toFixed(2) || 'N/A'}ms

## 页面加载性能
- **页面加载时间**: ${summary.pageLoadTime.toFixed(2)}ms
- **DOM元素数量**: ${this.results.rendering.domElements || 'N/A'}
- **可交互时间**: ${this.results.pageLoad.performanceMetrics.timing?.domInteractive ? 
  (this.results.pageLoad.performanceMetrics.timing.domInteractive - this.results.pageLoad.performanceMetrics.timing.navigationStart).toFixed(2) + 'ms' : 'N/A'}

## 图片加载性能
- **总图片数量**: ${summary.totalImages}
- **成功加载**: ${summary.loadedImages}
- **加载失败**: ${summary.totalImages - summary.loadedImages}
- **缓存命中**: ${this.results.images.cachedImages || 0}
- **平均加载时间**: ${summary.averageImageLoadTime.toFixed(2)}ms

## 网络性能
- **总请求数**: ${summary.totalNetworkRequests}
- **总传输大小**: ${(summary.totalNetworkSize / 1024).toFixed(2)}KB
- **平均请求时间**: ${this.results.network.averageLoadTime?.toFixed(2) || 'N/A'}ms
- **缓存请求数**: ${this.results.network.cachedRequests || 0}

## 内存使用
- **JS堆内存使用**: ${Math.round(summary.memoryUsage / 1024 / 1024)}MB
- **内存使用率**: ${this.results.memory.usedPercentage?.toFixed(2) || 'N/A'}%

## 详细数据
详细的性能数据已保存到 \`performance-test-report.json\` 文件中。

## 建议和优化点
${this.generateOptimizationSuggestions()}
`;
  }

  generateOptimizationSuggestions() {
    const suggestions = [];
    
    if (this.results.summary.serverStartupTime > 5000) {
      suggestions.push('- 服务器启动时间较长，建议检查依赖包大小和启动流程');
    }
    
    if (this.results.summary.pageLoadTime > 3000) {
      suggestions.push('- 页面加载时间较长，建议优化代码分割和资源加载');
    }
    
    if (this.results.summary.averageImageLoadTime > 1000) {
      suggestions.push('- 图片加载时间较长，建议优化图片格式和尺寸');
    }
    
    if (this.results.network.totalNetworkRequests > 50) {
      suggestions.push('- 网络请求数量较多，建议合并请求和启用缓存');
    }
    
    if (this.results.memory.usedPercentage > 80) {
      suggestions.push('- 内存使用率较高，建议检查内存泄漏和优化数据结构');
    }
    
    return suggestions.length > 0 ? suggestions.join('\n') : '- 当前性能表现良好，暂无特别优化建议';
  }

  // =============== 清理资源 ===============

  async cleanup() {
    console.log('🧹 清理测试资源...');
    
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    
    console.log('✅ 资源清理完成');
  }
}

// =============== 主函数 ===============

async function main() {
  const testRunner = new PerformanceTestRunner();
  
  try {
    await testRunner.runFullTest();
    await testRunner.generateReport();
    console.log('🎉 性能测试全部完成！');
  } catch (error) {
    console.error('❌ 性能测试失败:', error);
    process.exit(1);
  } finally {
    await testRunner.cleanup();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = PerformanceTestRunner;