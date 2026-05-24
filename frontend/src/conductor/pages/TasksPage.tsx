import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, updateDoc, doc, serverTimestamp, query, where,
} from 'firebase/firestore';
import { ref, update } from 'firebase/database'; // Added for RTDB
import { db, rtdb } from '../firebase/firebase'; // Added rtdb
import { useAuth } from '../hooks/useAuth';
import {
  ListChecks, CheckCircle2, XCircle, RefreshCw,
  MapPin, Bus, User, Clock, Inbox, Calendar, RotateCcw
} from 'lucide-react';
import '../../styles/tasks.css';

type AssignmentStatus = 'pending' | 'approved' | 'rejected';

interface DailyAssignment {
  id: string;
  assignmentId: string;
  busId: string;
  busNo: string;
  conductorId: string;
  conductorName: string;
  createdAt: number;
  date: string;
  ownerId: string;
  routeName: string;
  status: AssignmentStatus;
}

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  pending:  'Pending Review',
  approved: 'Accepted',
  rejected: 'Declined',
};

const TasksPage: React.FC = () => {
  const { conductor } = useAuth();
  const [assignments, setAssignments] = useState<DailyAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | AssignmentStatus>('all');
  const [acting, setActing] = useState<string | null>(null);

  const fetchAssignments = async () => {
    if (!conductor) return;
    setLoading(true);
    try {
      const conductorId = (conductor as any).id;
      const snap = await getDocs(
        query(collection(db, 'daily_assignments'), where('conductorId', '==', conductorId))
      );
      const data: DailyAssignment[] = snap.docs.map((d) => {
        const v = d.data() as any;
        return {
          id:           d.id,
          assignmentId:  v.assignmentId  || d.id,
          busId:         v.busId         || '',
          busNo:         v.busNo         || '',
          conductorId:   v.conductorId   || '',
          conductorName: v.conductorName || (conductor as any).name || '',
          createdAt:     v.createdAt?.seconds ? v.createdAt.seconds * 1000 : Date.parse(v.createdAt) || Date.now(),
          date:          v.date          || '',
          ownerId:       v.ownerId        || '',
          routeName:     v.routeName      || '',
          status:        (v.status as AssignmentStatus) || 'pending',
        };
      });
      data.sort((a, b) => b.createdAt - a.createdAt);
      setAssignments(data);
    } catch (err: any) {
      console.error('FETCH ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, [conductor]);

  const updateStatus = async (a: DailyAssignment, status: AssignmentStatus) => {
    setActing(a.id);
    try {
      // 1. Update Firestore Assignment Status
      await updateDoc(doc(db, 'daily_assignments', a.id), {
        status,
        updatedAt: serverTimestamp(),
      });

      // 2. Update Realtime Database for Tracking
      if (a.busId) {
        const isNowTracking = status === 'approved'; // true  tracking 

        // Update busStatus in RTDB
        const statusRef = ref(rtdb, `busStatus/${a.busId}`);
        await update(statusRef, {
          isTracking: isNowTracking, // 'rejected' or 'pending'  false 
          lastUpdated: Date.now()
        });
        
        // Tracking stop location status 'inactive' 
        if (!isNowTracking) {
          const locRef = ref(rtdb, `busLocations/${a.busId}`);
          await update(locRef, {
            status: 'inactive' 
          });
        } else {
          //  'approved' location active
          const locRef = ref(rtdb, `busLocations/${a.busId}`);
          await update(locRef, {
            lat: 0, 
            lng: 0,
            status: 'active'
          });
        }
      }

      setAssignments(prev => prev.map(t => t.id === a.id ? { ...t, status } : t));
    } catch (err) {
      console.error("Update Error:", err);
      alert('Update failed.');
    } finally {
      setActing(null);
    }
  };

  const filtered = assignments.filter(a => filter === 'all' || a.status === filter);
  const stats = {
    total:    assignments.length,
    pending:  assignments.filter(a => a.status === 'pending').length,
    approved: assignments.filter(a => a.status === 'approved').length,
    rejected: assignments.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="tp-wrap">
      <div className="tp-header-banner">
        <div className="tp-header-text">
          <h2><ListChecks size={26} className="text-primary-icon" /> Duty Roster</h2>
          <p>Review and manage your active bus route assignments instantly.</p>
        </div>
        <button className="tp-refresh-btn" onClick={fetchAssignments} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-anim' : ''} /> Synchronize
        </button>
      </div>

      <div className="tp-stats-matrix">
        <div className="tp-stat-card card-total">
          <div className="stat-icon-wrap"><Inbox size={18} /></div>
          <div className="stat-info">
            <span className="stat-count">{stats.total}</span>
            <span className="stat-label">Total Assigned</span>
          </div>
        </div>
        <div className="tp-stat-card card-pending">
          <div className="stat-icon-wrap"><Clock size={18} /></div>
          <div className="stat-info">
            <span className="stat-count">{stats.pending}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </div>
        <div className="tp-stat-card card-approved">
          <div className="stat-icon-wrap"><CheckCircle2 size={18} /></div>
          <div className="stat-info">
            <span className="stat-count">{stats.approved}</span>
            <span className="stat-label">Accepted Duties</span>
          </div>
        </div>
        <div className="tp-stat-card card-rejected">
          <div className="stat-icon-wrap"><XCircle size={18} /></div>
          <div className="stat-info">
            <span className="stat-count">{stats.rejected}</span>
            <span className="stat-label">Declined Duties</span>
          </div>
        </div>
      </div>

      <div className="tp-filter-bar">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} className={`tp-tab-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            <span className={`pill-dot dot-${f}`} />
            {f === 'all' ? 'All Shifts' : STATUS_LABEL[f as AssignmentStatus]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="tp-loading-state">
          <div className="pulse-spinner" />
          <p>Fetching secure terminal logs…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="tp-empty-state">
          <div className="empty-icon-shield"><Inbox size={42} /></div>
          <h3>No shifts matching criteria</h3>
          <p>You don't have any current schedule entries inside this category filter.</p>
        </div>
      ) : (
        <div className="tp-cards-grid">
          {filtered.map(a => (
            <article key={a.id} className={`tp-premium-card status-${a.status}`}>
              <div className="tp-premium-inner">
                <div className="tp-premium-head">
                  <span className={`tp-status-tag tag-${a.status}`}>
                    <span className="tag-inner-dot" />
                    {STATUS_LABEL[a.status]}
                  </span>
                  <div className="tp-timestamp">
                    <Clock size={12} />
                    <span>{new Date(a.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>

                <div className="tp-route-display">
                  <div className="route-icon-indicator"><MapPin size={16} /></div>
                  <div className="route-title-meta">
                    <label>Assigned Route</label>
                    <h4>{a.routeName || 'Unassigned Path'}</h4>
                  </div>
                </div>

                <div className="tp-grid-specifications">
                  <div className="spec-tile">
                    <Bus size={14} />
                    <div>
                      <span className="spec-label">Fleet Bus No.</span>
                      <span className="spec-value text-uppercase">{a.busNo || a.busId || '—'}</span>
                    </div>
                  </div>
                  <div className="spec-tile">
                    <Calendar size={14} />
                    <div>
                      <span className="spec-label">Target Date</span>
                      <span className="spec-value">{a.date || '—'}</span>
                    </div>
                  </div>
                  <div className="spec-tile full-span">
                    <User size={14} />
                    <div>
                      <span className="spec-label">Assigned Operator</span>
                      <span className="spec-value-name">{a.conductorName || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tp-premium-footer">
                {a.status === 'pending' ? (
                  <div className="action-button-cluster">
                    <button className="action-btn btn-reject-premium" disabled={acting === a.id} onClick={() => updateStatus(a, 'rejected')}>
                      Decline
                    </button>
                    <button className="action-btn btn-accept-premium" disabled={acting === a.id} onClick={() => updateStatus(a, 'approved')}>
                      {acting === a.id ? <span className="mini-loader" /> : <>Accept Duties</>}
                    </button>
                  </div>
                ) : (
                  <div className="action-button-cluster">
                    <button className="action-btn btn-reopen-premium" disabled={acting === a.id} onClick={() => updateStatus(a, 'pending')}>
                      <RotateCcw size={13} /> Re-evaluate Shift
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;