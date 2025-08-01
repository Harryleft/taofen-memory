import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookstoreTimelineModule from '../components/bookstore';

function BookstoreTimelinePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Header */}
      <nav className="sticky top-0 bg-cream/95 backdrop-blur-sm border-b border-gold/20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-charcoal hover:bg-gold/10 hover:text-gold"
              >
                <ArrowLeft size={18} />
                返回
              </Link>
              <div className="h-6 w-px bg-gold/20"></div>
              {/* <h1 className="text-2xl font-bold text-charcoal">韬奋·时光书影</h1> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <BookstoreTimelineModule />
      </main>
     
    </div>
  );
}

export default BookstoreTimelinePage;