// Auralis — Main Application
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Particles from './components/ui/Particles'
import LandingPage from './pages/LandingPage/LandingPage'
import SessionPage from './pages/SessionPage/SessionPage'
import ReviewPage from './pages/ReviewPage/ReviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <Particles />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
