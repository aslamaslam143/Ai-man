import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SubmitClaim from './pages/SubmitClaim';
import UserDashboard from './pages/UserDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ClaimDetail from './pages/ClaimDetail';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/submit" element={<SubmitClaim />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/reviewer" element={<ReviewerDashboard />} />
            <Route path="/claim/:id" element={<ClaimDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
