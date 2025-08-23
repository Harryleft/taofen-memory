import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookstoreTimelinePage from './pages/BookstoreTimelinePage';
import TimelinePage from './pages/TimelinePage';
import HandwritingPage from './pages/HandwritingPage';
import RelationshipsPage from './pages/RelationshipsPage';
import { NewspaperListPage, IssueListPage, ViewerPage } from './components/newspapers';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bookstore-timeline" element={<BookstoreTimelinePage />} />
      <Route path="/timeline" element={<TimelinePage />} />
      <Route path="/handwriting" element={<HandwritingPage />} />
      <Route path="/relationships" element={<RelationshipsPage />} />
      <Route path="/newspapers" element={<NewspaperListPage />} />
      <Route path="/newspapers/:publicationId/issues" element={<IssueListPage />} />
      <Route path="/newspapers/:publicationId/issues/:issueId/viewer" element={<ViewerPage />} />
    </Routes>
  );
}

export default App;
