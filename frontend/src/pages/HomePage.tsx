import React from 'react';
import EnhancedHero from '../components/heroIntro/EnhancedHero.tsx';

function HomePage() {

  return (
    <div className="min-h-screen bg-cream">
      {/* Enhanced Hero Section */}
      <EnhancedHero />
      {/* Main Content */}
      <main>
      </main>
    </div>
  );
}

export default HomePage;
