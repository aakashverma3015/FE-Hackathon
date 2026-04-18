import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { Phone, Navigation, Truck, MapPin } from 'lucide-react';

// ── Predefined MP route coordinates ────────────────────────────
const ROUTES = {
  'Indore → Bhopal': {
    from: [22.7196, 75.8577], to: [23.2599, 77.4126],
    waypoints: [[22.7196, 75.8577], [22.9734, 76.0520], [23.1000, 76.5500], [23.2599, 77.4126]],
    km: 193, time: '4-5 hrs',
  },
  'Indore → Ujjain': {
    from: [22.7196, 75.8577], to: [23.1765, 75.7885],
    waypoints: [[22.7196, 75.8577], [22.9000, 75.8200], [23.1765, 75.7885]],
    km: 55, time: '1.5 hrs',
  },
  'Indore → Ratlam': {
    from: [22.7196, 75.8577], to: [23.3311, 75.0367],
    waypoints: [[22.7196, 75.8577], [22.9500, 75.4000], [23.3311, 75.0367]],
    km: 125, time: '2.5-3 hrs',
  },
  'Indore → Dewas': {
    from: [22.7196, 75.8577], to: [22.9627, 76.0509],
    waypoints: [[22.7196, 75.8577], [22.8400, 75.9500], [22.9627, 76.0509]],
    km: 36, time: '45 min',
  },
};

const MANDI_LOCATIONS = [
  { name: 'Indore APMC', lat: 22.7196, lng: 75.8577, type: 'source' },
  { name: 'Bhopal Krishi Mandi', lat: 23.2599, lng: 77.4126, type: 'dest' },
  { name: 'Ujjain Mandi', lat: 23.1765, lng: 75.7885, type: 'dest' },
  { name: 'Ratlam APMC', lat: 23.3311, lng: 75.0367, type: 'dest' },
  { name: 'Dewas APMC', lat: 22.9627, lng: 76.0509, type: 'dest' },
];

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const truckIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions?.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  }, [positions, map]);
  return null;
}

export default function Transport() {
  const { t } = useTranslation();
  const { transportProviders } = useApp();
  const [pickup, setPickup] = useState('Indore');
  const [delivery, setDelivery] = useState('Bhopal');
  const [routeKey, setRouteKey] = useState(null);
  const [calculated, setCalculated] = useState(false);
  const [selected, setSelected] = useState(null);
  const [bookStep, setBookStep] = useState(0);
  const [otp, setOtp] = useState('');
  const [truckPos, setTruckPos] = useState(null);
  const [truckStep, setTruckStep] = useState(0);

  const activeRoute = routeKey ? ROUTES[routeKey] : null;

  // Animate truck along waypoints after booking confirmed
  useEffect(() => {
    if (bookStep !== 3 || !activeRoute) return;
    const pts = activeRoute.waypoints;
    setTruckPos(pts[0]);
    setTruckStep(0);
    const interval = setInterval(() => {
      setTruckStep(prev => {
        const next = prev + 1;
        if (next >= pts.length) { clearInterval(interval); return prev; }
        setTruckPos(pts[next]);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [bookStep]);

  const handleCalculate = () => {
    const key = `${pickup.trim()} → ${delivery.trim()}`;
    const found = ROUTES[key];
    if (!found) {
      toast.error('Route not in database — showing default Indore → Bhopal');
      setRouteKey('Indore → Bhopal');
    } else {
      setRouteKey(key);
    }
    setCalculated(true);
    const r = found || ROUTES['Indore → Bhopal'];
    toast.success(`Route calculated! ${r.km} km · ${r.time} · 3 options found`);
  };

  const handleBook = (provider) => {
    setSelected(provider);
    setBookStep(1);
    toast.success(`OTP sent for ${provider.name} booking`);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) { toast.error('Enter valid 4-digit OTP'); return; }
    setBookStep(2);
    setTimeout(() => setBookStep(3), 1800);
  };

  const currentRoute = activeRoute || ROUTES['Indore → Bhopal'];

  return (
    <div style={{ background: 'var(--surface-bg)', minHeight: '100vh', paddingBottom: 32 }}>
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="breadcrumb" style={{ marginBottom: 16 }}>
          <span className="breadcrumb-item">🏠 Home</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-item active">🚛 Transport Booking</span>
        </div>

        <h1 style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', color: '#1B5E20', marginBottom: 4 }}>
          🚛 Transport Booking
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
          Compare Porter, Loadshare &amp; Vahak — real-time route visualization
        </p>

        {/* ── Main Map (always visible) ── */}
        <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', marginBottom: 24, border: '2px solid #C8E6C9' }}>
          <div style={{ background: '#1B5E20', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} color="white" />
            <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>
              {calculated ? `Route: ${routeKey || 'Indore → Bhopal'} · ${currentRoute.km} km · ${currentRoute.time}` : 'MP Mandi Network Map'}
            </span>
            {bookStep === 3 && (
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#FFD54F', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div className="live-dot" style={{ background: '#FFD54F' }} /> LIVE TRACKING
              </span>
            )}
          </div>
          <MapContainer
            center={[22.9734, 76.5000]}
            zoom={7}
            style={{ height: 360, width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OSM" />

            {/* Show route when calculated */}
            {calculated && activeRoute && (
              <>
                <FitBounds positions={activeRoute.waypoints} />
                <Polyline positions={activeRoute.waypoints} pathOptions={{ color: '#1B5E20', weight: 5, dashArray: '10 6' }} />
                <Marker position={activeRoute.from} icon={greenIcon}>
                  <Popup><strong>📍 Pickup:</strong> {pickup}</Popup>
                </Marker>
                <Marker position={activeRoute.to} icon={redIcon}>
                  <Popup><strong>🎯 Delivery:</strong> {delivery}</Popup>
                </Marker>
              </>
            )}

            {/* Show mandi network when not calculated */}
            {!calculated && MANDI_LOCATIONS.map(m => (
              <Marker key={m.name} position={[m.lat, m.lng]} icon={m.type === 'source' ? greenIcon : redIcon}>
                <Popup><strong>{m.name}</strong><br />{m.type === 'source' ? '📦 Major Source Mandi' : '🏪 Destination Mandi'}</Popup>
              </Marker>
            ))}

            {/* Animated truck after booking */}
            {bookStep === 3 && truckPos && (
              <Marker position={truckPos} icon={truckIcon}>
                <Popup><strong>🚛 MP09 AB 1234</strong><br />Driver: Ramesh Kumar<br />📞 9876543210</Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Quick routes */}
          <div style={{ background: '#F8FAF7', padding: '10px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center' }}>Quick routes:</span>
            {Object.keys(ROUTES).map(r => (
              <button key={r} onClick={() => { const parts = r.split(' → '); setPickup(parts[0]); setDelivery(parts[1]); setRouteKey(r); setCalculated(true); toast.success(`Route: ${ROUTES[r].km} km`); }}
                style={{ fontSize: '0.72rem', padding: '4px 10px', borderRadius: 100, border: '1px solid #C8E6C9', background: routeKey === r ? '#1B5E20' : 'white', color: routeKey === r ? 'white' : '#1B5E20', cursor: 'pointer', fontWeight: 600 }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Route Input */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">📍 Pickup Location</label>
              <input type="text" className="form-input" placeholder="e.g. Indore, Dewas"
                value={pickup} onChange={e => setPickup(e.target.value)} list="pickup-list" />
              <datalist id="pickup-list">
                {['Indore', 'Ujjain', 'Dewas', 'Bhopal', 'Ratlam'].map(v => <option key={v} value={v} />)}
              </datalist>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 2 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>➜</div>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">🎯 Delivery Location</label>
              <input type="text" className="form-input" placeholder="e.g. Bhopal, Ratlam"
                value={delivery} onChange={e => setDelivery(e.target.value)} list="delivery-list" />
              <datalist id="delivery-list">
                {['Bhopal', 'Ratlam', 'Ujjain', 'Dewas', 'Jabalpur'].map(v => <option key={v} value={v} />)}
              </datalist>
            </div>
          </div>
          <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: 16 }} onClick={handleCalculate}>
            <Navigation size={18} /> Calculate Route &amp; Compare Prices
          </button>
        </div>

        {/* Results */}
        {calculated && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, color: '#1B5E20', fontSize: '0.95rem' }}>AI Route Analysis</div>
                <div style={{ fontSize: '0.85rem', color: '#2E7D32' }}>
                  Distance: <strong>{currentRoute.km} km</strong> · ETA: <strong>{currentRoute.time}</strong> · Best time: <strong>6:00–8:00 AM</strong>
                </div>
              </div>
            </div>

            <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 14 }}>📊 Provider Comparison</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {(transportProviders?.length ? transportProviders : [
                { id: 1, name: 'Porter', vehicle: 'Mini Truck', rating: 4.6, time: currentRoute.time, price: Math.round(currentRoute.km * 12), best: true },
                { id: 2, name: 'Loadshare', vehicle: 'Tempo', rating: 4.4, time: currentRoute.time, price: Math.round(currentRoute.km * 10), best: false },
                { id: 3, name: 'Vahak', vehicle: 'Large Truck', rating: 4.2, time: currentRoute.time, price: Math.round(currentRoute.km * 9), best: false },
              ]).map(p => {
                const finalPrice = p.price || Math.round((p.basePrice || 500) + (p.pricePerKm || 15) * currentRoute.km);
                return (
                <div key={p.id} style={{ background: 'var(--card-bg)', borderRadius: 18, padding: 20, border: `2px solid ${p.best ? '#1B5E20' : '#f0f0f0'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
                  {p.best && <div style={{ position: 'absolute', top: -10, left: 20 }}><span style={{ background: '#1B5E20', color: 'white', padding: '2px 12px', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700 }}>⭐ Best Option</span></div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: p.best ? '#E8F5E9' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                      {p.name === 'Porter' ? '🟢' : p.name === 'Loadshare' ? '🔵' : '🟠'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#1B5E20' }}>{p.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⭐ {p.rating}</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <span><Truck size={13} style={{ display: 'inline', marginRight: 4 }} />{p.vehicle}</span>
                        <span>⏱️ {p.time || currentRoute.time}</span>
                        <span>📍 {currentRoute.km} km</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: p.best ? '#1B5E20' : '#374151' }}>₹{finalPrice.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total cost</div>
                      <button className={`btn btn-sm ${p.best ? 'btn-primary' : 'btn-outline'}`} style={{ marginTop: 8 }} onClick={() => handleBook({ ...p, price: finalPrice })}>Book Now</button>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            <div style={{ background: '#FFEBEE', border: '2px solid #F44336', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Phone size={22} color="#C62828" />
              <div>
                <div style={{ fontWeight: 700, color: '#C62828', fontSize: '0.9rem' }}>Transport Emergency?</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>If your transport partner cancels last minute, call our emergency team</div>
              </div>
              <button className="btn btn-sm" style={{ marginLeft: 'auto', background: '#F44336', color: 'white', flexShrink: 0 }} onClick={() => toast.success('Calling 1800-XXX-XXXX...')}>📞 Emergency</button>
            </div>
          </>
        )}

        {/* OTP Modal */}
        {bookStep === 1 && selected && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 4, textAlign: 'center' }}>Confirm Booking — {selected.name}</h3>
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 24 }}>Enter the OTP sent to your mobile</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {[0, 1, 2, 3].map(i => (
                  <input key={i} type="text" maxLength={1}
                    style={{ width: 52, height: 58, textAlign: 'center', fontSize: '1.3rem', fontWeight: 700, border: '2px solid #e2e8f0', borderRadius: 12, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#1B5E20'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    onChange={e => { const val = otp.split(''); val[i] = e.target.value; setOtp(val.join('')); if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus(); }}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>Demo OTP: <strong>4729</strong></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline btn-full" onClick={() => setBookStep(0)}>Cancel</button>
                <button className="btn btn-primary btn-full" onClick={handleVerifyOtp}>Verify &amp; Book</button>
              </div>
            </div>
          </div>
        )}

        {/* Live Tracking Modal after confirm */}
        {bookStep === 3 && selected && (
          <div className="modal-overlay">
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>🚛</div>
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, color: '#1B5E20', marginBottom: 4 }}>Booking Confirmed!</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your truck is on the way — live position updating on map</p>
              </div>
              <div style={{ background: '#E8F5E9', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#1B5E20', marginBottom: 6, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="live-dot" /> Live Tracking Active
                </div>
                {[['Vehicle', 'MP09 AB 1234'], ['Driver', 'Ramesh Kumar'], ['Contact', '📞 9876543210'], ['ETA', '2:30 PM today'], ['Route', routeKey || 'Indore → Bhopal']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 600, color: '#2E7D32' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#F3F4F6', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                📍 Watch the orange marker move on the map above as your truck travels the route
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { setBookStep(0); setSelected(null); setTruckPos(null); }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
