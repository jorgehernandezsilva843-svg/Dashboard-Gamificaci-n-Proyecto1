import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Auth from './components/auth/Auth';
import Dashboard from './components/dashboard/Dashboard';
import Navbar from './components/layout/Navbar';
import TaskManager from './components/tasks/TaskManager';
import Garden from './components/garden/Garden';
import Store from './components/store/Store';
import FocusPlayer from './components/FocusPlayer';
import { GameProvider } from './context/GameContext';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Check if user clicked Guest Mode
    if (localStorage.getItem('questbloom_guest') === 'true') {
      setSession({ user: { id: 'guest-user', email: 'guest@questbloom.com' } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex-center min-h-screen">
        <div className="animate-pulse-glow" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
      </div>
    );
  }

  return (
    <GameProvider session={session}>
      {session && <Navbar />}
      <main className={session ? "container-with-nav" : "container-full"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={session ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={session ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Portal snap feel
            style={{ width: '100%', height: '100%' }}
          >
            <Routes>
              <Route
                path="/"
                element={session ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />}
              />
              <Route
                path="/auth"
                element={!session ? <Auth /> : <Navigate to="/dashboard" />}
              />
              <Route
                path="/dashboard"
                element={session ? <Dashboard session={session} /> : <Navigate to="/auth" />}
              />
              <Route
                path="/tasks"
                element={session ? <TaskManager /> : <Navigate to="/auth" />}
              />
              <Route
                path="/garden"
                element={session ? <Garden /> : <Navigate to="/auth" />}
              />
              <Route
                path="/store"
                element={session ? <Store /> : <Navigate to="/auth" />}
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {session && <FocusPlayer />}
    </GameProvider>
  );
}

export default App;
