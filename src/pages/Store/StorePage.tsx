import { useState, useEffect } from 'react';
import Header from '@/components/common/Header/Header';
import Footer from '@/components/common/Footer/Footer';
import { getStoreLocation, getStoreBranches } from '@/services/storeService';
import type { StoreLocationDto, StoreBranchDto } from '@/services/storeService';
import 'leaflet/dist/leaflet.css';
import './StorePage.css';

const StorePage = () => {
    const [location, setLocation] = useState<StoreLocationDto | null>(null);
    const [branches, setBranches] = useState<StoreBranchDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [MapComponents, setMapComponents] = useState<any>(null);

    // Dynamically import react-leaflet + fix icons (avoids SSR/rendering issues)
    useEffect(() => {
        const loadMap = async () => {
            try {
                const L = await import('leaflet');
                const RL = await import('react-leaflet');

                // Fix default marker icons for Vite
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                setMapComponents(RL);
            } catch (err) {
                console.error('Failed to load map:', err);
            }
        };
        loadMap();
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [loc, brs] = await Promise.all([
                    getStoreLocation().catch(() => null),
                    getStoreBranches().catch(() => []),
                ]);
                setLocation(loc);
                setBranches(brs);
            } catch {
                setError('Failed to load store information');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const defaultCenter: [number, number] = location
        ? [location.latitude, location.longitude]
        : [10.8231, 106.6297]; // Default HCMC

    const renderMap = () => {
        if (!MapComponents) return <div className="store-loading">Loading map...</div>;

        const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

        return (
            <MapContainer
                center={defaultCenter}
                zoom={14}
                className="store-map"
                style={{ height: '500px', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Main store marker */}
                {location && (
                    <Marker position={[location.latitude, location.longitude]}>
                        <Popup>
                            <strong>{location.name}</strong><br />
                            {location.address}<br />
                            📞 {location.phone}
                        </Popup>
                    </Marker>
                )}

                {/* Branch markers */}
                {branches.map((branch: StoreBranchDto, idx: number) => (
                    <Marker key={idx} position={[branch.latitude, branch.longitude]}>
                        <Popup>
                            <strong>{branch.name}</strong><br />
                            {branch.address}<br />
                            📞 {branch.phone}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        );
    };

    return (
        <>
            <Header />
            <main className="store-page">
                <div className="store-container">
                    <div className="store-header">
                        <h1>Our Stores</h1>
                        <p>Visit us at our store locations</p>
                    </div>

                    {loading ? (
                        <div className="store-loading">Loading store information...</div>
                    ) : error ? (
                        <div className="store-error">{error}</div>
                    ) : (
                        <div className="store-content">
                            {/* Map */}
                            <div className="store-map-wrapper">
                                {renderMap()}
                            </div>

                            {/* Store Info */}
                            <div className="store-info-panel">
                                {/* Main Store */}
                                {location && (
                                    <div className="store-card main-store">
                                        <div className="store-card-badge">Main Store</div>
                                        <h3>{location.name}</h3>
                                        <div className="store-card-detail">
                                            <span className="material-symbols-outlined">location_on</span>
                                            <span>{location.address}</span>
                                        </div>
                                        <div className="store-card-detail">
                                            <span className="material-symbols-outlined">phone</span>
                                            <span>{location.phone}</span>
                                        </div>
                                        {location.email && (
                                            <div className="store-card-detail">
                                                <span className="material-symbols-outlined">mail</span>
                                                <span>{location.email}</span>
                                            </div>
                                        )}
                                        <div className="store-card-detail">
                                            <span className="material-symbols-outlined">schedule</span>
                                            <div className="store-hours">
                                                {typeof location.openingHours === 'object' && location.openingHours
                                                    ? Object.entries(location.openingHours).map(([day, hours]) => (
                                                        <div key={day} className="store-hours-row">
                                                            <span className="store-hours-day">{day}:</span>
                                                            <span>{String(hours)}</span>
                                                        </div>
                                                    ))
                                                    : <span>{String(location.openingHours || 'N/A')}</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Branches */}
                                {branches.length > 0 && (
                                    <>
                                        <h3 className="branches-title">Branches ({branches.length})</h3>
                                        {branches.map((branch, idx) => (
                                            <div
                                                key={idx}
                                                className="store-card"
                                            >
                                                <h4>{branch.name}</h4>
                                                <div className="store-card-detail">
                                                    <span className="material-symbols-outlined">location_on</span>
                                                    <span>{branch.address}</span>
                                                </div>
                                                <div className="store-card-detail">
                                                    <span className="material-symbols-outlined">phone</span>
                                                    <span>{branch.phone}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default StorePage;
