import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import { AnimatePresence, motion } from 'framer-motion';

import Landing from './pages/Landing';
import About from './pages/About';
import Auth from './pages/Auth';
import Docs from './pages/Docs';
import Pricing from './pages/Pricing';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Workflows from './pages/Workflows';
import WorkflowBuilder from './pages/WorkflowBuilder';
import Templates from './pages/Templates';
import Logs from './pages/Logs';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import Upgrade from './pages/Upgrade';

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
        <Route path="/docs" element={
          <motion.div {...pageTransition} className="h-full">
            <Docs />
          </motion.div>
        } />
        <Route path="/pricing" element={
          <motion.div {...pageTransition} className="h-full">
            <Pricing />
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
          <Route path="/workflows" element={
            <motion.div key="workflows" {...pageTransition} className="h-full bg-background min-h-screen">
              <Workflows />
            </motion.div>
          } />
          <Route path="/workflows/:id" element={
            <motion.div key="workflow" {...pageTransition} className="h-full">
              <WorkflowBuilder />
            </motion.div>
          } />
          <Route path="/workflows/new" element={
            <motion.div key="new-workflow" {...pageTransition} className="h-full">
              <WorkflowBuilder />
            </motion.div>
          } />
          <Route path="/templates" element={
            <motion.div key="templates" {...pageTransition} className="h-full bg-background min-h-screen">
              <Templates />
            </motion.div>
          } />
          <Route path="/logs" element={
            <motion.div key="logs" {...pageTransition} className="h-full bg-background min-h-screen">
              <Logs />
            </motion.div>
          } />
          <Route path="/integrations" element={
            <motion.div key="integrations" {...pageTransition} className="h-full bg-background min-h-screen">
              <Integrations />
            </motion.div>
          } />
          <Route path="/settings" element={
            <motion.div key="settings" {...pageTransition} className="h-full bg-background min-h-screen">
              <Settings />
            </motion.div>
          } />
          <Route path="/upgrade" element={
            <motion.div key="upgrade" {...pageTransition} className="h-full bg-background min-h-screen">
              <Upgrade />
            </motion.div>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
