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
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="container" style={{ paddingTop: 24 }}>

        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 Home</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">📦 Crop Marketplace</span>
        </div>

        {/* AI Price Suggestion Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: 16,
          padding: '16px 20px', marginBottom: 24, border: '2px solid #4CAF50',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ fontSize: 36 }}>🤖</div>
          <div>
            <div style={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.95rem' }}>AI Price Suggestion</div>
            <div style={{ fontSize: '0.875rem', color: '#2E7D32' }}>
              Based on Indore mandi rate today — Suggested: <strong>₹{suggestedMin.toLocaleString()}–₹{suggestedMax.toLocaleString()}/quintal</strong>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#1B5E20' }}>
              ₹5,200 <span style={{ fontSize: '0.75rem', color: '#4CAF50' }}>Live</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#388E3C' }}>Current Mandi</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* LEFT: Crop Listing Form */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem', color: '#1B5E20', marginBottom: 6 }}>
              📦 {t('cropListing')}
            </h2>

            {/* Sell Mode Toggle */}
            <div className="toggle-wrap" style={{ marginBottom: 20 }}>
              <div className={`toggle-opt ${sellMode === 'sell' ? 'active' : ''}`} onClick={() => setSellMode('sell')}>
                🛒 {t('sellNow')}
              </div>
              <div className={`toggle-opt ${sellMode === 'store' ? 'active' : ''}`} onClick={() => setSellMode('store')}>
                🧊 {t('storeSellLater')}
              </div>
            </div>

            {listed ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div className="success-icon" style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>Crop Listed Successfully!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>Buyers in your area have been notified. You'll receive offers within 24 hours.</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowQR(true)}>
                    📱 Generate QR
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setListed(false)}>
                    + List Another
                  </button>
                </div>

                {/* Profit Suggestion Integration */}
                <div style={{
                  marginTop: 32, background: 'var(--card-bg)', borderRadius: 20, padding: 24, textAlign: 'left',
                  boxShadow: '0 4px 24px rgba(27,94,32,0.12)', border: '2px solid var(--green-pale)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ fontSize: 24 }}>💡</div>
                    <div>
                      <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: '#1B5E20' }}>Profit Suggestion</h2>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Based on your target price of ₹{Number(form.price).toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Middleman Option */}
                  <div style={{ padding: '14px 18px', borderRadius: 12, border: '2px solid var(--border)', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          🔗 Sell to Middleman
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          After 15% deductions & commission
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-muted)' }}>
                          ₹{(Number(form.price) * 0.85).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('dashboard.perQuintal')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Sale Option */}
                  <div style={{ padding: '14px 18px', borderRadius: 12, border: '2px solid #1B5E20', background: 'var(--green-pale)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -10, right: 16 }}>
                      <span style={{ background: '#1B5E20', color: 'white', padding: '2px 12px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 }}>
                        ⭐ You Are Here
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.95rem' }}>
                          🎯 Sell Directly to Wholesalers
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#388E3C', marginTop: 2 }}>
                          Zero commission · Full payment
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.6rem', color: '#1B5E20', display: 'inline-block' }}>
                          ₹{Number(form.price).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#388E3C' }}>{t('dashboard.perQuintal')}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    marginTop: 14, background: 'var(--gold-pale)', borderRadius: 10, padding: '10px 16px',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <Sparkles size={16} color="#FF8F00" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#E65100' }}>
                      You save <strong>₹{(Number(form.price) * 0.15).toLocaleString()}/quintal</strong> by using Aarohan Agri! Total profit increase: <strong>₹{(Number(form.price) * 0.15 * Number(form.qty)).toLocaleString()}</strong> ✨
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">{t('cropType')}</label>
                  <select className="form-select" value={form.crop} onChange={e => setForm({ ...form, crop: e.target.value })} required>
                    <option value="">{t('nav.select')}...</option>
                    {CROPS.map(c => <option key={c} value={c}>{t(c)}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">{t('dashboard.quantity')} (qtl)</label>
                    <input type="number" className="form-input" placeholder="e.g. 50" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('dashboard.grade')}</label>
                    <select className="form-select" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} required>
                      <option value="">{t('dashboard.grade')}...</option>
                      {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.village')} / {t('dashboard.location')}</label>
                  <input type="text" className="form-input" placeholder="Village, Tehsil, District" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('dashboard.harvestDate')}</label>
                  <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Price (₹/quintal)</label>
                  <input type="number" className="form-input" placeholder="e.g. 5200" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  {form.price && parseInt(form.price) >= suggestedMin && (
                    <div style={{ fontSize: '0.75rem', color: '#4CAF50', marginTop: 6 }}>✅ Good price! Within suggested range.</div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg">
                  List Crop for Sale
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

          {/* RIGHT: Buyer Offers */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                💼 Nearby Buyer Offers
              </h2>
              <button
                onClick={() => setShowMap(!showMap)}
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Map size={15} /> {showMap ? 'List View' : 'Map View'}
              </button>
            </div>

            <div className="filter-bar">
              {FILTERS.map(f => (
                <button key={f} className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}>
                  {f}
                </button>
              ))}
            </div>

            {showMap ? (
              <div className="map-container" style={{ marginBottom: 16 }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sortedOffers.map((offer, idx) => (
                <div key={offer.id} style={{
                  background: 'var(--card-bg)', borderRadius: 16, padding: 16,
                  border: `2px solid ${idx === 0 && activeFilter === 'Highest Price' ? '#1B5E20' : '#f0f0f0'}`,
                  boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'relative',
                }}>
                  {idx === 0 && activeFilter === 'Highest Price' && (
                    <div style={{ position: 'absolute', top: -10, left: 16 }}>
                      <span style={{ background: '#1B5E20', color: 'white', padding: '2px 10px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 }}>
                        🏆 Best Price
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, background: '#E8F5E9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0,
                    }}>🏪</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{offer.name}</span>
                        {offer.verified && <span className="badge badge-green">✅ Verified</span>}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span>📍 {offer.distance} km away</span>
                        <span>⭐ {offer.rating}</span>
                        <span>🚚 Pickup: {offer.pickup}</span>
                        <span className="badge badge-blue">{offer.type}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.2rem', color: '#1B5E20' }}>
                        ₹{offer.price.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per quintal</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', minHeight: 40 }}
                      onClick={() => toast.success(`Offer accepted from ${offer.name}!`)}>
                      Accept Offer
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => setChatOpen(offer.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageCircle size={15} /> Negotiate
                    </button>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
