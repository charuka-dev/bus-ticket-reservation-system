import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Home, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { bookingService } from '../../services/bookingService';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import type { Booking } from '../../types/firebase';

// ─── QR payload builder ───────────────────────────────────────────────────────
function buildQrPayload(booking: Booking, customerName: string): string {
    const td = booking.tripDetails;
    return JSON.stringify({
        bookingId:   booking.id,
        passenger:   customerName,
        seats:       booking.seatNumbers.join(', '),
        busNo:       td?.busNumber  ?? '',
        from:        td?.from       ?? '',
        to:          td?.to         ?? '',
        date:        booking.date   ?? '',
        departure:   td?.departureTime ?? '',
        totalPaid:   `LKR ${booking.totalAmount}`,
    });
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TicketPage() {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const { error: showError } = useToast();

    const ticketRef = useRef<HTMLDivElement>(null);

    const [booking, setBooking]         = useState<Booking | null>(null);
    const [customerName, setCustomerName] = useState('');
    const [qrPayload, setQrPayload]     = useState('');
    const [loading, setLoading]         = useState(true);
    const [downloading, setDownloading] = useState(false);

    // ── Load booking & build / persist QR ─────────────────────────────────────
    useEffect(() => {
        if (!bookingId) return;

        const load = async () => {
            try {
                const [b, customer] = await Promise.all([
                    bookingService.getBookingById(bookingId),
                    authService.getCurrentCustomerProfile(),
                ]);
                if (!b) { showError('Booking not found.'); navigate('/customer/bookings'); return; }

                const name = customer?.name ?? b.customerName;
                setBooking(b);
                setCustomerName(name);

                // Use persisted QR if already saved, otherwise build fresh and save
                const payload = b.qrCode ?? buildQrPayload(b, name);
                setQrPayload(payload);

                if (!b.qrCode) {
                    bookingService.saveQrCode(bookingId, payload).catch(console.error);
                }
            } catch {
                showError('Failed to load ticket.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [bookingId]);

    // ── PDF download ───────────────────────────────────────────────────────────
    const handleDownload = async () => {
        if (!ticketRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(ticketRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const pageW = pdf.internal.pageSize.getWidth();
            const imgW  = pageW - 20;           // 10 mm margin each side
            const imgH  = (canvas.height * imgW) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH);
            pdf.save(`ticket-${bookingId?.slice(0, 8)}.pdf`);
        } catch (err) {
            console.error('PDF generation failed:', err);
            showError('Failed to generate PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // ── Early returns ──────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!booking || !booking.tripDetails) return null;

    const { tripDetails, seatNumbers, totalAmount, bookingDate } = booking;

    // Format travel date nicely (stored as YYYY-MM-DD)
    const travelDateLabel = booking.date
        ? new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
          })
        : '—';

    return (
        <div className="max-w-2xl mx-auto py-4">

            {/* Success Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Booking Confirmed!</h1>
                <p className="text-gray-500">Your ticket is ready. Safe travels!</p>
            </motion.div>

            {/* ── Ticket Card (captured for PDF) ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                ref={ticketRef}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
            >
                {/* Ticket Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Bus Ticket</p>
                            <h2 className="text-2xl font-bold">{tripDetails.from}</h2>
                            <p className="text-blue-200 text-sm">to</p>
                            <h2 className="text-2xl font-bold">{tripDetails.to}</h2>
                        </div>
                        <div className="text-right">
                            <p className="text-blue-300 text-xs mb-1">Bus No.</p>
                            <p className="text-xl font-bold">{tripDetails.busNumber}</p>
                            <p className="text-blue-300 text-xs mt-3 mb-1">Travel Date</p>
                            <p className="text-sm font-semibold">{travelDateLabel}</p>
                        </div>
                    </div>
                </div>

                {/* Perforated divider */}
                <div className="relative flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gray-50 -ml-3 border border-gray-100 shadow-inner" />
                    <div className="flex-1 border-t-2 border-dashed border-gray-200 mx-2" />
                    <div className="w-6 h-6 rounded-full bg-gray-50 -mr-3 border border-gray-100 shadow-inner" />
                </div>

                {/* Ticket Body */}
                <div className="p-6 flex flex-col sm:flex-row gap-6">

                    {/* Details grid */}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Passenger</p>
                            <p className="font-semibold text-gray-900">{customerName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Booking ID</p>
                            <p className="font-semibold text-gray-900 text-sm font-mono">{bookingId?.slice(0, 8)}…</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Departure</p>
                            <p className="font-semibold text-gray-900">{tripDetails.departureTime || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Arrival</p>
                            <p className="font-semibold text-gray-900">{tripDetails.arrivalTime || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Seat(s)</p>
                            <div className="flex flex-wrap gap-1">
                                {seatNumbers.map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded font-bold text-sm">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Paid</p>
                            <p className="font-bold text-xl text-green-600">LKR {totalAmount.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Booked On</p>
                            <p className="text-sm text-gray-600">
                                {new Date(bookingDate).toLocaleString('en-US', {
                                    day: 'numeric', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>

                    {/* QR Code — payload contains all ticket details */}
                    <div className="flex flex-col items-center justify-center gap-2 shrink-0">
                        <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-sm">
                            {qrPayload ? (
                                <QRCodeSVG
                                    value={qrPayload}
                                    size={130}
                                    bgColor="#ffffff"
                                    fgColor="#1e293b"
                                    level="M"
                                />
                            ) : (
                                <div className="w-[130px] h-[130px] flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 text-center">Scan at boarding</p>
                    </div>
                </div>

                {/* Status badge */}
                <div className="px-6 pb-6">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                        <span className="text-sm font-medium text-green-700">Payment Confirmed</span>
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">PAID</span>
                    </div>
                </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 mt-6"
            >
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-60"
                >
                    {downloading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Download className="w-4 h-4" />}
                    {downloading ? 'Generating PDF…' : 'Download Ticket'}
                </button>
                <button
                    onClick={() => navigate('/customer/dashboard')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-900 text-white rounded-xl font-medium hover:bg-blue-800 transition"
                >
                    <Home className="w-4 h-4" />
                    Dashboard
                </button>
            </motion.div>
        </div>
    );
}
