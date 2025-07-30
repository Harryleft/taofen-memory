import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Star, Lightbulb, Book } from 'lucide-react'

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-20"></div>
        
        <div className="relative container mx-auto px-4 text-center text-primary-foreground">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              邹韬奋
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up">
              永远的爱国者 · 新闻出版先驱
            </p>
            <blockquote className="text-lg md:text-xl italic mb-12 opacity-80 animate-fade-in-up">
              "我生为中国人，死为中国魂，此志不渝。"
            </blockquote>
            <Button asChild size="lg" className="animate-fade-in-up">
              <Link to="/timeline" className="flex items-center space-x-2">
                <span>探索生平</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">探索邹韬奋的一生</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/timeline" className="group">
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border hover:border-primary/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">生平时间线</h3>
                <p className="text-muted-foreground">
                  追溯邹韬奋先生的一生历程，从出生到逝世的重要时刻
                </p>
              </div>
            </Link>

            <Link to="/events" className="group">
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border hover:border-primary/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">重要事件</h3>
                <p className="text-muted-foreground">
                  深入了解邹韬奋先生参与的重要历史事件和贡献
                </p>
              </div>
            </Link>

            <Link to="/legacy" className="group">
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border hover:border-primary/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">思想贡献</h3>
                <p className="text-muted-foreground">
                  探索邹韬奋先生的新闻出版理念和爱国思想
                </p>
              </div>
            </Link>

            <Link to="/resources" className="group">
              <div className="bg-card p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border hover:border-primary/50">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20">
                  <Book className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">历史资料</h3>
                <p className="text-muted-foreground">
                  珍贵的历史照片、文献记录和参考资料
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">精选内容</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold mb-4">《生活》周刊的创办</h3>
              <p className="text-muted-foreground mb-6">
                1926年，邹韬奋创办了《生活》周刊，这成为他新闻出版事业的重要起点。
                《生活》周刊以"传播进步思想，服务社会大众"为宗旨，内容涵盖时事评论、
                文化教育、生活指导等多个方面，很快成为当时最有影响力的进步刊物之一。
              </p>
              <Button asChild variant="outline">
                <Link to="/events/life-weekly">了解更多</Link>
              </Button>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
                alt="生活周刊"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}