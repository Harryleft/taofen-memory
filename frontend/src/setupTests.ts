import '@testing-library/jest-dom';

// Mock framer-motion to avoid React JSX runtime issues in Jest
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');

  // Framer-motion specific props that should be filtered out
  const motionProps = new Set([
    'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap',
    'whileFocus', 'whileInView', 'whileDrag', 'drag', 'dragConstraints',
    'dragElastic', 'dragMomentum', 'dragSnapToOrigin', 'dragControls',
    'variants', 'animatePresence', 'custom', 'inherit', 'onAnimationComplete',
    'onDragStart', 'onDrag', 'onDragEnd', 'layout', 'layoutId', 'key'
  ]);

  // Filter out framer-motion specific props
  const filterMotionProps = (props: Record<string, unknown>): Record<string, unknown> => {
    const filtered: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (!motionProps.has(key)) {
        filtered[key] = value;
      }
    }
    return filtered;
  };

  return {
    motion: {
      div: (props: Record<string, unknown>) => React.createElement('div', filterMotionProps(props)),
      span: (props: Record<string, unknown>) => React.createElement('span', filterMotionProps(props)),
      button: (props: Record<string, unknown>) => React.createElement('button', filterMotionProps(props)),
      a: (props: Record<string, unknown>) => React.createElement('a', filterMotionProps(props)),
    },
    AnimatePresence: ({ children }: { children: unknown }) => children,
  };
});