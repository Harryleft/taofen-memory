export interface TimelineEvent {
  id: string
  year: number
  title: string
  description: string
  image?: string
  location: string
  importance: 'low' | 'medium' | 'high'
  category: 'birth' | 'education' | 'career' | 'achievement' | 'social' | 'death'
}

export interface EventDetail {
  id: string
  title: string
  date: string
  location: string
  description: string
  image: string
  content: string
  links: Array<{
    text: string
    url: string
  }>
  relatedEvents: string[]
}

export interface LegacyItem {
  id: string
  title: string
  description: string
  icon: string
  category: string
}

export interface ResourceItem {
  id: string
  title: string
  description: string
  type: 'image' | 'document' | 'video' | 'link'
  url?: string
  thumbnail?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}