import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../hooks/useAuth';
import type { PageKey } from '../types';
import {
  UserCog, Ticket, QrCode, ListChecks, Sun, Cloud, Bus, ArrowRight,
  TrendingUp, MapPin, Clock,
} from 'lucide-react';
import '../../styles/home.css';

interface HomePageProps {
  onNavigate: (page: PageKey) => void;
}

const cards: { key: PageKey; icon: React.ReactNode; title: string; desc: string; accent: string }[] = [
  { key: 'profile', icon: <UserCog size={22} />,    title: 'Manage Profile', desc: 'Edit your photo, contact and route details',    accent: 'card-accent-indigo' },
  { key: 'booking', icon: <Ticket size={22} />,     title: 'Seat Booking',   desc: 'See which seats passengers booked on your bus', accent: 'card-accent-green'  },
  { key: 'scanqr',  icon: <QrCode size={22} />,     title: 'Scan QR',        desc: 'Verify passenger tickets in one tap',            accent: 'card-accent-amber'  },
  { key: 'tasks',   icon: <ListChecks size={22} />, title: 'Your Routes',    desc: 'Approve or reject routes from your owner',       accent: 'card-accent-pink'   },
];

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { conductor } = useAuth();
  const [now, setNow] = useState(new Date());
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!conductor) return;
    const fetchRoute = async () => {
      try {
        const conductorId = (conductor as any).id;
        
        // conductorId and status qyery used
        const q = query(
          collection(db, 'daily_assignments'),
          where('conductorId', '==', conductorId),
          where('status', '==', 'approved')
        );
        
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          // සියලුම approved routes ලබාගෙන දින අනුව අලුත්ම එක තෝරාගන්න
          const routes = snap.docs.map(doc => doc.data());
          
          // දින අනුව sort කිරීම (අලුත්ම දිනය මුලට)
          routes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setActiveRoute(routes[0].routeName || null);
        } else {
          setActiveRoute(null);
        }
      } catch (err) {
        console.error('Route fetch error:', err);
      }
    };
    fetchRoute();
  }, [conductor]);

  const hour = now.getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const today = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const shift = hour < 14 ? 'Morning shift' : hour < 20 ? 'Evening shift' : 'Night shift';

  return (
    <div className="home-page">
      <div className="hero-panel hero-panel-rich">
        <div className="hero-glow" />
        <div className="hero-glow2" />
        <div className="hero-pattern" />

        <div className="hero-row">
          <div style={{ flex: 1 }}>
            <div className="hero-eyebrow">
              <span className="hero-dot" /> {today} · {greet.toLowerCase()}
            </div>
            <h1 className="hero-title">{greet}, {conductor?.name?.split(' ')[0] || 'Conductor'} 👋</h1>
            <p className="hero-sub">
              You're signed in to BusLine Pro. Here's a quick look at your day —
              manage seats, validate tickets and review routes assigned by your owner.
            </p>
            <div className="hero-actions">
              <button className="btn-light" onClick={() => onNavigate('booking')}>
                <Ticket size={16} /> View Seat Map
              </button>
              <button className="btn-ghost-light" onClick={() => onNavigate('scanqr')}>
                <QrCode size={16} /> Scan a Ticket <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="hero-stat-strip">
            <div className="hero-stat">
              <Bus size={18} />
              <div>
                <small>Active Route</small>
                <strong>
                  {activeRoute
                    ? activeRoute
                    : <span style={{ opacity: .65, fontWeight: 400, fontSize: '.85em' }}>Not assigned</span>
                  }
                </strong>
              </div>
            </div>
            <div className="hero-stat">
              <Clock size={18} />
              <div>
                <small>Local Time</small>
                <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{timeStr}</strong>
              </div>
            </div>
            <div className="hero-stat">
              {hour < 18 ? <Sun size={18} /> : <Cloud size={18} />}
              <div>
                <small>Shift</small>
                <strong>{shift}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-title">
        <span>Quick actions</span>
        <small>Jump straight into what you need</small>
      </div>

      <div className="dash-grid">
        {cards.map(card => (
          <button
            key={card.key}
            className={`dash-card ${card.accent}`}
            onClick={() => onNavigate(card.key)}
          >
            <span className="dash-card-icon">{card.icon}</span>
            <div className="dash-card-body">
              <strong>{card.title}</strong>
              <p>{card.desc}</p>
            </div>
            <ArrowRight size={16} className="dash-card-arrow" />
          </button>
        ))}
      </div>

      <div className="home-tip-strip">
        <div className="home-tip">
          <TrendingUp size={18} />
          <div>
            <strong>Pro tip</strong>
            <p>Refresh the seat map before each trip so cancellations sync from the booking system.</p>
          </div>
        </div>
        <div className="home-tip">
          <MapPin size={18} />
          <div>
            <strong>Today's route</strong>
            <p>
              {activeRoute
                ? `Today you're on: ${activeRoute}`
                : "Your owner hasn't assigned a route yet — check Your Routes."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
