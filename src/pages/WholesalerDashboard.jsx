import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { Filter, Package, MessageCircle, Star, Zap, Search, Layout, CheckCircle, Shield, ArrowRight, BarChart3, Clock, Wallet } from 'lucide-react';
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

const GREETINGS = {
  hi: 'नमस्ते',
  en: 'Namaste',
  mr: 'नमस्कार',
  pa: 'ਸਤ ਸ੍ਰੀ ਅকাল',
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
    { id: 'all', label: 'All Listings' },
    { id: 'certified', label: '✓ Lab Certified' },
    { id: 'iot', label: '📡 IoT Tracked' },
    { id: 'delivery', label: '🚚 Logistics Inc.' },
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
    const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://aarohan-agri.onrender.com';
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('listing:new', (newListing) => {
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
      toast.success(`Payment of ₹${(razorpayModal.price * razorpayModal.qty).toLocaleString()} successful via Razorpay!`);
    }, 2000);
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-600)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Wholesaler Panel</span>
        </div>

        {/* ── ENTERPRISE HEADER ── */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0F172A, #1E293B)', borderRadius: 20, padding: '32px 40px', marginBottom: 32, 
          color: 'white', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
        }}>
          {/* Abstract background elements */}
          <div style={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, background: 'var(--brand-600)', filter: 'blur(100px)', opacity: 0.15 }} />
          <div style={{ position: 'absolute', right: 100, bottom: -40, width: 140, height: 140, background: '#3B82F6', filter: 'blur(80px)', opacity: 0.1 }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {GREETINGS[i18n.language] || 'Namaste'}, {user?.name?.split(' ')[0] || 'Partner'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9375rem', maxWidth: 600 }}>
              Manage your agricultural supply chain, track ongoing procurement, and explore real-time farmer listings across Madhya Pradesh.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginTop: 32 }}>
              {[
                { label: 'Active Orders', value: '4', icon: <Package size={18} /> },
                { label: 'Monthly Volume', value: '₹5.4L', icon: <BarChart3 size={18} /> },
                { label: 'Network Partners', value: '12', icon: <Star size={18} /> },
                { label: 'Escrow Balanced', value: '₹1.13L', icon: <Wallet size={18} /> },
              ].map((stat, i) => (
                <div key={i} style={{ 
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: '16px 20px', backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{stat.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 2 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN TABS ── */}
        <div style={{ 
          display: 'flex', gap: 8, background: 'var(--bg-card)', padding: 6, borderRadius: 14, 
          marginBottom: 32, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', width: 'fit-content'
        }}>
          {[
            { id: 'browse', label: 'Live Marketplace', icon: <Layout size={16} /> },
            { id: 'orders', label: 'Procurements', icon: <Package size={16} /> },
            { id: 'transactions', label: 'Ledger', icon: <Clock size={16} /> },
            { id: 'scan', label: 'QR Verify', icon: <Search size={16} /> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10,
                fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer',
                background: activeTab === tab.id ? 'var(--brand-600)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                border: 'none'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB CONTENT: BROWSE ── */}
        {activeTab === 'browse' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {filters.map(f => (
                  <button 
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    style={{
                      padding: '6px 16px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                      background: activeFilter === f.id ? 'var(--text-primary)' : 'white',
                      color: activeFilter === f.id ? 'white' : 'var(--text-muted)',
                      border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--success)' }} /> REAL-TIME AGMARKNET DATA
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {filteredListings.map(f => (
                <div key={f.id} style={{
                  background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden',
                  border: f.id === newListingId ? '2px solid var(--brand-500)' : '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Visual Signature */}
                    <div style={{ 
                      width: 80, background: 'var(--bg-page)', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRight: '1px solid var(--border-light)'
                    }}>
                      <div style={{ 
                        width: 48, height: 48, borderRadius: 12, background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontWeight: 800, color: 'var(--brand-600)'
                      }}>
                        {f.name.charAt(0)}
                      </div>
                    </div>

                    <div style={{ flex: 1, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: 2 }}>{f.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={12} /> {f.village}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--brand-700)', letterSpacing: '-0.02em' }}>
                            ₹{f.price.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>per quintal</div>
                        </div>
                      </div>

                      {/* Specs Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                        {[
                          { l: 'Crop', v: t(f.cropKey) || f.crop },
                          { l: 'Qty', v: `${f.qty} qtl` },
                          { l: 'Grade', v: f.grade },
                        ].map((spec, i) => (
                          <div key={i} style={{ background: 'var(--bg-page)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{spec.l}</div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{spec.v}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        {f.certified ? (
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 2, height: 38, fontSize: '0.75rem', background: '#0F172A' }}
                            onClick={() => { setEscrowModal(f); setEscrowStep(0); }}
                          >
                            <Shield size={14} style={{ marginRight: 6 }} /> Blockchain Escrow
                          </button>
                        ) : (
                          <button 
                            className="btn btn-primary" 
                            style={{ flex: 2, height: 38, fontSize: '0.75rem' }}
                            onClick={() => { setOfferModal(f); setOfferPrice(f.price.toString()); }}
                          >
                            Place Direct Offer
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary btn-icon" 
                          style={{ width: 38, height: 38, padding: 0 }}
                          onClick={() => toast.success(`Chatting with ${f.name}...`)}
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── TAB CONTENT: ORDERS ── */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredOrders.map(order => (
              <div key={order.id} style={{
                background: 'var(--bg-card)', borderRadius: 16, padding: '20px 24px',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={22} color="var(--brand-600)" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 2 }}>{order.id} — {order.crop} Procmnt</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Farmer: {order.farmer} · {order.qty} qtl · {order.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--brand-700)', letterSpacing: '-0.02em' }}>₹{(order.price * order.qty).toLocaleString()}</div>
                    <span style={{ 
                      background: order.status === 'Delivered' ? '#ECFDF5' : '#FEF3C7', 
                      color: order.status === 'Delivered' ? '#059669' : '#D97706',
                      padding: '2px 8px', borderRadius: 99, fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase'
                    }}>{order.status}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                  {/* Status track */}
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-page)', borderRadius: 3, position: 'relative' }}>
                    <div style={{ 
                      width: order.status === 'Delivered' ? '100%' : order.status === 'In Transit' ? '66%' : order.status === 'Confirmed' ? '33%' : '0%',
                      height: '100%', background: 'var(--brand-600)', borderRadius: 3, position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', right: -6, top: -4, width: 14, height: 14, borderRadius: 99, background: 'var(--brand-600)', border: '3px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                      {ORDER_STATUSES.map(s => (
                        <span key={s} style={{ fontSize: '0.625rem', fontWeight: 600, color: order.status === s ? 'var(--brand-700)' : 'var(--text-muted)' }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                      onClick={() => setProvenanceModal(order)}
                      style={{ background: 'none', border: 'none', color: 'var(--brand-600)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Shield size={14} /> Provenance Ledger
                    </button>
                    {order.status === 'Pending' && (
                      <button className="btn btn-primary btn-sm" onClick={() => setRazorpayModal(order)}>Pay Now</button>
                    )}
                    {order.status === 'Delivered' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setRatingModal(order)}>Rate Farmer</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MODALS: RE-IMPLEMENTED FOR PREMIUM LOOK ── */}
        {razorpayModal && (
          <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-box" style={{ padding: 0, width: 440, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ background: '#3399cc', color: 'white', padding: '24px 32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Aarohan Agri</h2>
                    <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>Order ID: {razorpayModal.id}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{(razorpayModal.price * razorpayModal.qty).toLocaleString()}</div>
                    <div style={{ fontSize: '0.625rem', opacity: 0.8 }}>Unified Checkout</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {['UPI (Google Pay, PhonePe)', 'Credit / Debit Card', 'Net Banking'].map((m, i) => (
                    <div key={i} style={{ padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', background: i === 0 ? 'var(--brand-50)' : 'white' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 99, border: '2px solid var(--brand-600)', background: i === 0 ? 'var(--brand-600)' : 'white' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{m}</span>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary btn-full" style={{ background: '#3399cc', height: 48 }} onClick={simulatePayment} disabled={rpLoading}>
                  {rpLoading ? 'Processing...' : `Pay ₹${(razorpayModal.price * razorpayModal.qty).toLocaleString()}`}
                </button>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button onClick={() => setRazorpayModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Cancel Payment</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── BLOCKCHAIN PROVENANCE MODAL ── */}
        {provenanceModal && (
          <div className="modal-overlay" onClick={() => setProvenanceModal(null)}>
            <div className="modal-box" style={{ maxWidth: 450, borderRadius: 24 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ background: 'var(--brand-100)', padding: 8, borderRadius: 12 }}><Shield size={24} color="var(--brand-700)" /></div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.125rem' }}>Immutable Ledger</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blockchain verified supply chain history</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative', paddingLeft: 8 }}>
                <div style={{ position: 'absolute', left: 23, top: 10, bottom: 10, width: 2, background: 'var(--brand-100)' }} />
                {[
                  { title: "Batch Created", desc: `${provenanceModal.farmer} @ Mandi`, hash: "0x8fa...c91", status: "complete" },
                  { title: "Lab Certification", desc: "Grade A Certification Issued", hash: "0x3bb...2af", status: "complete" },
                  { title: "Procurement Started", desc: "Price verified & offer accepted", hash: "0x4ca...88b", status: "complete" },
                  { title: "In-Transit Hash", desc: "IoT GPS Coordinates Hashed", hash: "0x7ee...11c", status: "active" },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: 20, position: 'relative' }}>
                    <div style={{ 
                      width: 32, height: 32, borderRadius: 99, background: step.status === 'complete' ? 'var(--brand-600)' : 'white', 
                      border: '2px solid var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1
                    }}>
                      {step.status === 'complete' ? <CheckCircle size={14} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--brand-600)' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{step.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{step.desc}</div>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'monospace', color: 'var(--brand-700)', background: 'var(--brand-50)', padding: '2px 8px', borderRadius: 4 }}>{step.hash}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="btn btn-secondary btn-full" style={{ marginTop: 32 }} onClick={() => setProvenanceModal(null)}>Close Verified View</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
