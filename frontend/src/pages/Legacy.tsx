import { Heart, BookOpen, GraduationCap, Scale } from 'lucide-react'

const legacyItems = [
  {
    title: '爱国情怀',
    description: '一生致力于爱国救亡运动，被誉为"永远的爱国者"',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  {
    title: '新闻出版理念',
    description: '倡导"为人民服务"的新闻出版理念，推动大众文化传播',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    title: '教育思想',
    description: '重视教育对国家发展的重要性，提倡普及教育',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    title: '社会正义',
    description: '关注社会底层民众，倡导社会公平正义',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
]

export function Legacy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">思想贡献与遗产</h1>
        <p className="text-muted-foreground text-lg">
          邹韬奋先生的思想和精神至今仍在影响着我们，他的贡献远不止于新闻出版领域
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {legacyItems.map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="bg-card rounded-lg p-6 text-center border hover:shadow-md transition-all duration-200">
              <div className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          )
        })}
      </div>

      {/* Detailed Legacy Sections */}
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">新闻出版理念</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-lg border-l-4 border-primary">
                <h3 className="font-semibold mb-2">为人民服务</h3>
                <p className="text-muted-foreground">
                  邹韬奋先生始终强调新闻出版要为人民服务，要反映民众的呼声和需求。
                  他认为报刊杂志应该成为民众的喉舌，而不是统治者的工具。
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border-l-4 border-primary">
                <h3 className="font-semibold mb-2">传播进步思想</h3>
                <p className="text-muted-foreground">
                  他通过《生活》周刊等刊物，积极传播马克思主义和进步思想，
                  为中国革命和建设事业培养了大批人才。
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border-l-4 border-primary">
                <h3 className="font-semibold mb-2">坚持真理</h3>
                <p className="text-muted-foreground">
                  面对国民党的压迫和威胁，他始终坚持真理，不为权势所屈服，
                  体现了中国知识分子的骨气和担当。
                </p>
              </div>
            </div>
          </div>
          <div className="bg-muted/50 p-8 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">经典语录</h3>
            <blockquote className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-muted-foreground italic">
                  "我生为中国人，死为中国魂，此志不渝。"
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-muted-foreground italic">
                  "新闻记者要说真话，办实事，为人民服务。"
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-muted-foreground italic">
                  "文化工作者的天职是为人民服务，为真理服务。"
                </p>
              </div>
            </blockquote>
          </div>
        </div>

        <div className="bg-card p-8 rounded-lg border">
          <h2 className="text-2xl font-bold mb-6">现代意义</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">媒体责任</h3>
              <p className="text-muted-foreground text-sm">
                在当今信息爆炸的时代，邹韬奋先生的媒体责任理念更具现实意义
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">爱国精神</h3>
              <p className="text-muted-foreground text-sm">
                他的爱国精神激励着一代又一代中国人为国家发展贡献力量
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">教育价值</h3>
              <p className="text-muted-foreground text-sm">
                他的教育思想和实践对现代教育事业仍有重要的借鉴意义
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}