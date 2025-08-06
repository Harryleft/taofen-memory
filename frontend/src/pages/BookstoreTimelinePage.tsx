import BookstoreTimelineModule from '../components/bookstore/BookstoreModule.tsx';
import AppHeader from '../components/layout/header/AppHeader.tsx';

function BookstoreTimelinePage() {
  return (
    <div className="min-h-screen bg-cream">
      <AppHeader moduleId="bookstore" />

      {/* Main Content */}
      <main>
        <BookstoreTimelineModule />
      </main>
     
    </div>
  );
}

export default BookstoreTimelinePage;
