import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import toast from 'react-hot-toast';
import { Phone, Navigation, Truck, MapPin, Zap, CheckCircle, Info, Star, Search, Layout } from 'lucide-react';

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
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', paddingBottom: 60, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <div className="container" style={{ paddingTop: 24 }}>
        
        {/* ── BREADCRUMB ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.15s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-600)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>Home</span>
          <span style={{ color: 'var(--border-strong)' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Transport Booking</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 4 }}>
              Agri Logistics Network
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Compare and book certified logistics providers for Mandi transport.</p>
          </div>
          {bookStep === 3 && (
            <div style={{ 
              background: '#FEF3C7', border: '1px solid #FDE68A', padding: '6px 12px', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 700, color: '#92400E'
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: '#D97706' }} /> LIVE TRACKING ACTIVE
            </div>
          )}
        </div>

        {/* ── ROUTE CALCULATION ACTION BAR ── */}
        <div style={{ 
          background: 'var(--bg-card)', borderRadius: 16, padding: '16px 20px', marginBottom: 24,
          border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr) auto', gap: 16, alignItems: 'end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pickup Mandi</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-600)' }} />
                <input 
                  type="text" style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px 0 34px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                  placeholder="Source" value={pickup} onChange={e => setPickup(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Truck size={18} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Destination</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-red)' }} />
                <input 
                  type="text" style={{ width: '100%', height: 40, borderRadius: 8, border: '1px solid var(--border)', padding: '0 12px 0 34px', fontSize: '0.875rem', background: 'var(--bg-page)' }}
                  placeholder="Destination" value={delivery} onChange={e => setDelivery(e.target.value)} 
                />
              </div>
            </div>

            <button 
              onClick={handleCalculate}
              className="btn btn-primary"
              style={{ height: 40, padding: '0 24px', fontSize: '0.8125rem', fontWeight: 700 }}
            >
              Verify Route
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 32, alignItems: 'start' }}>
          
          {/* ── LEFT: PROVIDERS & AI INSIGHTS ── */}
          <div>
            {calculated && (
              <div style={{
                background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 16,
                padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20,
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'var(--brand-500)' }} />
                <div style={{ 
                  width: 48, height: 48, borderRadius: 12, background: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <Zap size={24} color="var(--brand-600)" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--brand-900)' }}>Logistics Intelligence</span>
                    <span style={{ background: 'var(--brand-600)', color: 'white', padding: '1px 8px', borderRadius: 999, fontSize: '0.625rem', fontWeight: 800 }}>OPTIMIZED</span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--brand-700)', lineHeight: 1.5 }}>
                    Route: <strong>{currentRoute.km} km</strong> via Indore bypass. ETA: <strong>{currentRoute.time}</strong>.
                    Recommended pickup window: <strong>7:00 AM – 9:00 AM</strong> for minimum congestion.
                  </p>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(transportProviders?.length ? transportProviders : [
                { id: 1, name: 'Porter', vehicle: 'Tata Ace (Chota Haathi)', rating: 4.8, type: 'Verified', price: Math.round(currentRoute.km * 12.5), best: true },
                { id: 2, name: 'Loadshare', vehicle: 'Bolero Pickup', rating: 4.5, type: 'Fastest', price: Math.round(currentRoute.km * 11), best: false },
                { id: 3, name: 'Vahak', vehicle: 'Eicher 14ft', rating: 4.3, type: 'Standard', price: Math.round(currentRoute.km * 9.8), best: false },
              ]).map((p, idx) => {
                const finalPrice = p.price || Math.round((p.basePrice || 500) + (p.pricePerKm || 15) * currentRoute.km);
                return (
                  <div key={p.id} style={{
                    background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden',
                    border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s', position: 'relative'
                  }}>
                    {idx === 0 && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--brand-600)', color: 'white', padding: '2px 12px', borderRadius: '0 0 0 12px', fontSize: '0.625rem', fontWeight: 800 }}>
                        RECOMMENDED
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      {/* Visual Signature Section */}
                      <div style={{ 
                        width: 100, background: 'var(--bg-page)', position: 'relative',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        borderRight: '1px solid var(--border-light)', gap: 8
                      }}>
                        <div style={{ 
                          width: 56, height: 56, borderRadius: 16, background: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                        }}>
                          {p.name === 'Porter' ? '🚚' : p.name === 'Loadshare' ? '🚛' : '🚛'}
                        </div>
                        <span style={{ 
                          fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>{p.type || 'Provider'}</span>
                      </div>

                      {/* Main Info */}
                      <div style={{ flex: 1, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                              <h3 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{p.name}</h3>
                              <span style={{ background: '#ECFDF5', color: '#059669', padding: '1px 8px', borderRadius: 999, fontSize: '0.625rem', fontWeight: 700 }}>VERIFIED</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={14} /> {p.vehicle}</span>
                              <span style={{ color: 'var(--border-strong)' }}>|</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={14} fill="#F59E0B" color="#F59E0B" /> {p.rating}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--brand-700)', letterSpacing: '-0.02em' }}>
                              ₹{finalPrice.toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Fixed Fare</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                          <button 
                            onClick={() => handleBook({ ...p, price: finalPrice })}
                            style={{ 
                              flex: 1.5, background: 'var(--brand-600)', color: 'white', height: 40, borderRadius: 8,
                              fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer'
                            }}
                          >
                            Book Vehicle Now
                          </button>
                          <button 
                            style={{ 
                              flex: 1, background: 'white', color: 'var(--text-primary)', height: 40, borderRadius: 8,
                              fontSize: '0.8125rem', fontWeight: 600, border: '1px solid var(--border)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}
                          >
                            <Phone size={14} /> Call Driver
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── RIGHT: INTERACTIVE ROUTE MAP ── */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ background: 'var(--brand-600)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
                  <Navigation size={16} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Full Route Trajectory</span>
                </div>
                {calculated && <span style={{ fontSize: '0.625rem', color: 'white', fontWeight: 700 }}>{currentRoute.km} KM</span>}
              </div>
              <MapContainer center={[22.9734, 76.5000]} zoom={7} style={{ height: 450, width: '100%' }} scrollWheelZoom={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OSM" />
                {calculated && activeRoute && (
                  <>
                    <FitBounds positions={activeRoute.waypoints} />
                    <Polyline positions={activeRoute.waypoints} pathOptions={{ color: 'var(--brand-600)', weight: 5, dashArray: '10 6' }} />
                    <Marker position={activeRoute.from} icon={greenIcon}><Popup><strong>Mandi Source</strong></Popup></Marker>
                    <Marker position={activeRoute.to} icon={redIcon}><Popup><strong>Mandi Destination</strong></Popup></Marker>
                  </>
                )}
                {!calculated && MANDI_LOCATIONS.map(m => (
                  <Marker key={m.name} position={[m.lat, m.lng]} icon={m.type === 'source' ? greenIcon : redIcon}>
                    <Popup><strong>{m.name}</strong></Popup>
                  </Marker>
                ))}
                {bookStep === 3 && truckPos && (
                  <Marker position={truckPos} icon={truckIcon}>
                    <Popup><strong>Live Truck Position</strong><br />MP09 AB 1234</Popup>
                  </Marker>
                )}
              </MapContainer>
              <div style={{ padding: '16px', background: 'var(--bg-page)' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--brand-600)' }} /> Source
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 2, background: '#DC2626' }} /> Destination
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── MODALS ── */}
        {bookStep === 1 && selected && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ maxWidth: 400 }}>
              <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Secure Booking</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 24 }}>Enter the verification code sent to your mobile.</p>
              
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
                {[0, 1, 2, 3].map(i => (
                  <input 
                    key={i} type="text" maxLength={1}
                    style={{ 
                      width: 52, height: 60, textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, 
                      border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-page)', outline: 'none' 
                    }}
                    onChange={e => { if (e.target.value && i < 3) e.target.parentElement.children[i+1].focus(); setOtp(prev => { const arr = prev.split(''); arr[i] = e.target.value; return arr.join(''); }); }}
                  />
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24 }}>Demo Pin: 4729</div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary btn-full" style={{ height: 44 }} onClick={() => setBookStep(0)}>Cancel</button>
                <button 
                  className="btn btn-primary btn-full" 
                  style={{ height: 44 }}
                  onClick={handleVerifyOtp}
                >
                  Verify & Book
                </button>
              </div>
            </div>
          </div>
        )}

        {bookStep === 3 && selected && (
          <div className="modal-overlay">
            <div className="modal-box" style={{ textAlign: 'center', maxWidth: 400 }}>
              <div style={{ width: 64, height: 64, borderRadius: 99, background: '#ECFDF5', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={32} color="#10B981" />
              </div>
              <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>Booking Confirmed</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20, lineHeight: 1.5 }}>
                Your transport with <strong>{selected.name}</strong> has been secured for the <strong>{routeKey}</strong> route.
              </p>
              <div style={{ background: 'var(--bg-page)', padding: 16, borderRadius: 12, textAlign: 'left', marginBottom: 20, border: '1px dashed var(--border)' }}>
                {[['Vehicle No', 'MP09 AB 1234'], ['Driver', 'Kailash Singh'], ['ETA', 'Check Map Above']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full" style={{ height: 44 }} onClick={() => { setBookStep(0); setSelected(null); setTruckPos(null); }}>Track Journey</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
