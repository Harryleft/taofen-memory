import '@testing-library/jest-dom';

// Mock framer-motion to avoid React JSX runtime issues in Jest
const mockReact = require('react');

jest.mock('framer-motion', () => ({
  motion: {
    div: (props: Record<string, unknown>) => mockReact.createElement('div', props),
    span: (props: Record<string, unknown>) => mockReact.createElement('span', props),
    button: (props: Record<string, unknown>) => mockReact.createElement('button', props),
    a: (props: Record<string, unknown>) => mockReact.createElement('a', props),
  },
  AnimatePresence: ({ children }: { children: unknown }) => children,
}));