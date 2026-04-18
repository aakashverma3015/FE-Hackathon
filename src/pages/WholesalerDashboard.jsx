import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Filter, Package, MessageCircle, Star, Zap } from 'lucide-react';
import { io } from 'socket.io-client';

const ORDER_STATUSES = ['Pending', 'Confirmed', 'In Transit', 'Delivered'];

const ORDERS = [
  { id: 'ORD-001', farmer: 'Ramesh Patel', crop: 'Soybean', qty: 50, price: 5350, status: 'In Transit', date: '14 Apr' },
  { id: 'ORD-002', farmer: 'Suresh Yadav', crop: 'Wheat', qty: 120, price: 2280, status: 'Confirmed', date: '13 Apr' },
  { id: 'ORD-003', farmer: 'Lakshmi Devi', crop: 'Gram', qty: 30, price: 4850, status: 'Delivered', date: '10 Apr' },
  { id: 'ORD-004', farmer: 'Mohan Verma', crop: 'Cotton', qty: 20, price: 6400, status: 'Pending', date: '15 Apr' },
];

const TRANSACTION_HISTORY = [
  { id: 'TXN-001', amount: 267500, desc: '50 qtl Soybean — Ramesh Patel', date: '14 Apr 2024', status: 'Paid' },
  { id: 'TXN-002', amount: 273600, desc: '120 qtl Wheat — Suresh Yadav', date: '10 Apr 2024', status: 'Paid' },
];

// Native language greetings map
const GREETINGS = {
  hi: 'नमस्ते',
  en: 'Namaste',
  mr: 'नमस्कार',
  pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',
  gu: 'નમસ્તે',
  ta: 'வணக்கம்',
  te: 'నమస్కారం',
  kn: 'ನಮಸ್ಕಾರ',
  bn: 'নমস্কার',
  or: 'ନମସ୍କାର',
};

export default function WholesalerDashboard() {
  const { t, i18n } = useTranslation();
  const { farmerListings, user } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [orderFilter, setOrderFilter] = useState('All');
  const [offerModal, setOfferModal] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(0);

  // Web3 Sandbox States
  const [escrowModal, setEscrowModal] = useState(null);
  const [escrowStep, setEscrowStep] = useState(0);
  const [provenanceModal, setProvenanceModal] = useState(null);

  const filters = [
    { id: 'all', label: 'All Farmers' },
    { id: 'certified', label: '✅ Lab Certified' },
    { id: 'iot', label: '📡 IoT Monitored' },
    { id: 'delivery', label: '🚛 Delivery Available' },
  ];

  const [localListings, setLocalListings] = useState([]);
  const [newListingId, setNewListingId] = useState(null);
  const [localOrders, setLocalOrders] = useState(ORDERS);

  // Razorpay Ext
  const [razorpayModal, setRazorpayModal] = useState(null);
  const [rpTab, setRpTab] = useState('upi');
  const [rpLoading, setRpLoading] = useState(false);

  useEffect(() => {
    setLocalListings(farmerListings);
  }, [farmerListings]);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    
    socket.on('listing:new', (newListing) => {
      // Create safe object if mocked from socket
      const enriched = {
        ...newListing,
        id: newListing.id || `LIVE-${Math.floor(Math.random() * 10000)}`,
        name: newListing.farmer?.name || newListing.name || 'Anonymous Farmer',
        village: newListing.village || 'Indore Region',
        cropKey: `crops.${(newListing.crop || 'soybean').toLowerCase()}`
      };
      
      toast.success(`📣 New Feed: ${enriched.qty} qtl ${enriched.crop} by ${enriched.name}`, { icon: '🔔' });
      setLocalListings(prev => [enriched, ...prev]);
      setNewListingId(enriched.id);
      setTimeout(() => setNewListingId(null), 3000);
    });

    return () => socket.disconnect();
  }, []);

  const filteredListings = localListings.filter(f => {
    if (activeFilter === 'certified') return f.certified;
    if (activeFilter === 'iot') return f.iot;
    if (activeFilter === 'delivery') return f.delivery;
    return true;
  });

  const filteredOrders = localOrders.filter(o => orderFilter === 'All' || o.status === orderFilter);

  const simulatePayment = () => {
    setRpLoading(true);
    setTimeout(() => {
      setRpLoading(false);
      setRazorpayModal(null);
      setLocalOrders(prev => prev.map(o => o.id === razorpayModal.id ? { ...o, status: 'Confirmed' } : o));
      toast.success(`Payment of ₹${(razorpayModal.price * razorpayModal.qty).toLocaleString()} successful via Razorpay Sandbox!`);
    }, 2000);
  };

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 Home</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">🏪 Wholesaler Dashboard</span>
        </div>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0D47A1, #1565C0)', borderRadius: 20, padding: '24px 28px', marginBottom: 24, color: 'white' }}>
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: 'white', marginBottom: 4 }}>
            {GREETINGS[i18n.language] || 'Namaste'}, {user?.name?.split(' ')[0] || t(`roles.${user?.role || 'wholesaler'}`)} 🏪
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
            Browse certified farmer listings · Place offers · Manage orders
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
            {[['4', 'Active Orders'], ['₹5.4L', 'Monthly Purchases'], ['12', 'Farmer Partners']].map(([val, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 16px', backdropFilter: 'blur(8px)' }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.3rem', color: '#FFD54F' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Tabs */}
        <div className="tabs">
          {[['browse', '🌾 Browse Farmers'], ['orders', '📦 Order Management'], ['transactions', '📄 Transactions'], ['scan', '📱 Scan QR']].map(([id, label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)} style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Browse Farmers */}
        {activeTab === 'browse' && (
          <>
            <div className="filter-bar">
              {filters.map(f => (
                <button key={f.id} className={`filter-pill ${activeFilter === f.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f.id)}>
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filteredListings.map(farmer => (
                <div key={farmer.id} style={{
                  background: farmer.id === newListingId ? '#E8F5E9' : 'white', borderRadius: 18, padding: 20,
                  border: `2px solid ${farmer.id === newListingId ? '#4CAF50' : '#f0f0f0'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.5s ease-out', cursor: 'pointer',
                  transform: farmer.id === newListingId ? 'scale(1.02)' : 'none'
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = farmer.id === newListingId ? 'scale(1.02)' : 'none'}
                >
                  {farmer.id === newListingId && (
                    <div style={{ position: 'absolute', top: -10, right: 10, background: '#4CAF50', color: 'white', padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={12} fill="white" /> LIVE DEAL
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Poppins', fontWeight: 800, color: 'white', fontSize: '1.1rem', flexShrink: 0,
                    }}>
                      {farmer.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{farmer.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {farmer.village}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {farmer.certified && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>✅ Certified</span>}
                      {farmer.iot && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>📡 IoT</span>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                    {[
                      [t('cropType'), t(farmer.cropKey)],
                      [t('dashboard.quantity'), `${farmer.qty} qtl`],
                      [t('dashboard.grade'), farmer.grade],
                      ['Price', `₹${farmer.price.toLocaleString()}`],
                      ['Delivery', farmer.delivery ? '✅ Yes' : '❌ No'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: 'var(--surface-bg)', borderRadius: 8, padding: '8px 10px' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{k}</div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {farmer.certified ? (
                       <button className="btn btn-full btn-sm" style={{ background: '#111827', color: '#34D399', fontWeight: 800, border: '1px solid #34D399' }} 
                         onClick={() => { setEscrowModal(farmer); setEscrowStep(0); }}>
                         🔒 Buy via Escrow (MATIC)
                       </button>
                    ) : (
                      <button className="btn btn-primary btn-full btn-sm"
                        onClick={() => { setOfferModal(farmer); setOfferPrice(farmer.price.toString()); }}>
                        💼 Place Offer
                      </button>
                    )}
                    <button className="btn btn-outline btn-sm"
                      onClick={() => toast.success(`Calling ${farmer.name}...`)}>
                      <MessageCircle size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Order Management */}
        {activeTab === 'orders' && (
          <>
            <div className="filter-bar">
              {['All', ...ORDER_STATUSES].map(s => (
                <button key={s} className={`filter-pill ${orderFilter === s ? 'active' : ''}`}
                  onClick={() => setOrderFilter(s)}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {filteredOrders.map(order => (
                <div key={order.id} style={{
                  background: 'var(--card-bg)', borderRadius: 16, padding: 20,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{order.id} — {order.crop}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.farmer} · {order.date} · {order.qty} qtl</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#1B5E20' }}>
                        ₹{(order.price * order.qty).toLocaleString()}
                      </div>
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'badge-green' :
                        order.status === 'In Transit' ? 'badge-blue' :
                        order.status === 'Confirmed' ? 'badge-gold' : 'badge-red'
                      }`}>{order.status}</span>
                      
                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => setProvenanceModal(order)} style={{ background: 'none', border: 'none', color: '#0D47A1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                          🔗 View Provenance
                        </button>
                      </div>
                      
                      {order.status === 'Pending' && (
                        <div style={{ marginTop: 12 }}>
                          <button className="btn btn-sm" onClick={() => setRazorpayModal(order)} style={{ background: '#3399cc', color: 'white', fontWeight: 700, border: 'none' }}>
                            💳 Pay with Razorpay
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="order-status-bar" style={{ marginTop: 16 }}>
                    {ORDER_STATUSES.map((s, i) => {
                      const currentIdx = ORDER_STATUSES.indexOf(order.status);
                      const isDone = i < currentIdx;
                      const isActive = i === currentIdx;
                      return (
                        <React.Fragment key={s}>
                          <div className="status-step">
                            <div className={`status-dot ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                              {isDone ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 4, maxWidth: 50 }}>{s}</div>
                          </div>
                          {i < ORDER_STATUSES.length - 1 && <div className={`status-line ${isDone ? 'done' : ''}`} />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {order.status === 'Delivered' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#1B5E20' }} onClick={() => toast.success('Invoice downloaded!')}>
                        📄 Download Invoice
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#FF8F00' }} onClick={() => setRatingModal(order)}>
                        ⭐ Rate Farmer
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {/* Transactions */}
        {activeTab === 'transactions' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Transaction History</h2>
            {TRANSACTION_HISTORY.map(txn => (
              <div key={txn.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💳</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{txn.desc}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{txn.id} · {txn.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20' }}>₹{txn.amount.toLocaleString()}</div>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>{txn.status}</span>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => toast.success('Invoice downloaded!')} style={{ minHeight: 36 }}>📄</button>
              </div>
            ))}
          </div>
        )}

        {/* Scan QR */}
        {activeTab === 'scan' && (
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 400 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>📱</div>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>Scan Batch QR Code</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>
              Scan the QR code on the crop batch to instantly verify quality certificates and traceability
            </p>
            <div style={{ border: '4px dashed #C8E6C9', borderRadius: 20, padding: 32, marginBottom: 24 }}>
              <div style={{ fontSize: 80 }}>🔲</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 12 }}>Camera viewfinder will appear here</div>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => toast.success('Demo: Batch AA-2024-001 verified! Grade A Soybean — Ramesh Patel')}>
              📱 Open Camera & Scan
            </button>
          </div>
        )}

        {/* Offer Modal */}
        {offerModal && (
          <div className="modal-overlay" onClick={() => setOfferModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>
                💼 Place Offer — {offerModal.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>
                {offerModal.crop} · Grade {offerModal.grade} · {offerModal.qty} quintal
              </p>
              <div className="form-group">
                <label className="form-label">Your Offer Price (₹/quintal)</label>
                <input type="number" className="form-input" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                  Farmer's asking price: ₹{offerModal.price.toLocaleString()} · Total: ₹{(parseInt(offerPrice || 0) * offerModal.qty).toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-full" onClick={() => setOfferModal(null)}>Cancel</button>
                <button className="btn btn-primary btn-full"
                  onClick={() => { setOfferModal(null); toast.success(`Offer sent! ₹${parseInt(offerPrice).toLocaleString()} for ${offerModal.name}'s ${offerModal.crop}`); }}>
                  Send Offer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingModal && (
          <div className="modal-overlay" onClick={() => setRatingModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 20, textAlign: 'center' }}>
                ⭐ Rate this farmer
              </h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)}
                    style={{ fontSize: 36, background: 'none', border: 'none', cursor: 'pointer', color: s <= rating ? '#FF8F00' : '#e2e8f0', transition: 'all 0.15s', minHeight: 44 }}>
                    ★
                  </button>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { setRatingModal(null); toast.success('Rating submitted! Thank you.'); setRating(0); }}>
                Submit Rating
              </button>
            </div>
          </div>
        )}
        {/* ── WEB3 ESCROW MODAL (SIMULATION) ── */}
        {escrowModal && (
          <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', background: 'rgba(0,0,0,0.6)' }} onClick={() => { if(escrowStep !== 1) { setEscrowModal(null); setEscrowStep(0); } }}>
            <div className="modal-box" style={{ background: '#111827', color: 'white', border: '1px solid #374151' }} onClick={e => e.stopPropagation()}>
              
              {/* Step 0: Invoice & Wallet Connect */}
              {escrowStep === 0 && (
                <>
                  <div style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ fontSize: 40 }}>🦊</div>
                    <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: 'white' }}>MetaMask Connection</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Secure Web3 Escrow for {escrowModal.crop}</p>
                  </div>
                  <div style={{ background: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Farmer</span>
                      <span style={{ fontWeight: 600 }}>{escrowModal.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Quantity</span>
                      <span style={{ fontWeight: 600 }}>{escrowModal.qty} qtl</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #374151', paddingTop: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Escrow Total</span>
                      <span style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#34D399' }}>₹{(escrowModal.price * escrowModal.qty).toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="btn btn-full" style={{ background: '#34D399', color: '#111827', fontWeight: 800 }} onClick={() => {
                    setEscrowStep(1);
                    setTimeout(() => setEscrowStep(2), 3000);
                  }}>
                    Connect Wallet & Lock Funds
                  </button>
                </>
              )}

              {/* Step 1: Processing */}
              {escrowStep === 1 && (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div className="pulse-anim" style={{ fontSize: 48, marginBottom: 16 }}>⛓️</div>
                  <h3 style={{ fontFamily: 'Poppins', color: 'white', marginBottom: 8 }}>Awaiting Signature...</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Writing to Polygon Network (MATIC)</p>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: 24, fontFamily: 'monospace' }}>Txn: 0x{Math.random().toString(16).substr(2, 40)}...</div>
                </div>
              )}

              {/* Step 2: Success */}
              {escrowStep === 2 && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
                  <h3 style={{ fontFamily: 'Poppins', color: '#34D399', marginBottom: 8 }}>Escrow Locked!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Funds are secure in the Smart Contract. They will auto-release upon delivery confirmation.</p>
                  <button className="btn btn-full" style={{ background: 'var(--card-bg)', color: '#111827', fontWeight: 800 }} onClick={() => { setEscrowModal(null); setEscrowStep(0); toast.success('Smart Contract Escrow Active!'); }}>
                    View Orders
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PROVENANCE LEDGER MODAL ── */}
        {provenanceModal && (
          <div className="modal-overlay" onClick={() => setProvenanceModal(null)}>
            <div className="modal-box" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 800, color: '#1B5E20', marginBottom: 4 }}>Immutable Traceability</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>Blockchain Ledger for {provenanceModal.id}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 10, bottom: 10, left: 15, width: 2, background: '#E8F5E9', zIndex: 0 }} />
                
                {[
                  { title: "Crop Listed", desc: `Listed by ${provenanceModal.farmer}`, hash: "0x8fa...c91", color: "#1B5E20" },
                  { title: "Lab Results Hashed", desc: "Moisture: 10% · Premium Grade", hash: "0x3bb...2af", color: "#0D47A1" },
                  { title: "Escrow Locked", desc: `Funds secured by Wholesaler`, hash: "0x4ca...88b", color: "#F59E0B" },
                  { title: "In Transit", desc: "GPS Hashed via IoT Tracker", hash: "0x7ee...11c", color: "#6B7280", current: provenanceModal.status !== 'Delivered' },
                  ...(provenanceModal.status === 'Delivered' ? [{ title: "Delivered & Funds Released", desc: "Smart contract auto-executed", hash: "0x9da...cc2", color: "#16A34A" }] : [])
                ].map((node, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', position: 'relative', zIndex: 1, opacity: node.current ? 0.5 : 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: node.color, border: '4px solid white', flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{node.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{node.desc}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 4, background: '#F3F4F6', padding: '2px 6px', borderRadius: 4, display: 'inline-block' }}>
                        Txn Hash: {node.hash}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} onClick={() => setProvenanceModal(null)}>Close Ledger</button>
            </div>
          </div>
        )}

        {/* ── RAZORPAY MOCKUP MODAL ── */}
        {razorpayModal && (
          <div className="modal-overlay" onClick={() => !rpLoading && setRazorpayModal(null)} style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ padding: 0, overflow: 'hidden', maxWidth: 450, background: 'white', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              
              {/* Rp Header */}
              <div style={{ background: '#3399cc', color: 'white', padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem' }}>Aarohan Agri</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Order: {razorpayModal.id}</div>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.2rem' }}>
                    ₹ {(razorpayModal.price * razorpayModal.qty).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', background: 'rgba(0,0,0,0.15)', padding: '4px 10px', borderRadius: 6, width: 'fit-content' }}>
                  🛡️ Securely powered by <strong style={{ letterSpacing: 0.5 }}>Razorpay</strong>
                </div>
              </div>

              {/* Rp Content */}
              <div style={{ display: 'flex', minHeight: 300 }}>
                {/* Sidebar */}
                <div style={{ width: 130, background: '#F9FAFB', borderRight: '1px solid #e2e8f0' }}>
                  {[
                    { id: 'upi', icon: '⚡', label: 'UPI' },
                    { id: 'card', icon: '💳', label: 'Card' },
                    { id: 'net', icon: '🏛️', label: 'Netbanking' },
                    { id: 'wallet', icon: '👛', label: 'Wallet' },
                  ].map(t => (
                    <div key={t.id} onClick={() => setRpTab(t.id)} style={{ padding: '16px 14px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid #e2e8f0', background: rpTab === t.id ? 'white' : 'transparent', color: rpTab === t.id ? '#3399cc' : '#4a5568', borderLeft: rpTab === t.id ? '3px solid #3399cc' : '3px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 20 }}>{t.icon}</span>
                      <span>{t.label}</span>
                    </div>
                  ))}
                </div>

                {/* Main pane */}
                <div style={{ flex: 1, padding: 24 }}>
                  <h4 style={{ margin: '0 0 16px', color: '#1a1a1a', fontSize: '0.9rem' }}>
                    {rpTab === 'upi' ? 'Pay via UPI' : rpTab === 'card' ? 'Pay via Card' : rpTab === 'net' ? 'Select Bank' : 'Select Wallet'}
                  </h4>

                  {rpTab === 'upi' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, textAlign: 'center', cursor: 'pointer' }}>📱 GPay</div>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, textAlign: 'center', cursor: 'pointer' }}>📱 PhonePe</div>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, textAlign: 'center', cursor: 'pointer' }}>📱 Paytm</div>
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, textAlign: 'center', cursor: 'pointer' }}>More...</div>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label" style={{ fontSize: '0.75rem' }}>Or enter UPI ID</label>
                        <input type="text" className="form-input" placeholder="e.g. name@bank" />
                      </div>
                    </div>
                  )}

                  {rpTab === 'card' && (
                    <div>
                      <input type="text" className="form-input" placeholder="Card Number" style={{ marginBottom: 12 }} />
                      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                        <input type="text" className="form-input" placeholder="MM/YY" style={{ flex: 1 }} />
                        <input type="text" className="form-input" placeholder="CVV" style={{ flex: 1 }} />
                      </div>
                      <input type="text" className="form-input" placeholder="Cardholder Name" />
                    </div>
                  )}

                  {rpTab === 'net' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {['SBI', 'HDFC', 'ICICI', 'Axis'].map(b => (
                        <div key={b} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 10px', textAlign: 'center', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>🏛️ {b}</div>
                      ))}
                    </div>
                  )}

                  {rpTab === 'wallet' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {['Amazon Pay', 'MobiKwik', 'Freecharge'].map(w => (
                        <div key={w} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>👛 {w}</div>
                      ))}
                    </div>
                  )}

                  <div style={{ marginTop: 'auto', paddingTop: 20 }}>
                    <button className="btn btn-full" onClick={simulatePayment} disabled={rpLoading} style={{ background: '#3399cc', color: 'white', fontWeight: 800 }}>
                      {rpLoading ? 'Processing...' : `Pay ₹${(razorpayModal.price * razorpayModal.qty).toLocaleString()}`}
                    </button>
                    {!rpLoading && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>This is a simulated Razorpay interface.</div>}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      <style>{`
        .pulse-anim { animation: pulse 1s infinite alternate; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.1); opacity: 0.8; } }
      `}</style>
    </div>
  );
}
