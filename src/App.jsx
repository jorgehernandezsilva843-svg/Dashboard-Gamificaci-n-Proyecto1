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
import PomodoroTimer from './components/PomodoroTimer';
import { GameProvider } from './context/GameContext';

// 8-Bit Runner Transition Component
const RunnerTransition = ({ isVisible, direction = 'right' }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ x: direction === 'right' ? '-100vw' : '100vw' }}
        animate={{ x: direction === 'right' ? '100vw' : '-100vw' }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'linear' }}
        style={{
          position: 'fixed', top: '50%', left: 0,
          transform: 'translateY(-50%)', zIndex: 9999,
          pointerEvents: 'none',
          fontSize: '4rem',
        }}
      >
        🏃‍♂️
      </motion.div>
    )}
  </AnimatePresence>
);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [transDirection, setTransDirection] = useState('right');
  const location = useLocation();

  const handleSessionChange = (newSession) => {
    if (!!newSession !== !!session && !loading) {
      setTransDirection(newSession ? 'right' : 'left');
      setTransitioning(true);
      setTimeout(() => {
        setSession(newSession);
      }, 750); // Mid-point of the 1.5s runner animation
      setTimeout(() => {
        setTransitioning(false);
      }, 1500);
    } else {
      setSession(newSession);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('questbloom_guest') === 'true') {
      handleSessionChange({ user: { id: 'guest-user', email: 'guest@questbloom.com' } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      handleSessionChange(s);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      // Don't override guest session via auth state changes if guest is forced
      if (localStorage.getItem('questbloom_guest') !== 'true') {
        handleSessionChange(s);
      }
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
      <RunnerTransition isVisible={transitioning} direction={transDirection} />
      {session && <Navbar />}
      <main className={session ? "container-with-nav" : "container-full"}>
        <AnimatePresence mode="wait">
          {!transitioning && (
            <motion.div
              key={location.pathname + (session ? 'in' : 'out')}
              initial={{ filter: 'blur(10px) grayscale(100%)', opacity: 0 }}
              animate={{ filter: 'blur(0px) grayscale(0%)', opacity: 1 }}
              exit={{ filter: 'blur(10px) grayscale(100%)', opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              <Routes>
                <Route path="/" element={session ? <Navigate to="/dashboard" /> : <Navigate to="/auth" />} />
                <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/auth" />} />
                <Route path="/tasks" element={session ? <TaskManager /> : <Navigate to="/auth" />} />
                <Route path="/garden" element={session ? <Garden /> : <Navigate to="/auth" />} />
                <Route path="/store" element={session ? <Store /> : <Navigate to="/auth" />} />
              </Routes>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {session && <PomodoroTimer />}
    </GameProvider>
  );
}

export default App;
