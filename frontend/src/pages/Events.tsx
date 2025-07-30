import { Link } from 'react-router-dom'
import { Newspaper, BookOpen, Users, Ship } from 'lucide-react'

const events = [
  {
    id: 'life-weekly',
    title: '《生活》周刊的创办',
    description: '1926年创办的《生活》周刊成为当时最有影响力的进步刊物之一',
    icon: Newspaper,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    date: '1926年',
    location: '上海'
  },
  {
    id: 'mass-books',
    title: '生活书店的建立',
    description: '1932年建立生活书店，出版进步书籍，传播新思想',
    icon: BookOpen,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=250&fit=crop',
    date: '1932年',
    location: '上海'
  },
  {
    id: 'seven-incident',
    title: '七君子事件',
    description: '1936年与沈钧儒等七人被国民党政府逮捕，引发全国抗议',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=250&fit=crop',
    date: '1936年',
    location: '上海'
  },
  {
    id: 'hongkong',
    title: '香港流亡时期',
    description: '抗战期间在香港继续从事抗日救国宣传工作',
    icon: Ship,
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=250&fit=crop',
    date: '1941年',
    location: '香港'
  }
]

export function Events() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">重要历史事件</h1>
        <p className="text-muted-foreground text-lg">
          深入了解邹韬奋先生参与的重要历史事件，感受那个时代的风云变幻
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((event) => {
          const Icon = event.icon
          return (
            <Link key={event.id} to={`/events/${event.id}`} className="group">
              <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border hover:border-primary/50">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-200"></div>
                  <div className="absolute top-4 left-4">
                    <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="text-sm opacity-90">{event.date}</div>
                    <div className="text-sm opacity-90 flex items-center">
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary font-medium">
                    <span>查看详情</span>
                    <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Additional Events Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8">更多历史事件</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Newspaper className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">抗日救亡运动</h3>
            <p className="text-muted-foreground text-sm">
              积极参与抗日救亡运动，通过《生活》周刊传播抗日思想
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">新闻出版事业</h3>
            <p className="text-muted-foreground text-sm">
              致力于新闻出版事业，推动进步文化的发展
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">社会活动</h3>
            <p className="text-muted-foreground text-sm">
              参与各种社会活动，为民众利益发声
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}