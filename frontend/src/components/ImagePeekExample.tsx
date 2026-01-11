import React from 'react';
import { ImagePeek } from './ImagePeek';

/**
 * 图片预览组件使用示例
 */
export const ImagePeekExample: React.FC = () => {
  const sampleImages = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      alt: '山脉风景',
      title: 'clip-path方案',
      description: '使用CSS clip-path实现，性能最佳'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=600&fit=crop',
      alt: '海洋风景',
      title: 'overflow方案',
      description: '使用overflow:hidden实现，兼容性好'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=600&fit=crop',
      alt: '森林风景',
      title: 'scale方案',
      description: '使用transform scale实现，视觉效果独特'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">图片前20%显示方案</h1>
      
      {/* 基础使用示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">基础使用</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium mb-2">{image.title}</h3>
              <p className="text-gray-600 mb-4 text-sm">{image.description}</p>
              <ImagePeek
                src={image.src}
                alt={image.alt}
                height="md"
              />
            </div>
          ))}
        </div>
      </section>

      {/* 不同尺寸示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">不同尺寸</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-2">小尺寸</h3>
            <ImagePeek
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
              alt="小尺寸示例"
              height="sm"
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-2">中等尺寸</h3>
            <ImagePeek
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
              alt="中等尺寸示例"
              height="md"
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-2">大尺寸</h3>
            <ImagePeek
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
              alt="大尺寸示例"
              height="lg"
            />
          </div>
        </div>
      </section>

      {/* 交互示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">交互功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-2">带点击事件</h3>
            <ImagePeek
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
              alt="带点击事件"
              height="md"
              onClick={() => alert('图片被点击了！')}
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-2">隐藏展开提示</h3>
            <ImagePeek
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
              alt="隐藏展开提示"
              height="md"
              showExpandHint={false}
            />
          </div>
        </div>
      </section>

      {/* 性能优化示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">性能优化示例</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium mb-4">大量图片展示</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ImagePeek
                key={i}
                src={`https://picsum.photos/seed/${i}/300/400.jpg`}
                alt={`示例图片 ${i + 1}`}
                height="sm"
                className="image-peek-glow"
              />
            ))}
          </div>
        </div>
      </section>

      {/* 自定义样式示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">自定义样式</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-2">圆角卡片样式</h3>
            <ImagePeek
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
              alt="圆角卡片"
              height="md"
              className="image-peek-card image-peek-animate-slow"
            />
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium mb-2">发光效果</h3>
            <ImagePeek
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop"
              alt="发光效果"
              height="md"
              className="image-peek-glow"
            />
          </div>
        </div>
      </section>

      {/* 响应式示例 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">响应式设计</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p className="text-gray-600 mb-4">
            在移动设备上，图片会自动展开显示完整内容
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleImages.map((image) => (
              <div key={image.id} className="text-center">
                <ImagePeek
                  src={image.src}
                  alt={image.alt}
                  height="md"
                />
                <p className="mt-2 text-sm text-gray-600">{image.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ImagePeekExample;