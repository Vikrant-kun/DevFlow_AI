import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { AnimatePresence, motion } from 'framer-motion';

import Landing from './pages/Landing';
import About from './pages/About';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={
          <motion.div {...pageTransition} className="h-full">
            <Landing />
          </motion.div>
        } />
        <Route path="/auth" element={
          <motion.div {...pageTransition} className="h-full">
            <Auth />
          </motion.div>
        } />
        <Route path="/about" element={
          <motion.div {...pageTransition} className="h-full">
            <About />
          </motion.div>
        } />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <motion.div {...pageTransition} className="h-full">
              <Onboarding />
            </motion.div>
          </ProtectedRoute>
        } />

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={
            <motion.div key="dashboard" {...pageTransition} className="h-full">
              <Dashboard />
            </motion.div>
          } />
          <Route path="/workflows/:id" element={
            <motion.div key="workflow" {...pageTransition} className="h-full">
              <WorkflowBuilder />
            </motion.div>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
