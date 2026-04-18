import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { MapPin, Navigation, Star } from 'lucide-react';

// ── MP cold storage locations with full coordinates ──────────────
const STORAGE_LOCATIONS = [
  { id: 1, lat: 22.7196, lng: 75.8577, name: 'Rajdhani Cold Storage', price: 1.80, type: 'Private', capacity: 2000, rating: 4.5, temp: '-18°C', phone: '0731-2345678', address: 'AB Road, Indore' },
  { id: 2, lat: 22.7353, lng: 75.8760, name: 'MP State Cooperative', price: 1.20, type: 'Co-op', capacity: 5000, rating: 4.2, temp: '-20°C', phone: '0731-3456789', address: 'Vijay Nagar, Indore' },
  { id: 3, lat: 22.6961, lng: 75.8315, name: 'Govt. Cold Chain Facility', price: 0.90, type: 'Govt', capacity: 8000, rating: 3.9, temp: '-15°C', phone: '0731-4567890', address: 'Lasudia, Indore' },
  { id: 4, lat: 22.7050, lng: 75.8680, name: 'FrostMate Premium Storage', price: 2.20, type: 'Private', capacity: 1500, rating: 4.8, temp: '-22°C', phone: '0731-5678901', address: 'Scheme 54, Indore' },
  { id: 5, lat: 22.7500, lng: 75.8900, name: 'Dewas AgriCool Hub', price: 1.10, type: 'Co-op', capacity: 3500, rating: 4.1, temp: '-18°C', phone: '07272-234567', address: 'Industrial Area, Dewas' },
  { id: 6, lat: 23.1765, lng: 75.7885, name: 'Ujjain Cold Chain', price: 1.40, type: 'Private', capacity: 2500, rating: 4.3, temp: '-20°C', phone: '0734-2345678', address: 'Madhav Nagar, Ujjain' },
  { id: 7, lat: 22.9734, lng: 76.0520, name: 'Shajapur FrostStore', price: 1.00, type: 'Govt', capacity: 4000, rating: 3.8, temp: '-16°C', phone: '07364-234567', address: 'Station Road, Shajapur' },
];

const getIconColor = (price) =>
  price < 1.0 ? 'blue' : price < 1.5 ? 'green' : price < 2.0 ? 'orange' : 'red';

const colorIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Component to fly to selected storage on map
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14, { animate: true, duration: 1 });
  }, [position, map]);
  return null;
}

const TYPE_COLORS = { Govt: '#1565C0', 'Co-op': '#6A1B9A', Private: '#1B5E20' };

export default function ColdStorage() {
  const { t } = useTranslation();
  const { coldStorages } = useApp();
  const [search, setSearch] = useState('');
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [bookModal, setBookModal] = useState(null);
  const [duration, setDuration] = useState(30);
  const [qty, setQty] = useState(50);
  const [confirmed, setConfirmed] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [userPos, setUserPos] = useState(null);

  // Ask for geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {} // silent fail
      );
    }
  }, []);

  const displayList = (coldStorages?.length ? coldStorages : STORAGE_LOCATIONS).filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );
  const mapLocations = STORAGE_LOCATIONS;

  const toggleCompare = (id) => {
    if (compareList.includes(id)) { setCompareList(compareList.filter(c => c !== id)); return; }
    if (compareList.length >= 3) { toast.error('Max 3 storages for comparison'); return; }
    setCompareList([...compareList, id]);
  };

  const handleShowOnMap = (storage) => {
    const loc = STORAGE_LOCATIONS.find(s => s.id === storage.id) || STORAGE_LOCATIONS[0];
    setSelectedStorage(loc);
    setFlyTarget([loc.lat, loc.lng]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const storagesToCompare = displayList.filter(s => compareList.includes(s.id));

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 {t('nav.home') || 'Home'}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">🧊 {t('nav.coldStorage') || 'Cold Storage Finder'}</span>
        </div>

        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: '#1B5E20', marginBottom: 4 }}>
          🧊 Cold Storage Finder
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
          Find verified cold storage partners near you — click any card to highlight on map
        </p>

        {/* ── ALWAYS-VISIBLE MAP ── */}
        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', marginBottom: 24, border: '2px solid #C8E6C9' }}>
          {/* Map header */}
          <div style={{ background: '#1B5E20', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
              <MapPin size={17} />
              <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem' }}>Live Storage Map — Madhya Pradesh</span>
            </div>
            {userPos && (
              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Navigation size={12} /> Using your location
              </span>
            )}
          </div>

          <MapContainer
            center={userPos || [22.9734, 76.0520]}
            zoom={userPos ? 11 : 8}
            style={{ height: 380, width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <FlyTo position={flyTarget} />

            {/* User location */}
            {userPos && (
              <>
                <Marker position={userPos} icon={userIcon}>
                  <Popup><strong>📍 Your Location</strong></Popup>
                </Marker>
                <Circle center={userPos} radius={5000} pathOptions={{ color: '#6A1B9A', fillOpacity: 0.06 }} />
              </>
            )}

            {/* Storage markers */}
            {mapLocations.map(s => (
              <Marker key={s.id} position={[s.lat, s.lng]} icon={colorIcon(getIconColor(s.price))}>
                <Popup maxWidth={220}>
                  <div style={{ fontFamily: 'Noto Sans', fontSize: 13, lineHeight: 1.6 }}>
                    <strong style={{ color: '#1B5E20', display: 'block', marginBottom: 4 }}>🧊 {s.name}</strong>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                      <tbody>
                        {[['Type', s.type], ['Price', `₹${s.price}/qtl/day`], ['Capacity', `${s.capacity} qtl`], ['Temp', s.temp], ['Rating', `⭐ ${s.rating}/5`], ['Phone', s.phone]].map(([k, v]) => (
                          <tr key={k}>
                            <td style={{ color: 'var(--text-muted)', paddingRight: 8, fontSize: 11 }}>{k}</td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      onClick={() => setBookModal(s)}
                      style={{ marginTop: 8, width: '100%', background: '#1B5E20', color: 'white', border: 'none', borderRadius: 8, padding: '6px 0', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                    >
                      📅 Book This Storage
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div style={{ background: '#F8FAF7', padding: '10px 20px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[['🟦', '< ₹1/day', 'Budget'], ['🟩', '₹1–1.5', 'Good Value'], ['🟧', '₹1.5–2', 'Premium'], ['🟥', '> ₹2', 'High End'], ['🟣', 'Your Location', '']].map(([dot, price, tag]) => (
              <span key={price} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {dot} <strong>{price}</strong>{tag && ` (${tag})`}
              </span>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or location... (e.g. Indore, Dewas)"
            className="form-input" style={{ paddingLeft: 44 }} />
        </div>

        {/* Compare bar */}
        {compareList.length > 0 && (
          <div style={{ background: '#E8F5E9', border: '2px solid #4CAF50', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.875rem' }}>📊 {compareList.length} selected</span>
            <button className="btn btn-primary btn-sm" onClick={() => setShowCompare(true)}>Compare Now</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setCompareList([])}>Clear</button>
          </div>
        )}

        {/* Storage cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {displayList.map((storage) => {
            const loc = STORAGE_LOCATIONS.find(s => s.id === storage.id);
            const isSelected = selectedStorage?.id === storage.id;
            return (
              <div key={storage.id} style={{
                background: 'var(--card-bg)', borderRadius: 18, padding: 20,
                border: `2px solid ${isSelected ? '#1B5E20' : compareList.includes(storage.id) ? '#4CAF50' : '#f0f0f0'}`,
                boxShadow: isSelected ? '0 4px 20px rgba(27,94,32,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
                position: 'relative', transition: 'all 0.2s',
                transform: isSelected ? 'translateY(-2px)' : 'none',
              }}>
                {/* Badges */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {storage.bestValue && <span className="badge badge-gold">⭐ Best Value</span>}
                  {storage.nearest && <span className="badge badge-blue">📍 Nearest</span>}
                  {(storage.available === false) && <span className="badge badge-red">❌ Full</span>}
                  <span className="badge" style={{ background: TYPE_COLORS[storage.type] + '20', color: TYPE_COLORS[storage.type] }}>
                    {storage.type === 'Govt' ? '🏛️' : storage.type === 'Co-op' ? '🤝' : '🏢'} {storage.type}
                  </span>
                </div>

                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#1B5E20', marginBottom: 10 }}>
                  🧊 {storage.name}
                </h3>

                {loc && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} /> {loc.address}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {[
                    ['Distance', `${storage.distance || loc ? '~' + Math.round(Math.random() * 20 + 3) : '?'} km`],
                    ['Price/qtl/day', `₹${storage.pricePerDay || storage.price}`],
                    ['Capacity', `${storage.capacity} qtl`],
                    ['Rating', `⭐ ${storage.rating}`],
                    ['Temperature', loc?.temp || 'N/A'],
                    ['Phone', loc?.phone || 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label} style={{ background: 'var(--surface-bg)', borderRadius: 8, padding: '7px 10px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={`btn btn-sm ${compareList.includes(storage.id) ? 'btn-outline' : 'btn-ghost'}`}
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    onClick={() => toggleCompare(storage.id)}
                  >
                    {compareList.includes(storage.id) ? '✅ Selected' : '📊 Compare'}
                  </button>
                  {loc && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1, fontSize: '0.75rem', color: '#1565C0' }}
                      onClick={() => handleShowOnMap(storage)}
                    >
                      🗺️ Show Map
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, fontSize: '0.75rem' }}
                    disabled={storage.available === false}
                    onClick={() => storage.available !== false && setBookModal(storage)}
                  >
                    {storage.available === false ? '❌ Full' : '📅 Book'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare Modal */}
        {showCompare && (
          <div className="modal-overlay" onClick={() => setShowCompare(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '95%' }}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 20 }}>📊 Storage Comparison</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#E8F5E9' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: '#1B5E20' }}>Feature</th>
                      {storagesToCompare.map(s => <th key={s.id} style={{ padding: '12px', textAlign: 'center', color: '#1B5E20' }}>{s.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: '💰 Price/qtl/day', key: 'pricePerDay', alt: 'price', format: v => `₹${v}`, best: 'min' },
                      { label: '📦 Capacity', key: 'capacity', format: v => `${v} qtl`, best: 'max' },
                      { label: '⭐ Rating', key: 'rating', format: v => `${v}/5`, best: 'max' },
                      { label: '🏢 Type', key: 'type', format: v => v },
                    ].map((row, i) => (
                      <tr key={row.label} style={{ background: i % 2 ? '#FAFAF7' : 'white' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.label}</td>
                        {storagesToCompare.map(s => {
                          const val = s[row.key] ?? s[row.alt];
                          const nums = storagesToCompare.map(x => x[row.key] ?? x[row.alt]).filter(Number.isFinite);
                          const isBest = row.best === 'min' ? val === Math.min(...nums) : row.best === 'max' ? val === Math.max(...nums) : false;
                          return (
                            <td key={s.id} style={{ padding: '10px 12px', textAlign: 'center', color: isBest ? '#1B5E20' : '#374151', fontWeight: isBest ? 700 : 400 }}>
                              {row.format(val)} {isBest && '🏆'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn btn-outline btn-full" onClick={() => setShowCompare(false)}>Close</button>
                <button className="btn btn-primary btn-full" onClick={() => { setShowCompare(false); setBookModal(storagesToCompare[0]); }}>
                  Book Best Option
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Book Modal */}
        {bookModal && !confirmed && (
          <div className="modal-overlay" onClick={() => setBookModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>📅 Book: {bookModal.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20 }}>Confirm your storage booking details</p>
              <div className="form-group">
                <label className="form-label">Quantity (Quintals)</label>
                <input type="number" className="form-input" value={qty} onChange={e => setQty(+e.target.value)} min={1} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (Days)</label>
                <input type="number" className="form-input" value={duration} onChange={e => setDuration(+e.target.value)} min={1} />
              </div>
              <div style={{ background: '#E8F5E9', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: 4 }}>
                  <span>Storage cost</span>
                  <span>₹{bookModal.pricePerDay || bookModal.price}/qtl/day × {qty} qtl × {duration} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: '#1B5E20' }}>
                  <span>Total</span>
                  <span>₹{Math.round((bookModal.pricePerDay || bookModal.price) * qty * duration * 100).toLocaleString()}</span>
                </div>
              </div>
              <div className="alert alert-warning" style={{ marginBottom: 16 }}>⚠️ <strong>Cancellation Policy:</strong> Cancellation within 24hrs will incur ₹200 charge</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-full" onClick={() => setBookModal(null)}>Cancel</button>
                <button className="btn btn-primary btn-full" onClick={() => { setConfirmed(true); toast.success('Storage booked! OTP sent to your mobile.'); }}>✅ Confirm Booking</button>
              </div>
            </div>
          </div>
        )}

        {confirmed && (
          <div className="modal-overlay" onClick={() => setConfirmed(false)}>
            <div className="modal-box" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <div className="success-icon" style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 8 }}>Booking Confirmed!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
                Your storage at <strong>{bookModal?.name}</strong> is confirmed. Details sent via SMS.
              </p>
              <div style={{ background: '#F3F4F6', borderRadius: 12, padding: 12, fontSize: '0.8rem', color: 'var(--text-primary)', marginBottom: 20 }}>
                Booking ID: CS-{Date.now().toString().slice(-6)} | OTP: 847291
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { setConfirmed(false); setBookModal(null); }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
