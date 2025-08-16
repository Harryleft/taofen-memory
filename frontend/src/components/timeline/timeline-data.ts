export interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  details: string[];
  imageUrl: string;
  location: string;
  period: 'early' | 'middle' | 'late';
}