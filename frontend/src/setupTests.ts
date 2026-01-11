import '@testing-library/jest-dom';

// Mock framer-motion to avoid React JSX runtime issues in Jest
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: (props: Record<string, unknown>) => React.createElement('div', props),
      span: (props: Record<string, unknown>) => React.createElement('span', props),
      button: (props: Record<string, unknown>) => React.createElement('button', props),
      a: (props: Record<string, unknown>) => React.createElement('a', props),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});