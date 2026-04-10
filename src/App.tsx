import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import CarDetails from './pages/CarDetails';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/quiz"       element={<Quiz />} />
        <Route path="/results"    element={<Results />} />
        <Route path="/car/:id"    element={<CarDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
