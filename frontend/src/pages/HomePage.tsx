import React from 'react';
import EnhancedHero from '../components/heroIntro/EnhancedHero.tsx';
import { AppFooter } from '../components/layout/footer';
import AppHeader from '../components/layout/header/AppHeader.tsx';

function HomePage() {

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <AppHeader moduleId="home" />
      {/* Enhanced Hero Section */}
      <EnhancedHero />
      {/* Main Content */}
      <main className="flex-1">
      </main>
      {/* Footer */}
      <AppFooter />
    </div>
  );
}

export default HomePage;
