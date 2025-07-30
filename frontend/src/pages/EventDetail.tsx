import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin } from 'lucide-react'

const eventDetails = {
  'life-weekly': {
    title: '《生活》周刊的创办',
    date: '1926年10月10日',
    location: '上海',
    description: '邹韬奋创办的《生活》周刊成为当时最有影响力的进步刊物之一，以"传播进步思想，服务社会大众"为宗旨。',
    content: `
      《生活》周刊是邹韬奋先生新闻出版事业的重要起点。1926年10月10日，该刊在上海正式创刊，
      邹韬奋亲自担任主编。周刊的创办背景是当时中国社会的动荡不安，民众渴望获得正确的信息和指导。

      《生活》周刊的内容涵盖时事评论、文化教育、生活指导等多个方面。邹韬奋以其敏锐的政治洞察力
      和深厚的文化底蕴，将周刊办成了一份真正为民众服务的刊物。

      该刊物的成功不仅体现在发行量的增长上，更重要的是它在传播进步思想、启发民众觉悟方面发挥的
      重要作用。通过《生活》周刊，邹韬奋建立了与广大读者的密切联系，也确立了他在新闻出版界的重要地位。
    `,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop'
  }
}

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const event = eventDetails[id as keyof typeof eventDetails]

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">未找到事件</h1>
        <p className="text-muted-foreground mb-8">
          抱歉，无法找到您要查看的历史事件详情。
        </p>
        <Link 
          to="/events" 
          className="inline-flex items-center space-x-2 text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回事件列表</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          to="/events" 
          className="inline-flex items-center space-x-2 text-primary hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回事件列表</span>
        </Link>
        
        <h1 className="text-4xl font-bold mb-4">{event.title}</h1>
        
        <div className="flex flex-wrap gap-4 text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="prose max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              {event.description}
            </p>
            
            <div className="whitespace-pre-line text-foreground leading-relaxed">
              {event.content}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-card p-6 rounded-lg border">
            <img 
              src={event.image} 
              alt={event.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold mb-2">相关信息</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">时间：</span>
                <span>{event.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">地点：</span>
                <span>{event.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">重要性：</span>
                <span className="text-red-600">极高</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}