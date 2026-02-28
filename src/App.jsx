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
import PixelSprite from './components/PixelSprite';

const GlobalLoadingScreen = ({ isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: '#000', zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'
        }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 0.5, ease: "steps(2)" }}
          style={{ marginBottom: '2rem' }}
        >
          <PixelSprite templateName="goblin" baseColor="#4ade80" scale={4} />
        </motion.div>
        <motion.h2
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="text-gradient"
          style={{ fontSize: '1.2rem', textShadow: '2px 2px #000' }}
        >
          Esperando combate...
        </motion.h2>
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
      setTransitioning(true);
      setTimeout(() => {
        setSession(newSession);
      }, 3000); // Swap session midway through 6s loading
      setTimeout(() => {
        setTransitioning(false);
      }, 6000); // 6 seconds total loading time
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

    const startLoad = Date.now();
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      handleSessionChange(s);
      const elapsed = Date.now() - startLoad;
      const remaining = Math.max(0, 5000 - elapsed);
      setTimeout(() => setLoading(false), remaining);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      // Don't override guest session via auth state changes if guest is forced
      if (localStorage.getItem('questbloom_guest') !== 'true') {
        handleSessionChange(s);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <GameProvider session={session}>
      <GlobalLoadingScreen isVisible={loading || transitioning} />
      {session && <Navbar />}
      <main className={session ? "container-with-nav" : "container-full"}>
        <AnimatePresence mode="wait">
          {(!loading && !transitioning) && (
            <motion.div
              key={location.pathname + (session ? 'in' : 'out')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
