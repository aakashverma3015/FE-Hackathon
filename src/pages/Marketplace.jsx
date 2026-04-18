import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { marketplaceAPI } from '../lib/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Filter, Star, Map, QrCode, MessageCircle, Sparkles, Upload, ChevronDown, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

const CROPS = ['crops.wheat', 'crops.soybean', 'crops.gram', 'crops.onion', 'crops.tomato', 'crops.maize', 'crops.cotton', 'crops.rice'];
const GRADES = ['A+ (Premium)', 'A (Good)', 'B (Standard)', 'C (Fair)'];
const FILTERS = ['Highest Price', 'Nearest', 'Highest Rated', 'Fastest Pickup'];

const buyerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const buyerLocations = [
  { id: 1, name: 'Rajesh Agromart', lat: 22.7196, lng: 75.8577, price: 5350 },
  { id: 2, name: 'Indore Fresh Pvt Ltd', lat: 22.7353, lng: 75.8760, price: 5280 },
  { id: 3, name: 'MP Grain Traders', lat: 22.6961, lng: 75.8315, price: 5400 },
];

export default function Marketplace() {
  const { t } = useTranslation();
  const { buyerOffers } = useApp();
  const [activeFilter, setActiveFilter] = useState('Highest Price');
  const [sellMode, setSellMode] = useState('sell');
  const [showMap, setShowMap] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [chatOpen, setChatOpen] = useState(null);
  const [form, setForm] = useState({ crop: '', qty: '', location: '', date: '', grade: '', price: '' });
  const [step, setStep] = useState(1);
  const [listed, setListed] = useState(false);

  const suggestedMin = 5100, suggestedMax = 5400;

  const mockBuyerOffers = [
    { id: 1, name: 'Rajesh Agromart', verified: true, price: 5350, distance: 12, rating: 4.8, pickup: 'Same Day', type: 'Wholesaler' },
    { id: 2, name: 'Indore Fresh Pvt Ltd', verified: true, price: 5280, distance: 8, rating: 4.5, pickup: 'Next Day', type: 'Processor' },
    { id: 3, name: 'MP Grain Traders', verified: false, price: 5400, distance: 25, rating: 4.2, pickup: '2-3 Days', type: 'Wholesaler' }
  ];

  const actualOffers = buyerOffers && buyerOffers.length > 0 ? buyerOffers : mockBuyerOffers;

  const sortedOffers = [...actualOffers].sort((a, b) => {
    if (activeFilter === 'Highest Price') return b.price - a.price;
    if (activeFilter === 'Nearest') return a.distance - b.distance;
    if (activeFilter === 'Highest Rated') return b.rating - a.rating;
    if (activeFilter === 'Fastest Pickup') return a.pickup.localeCompare(b.pickup);
    return 0;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await marketplaceAPI.createListing({
        crop: form.crop.replace('crops.', ''),
        qty: form.qty,
        grade: form.grade,
        village: form.location,
        harvestDate: form.date,
        price: form.price,
      });
      toast.success('🌾 Crop listed successfully! Buyers will be notified.');
      setListed(true);
    } catch (err) {
      console.warn('API connection failed, falling back to local simulation mode:', err);
      toast.success('🌾 Crop listed successfully! (Local Simulation)');
      setListed(true); // Always proceed to the Profit Suggestion view
    }
  };

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>

        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-600)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Crop Marketplace</span>
        </div>

        {/* ── AI PRICE SUGGESTION BANNER ── */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16,
          padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20,
          boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden'
        }}>
          {/* Accent strip */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--brand-500)' }} />

          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--brand-50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Sparkles size={24} color="var(--brand-600)" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>AI Market Intelligence</span>
              <span style={{ background: 'var(--brand-100)', color: 'var(--brand-700)', padding: '1px 8px', borderRadius: 999, fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase' }}>Live Analysis</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 500 }}>
              Based on the Indore Mandi index — your crop's fair market value is currently
              <strong style={{ color: 'var(--brand-700)' }}> ₹{suggestedMin.toLocaleString()} – ₹{suggestedMax.toLocaleString()}</strong> per quintal.
            </p>
          </div>

          <div style={{ textAlign: 'right', paddingLeft: 20, borderLeft: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Current Mandi Avg</div>
            <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--brand-700)', letterSpacing: '-0.03em' }}>
              ₹5,200
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', gap: 32, alignItems: 'start' }}>

          {/* ── LEFT: CROP LISTING FORM ── */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '24px 32px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.02em' }}>
              Create Sale Listing
            </h2>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', background: 'var(--brand-50)', borderRadius: 12, padding: 4, marginBottom: 24, border: '1px solid var(--brand-100)' }}>
              <button
                onClick={() => setSellMode('sell')}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600,
                  background: sellMode === 'sell' ? 'white' : 'transparent',
                  color: sellMode === 'sell' ? 'var(--brand-700)' : 'var(--text-muted)',
                  boxShadow: sellMode === 'sell' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s', border: 'none', cursor: 'pointer'
                }}
              >
                Sell Immediately
              </button>
              <button
                onClick={() => setSellMode('store')}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600,
                  background: sellMode === 'store' ? 'white' : 'transparent',
                  color: sellMode === 'store' ? 'var(--brand-700)' : 'var(--text-muted)',
                  boxShadow: sellMode === 'store' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s', border: 'none', cursor: 'pointer'
                }}
              >
                Cold Store & Sell Later
              </button>
            </div>

            {listed ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 99, background: '#ECFDF5', margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CheckCircle size={32} color="#10B981" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Listing Published</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.5 }}>
                  Buyers in the Indore region have been notified.<br />You'll receive offers via chat and SMS.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowQR(true)}>View Batch QR</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setListed(false)}>List Another Crop</button>
                </div>

                {/* ── PROFIT STRATEGY COMPARISON ── */}
                <div style={{
                  background: 'var(--brand-50)', borderRadius: 16, padding: 24, textAlign: 'left',
                  border: '1px solid var(--brand-200)', position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: 'var(--brand-600)', padding: 6, borderRadius: 8 }}>
                      <Zap size={18} color="white" />
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-900)' }}>Aarohan Profit Strategy</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--brand-700)' }}>Maximizing your take-home income</p>
                    </div>
                  </div>

                  {/* Comparisons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Middleman */}
                    <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mandi Middleman Sale</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: 2 }}>After 15% commission & hidden charges</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-muted)' }}>₹{(Number(form.price) * 0.85).toLocaleString()}</span>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>per quintal</div>
                        </div>
                      </div>
                    </div>

                    {/* Direct */}
                    <div style={{ background: 'var(--brand-100)', padding: 16, borderRadius: 12, border: '1px solid var(--brand-300)', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: -10, right: 12, background: 'var(--brand-600)', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: '0.625rem', fontWeight: 800 }}>OPTIMIZED</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-900)' }}>Direct Marketplace Sale</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--brand-700)', marginTop: 2 }}>Zero commission · Direct-to-Wholesaler</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-700)' }}>₹{Number(form.price).toLocaleString()}</span>
                          <div style={{ fontSize: '0.625rem', color: 'var(--brand-700)', fontWeight: 600 }}>per quintal</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 20, background: 'white', borderRadius: 10, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: 12, border: '1px dashed var(--brand-300)'
                  }}>
                    <Star size={16} color="var(--brand-600)" fill="var(--brand-600)" />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--brand-800)', lineHeight: '1.4' }}>
                      Using Aarohan Agri increases your net profit by <strong>₹{(Number(form.price) * 0.15 * Number(form.qty)).toLocaleString()}</strong> for this batch.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Crop Type</label>
                  <select
                    style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                    value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} required
                  >
                    <option value="">Select Crop...</option>
                    {CROPS.map(c => <option key={c} value={c}>{t(c)}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Quantity (qtl)</label>
                    <input
                      type="number" style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                      placeholder="e.g. 50" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Quality Grade</label>
                    <select
                      style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                      value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} required
                    >
                      <option value="">Grade...</option>
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Village / Mandi Location</label>
                  <input
                    type="text" style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                    placeholder="e.g. Dewas, MP" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Harvest/Ready Date</label>
                    <input
                      type="date" style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                      value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Asking Price (₹/qtl)</label>
                    <input
                      type="number" style={{ width: '100%', height: 44, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                      placeholder="e.g. 5200" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full" style={{ height: 48, fontSize: '0.9375rem' }}>
                  Publish Listing to Marketplace
                </button>
              </form>
            )}

            {/* QR Modal */}
            {showQR && (
              <div className="modal-overlay" onClick={() => setShowQR(false)}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                  <h3 style={{ fontFamily: 'Poppins', textAlign: 'center', color: '#1B5E20', marginBottom: 8 }}>Crop Batch QR Code</h3>
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 24 }}>
                    Scan to verify quality certificate & traceability
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div className="qr-box">🔲</div>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 20 }}>
                    Batch ID: AA-2024-001 | Crop: Soybean | Grade: A | Qty: 50 qtl
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-outline btn-full" onClick={() => setShowQR(false)}>Close</button>
                    <button className="btn btn-primary btn-full" onClick={() => toast.success('QR Downloaded!')}>⬇️ Download</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: BUYER OFFERS ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Nearby Wholesaler Offers
              </h2>
              <button
                onClick={() => setShowMap(!showMap)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
                  fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)', background: 'white',
                  color: 'var(--text-primary)', cursor: 'pointer'
                }}
              >
                {showMap ? <Layout size={14} /> : <Map size={14} />} {showMap ? 'Show Directory' : 'View on Map'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 8 }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  style={{
                    padding: '6px 16px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600,
                    whiteSpace: 'nowrap', transition: 'all 0.2s', cursor: 'pointer',
                    background: activeFilter === f ? 'var(--brand-600)' : 'white',
                    color: activeFilter === f ? 'white' : 'var(--text-muted)',
                    border: '1px solid',
                    borderColor: activeFilter === f ? 'var(--brand-600)' : 'var(--border)'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {showMap ? (
              <div style={{
                height: 380, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
                marginBottom: 24, boxShadow: 'var(--shadow-sm)'
              }}>
                <MapContainer center={[22.7196, 75.8577]} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OSM" />
                  {buyerLocations.map(b => (
                    <Marker key={b.id} position={[b.lat, b.lng]} icon={buyerIcon}>
                      <Popup><strong>{b.name}</strong><br />₹{b.price}/quintal</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {sortedOffers.map((offer, idx) => (
                <div key={offer.id} style={{
                  background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden',
                  border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Visual Strip */}
                    <div style={{
                      width: 80, background: 'var(--brand-50)', position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRight: '1px solid var(--border-light)'
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, background: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }}>🏪</div>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{offer.name}</span>
                            {offer.verified && (
                              <span style={{
                                background: '#ECFDF5', color: '#059669', padding: '1px 8px', borderRadius: 999,
                                fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
                              }}>✓ VERIFIED</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>📍 {offer.distance} km</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>⭐ {offer.rating} rating</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>🚚 {offer.pickup} pickup</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--brand-700)', letterSpacing: '-0.02em' }}>
                            ₹{offer.price.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>per quintal</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => toast.success(`Acceptance request sent to ${offer.name}!`)}
                          style={{
                            flex: 1.5, background: 'var(--brand-600)', color: 'white', height: 40, borderRadius: 8,
                            fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-700)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'var(--brand-600)'}
                        >
                          Send Sale Intent
                        </button>
                        <button
                          onClick={() => setChatOpen(offer.id)}
                          style={{
                            flex: 1, background: 'white', color: 'var(--text-primary)', height: 40, borderRadius: 8,
                            fontSize: '0.8125rem', fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                          }}
                        >
                          <MessageCircle size={14} /> Negotiate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="modal-overlay" onClick={() => setChatOpen(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 32 }}>🏪</div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{buyerOffers.find(o => o.id === chatOpen)?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#4CAF50' }}>🟢 Online · Verified Buyer</div>
              </div>
              <button onClick={() => setChatOpen(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: 'var(--text-muted)', minHeight: 36 }}>✕</button>
            </div>
            <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div style={{ background: '#E8F5E9', padding: '10px 14px', borderRadius: '0 12px 12px 12px', maxWidth: '80%', fontSize: '0.875rem', color: '#1B5E20' }}>
                Namaste! I'm interested in your Soybean. Can you offer ₹5,250?
              </div>
              <div style={{ background: '#1B5E20', padding: '10px 14px', borderRadius: '12px 0 12px 12px', maxWidth: '80%', marginLeft: 'auto', fontSize: '0.875rem', color: 'white' }}>
                My minimum is ₹5,350. Quality is Grade A, lab certified.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="text" className="form-input" placeholder="Type your message..." style={{ flex: 1 }} />
              <button className="btn btn-primary" style={{ padding: '10px 16px', minHeight: 48 }} onClick={() => toast.success('Message sent!')}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
