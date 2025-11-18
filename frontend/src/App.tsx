import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ProjectEditor from './pages/ProjectEditor'
import CuttingPlan from './pages/CuttingPlan'
import Landing from './pages/Landing'
import AuthCallback from './pages/AuthCallback'

function App() {
  const { token } = useAuthStore()

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/new"
          element={token ? <ProjectEditor /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/:id"
          element={token ? <ProjectEditor /> : <Navigate to="/login" />}
        />
        <Route
          path="/projects/:id/plan"
          element={token ? <CuttingPlan /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  )
}

export default App
