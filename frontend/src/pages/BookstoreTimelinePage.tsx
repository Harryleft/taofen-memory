import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookstoreTimelineModule from '../components/BookstoreTimelineModule';

function BookstoreTimelinePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Header */}
      <nav className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-gold/20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-charcoal hover:bg-gold/10 hover:text-gold"
              >
                <ArrowLeft size={18} />
                返回首页
              </Link>
              <div className="h-6 w-px bg-gold/20"></div>
              <h1 className="text-2xl font-bold text-charcoal">生活书店时间线</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <BookstoreTimelineModule />
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

export default BookstoreTimelinePage;