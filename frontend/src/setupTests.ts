import '@testing-library/jest-dom';
import React from 'react';

// Mock framer-motion to avoid React JSX runtime issues in Jest
jest.mock('framer-motion', () => ({
  motion: {
    div: (props: Record<string, unknown>) => React.createElement('div', props),
    span: (props: Record<string, unknown>) => React.createElement('span', props),
    button: (props: Record<string, unknown>) => React.createElement('button', props),
    a: (props: Record<string, unknown>) => React.createElement('a', props),
  },
  AnimatePresence: ({ children }: { children: unknown }) => children,
}));