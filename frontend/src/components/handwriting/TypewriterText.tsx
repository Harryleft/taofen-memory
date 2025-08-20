import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText = ({ 
  text, 
  speed = 30, 
  className = '', 
  onComplete 
}: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!text) return;

    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayedText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current && isTyping) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText, isTyping]);

  return (
    <div ref={containerRef} className={`typewriter-container ${className}`}>
      <div className="relative">
        <p className="whitespace-pre-wrap leading-relaxed">
          {displayedText}
        </p>
        {isTyping && (
          <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
};