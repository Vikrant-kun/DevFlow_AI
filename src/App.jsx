import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
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
import Profile from './pages/Profile';
import Team from './pages/Team';
import SSOCallback from './pages/SSOCallback';

// ─────────────────────────────────────────────────────────────────────────────
// Page transition wrapper
// ─────────────────────────────────────────────────────────────────────────────
const transition = { duration: 0.22, ease: 'easeOut' };
const variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const Page = ({ children }) => (
  <motion.div variants={variants} initial="initial" animate="animate" exit="exit" transition={transition} className="h-full">
    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedOutlet — sits INSIDE Layout, so only page content fades.
// The sidebar (also inside Layout) is completely untouched by this.
// ─────────────────────────────────────────────────────────────────────────────
const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        className="h-full"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Public shell — AnimatePresence only for public pages
// ─────────────────────────────────────────────────────────────────────────────
const PublicShell = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route path="/auth" element={<Page><Auth /></Page>} />
        <Route path="/about" element={<Page><About /></Page>} />
        <Route path="/docs" element={<Page><Docs /></Page>} />
        <Route path="/pricing" element={<Page><Pricing /></Page>} />
        <Route path="/sso-callback" element={<SSOCallback />} />
        <Route path="/onboarding" element={
          <ProtectedRoute><Page><Onboarding /></Page></ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Root router — splits public vs app routes so Layout never remounts
// ─────────────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* ── Public (no sidebar) ── */}
    <Route path="/" element={<Page><Landing /></Page>} />
    <Route path="/auth" element={<Page><Auth /></Page>} />
    <Route path="/about" element={<Page><About /></Page>} />
    <Route path="/docs" element={<Page><Docs /></Page>} />
    <Route path="/pricing" element={<Page><Pricing /></Page>} />
    <Route path="/sso-callback" element={<SSOCallback />} />
    <Route path="/onboarding" element={
      <ProtectedRoute><Page><Onboarding /></Page></ProtectedRoute>
    } />

    {/*
         * ── App shell (sidebar lives here) ──
         *
         * The key insight: <Layout /> is the element on this route, so React
         * keeps the SAME Layout instance mounted for all child routes.
         * Sidebar (rendered inside Layout) never remounts or refreshes.
         *
         * AnimatedOutlet sits inside Layout and handles ONLY the page-content
         * fade — the sidebar is invisible to that AnimatePresence.
         */}
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route element={<AnimatedOutlet />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/workflows/new" element={<WorkflowBuilder />} />
        <Route path="/workflows/:id" element={<WorkflowBuilder />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/team" element={<Team />} />
      </Route>
    </Route>
  </Routes>
);

// ─────────────────────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SidebarProvider>
          <AppRoutes />
        </SidebarProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;