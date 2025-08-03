import React from 'react';
import EnhancedHero from '../components/EnhancedHero';

function HomePage() {

  return (
    <div className="min-h-screen bg-cream">
      {/* Enhanced Hero Section */}
      <EnhancedHero />



      {/* Main Content */}
      <main>

      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-cream py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-4">邹韬奋数字人文纪念馆</h3>
          <p className="text-cream/80 mb-6">传承文化，启迪未来</p>
          <p className="text-cream/60 text-sm">
            © 2025 数字人文纪念馆项目 · 致敬中国现代新闻出版业的先驱
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;