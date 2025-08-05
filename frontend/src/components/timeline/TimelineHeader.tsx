import React from 'react';
import { Clock, Calendar, MapPin } from 'lucide-react';
import BaseHeader from '../common/BaseHeader';
import { ModuleHeaderConfig } from '../../styles/commonHeader';

// TimelineHeader组件的props接口定义
interface TimelineHeaderProps {
  stats?: {
    totalEvents: number;
    totalGroups: number;
    yearRange: { min: number; max: number } | null;
    uniqueLocations: string[];
  } | null;
  searchQuery?: string;
  selectedYear?: number | null;
  selectedLocation?: string | null;
  availableYears?: number[];
  availableLocations?: string[];
  onSearch?: (query: string) => void;
  onYearFilter?: (year: number | null) => void;
  onLocationFilter?: (location: string | null) => void;
  onRefresh?: () => void;
  onClearCache?: () => void;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  stats = null,
  searchQuery = '',
  selectedYear = null,
  selectedLocation = null,
  availableYears = [],
  availableLocations = [],
  onSearch,
  onYearFilter,
  onLocationFilter,
  onRefresh,
  onClearCache
}) => {
  const config: ModuleHeaderConfig = {
    moduleId: 'timeline',
    icon: <Clock className="w-8 h-8 text-gold" />,
    title: '生平时光轴',
    subtitle: '追溯韬奋先生的人生足迹',
    description: '以时间为轴，梳理邹韬奋先生从求学、办报到投身抗日救国的人生历程，感受一代报人的家国情怀与时代担当。',
    accentColor: 'amber',
    backgroundImage: 'placeholder',
    showDecorative: true,
    customStyles: {
      container: 'timeline-header',
      title: 'text-amber-800',
      description: 'text-charcoal/70'
    }
  };

  return (
    <BaseHeader config={config}>
      {/* 时间线特色装饰元素 */}
      <div className="flex items-center justify-center mt-6 mb-4">
        <div className="flex items-center space-x-8 text-charcoal/50">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {stats?.yearRange 
                ? `${stats.yearRange.min}-${stats.yearRange.max}` 
                : '1895-1944'}
            </span>
          </div>
          <div className="w-px h-4 bg-gold/30"></div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {stats?.uniqueLocations && stats.uniqueLocations.length > 0
                ? stats.uniqueLocations.slice(0, 3).join(' → ')
                : '福建永安 → 上海 → 香港'}
            </span>
          </div>
        </div>
      </div>
      
      {/* 时间轴视觉隐喻 */}
      <div className="relative mt-8">
        <div className="absolute left-1/2 transform -translate-x-1/2 w-px h-16 bg-gradient-to-b from-gold/60 to-transparent"></div>
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-3 h-3 bg-gold rounded-full border-2 border-white shadow-lg"></div>
        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 w-2 h-2 bg-gold/60 rounded-full"></div>
      </div>
    </BaseHeader>
  );
};

export default TimelineHeader;