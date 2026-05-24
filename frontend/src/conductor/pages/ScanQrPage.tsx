import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { Booking } from '../types';
import {
  QrCode, CheckCircle, XCircle, RotateCcw, Camera, ShieldCheck, Inbox,
  AlertCircle, Bus, Armchair, User, Info, Keyboard, LogIn, Award
} from 'lucide-react';
import '../../styles/scan.css';

interface ScanRecord {
  id: string;
  name: string;
  seat: string;
  time: string;
  valid: boolean;
}

type Verdict =
  | { status: 'idle' }
  | { status: 'starting' }
  | { status: 'scanning' }
  | { status: 'verifying'; code: string }
  | { status: 'valid'; booking: Booking; code: string }
  | { status: 'updating'; booking: Booking; code: string }
  | { status: 'invalid'; reason: string; code: string };

const SCANNER_ID = 'qr-scanner-region';

const ScanQrPage: React.FC = () => {
  const [verdict, setVerdict] = useState<Verdict>({ status: 'idle' });
  const [busNoInput, setBusNoInput] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const runningRef = useRef(false);

  const stopScanner = async () => {
    if (scannerRef.current && runningRef.current) {
      try { await scannerRef.current.stop(); await scannerRef.current.clear(); } catch { }
      runningRef.current = false;
    }
    scannerRef.current = null;
  };

  useEffect(() => () => { stopScanner(); }, []);

  useEffect(() => {
    if (verdict.status !== 'starting') return;

    let cancelled = false;

    const launch = async () => {
      await new Promise(r => requestAnimationFrame(r));
      if (cancelled) return;

      try {
        const instance = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = instance;

        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decoded) => {
            await stopScanner();
            verifyTicket(decoded.trim());
          },
          () => { },
        );

        if (!cancelled) {
          runningRef.current = true;
          setVerdict({ status: 'scanning' });
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('Camera error:', err);
        let msg = 'Could not access camera.';
        if (err?.message?.toLowerCase().includes('permission')) {
          msg = 'Camera permission denied. Allow camera access in browser settings and try again.';
        } else if (err?.message) {
          msg = err.message;
        }
        setCameraError(msg);
        setVerdict({ status: 'idle' });
      }
    };

    launch();
    return () => { cancelled = true; };
  }, [verdict.status]);

  const verifyTicket = async (code: string) => {
    setVerdict({ status: 'verifying', code });
    try {
      let targetBusId = '';
      let activeBusNo = '';

      if (busNoInput.trim()) {
        const busQuery = query(collection(db, 'buses'), where('busNo', '==', busNoInput.trim()));
        const busSnap = await getDocs(busQuery);
        
        if (busSnap.empty) {
          recordResult(code, false, `Bus registration number "${busNoInput.trim()}" does not exist.`);
          return;
        } else {
          targetBusId = busSnap.docs[0].id;
          activeBusNo = busSnap.docs[0].data().busNo || busNoInput.trim();
        }
      }

      let snap = await getDocs(query(collection(db, 'bookings'), where('qrCode', '==', code)));
      if (snap.empty) {
        snap = await getDocs(query(collection(db, 'bookings'), where('bookingId', '==', code)));
      }

      if (snap.empty) { 
        recordResult(code, false, 'Invalid Ticket. Ticket reference code not found in system database.'); 
        return; 
      }

      const d = snap.docs[0];
      const v = d.data() as any;
      
      const booking: Booking = {
        id: d.id,
        seatNumber: String(v.seatNo || v.seatNumber || '—'),
        passengerName: v.passengerName || v.passenger || `Customer (${v.customerId || 'Unknown'})`,
        passengerId: v.customerId || v.passengerId || '—',
        route: v.routeId || v.route || '—',
        date: v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—',
        status: v.status || 'pending',
        busId: v.busId || '—',
        qrCode: v.qrCode || v.bookingId || code,
      };

      if (booking.status === 'cancelled') { 
        recordResult(code, false, 'Ticket rejected. This booking has been cancelled.', booking); 
        return; 
      }
      
      if (booking.status === 'boarded') {
        recordResult(code, false, 'Ticket Already Used! This passenger has already boarded the bus.', booking);
        return;
      }

      if (targetBusId && booking.busId !== targetBusId) {
        recordResult(code, false, `Access Denied. This ticket belongs to a different bus, not for ${activeBusNo}.`, booking); 
        return;
      }

      setVerdict({ status: 'valid', booking, code });
    } catch (err) {
      console.error(err);
      recordResult(code, false, 'Secure network timeout. Connection failed.');
    }
  };

  const handleApproveBoarding = async (booking: Booking, code: string) => {
    setVerdict({ status: 'updating', booking, code });
    try {
      const bookingDocRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingDocRef, { status: 'boarded' });

      addHistory(booking.passengerName, booking.seatNumber, true);
      setVerdict({ status: 'idle' });
      setManualCode('');
    } catch (err) {
      console.error("Update Error: ", err);
      recordResult(code, false, 'Failed to update booking status in database.', booking);
    }
  };

  const addHistory = (name: string, seat: string, valid: boolean) => {
    setHistory(prev => [{
      id: Date.now().toString(), name, seat: seat || '—', valid,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }, ...prev].slice(0, 8));
  };

  const recordResult = (code: string, valid: boolean, reason: string, booking?: Booking) => {
    setVerdict(valid && booking ? { status: 'valid', booking, code } : { status: 'invalid', reason, code });
    if (!valid) {
      addHistory(booking?.passengerName || (booking?.passengerId ? `ID: ${booking.passengerId}` : 'Unknown'), booking?.seatNumber || '—', valid);
    }
  };

  const startScan = () => {
    setCameraError('');
    setVerdict({ status: 'starting' });
  };

  const handleReset = async () => { await stopScanner(); setVerdict({ status: 'idle' }); setManualCode(''); };

  const handleManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    verifyTicket(manualCode.trim());
  };

  const showCamera = verdict.status === 'starting' || verdict.status === 'scanning';
  const isVerifying = verdict.status === 'verifying' || verdict.status === 'updating';

  const totalScanned = history.length;
  const successfulScans = history.filter(h => h.valid).length;

  return (
    <div className="scan-page">
      <div className="page-header">
        <h2><QrCode size={24} /> Gate Ticket Validator</h2>
        <p>Scan passenger QR code to validate and approve boarding.</p>
      </div>

      <div className="scan-context-bar">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label><Bus size={14} /> Assign Current Bus Number (Mandatory)</label>
          <input className="form-control text-uppercase" value={busNoInput} onChange={e => setBusNoInput(e.target.value)} placeholder="e.g. NC-5566" />
        </div>
        <button className={`btn ${showManual ? 'btn-dark' : 'btn-secondary'} btn-sm`} onClick={() => setShowManual(s => !s)} type="button">
          <Keyboard size={16} /> {showManual ? 'Hide Manual Input' : 'Manual Entry'}
        </button>
      </div>

      {showManual && (
        <form className="manual-entry-bar" onSubmit={handleManual}>
          <input className="form-control" value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="Enter Ticket ID (e.g. QR_BOOK_002)..." />
          <button type="submit" className="btn btn-primary" disabled={!manualCode.trim()}>Verify Code</button>
        </form>
      )}

      <div className="scan-layout">
        {/* ── Left Side: Camera Panel ── */}
        <div className="scan-camera-panel">
          <div className="scan-camera-header">
            <h3><Camera size={16} /> Live Scanner Viewport</h3>
            {verdict.status === 'scanning' && <span className="live-badge"><span className="live-dot" /> Scanning</span>}
          </div>

          <div className="scan-camera-body">
            {showCamera && (
              <div className="scanner-wrapper">
                <div className="scanner-overlay-frame">
                  <div className="scanner-target-box">
                    <div className="scanner-corner-tr" />
                    <div className="scanner-corner-bl" />
                    <div className="scanner-laser" />
                  </div>
                </div>
                <div id={SCANNER_ID} style={{ width: '100%', minHeight: 320, background: '#000' }} />
              </div>
            )}

            {/* 🌟 UI UPDATE: Launch Scanner Button  Idle card middle set */}
            {!showCamera && !isVerifying && verdict.status !== 'valid' && verdict.status !== 'invalid' && (
              <div className="scan-idle clickable-idle" onClick={startScan}>
                <div className="scan-idle-icon"><QrCode size={36} /></div>
                <h3>Scanner Ready</h3>
                <p>Align the customer's QR ticket within the viewfinder frame to scan.</p>
                <button className="btn btn-primary btn-launch-inside" type="button">
                  <Camera size={16} /> Launch Camera Scanner
                </button>
              </div>
            )}

            {/* Dynamic views for result statuses inside the scanner box */}
            {!showCamera && !isVerifying && (verdict.status === 'valid' || verdict.status === 'invalid') && (
              <div className="scan-idle">
                <div className={`scan-idle-icon ${verdict.status === 'valid' ? 'icon-success' : 'icon-danger'}`}>
                  {verdict.status === 'valid' ? <CheckCircle size={36} /> : <XCircle size={36} />}
                </div>
                <h3>{verdict.status === 'valid' ? 'Ticket Verified' : 'Verification Failed'}</h3>
                <p>{verdict.status === 'valid' ? 'Onboarding credentials mapped successfully.' : 'This document could not be validated.'}</p>
              </div>
            )}

            {isVerifying && (
              <div className="scan-verifying">
                <span className="spinner spinner-dark" />
                <p style={{ margin: 0, fontWeight: 500 }}>
                  {verdict.status === 'updating' ? 'Updating seat status...' : 'Querying secure database...'}
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="camera-error">
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> <div>{cameraError}</div>
            </div>
          )}

          {/* Controls visible only during scanner or post-scan sessions */}
          {(showCamera || verdict.status === 'valid' || verdict.status === 'invalid') && (
            <div className="scan-controls">
              {showCamera && (
                <button className="btn btn-danger w-100" onClick={handleReset} type="button">
                  <RotateCcw size={14} /> Kill Camera Session
                </button>
              )}
              
              {verdict.status === 'valid' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <button 
                    className="btn btn-success w-100" 
                    onClick={() => handleApproveBoarding(verdict.booking, verdict.code)} 
                    type="button"
                    style={{ background: '#4f46e5', color: '#fff', fontWeight: 'bold', fontSize: '16px' }}
                  >
                    <LogIn size={18} /> APPROVE & BOARD PASSENGER
                  </button>
                  <button className="btn btn-secondary w-100" onClick={handleReset} type="button">
                    Cancel / Scan Next
                  </button>
                </div>
              )}

              {verdict.status === 'invalid' && (
                <button className="btn btn-secondary w-100" onClick={handleReset} type="button" style={{ background: '#4f46e5', color: '#fff' }}>
                  <RotateCcw size={14} /> Scan Next Passenger
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Right Side: Dynamic Result Panel + Session Logs ── */}
        <div className="scan-right-column">
          {verdict.status !== 'valid' && verdict.status !== 'invalid' && (
            <div className="scan-placeholder-card">
              <div className="placeholder-brand">
                <Award size={20} className="placeholder-icon" />
                <h4>Terminal Guard System Active</h4>
              </div>
              <p>Ready to dispatch passenger flow. Ensure the target bus registration code is mapped accurately prior to gate onboarding approval.</p>
              
              <div className="placeholder-stats-grid">
                <div className="p-stat-box">
                  <span className="p-stat-num">{totalScanned}</span>
                  <span className="p-stat-lbl">Processed</span>
                </div>
                <div className="p-stat-box success">
                  <span className="p-stat-num">{successfulScans}</span>
                  <span className="p-stat-lbl">Boarded OK</span>
                </div>
              </div>
            </div>
          )}

          {(verdict.status === 'valid' || verdict.status === 'invalid') && (
            <div className={`scan-result-panel ${verdict.status === 'valid' ? 'verdict-valid' : 'verdict-invalid'}`}>
              <div className="verdict-header">
                <div className="verdict-icon">
                  {verdict.status === 'valid' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="verdict-label">
                    {verdict.status === 'valid' ? 'PASSED CHECK' : 'ACCESS DENIED'}
                  </div>
                  <div className="verdict-status-sub">
                    {verdict.status === 'valid' ? 'Awaiting Boarding Approval' : 'Validation Error'}
                  </div>
                </div>
              </div>

              <div className="verdict-body">
                <div className="verdict-info-grid">
                  <div className="info-tile full-width">
                    <label><User size={13} /> Customer Reference</label>
                    <div className="info-value">{verdict.status === 'valid' ? verdict.booking.passengerName : 'Unknown'}</div>
                  </div>
                  
                  <div className="info-tile">
                    <label><Armchair size={13} /> Allocated Seat</label>
                    <div className="info-value highlight">{verdict.status === 'valid' && verdict.booking.seatNumber ? `Seat ${verdict.booking.seatNumber}` : '—'}</div>
                  </div>

                  <div className="info-tile">
                    <label><Bus size={13} /> Target Bus Key</label>
                    <div className="info-value">{verdict.status === 'valid' ? verdict.booking.busId : '—'}</div>
                  </div>

                  <div className="info-tile full-width">
                    <label><Info size={13} /> Status State</label>
                    <div className="info-value-sm" style={{ textTransform: 'capitalize', fontWeight: 600, color: verdict.status === 'valid' ? '#16a34a' : '#dc2626' }}>
                      {verdict.status === 'valid' ? 'Valid & Ready for Boarding' : 'Rejected'}
                    </div>
                  </div>
                </div>

                {verdict.status === 'invalid' && (
                  <div className="verdict-reason-box">
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{verdict.reason}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="scan-history">
            <div className="scan-history-head"><ShieldCheck size={16} /> <span>Session Logs ({history.length})</span></div>
            {history.length === 0 ? (
              <div className="scan-history-empty">
                <Inbox size={32} strokeWidth={1.5} style={{ color: 'var(--text-muted)', opacity: 0.6 }} />
                <span>No successful boardings in this session.</span>
              </div>
            ) : (
              <div className="scan-history-list">
                {history.map(h => (
                  <div className="scan-history-item" key={h.id}>
                    <div className="scan-history-left">
                      <div className={`scan-history-dot ${h.valid ? 'valid' : 'invalid'}`} />
                      <div className="scan-history-name">{h.name}</div>
                    </div>
                    <div className="scan-history-meta">
                      <span className="history-seat-badge">Seat {h.seat}</span>
                      <span className="history-time">{h.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanQrPage;