import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookstoreTimelinePage from './pages/BookstoreTimelinePage';
import TimelinePage from './pages/TimelinePage';
import HandwritingPage from './pages/HandwritingPage';
import RelationshipsPage from './pages/RelationshipsPage';
import BookstoreComparison from './components/bookstore/BookstoreComparison';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bookstore-timeline" element={<BookstoreTimelinePage />} />
      <Route path="/bookstore-comparison" element={<BookstoreComparison />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="/handwriting" element={<HandwritingPage />} />
      <Route path="/relationships" element={<RelationshipsPage />} />
    </Routes>
  );
}

export default App;