import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BookstoreTimelinePage from './pages/BookstoreTimelinePage';
import TimelinePage from './pages/TimelinePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/bookstore-timeline" element={<BookstoreTimelinePage />} />
      <Route path="/timeline" element={<TimelinePage />} />
    </Routes>
  );
}

export default App;