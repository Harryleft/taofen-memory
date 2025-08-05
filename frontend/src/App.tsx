import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookstoreTimelinePage from './pages/BookstoreTimelinePage';
import TimelinePage from './pages/TimelinePage';
import RefactoredTimelinePage from './components/timeline/RefactoredTimelinePage';
import HandwritingPage from './pages/HandwritingPage';
import RelationshipsPage from './pages/RelationshipsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bookstore-timeline" element={<BookstoreTimelinePage />} />
      <Route path="/timeline" element={<RefactoredTimelinePage />} />
      <Route path="/handwriting" element={<HandwritingPage />} />
      <Route path="/relationships" element={<RelationshipsPage />} />
    </Routes>
  );
}

export default App;