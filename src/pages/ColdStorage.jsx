import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { MapPin, Navigation, Star, Search, Map, Layout, Zap, CheckCircle, Info } from 'lucide-react';

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
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-600)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Cold Storage Finder</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Cold Storage Network
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Find and book certified storage facilities near your location.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            {compareList.length > 0 && (
              <button 
                onClick={() => setShowCompare(true)}
                style={{ 
                  background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)',
                  padding: '8px 16px', borderRadius: 8, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}
              >
                Compare ({compareList.length})
              </button>
            )}
            <button 
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => toast.success('Scanning live availability...')}
            >
              <Navigation size={14} /> Detect Location
            </button>
          </div>
        </div>

        {/* ── TOP ACTION BAR ── */}
        <div style={{ 
          background: 'var(--bg-card)', borderRadius: 16, padding: '12px 16px', marginBottom: 24,
          border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search by facility name, region or zip code..."
              style={{ 
                width: '100%', border: 'none', background: 'transparent', outline: 'none',
                fontSize: '0.9375rem', color: 'var(--text-primary)' 
              }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', alignSelf: 'center', marginRight: 8 }}>Filter:</span>
            {['All', 'Private', 'Govt', 'Co-op'].map(t => (
              <button key={t} style={{ height: 32, padding: '0 12px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)', background: 'white', color: 'var(--text-muted)', cursor: 'pointer' }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
          
          {/* ── LEFT: STORAGE GRID ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayList.map((storage) => (
              <div key={storage.id} style={{
                background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden',
                border: storage.id === selectedStorage?.id ? '2px solid var(--brand-600)' : '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s', position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  {/* Visual Signature Section */}
                  <div style={{ 
                    width: 100, background: 'var(--brand-50)', position: 'relative',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderRight: '1px solid var(--border-light)', gap: 8
                  }}>
                    <div style={{ 
                      width: 56, height: 56, borderRadius: 16, background: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }}>
                      {storage.type === 'Govt' ? '🏛️' : storage.type === 'Co-op' ? '🤝' : '🏭'}
                    </div>
                    <span style={{ 
                      fontSize: '0.625rem', fontWeight: 800, color: 'var(--brand-700)',
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>{storage.type}</span>
                  </div>

                  {/* Main Info */}
                  <div style={{ flex: 1, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{storage.name}</h3>
                          <button 
                            onClick={() => toggleCompare(storage.id)}
                            style={{ 
                              background: 'none', border: 'none', color: compareList.includes(storage.id) ? 'var(--brand-600)' : 'var(--text-muted)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', fontWeight: 600
                            }}
                          >
                            {compareList.includes(storage.id) ? '✓ Compared' : '+ Compare'}
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {storage.address}</span>
                          <span style={{ color: 'var(--border-strong)' }}>|</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="#F59E0B" color="#F59E0B" /> {storage.rating}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--brand-700)', letterSpacing: '-0.02em' }}>
                          ₹{storage.price.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>per quintal / day</div>
                      </div>
                    </div>

                    <div style={{ 
                      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, 
                      background: 'var(--bg-page)', padding: '10px 14px', borderRadius: 12, marginBottom: 16
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Capacity</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{storage.capacity.toLocaleString()} qtl</div>
                      </div>
                      <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Temp Range</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--brand-600)' }}>{storage.temp}</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Status</div>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--success)' }}>Available</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                      <button 
                        onClick={() => setBookModal(storage)}
                        style={{ 
                          flex: 1.5, background: 'var(--brand-600)', color: 'white', height: 40, borderRadius: 8,
                          fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer'
                        }}
                      >
                        Book Instantly
                      </button>
                      <button 
                        onClick={() => handleShowOnMap(storage)}
                        style={{ 
                          flex: 1, background: 'white', color: 'var(--text-primary)', height: 40, borderRadius: 8,
                          fontSize: '0.8125rem', fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                        }}
                      >
                        <Map size={14} /> Locate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── RIGHT: INTERACTIVE MAP ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ background: 'var(--brand-600)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
                  <MapPin size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Live Capacity Map</span>
                </div>
                {userPos && <span style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Using your location</span>}
              </div>
              <MapContainer center={userPos || [22.7196, 75.8577]} zoom={userPos ? 12 : 10} style={{ height: 450, width: '100%' }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                <FlyTo position={flyTarget} />
                {userPos && <Marker position={userPos} icon={userIcon}><Popup><strong>Your Location</strong></Popup></Marker>}
                {mapLocations.map(s => (
                  <Marker key={s.id} position={[s.lat, s.lng]} icon={colorIcon(getIconColor(s.price))}>
                    <Popup maxWidth={220}>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                        <strong style={{ color: 'var(--brand-700)' }}>{s.name}</strong><br />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.address}</span><br />
                        <div style={{ marginTop: 8, fontWeight: 700 }}>₹{s.price}/qtl/day</div>
                        <button onClick={() => setBookModal(s)} style={{ marginTop: 8, width: '100%', background: 'var(--brand-600)', color: 'white', border: 'none', borderRadius: 4, padding: '4px 0', fontSize: 11, cursor: 'pointer' }}>Book Now</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div style={{ padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', background: 'var(--bg-page)' }}>
                {[['🟦', '< ₹1.0'], ['🟩', '₹1–1.5'], ['🟧', '₹1.5–2'], ['🟥', '> ₹2']].map(([dot, label]) => (
                  <span key={label} style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {dot} <span style={{ fontWeight: 600 }}>{label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── MODALS ── */}
        {showCompare && (
          <div className="modal-overlay" onClick={() => setShowCompare(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '95%' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>Storage Comparison</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)' }}>Feature</th>
                      {storagesToCompare.map(s => <th key={s.id} style={{ padding: '12px', textAlign: 'center', color: 'var(--brand-700)' }}>{s.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Price (qtl/day)', key: 'price', format: v => `₹${v.toFixed(2)}`, best: 'min' },
                      { label: 'Capacity', key: 'capacity', format: v => `${v.toLocaleString()} qtl` },
                      { label: 'Rating', key: 'rating', format: v => `⭐ ${v}` },
                      { label: 'Temperature', key: 'temp', format: v => v }
                    ].map((row, i) => (
                      <tr key={row.label} style={{ background: i % 2 ? 'var(--bg-page)' : 'transparent' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{row.label}</td>
                        {storagesToCompare.map(s => {
                          const val = s[row.key];
                          return <td key={s.id} style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>{row.format(val)}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-secondary btn-full" style={{ marginTop: 24 }} onClick={() => setShowCompare(false)}>Close Selection</button>
            </div>
          </div>
        )}

        {bookModal && !confirmed && (
          <div className="modal-overlay" onClick={() => setBookModal(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
              <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Review Booking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 24 }}>Facility: {bookModal.name}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Quantity (qtl)</label>
                  <input type="number" className="form-input" style={{ borderRadius: 8, height: 40 }} value={qty} onChange={e => setQty(+e.target.value)} min={1} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Duration (Days)</label>
                  <input type="number" className="form-input" style={{ borderRadius: 8, height: 40 }} value={duration} onChange={e => setDuration(+e.target.value)} min={1} />
                </div>
              </div>

              <div style={{ background: 'var(--brand-50)', padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid var(--brand-100)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 8, color: 'var(--brand-900)' }}>
                  <span>Rate</span>
                  <span>₹{bookModal.price.toFixed(2)}/qtl/day</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', color: 'var(--brand-700)' }}>
                  <span>Estimated Total</span>
                  <span>₹{Math.round(bookModal.price * qty * duration).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary btn-full" style={{ height: 44 }} onClick={() => setBookModal(null)}>Cancel</button>
                <button 
                  className="btn btn-primary btn-full" 
                  style={{ height: 44 }}
                  onClick={() => { setConfirmed(true); toast.success('Booking recorded successfully!'); }}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmed && (
          <div className="modal-overlay" onClick={() => { setConfirmed(false); setBookModal(null); }}>
            <div className="modal-box" style={{ textAlign: 'center', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 64, height: 64, borderRadius: 99, background: '#ECFDF5', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={32} color="#10B981" />
              </div>
              <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Booking Confirmed</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 24, lineHeight: 1.5 }}>
                Your storage space at <strong>{bookModal?.name}</strong> has been reserved. Check your profile for the digital receipt.
              </p>
              <button className="btn btn-primary btn-full" style={{ height: 44 }} onClick={() => { setConfirmed(false); setBookModal(null); }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
