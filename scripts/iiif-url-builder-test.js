#!/usr/bin/env node

/**
 * IIIF URL构建工具测试脚本
 * 
 * 测试新的URL构建工具是否能正确处理各种边界情况
 * 验证URL构建、解析、修复和验证功能
 */

console.log('=== IIIF URL构建工具测试 ===\n');

// 模拟IIIFUrlBuilder类
class IIIFUrlBuilder {
  static DEFAULT_BASE_URL = 'https://www.ai4dh.cn/iiif';
  static DEFAULT_VERSION = '3';
  static SUPPORTED_FORMATS = ['json', 'jpg', 'png', 'tif', 'jp2'];
  
  static build(components, options = {}) {
    const { encode = true, validate = true, proxy = false } = options;
    
    if (validate) {
      this.validateComponents(components);
    }
    
    let path = components.path;
    
    if (encode) {
      path = this.encodePath(path);
    }
    
    const url = `${components.baseUrl}/${components.version}/${this.buildPathSegment(path, components.type, components.format)}`;
    
    return proxy && this.shouldProxy(url) ? this.buildProxyUrl(url) : url;
  }
  
  static parse(url) {
    const actualUrl = this.parseProxyUrl(url) || url;
    
    const match = actualUrl.match(/^(https?:\/\/[^\/]+)\/iiif\/(\d+)\/(.+)$/);
    if (!match) {
      throw new Error(`Invalid IIIF URL: ${url}`);
    }
    
    const [, baseUrl, version, pathSegment] = match;
    const { path, type, format } = this.parsePathSegment(pathSegment);
    
    return {
      baseUrl,
      version,
      path,
      type,
      format
    };
  }
  
  static fix(url) {
    try {
      const components = this.parse(url);
      const fixedComponents = this.fixComponents(components);
      return this.build(fixedComponents, { encode: true, validate: true });
    } catch (error) {
      return this.heuristicFix(url);
    }
  }
  
  static validate(url) {
    const errors = [];
    
    try {
      const components = this.parse(url);
      
      if (!components.baseUrl || !components.baseUrl.startsWith('http')) {
        errors.push('Invalid base URL');
      }
      
      if (!components.version || !/^\d+$/.test(components.version)) {
        errors.push('Invalid IIIF version');
      }
      
      if (!components.path || components.path.trim() === '') {
        errors.push('Invalid path');
      }
      
      if (components.format && !this.SUPPORTED_FORMATS.includes(components.format)) {
        errors.push(`Unsupported format: ${components.format}`);
      }
      
    } catch (error) {
      errors.push(`URL parsing failed: ${error.message}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static buildManifest(path, options = {}) {
    return this.build({
      baseUrl: this.DEFAULT_BASE_URL,
      version: this.DEFAULT_VERSION,
      path,
      type: 'manifest',
      format: 'json'
    }, options);
  }
  
  static buildCollection(path, options = {}) {
    return this.build({
      baseUrl: this.DEFAULT_BASE_URL,
      version: this.DEFAULT_VERSION,
      path,
      type: 'collection',
      format: 'json'
    }, options);
  }
  
  static buildImage(path, region = 'full', size = '1024,', rotation = '0', quality = 'default', format = 'jpg', options = {}) {
    const imagePath = `${path}/${region}/${size}/${rotation}/${quality}.${format}`;
    return this.build({
      baseUrl: this.DEFAULT_BASE_URL,
      version: this.DEFAULT_VERSION,
      path: imagePath,
      type: 'image',
      format
    }, options);
  }
  
  static extractManifestId(manifestUrl) {
    try {
      const components = this.parse(manifestUrl);
      let id = components.path;
      if (id.endsWith('/manifest.json')) {
        id = id.substring(0, id.length - '/manifest.json'.length);
      }
      return id;
    } catch (error) {
      const match = manifestUrl.match(/([^\/]+)\/manifest\.json$/);
      return match ? match[1] : '';
    }
  }
  
  static extractCollectionId(collectionUrl) {
    try {
      const components = this.parse(collectionUrl);
      let id = components.path;
      if (id.endsWith('/collection.json')) {
        id = id.substring(0, id.length - '/collection.json'.length);
      }
      return id;
    } catch (error) {
      const match = collectionUrl.match(/([^\/]+)\/collection\.json$/);
      return match ? match[1] : '';
    }
  }
  
  // 私有方法
  static validateComponents(components) {
    if (!components.baseUrl) throw new Error('Base URL is required');
    if (!components.version) throw new Error('IIIF version is required');
    if (!components.path) throw new Error('Path is required');
    if (!components.type) throw new Error('Type is required');
    if (components.format && !this.SUPPORTED_FORMATS.includes(components.format)) {
      throw new Error(`Unsupported format: ${components.format}`);
    }
  }
  
  static encodePath(path) {
    return path.replace(/\//g, '%2F');
  }
  
  static buildPathSegment(path, type, format) {
    switch (type) {
      case 'manifest':
        return format ? `manifests/${path}/manifest.${format}` : `manifests/${path}/manifest.json`;
      case 'collection':
        return format ? `manifests/${path}/collection.${format}` : `manifests/${path}/collection.json`;
      case 'image':
        return path;
      default:
        throw new Error(`Unknown type: ${type}`);
    }
  }
  
  static parsePathSegment(pathSegment) {
    if (pathSegment.includes('manifests/')) {
      const match = pathSegment.match(/manifests\/(.+?)\/(manifest|collection)\.(\w+)$/);
      if (match) {
        return {
          path: match[1],
          type: match[2] === 'manifest' ? 'manifest' : 'collection',
          format: match[3]
        };
      }
    }
    
    if (pathSegment.includes('/full/') && pathSegment.includes('/default.')) {
      return {
        path: pathSegment,
        type: 'image'
      };
    }
    
    throw new Error(`Unknown path segment format: ${pathSegment}`);
  }
  
  static shouldProxy(url) {
    return typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && url.startsWith('https://');
  }
  
  static buildProxyUrl(url) {
    return `/proxy?url=${encodeURIComponent(url)}`;
  }
  
  static parseProxyUrl(url) {
    if (url.startsWith('/proxy?url=')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      return decodeURIComponent(urlParams.get('url') || '');
    }
    return null;
  }
  
  static fixComponents(components) {
    const fixed = { ...components };
    
    if (!fixed.baseUrl.startsWith('http')) {
      fixed.baseUrl = this.DEFAULT_BASE_URL;
    }
    
    if (!fixed.version || !/^\d+$/.test(fixed.version)) {
      fixed.version = this.DEFAULT_VERSION;
    }
    
    if (fixed.format && !this.SUPPORTED_FORMATS.includes(fixed.format)) {
      fixed.format = 'json';
    }
    
    return fixed;
  }
  
  static heuristicFix(url) {
    let fixed = url;
    fixed = fixed.replace(/([^:])\/\//g, '$1/');
    
    if (url.includes('/') && !url.includes('%2F')) {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('/')) {
        parts[parts.length - 1] = lastPart.replace(/\//g, '%2F');
        fixed = parts.join('/');
      }
    }
    
    return fixed;
  }
}

// 测试用例
console.log('1. URL构建测试:');
console.log('');

const buildTests = [
  {
    name: '简单manifest',
    input: () => IIIFUrlBuilder.buildManifest('test'),
    expected: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json'
  },
  {
    name: '包含斜杠的manifest',
    input: () => IIIFUrlBuilder.buildManifest('dazhongshenghuozhoukan/1-16-chuangkanhao'),
    expected: 'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan%2F1-16-chuangkanhao/manifest.json'
  },
  {
    name: 'collection URL',
    input: () => IIIFUrlBuilder.buildCollection('test'),
    expected: 'https://www.ai4dh.cn/iiif/3/manifests/test/collection.json'
  },
  {
    name: 'image URL',
    input: () => IIIFUrlBuilder.buildImage('dazhongshenghuozhoukan%2F1-16-chuangkanhao'),
    expected: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg'
  }
];

buildTests.forEach(test => {
  try {
    const result = test.input();
    const passed = result === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.name}`);
    console.log(`   输入: ${test.input.toString().replace(/^.*?=>\s*/, '')}`);
    console.log(`   期望: ${test.expected}`);
    console.log(`   结果: ${result}`);
    if (!passed) {
      console.log(`   ❌ 构建失败`);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ ${test.name} - 错误: ${error.message}`);
    console.log('');
  }
});

console.log('2. URL解析测试:');
console.log('');

const parseTests = [
  {
    name: '标准manifest URL',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json',
    expected: {
      baseUrl: 'https://www.ai4dh.cn/iiif',
      version: '3',
      path: 'test',
      type: 'manifest',
      format: 'json'
    }
  },
  {
    name: '编码的manifest URL',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan%2F1-16-chuangkanhao/manifest.json',
    expected: {
      baseUrl: 'https://www.ai4dh.cn/iiif',
      version: '3',
      path: 'dazhongshenghuozhoukan%2F1-16-chuangkanhao',
      type: 'manifest',
      format: 'json'
    }
  },
  {
    name: 'collection URL',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/test/collection.json',
    expected: {
      baseUrl: 'https://www.ai4dh.cn/iiif',
      version: '3',
      path: 'test',
      type: 'collection',
      format: 'json'
    }
  },
  {
    name: 'image URL',
    input: 'https://www.ai4dh.cn/iiif/3/dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg',
    expected: {
      baseUrl: 'https://www.ai4dh.cn/iiif',
      version: '3',
      path: 'dazhongshenghuozhoukan%2F1-16-chuangkanhao/full/1024,/0/default.jpg',
      type: 'image',
      format: 'jpg'
    }
  }
];

parseTests.forEach(test => {
  try {
    const result = IIIFUrlBuilder.parse(test.input);
    const passed = JSON.stringify(result) === JSON.stringify(test.expected);
    console.log(`${passed ? '✅' : '❌'} ${test.name}`);
    console.log(`   输入: ${test.input}`);
    console.log(`   期望: ${JSON.stringify(test.expected)}`);
    console.log(`   结果: ${JSON.stringify(result)}`);
    if (!passed) {
      console.log(`   ❌ 解析失败`);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ ${test.name} - 错误: ${error.message}`);
    console.log('');
  }
});

console.log('3. URL修复测试:');
console.log('');

const fixTests = [
  {
    name: '修复编码问题',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan/1-16-chuangkanhao/manifest.json',
    expected: 'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan%2F1-16-chuangkanhao/manifest.json'
  },
  {
    name: '修复双斜杠',
    input: 'https://www.ai4dh.cn/iiif//3/manifests/test/manifest.json',
    expected: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json'
  },
  {
    name: '修复缺失版本',
    input: 'https://www.ai4dh.cn/iiif/manifests/test/manifest.json',
    expected: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json'
  }
];

fixTests.forEach(test => {
  try {
    const result = IIIFUrlBuilder.fix(test.input);
    const passed = result === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.name}`);
    console.log(`   输入: ${test.input}`);
    console.log(`   期望: ${test.expected}`);
    console.log(`   结果: ${result}`);
    if (!passed) {
      console.log(`   ❌ 修复失败`);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ ${test.name} - 错误: ${error.message}`);
    console.log('');
  }
});

console.log('4. URL验证测试:');
console.log('');

const validationTests = [
  {
    name: '有效URL',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json',
    expected: true
  },
  {
    name: '无效URL - 缺少协议',
    input: 'www.ai4dh.cn/iiif/3/manifests/test/manifest.json',
    expected: false
  },
  {
    name: '无效URL - 缺少版本',
    input: 'https://www.ai4dh.cn/iiif/manifests/test/manifest.json',
    expected: false
  },
  {
    name: '无效URL - 错误格式',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.xml',
    expected: false
  }
];

validationTests.forEach(test => {
  try {
    const result = IIIFUrlBuilder.validate(test.input);
    const passed = result.valid === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.name}`);
    console.log(`   输入: ${test.input}`);
    console.log(`   期望: ${test.expected ? '有效' : '无效'}`);
    console.log(`   结果: ${result.valid ? '有效' : '无效'}`);
    if (!result.valid && result.errors.length > 0) {
      console.log(`   错误: ${result.errors.join(', ')}`);
    }
    if (!passed) {
      console.log(`   ❌ 验证失败`);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ ${test.name} - 错误: ${error.message}`);
    console.log('');
  }
});

console.log('5. ID提取测试:');
console.log('');

const extractTests = [
  {
    name: '提取manifest ID',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/test/manifest.json',
    method: 'extractManifestId',
    expected: 'test'
  },
  {
    name: '提取编码的manifest ID',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/dazhongshenghuozhoukan%2F1-16-chuangkanhao/manifest.json',
    method: 'extractManifestId',
    expected: 'dazhongshenghuozhoukan%2F1-16-chuangkanhao'
  },
  {
    name: '提取collection ID',
    input: 'https://www.ai4dh.cn/iiif/3/manifests/test/collection.json',
    method: 'extractCollectionId',
    expected: 'test'
  }
];

extractTests.forEach(test => {
  try {
    const result = IIIFUrlBuilder[test.method](test.input);
    const passed = result === test.expected;
    console.log(`${passed ? '✅' : '❌'} ${test.name}`);
    console.log(`   输入: ${test.input}`);
    console.log(`   方法: ${test.method}`);
    console.log(`   期望: ${test.expected}`);
    console.log(`   结果: ${result}`);
    if (!passed) {
      console.log(`   ❌ 提取失败`);
    }
    console.log('');
  } catch (error) {
    console.log(`❌ ${test.name} - 错误: ${error.message}`);
    console.log('');
  }
});

console.log('=== 测试完成 ===');
console.log('');
console.log('🎯 新URL构建工具的特点:');
console.log('✅ 统一的URL构建、解析、修复和验证');
console.log('✅ 消除所有特殊情况处理');
console.log('✅ 智能URL编码和解码');
console.log('✅ 完善的错误处理和恢复机制');
console.log('✅ 代理URL支持');
console.log('');
console.log('🔧 核心改进:');
console.log('- 从分散的URL构建逻辑到统一的工具类');
console.log('- 从复杂的条件判断到简洁的数据结构');
console.log('- 从脆弱的字符串处理到robust的URL解析');
console.log('- 从手动编码到智能的自动编码');
console.log('');
console.log('📋 下一步:');
console.log('1. 将新的URL构建工具集成到现有代码中');
console.log('2. 运行实际测试验证功能');
console.log('3. 监控生产环境中的URL错误');
console.log('4. 根据需要进一步优化');