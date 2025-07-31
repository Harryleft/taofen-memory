import React, { useState, useEffect } from 'react';
import { BookOpen, Image, MapPin, User, Clock } from 'lucide-react';
import EnhancedHero from './components/EnhancedHero';
import PublicationsGallery from './components/PublicationsGallery';
import LifeTimelineModule from './components/LifeTimelineModule';
import BookstoreTimelineModule from './components/BookstoreTimelineModule';
import HandwritingModule from './components/HandwritingModule';

function App() {
  const [activeSection, setActiveSection] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: '总览', icon: BookOpen },
    { id: 'timeline', label: '人生大事', icon: Clock },
    { id: 'bookstore', label: '生活书店', icon: MapPin },
    { id: 'handwriting', label: '韬奋手迹', icon: Image }
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Enhanced Hero Section */}
      <EnhancedHero />

      {/* Navigation */}
      <nav id="main-content" className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-gold/20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h2 className="text-2xl font-bold text-charcoal">数字人文纪念馆</h2>
              
              {/* Navigation Menu */}
              <div className="hidden md:flex items-center gap-6">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        activeSection === item.id
                          ? 'bg-gold text-cream'
                          : 'text-charcoal hover:bg-gold/10 hover:text-gold'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            

          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {/* Publications Gallery */}
        <PublicationsGallery />

        {/* Life Timeline Module */}
        <LifeTimelineModule />

        {/* Bookstore Timeline Module */}
        <BookstoreTimelineModule />

        {/* Handwriting Module */}
        <HandwritingModule />
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

export default App;