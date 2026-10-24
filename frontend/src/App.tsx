import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AssessmentProvider } from './context/AssessmentContext';
import { Home } from './pages/Home/Home';
import { Assessment } from './pages/Assess/Assessment';
import { DecisionTreePage } from './pages/Assess/DecisionTreePage';
import { ComparatorPage } from './pages/Assess/ComparatorPage';
import { ActionPlanPage } from './pages/Assess/ActionPlanPage';
import { Dashboard } from './pages/Dashboard/Dashboard';

function App() {
  return (
    <AuthProvider>
      <AssessmentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<Navigate to="/dashboard" replace />} />
            <Route path="/assess" element={<Assessment />} />
            <Route path="/assess/decision-tree" element={<DecisionTreePage />} />
            <Route path="/assess/comparator" element={<ComparatorPage />} />
            <Route path="/assess/action-plan" element={<ActionPlanPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AssessmentProvider>
    </AuthProvider>
  );
}

export default App;
