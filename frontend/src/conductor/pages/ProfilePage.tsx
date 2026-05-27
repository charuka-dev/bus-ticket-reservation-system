import React, { useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import {
  Save, CheckCircle, Camera, Lightbulb, ShieldCheck, Phone, Mail,
  MapPin, AtSign, IdCard, X, RefreshCw
} from 'lucide-react';
import '../../styles/profile.css';

const TIPS = [
  "Greet every passenger — a smile fills the bus faster than any ad.",
  "Always re-check the seat map after a cancellation to keep boarding smooth.",
  "Keep your phone charged: the QR scanner can drain battery on long trips.",
  "Confirm route changes with your owner in writing through the Routes page.",
  "Hydrate often — long shifts feel shorter when you take micro breaks.",
];

const ProfilePage: React.FC = () => {
  const { conductor, login } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [form, setForm] = useState({
    name: conductor?.name || '',
    email: conductor?.email || '',
    phone: conductor?.phone || '',
    route: conductor?.route || '',
    photoUrl: conductor?.photoUrl || '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));

  const initials = form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  // 💡 Magic function to compress the image into a smaller size suitable for Firestore
  const resizeAndCompressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150; // This size is more than enough for a profile picture
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Quality එක 0.6 (60%)  Size 10KB-20KB . Firestore save quickly
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        resolve(compressedBase64);
      };
    });
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const rawBase64 = reader.result as string;
      setSaving(true); // compress time loading
      
      // picture compress
      const optimizedImage = await resizeAndCompressImage(rawBase64);
      setForm(prev => ({ ...prev, photoUrl: optimizedImage }));
      setSaving(false);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => { 
    setForm(prev => ({ ...prev, photoUrl: '' })); 
    setSaved(false); 
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conductor) return;
    setSaving(true);

    const profileData = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      route: form.route,
      photoUrl: form.photoUrl || '',
    };

    try {
      // Try to save at the UID path first (creates or merges — never throws "no document")
      await setDoc(doc(db, 'conductors', conductor.id), profileData, { merge: true });

      // If conductor's Firestore doc lives under a different ID (email-keyed),
      // also update that document so both stay in sync.
      if (conductor.email) {
        const q = query(
          collection(db, 'conductors'),
          where('email', '==', conductor.email)
        );
        const snap = await getDocs(q);
        snap.forEach(d => {
          if (d.id !== conductor.id) {
            setDoc(doc(db, 'conductors', d.id), profileData, { merge: true });
          }
        });
      }

      login({ ...conductor, ...form });
      setSaved(true);
    } catch (err: any) {
      console.error(err);
      alert('Error: ' + (err.message || 'Could not save profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-layout">
      {/* Left Column: Avatar & Quick Info Widgets */}
      <aside className="profile-aside">
        <div className="profile-avatar-card">
          <div className="profile-avatar-wrap">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar">{initials || 'CO'}</div>
            )}
            <button type="button" className="profile-avatar-edit" onClick={() => fileRef.current?.click()} title="Change photo">
              <Camera size={14} />
            </button>
            {form.photoUrl && (
              <button type="button" className="profile-avatar-remove" onClick={removePhoto} title="Remove photo">
                <X size={12} />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          </div>
          <h3 className="profile-name">{form.name || 'Conductor'}</h3>
          <span className="profile-role-badge">Verified Operator</span>
        </div>

        <div className="advice-card">
          <div className="advice-head">
            <div className="advice-title"><Lightbulb size={16} /><span>Daily Tip</span></div>
            <button type="button" className="advice-shuffle" onClick={() => setTipIdx(i => (i + 1) % TIPS.length)} title="Next Tip">
              <RefreshCw size={13} />
            </button>
          </div>
          <p>"{TIPS[tipIdx]}"</p>
        </div>

        <div className="security-card">
          <ShieldCheck size={18} className="security-icon" />
          <div className="security-text">
            <strong>Account Secured</strong>
            <p>Admin verified account profile.</p>
          </div>
        </div>
      </aside>

      {/* Right Column: Interactive Details Form */}
      <main className="profile-form-card">
        <div className="profile-form-header">
          <h2>Personal Profile</h2>
          <p>Manage your account credentials, terminal ID details, and active operational routes.</p>
        </div>

        {saved && (
          <div className="save-success-banner">
            <CheckCircle size={16} /> <span>Your changes have been safely updated.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="profile-actual-form">
          <div className="form-grid-row">
            <div className="form-group-premium">
              <label><IdCard size={13} /> Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-control-premium" placeholder="E.g., John Doe" required />
            </div>
            
            <div className="form-group-premium">
              <label><AtSign size={13} /> Employee ID (System)</label>
              <input value={conductor?.employeeId || 'Not Registered'} readOnly className="form-control-premium readonly" />
            </div>
          </div>

          <div className="form-grid-row">
            <div className="form-group-premium">
              <label><Mail size={13} /> Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className="form-control-premium" placeholder="name@domain.com" required />
            </div>
            
            <div className="form-group-premium">
              <label><Phone size={13} /> Phone Number</label>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="form-control-premium" placeholder="+94 7X XXX XXXX" />
            </div>
          </div>

          <div className="form-group-premium">
            <label><AtSign size={13} /> Terminal Account Username</label>
            <input value={conductor?.username || '—'} readOnly className="form-control-premium readonly" />
          </div>

          <div className="form-group-premium">
            <label><MapPin size={13} /> Main Route Selection</label>
            <div className="select-wrapper-premium">
              <select name="route" value={form.route} onChange={handleChange} className="form-control-premium">
                <option value="">Choose your primary operation path…</option>
                <option value="Route 06 – Negombo → Colombo">Route 06 – Negombo → Colombo</option>
                <option value="Route 15 – Colombo → Kandy">Route 15 – Colombo → Kandy</option>
                <option value="Route 32 – Galle → Colombo">Route 32 – Galle → Colombo</option>
                <option value="Route 48 – Kurunegala → Colombo">Route 48 – Kurunegala → Colombo</option>
              </select>
            </div>
          </div>

          <div className="profile-form-actions">
            <button type="button" className="btn-premium btn-cancel-premium" onClick={() => {
              setForm({ name: conductor?.name || '', email: conductor?.email || '', phone: conductor?.phone || '', route: conductor?.route || '', photoUrl: conductor?.photoUrl || '' });
              setSaved(false);
            }}>
              Reset Form
            </button>
            <button type="submit" className="btn-premium btn-save-premium" disabled={saving}>
              {saving ? <span className="premium-spinner" /> : <Save size={15} />}
              {saving ? 'Saving updates…' : 'Save Profiles'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;