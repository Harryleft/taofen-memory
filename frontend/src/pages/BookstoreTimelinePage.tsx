import BookstoreTimelineModule from '@/components/bookstore/BookstoreModule.tsx';
import AppHeader from '@/components/layout/header/AppHeader.tsx';
import { AppFooter } from '@/components/layout/footer';

function BookstoreTimelinePage() {
  return (
    <div className="min-h-screen bookstore-page-container flex flex-col">
      <AppHeader moduleId="bookstore" />

      {/* Main Content */}
      <main className="flex-1">
        <BookstoreTimelineModule />
      </main>
      
      {/* Footer */}
      <AppFooter />
    </div>
  );
}

export default BookstoreTimelinePage;
