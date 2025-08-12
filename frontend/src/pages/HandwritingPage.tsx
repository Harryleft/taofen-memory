import React from 'react';
import HandwritingModule from '../components/handwriting/HandwritingModule.tsx';
import { AppFooter } from '../components/layout/footer';

function HandwritingPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <HandwritingModule />
      
      {/* Footer */}
      <AppFooter moduleId="handwriting" />
    </div>
  );
}

export default HandwritingPage;
