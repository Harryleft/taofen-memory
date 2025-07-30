import { useState } from 'react'
import { ResourceItem } from '@/types'
import { Image, FileText, Video, ExternalLink, Search } from 'lucide-react'

const mockResources: ResourceItem[] = [
  {
    id: '1',
    title: '邹韬奋先生肖像照',
    description: '1930年代拍摄的珍贵肖像照片',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=200&fit=crop'
  },
  {
    id: '2',
    title: '《生活》周刊创刊号',
    description: '1926年《生活》周刊创刊号的数字化版本',
    type: 'document',
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    title: '邹韬奋纪录片',
    description: '关于邹韬奋生平的完整纪录片',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=200&fit=crop'
  },
  {
    id: '4',
    title: '邹韬奋纪念馆',
    description: '上海邹韬奋纪念馆官方网站',
    type: 'link',
    url: 'https://www.zoutaofen.org'
  },
  {
    id: '5',
    title: '七君子事件历史照片',
    description: '1936年七君子事件的相关历史照片',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop'
  },
  {
    id: '6',
    title: '邹韬奋著作全集',
    description: '邹韬奋先生著作的数字化合集',
    type: 'document',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=200&fit=crop'
  }
]

const typeIcons = {
  image: Image,
  document: FileText,
  video: Video,
  link: ExternalLink
}

const typeColors = {
  image: 'text-green-600 bg-green-50',
  document: 'text-blue-600 bg-blue-50',
  video: 'text-red-600 bg-red-50',
  link: 'text-purple-600 bg-purple-50'
}

const typeLabels = {
  image: '图片',
  document: '文档',
  video: '视频',
  link: '链接'
}

export function Resources() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredResources = mockResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || resource.type === selectedType
    return matchesSearch && matchesType
  })

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentResources = filteredResources.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">历史资料</h1>
        <p className="text-muted-foreground text-lg">
          收集整理的珍贵历史资料，包括照片、文档、视频和相关链接
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="搜索资料..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">全部类型</option>
            <option value="image">图片</option>
            <option value="document">文档</option>
            <option value="video">视频</option>
            <option value="link">链接</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          找到 {filteredResources.length} 个资料
          {selectedType !== 'all' && ` (${typeLabels[selectedType as keyof typeof typeLabels]})`}
        </p>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentResources.map((resource) => {
          const Icon = typeIcons[resource.type]
          return (
            <div key={resource.id} className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border">
              {resource.type === 'link' ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${typeColors[resource.type]} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${typeColors[resource.type].split(' ')[0]}`} />
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[resource.type]}`}>
                      {typeLabels[resource.type]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
                  <div className="mt-4 flex items-center text-primary">
                    <span className="text-sm">访问链接</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </div>
                </a>
              ) : (
                <div className="block">
                  {resource.thumbnail && (
                    <div className="aspect-video relative">
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${typeColors[resource.type]}`}>
                          {typeLabels[resource.type]}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 ${typeColors[resource.type]} rounded-lg flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${typeColors[resource.type].split(' ')[0]}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{resource.title}</h3>
                    <p className="text-muted-foreground text-sm">{resource.description}</p>
                    <button className="mt-4 text-primary hover:underline text-sm font-medium">
                      查看详情
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10"
          >
            上一页
          </button>
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded border ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-primary/10'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10"
          >
            下一页
          </button>
        </div>
      )}

      {/* External Links Section */}
      <div className="mt-16 bg-card p-8 rounded-lg border">
        <h2 className="text-2xl font-bold mb-6">相关链接</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://www.zoutaofen.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">邹韬奋纪念馆</h3>
              <p className="text-sm text-muted-foreground">上海邹韬奋纪念馆官方网站</p>
            </div>
          </a>
          <a
            href="https://www.shanghaimuseum.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">上海历史博物馆</h3>
              <p className="text-sm text-muted-foreground">相关历史资料和展览</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}