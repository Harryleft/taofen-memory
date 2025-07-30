import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20">404</h1>
        </div>
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">页面未找到</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            抱歉，您访问的页面不存在。可能是链接有误或页面已被移除。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>返回首页</span>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center space-x-2 border border-border hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回上页</span>
          </button>
        </div>
        
        <div className="mt-12 text-sm text-muted-foreground">
          <p>如果您认为这是一个错误，请联系网站管理员。</p>
        </div>
      </div>
    </div>
  )
}