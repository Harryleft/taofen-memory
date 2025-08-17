// 检查控制台错误的脚本
console.log('=== CSS架构重构验证 ===');

// 检查CSS变量是否正确加载
const computedStyle = getComputedStyle(document.documentElement);
const globalBgPrimary = computedStyle.getPropertyValue('--global-bg-primary');
const timelineBgPrimary = computedStyle.getPropertyValue('--timeline-bg-primary');

console.log('全局背景色变量:', globalBgPrimary);
console.log('时间轴背景色变量:', timelineBgPrimary);

// 检查Footer组件类名冲突
const footerElements = document.querySelectorAll('.footer, .footer-component, .zoutaofen-footer');
console.log('找到的Footer元素:', footerElements.length);

// 检查响应式断点是否正确
const breakpoints = {
  xs: computedStyle.getPropertyValue('--global-breakpoint-xs'),
  sm: computedStyle.getPropertyValue('--global-breakpoint-sm'),
  md: computedStyle.getPropertyValue('--global-breakpoint-md'),
  lg: computedStyle.getPropertyValue('--global-breakpoint-lg'),
  xl: computedStyle.getPropertyValue('--global-breakpoint-xl'),
  '2xl': computedStyle.getPropertyValue('--global-breakpoint-2xl')
};

console.log('响应式断点:', breakpoints);

// 检查动画是否可用
const animations = [
  'fadeIn', 'staggerIn', 'cardEnter', 'float', 'blob'
];

animations.forEach(animation => {
  const testElement = document.createElement('div');
  testElement.style.animation = `${animation} 0.3s ease`;
  document.body.appendChild(testElement);
  
  const computedAnimation = getComputedStyle(testElement).animationName;
  console.log(`${animation} 动画:`, computedAnimation === 'none' ? '❌ 不可用' : '✅ 可用');
  
  document.body.removeChild(testElement);
});

// 检查Tailwind类是否可用
const testClasses = [
  'bg-cream', 'text-primary', 'rounded-lg', 'shadow-card'
];

testClasses.forEach(testClass => {
  const testElement = document.createElement('div');
  testElement.className = testClass;
  document.body.appendChild(testElement);
  
  const computedBg = getComputedStyle(testElement).backgroundColor;
  console.log(`${testClass} 类:`, computedBg || '❌ 不可用');
  
  document.body.removeChild(testElement);
});

console.log('=== 验证完成 ===');