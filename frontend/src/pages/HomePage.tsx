import React from 'react';
import EnhancedHero from '../components/heroIntro/EnhancedHero.tsx';
import { AppFooter } from '../components/layout/footer';

function HomePage() {

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Enhanced Hero Section */}
      <EnhancedHero />
      {/* Main Content */}
      <main className="flex-1">
      </main>
      {/* Footer */}
      <AppFooter moduleId="home" />
    </div>
  );
}

export default HomePage;
