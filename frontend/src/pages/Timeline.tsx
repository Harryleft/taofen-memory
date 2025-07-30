import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TimelineEvent } from '@/types'
import { Calendar, MapPin } from 'lucide-react'

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'birth',
    year: 1895,
    title: '出生于福建永安',
    description: '邹韬奋出生于福建省永安县一个书香门第家庭，原名邹恩润。',
    location: '福建永安',
    importance: 'high',
    category: 'birth'
  },
  {
    id: 'education',
    year: 1921,
    title: '毕业于圣约翰大学',
    description: '毕业于上海圣约翰大学，主修文学，后赴美国哥伦比亚大学深造。',
    location: '上海',
    importance: 'high',
    category: 'education'
  },
  {
    id: 'life-weekly',
    year: 1926,
    title: '创办《生活》周刊',
    description: '创办《生活》周刊，开始了他的新闻出版事业，致力于传播进步思想。',
    location: '上海',
    importance: 'high',
    category: 'career'
  },
  {
    id: 'anti-japanese',
    year: 1931,
    title: '九一八事变后的抗日宣传',
    description: '九一八事变后，积极宣传抗日救国，成为重要的抗日舆论阵地。',
    location: '上海',
    importance: 'high',
    category: 'social'
  },
  {
    id: 'salvation-council',
    year: 1936,
    title: '参与成立救国会',
    description: '参与成立全国各界救国联合会，积极投身抗日救亡运动。',
    location: '上海',
    importance: 'high',
    category: 'social'
  },
  {
    id: 'death',
    year: 1944,
    title: '在上海逝世',
    description: '因病在上海逝世，年仅49岁。临终前仍心系国家前途。',
    location: '上海',
    importance: 'high',
    category: 'death'
  }
]

export function Timeline() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const years = Array.from(new Set(mockTimelineEvents.map(event => event.year))).sort()

  const filteredEvents = selectedYear 
    ? mockTimelineEvents.filter(event => event.year === selectedYear)
    : mockTimelineEvents

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'birth': return '👶'
      case 'education': return '🎓'
      case 'career': return '💼'
      case 'achievement': return '🏆'
      case 'social': return '👥'
      case 'death': return '⚰️'
      default: return '📅'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">邹韬奋生平时间线</h1>
        <p className="text-muted-foreground text-lg">
          追踪邹韬奋先生的一生历程，了解他在中国近代史上的重要贡献
        </p>
      </div>

      {/* Year Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">按年份筛选</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedYear(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedYear === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            全部
          </button>
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {year}年
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-border h-full"></div>

        <div className="space-y-12">
          {filteredEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background"></div>

              {/* Event content */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                <div className={index % 2 === 0 ? 'md:text-right' : ''}>
                  <div className="bg-card p-6 rounded-lg shadow-sm border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getCategoryIcon(event.category)}</span>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{event.year}年</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.importance === 'high' ? 'bg-red-100 text-red-800' :
                        event.importance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {event.importance === 'high' ? '重要' : 
                         event.importance === 'medium' ? '中等' : '一般'}
                      </span>
                      {event.category === 'career' && (
                        <Link 
                          to={`/events/${event.id}`}
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          了解更多 →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <div className={index % 2 === 0 ? 'md:order-last' : 'md:order-first'}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Stats */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {mockTimelineEvents.length}
          </div>
          <div className="text-sm text-muted-foreground">重要事件</div>
        </div>
        <div className="bg-card p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {Math.max(...mockTimelineEvents.map(e => e.year)) - Math.min(...mockTimelineEvents.map(e => e.year))}
          </div>
          <div className="text-sm text-muted-foreground">年历程</div>
        </div>
        <div className="bg-card p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {mockTimelineEvents.filter(e => e.importance === 'high').length}
          </div>
          <div className="text-sm text-muted-foreground">重大事件</div>
        </div>
        <div className="bg-card p-6 rounded-lg text-center">
          <div className="text-3xl font-bold text-primary mb-2">
            {new Set(mockTimelineEvents.map(e => e.location)).size}
          </div>
          <div className="text-sm text-muted-foreground">涉及城市</div>
        </div>
      </div>
    </div>
  )
}