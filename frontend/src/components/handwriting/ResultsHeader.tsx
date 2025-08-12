import { memo } from 'react';

interface ResultsHeaderProps {
  totalItems: number;
  visibleItems: number;
}

const ResultsHeader = memo(({ totalItems, visibleItems }: ResultsHeaderProps) => (
  <div className="text-center mb-8">
    <p className="text-charcoal/60">
      找到 <span className="font-bold text-gold">{totalItems}</span> 件手迹
      {visibleItems < totalItems && (
        <span>，显示 <span className="font-bold text-gold">{visibleItems}</span> 项</span>
      )}
    </p>
  </div>
));

ResultsHeader.displayName = 'ResultsHeader';

export default ResultsHeader;