import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { processImageUrl } from '../utils/imageUtils';
import type { UnitMap, UnitData } from '../types';
import { ArrowLeft } from 'lucide-react';
import { GuideViewer } from '../components/GuideViewer';

export const UnitDetailPage = () => {
    const { unitName } = useParams<{ unitName: string }>();
    const navigate = useNavigate();
    const [units, setUnits] = useState<UnitMap>({});
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const response = await fetch('/data/units.json');
                const unitsArray: UnitData[] = await response.json();

                // Convert array to map using unit_name as key
                const unitsMap: UnitMap = {};
                unitsArray.forEach(unit => {
                    unitsMap[unit.unit_name] = unit;
                });

                setUnits(unitsMap);
            } catch (error) {
                console.error('Error loading unit data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUnits();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                Loading unit data...
            </div>
        );
    }

    const unit = unitName ? units[unitName] : null;

    if (!unit || !unitName) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: '#ff4444' }}>Unit not found</h2>
                <button onClick={() => navigate('/')} style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--color-gold)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}>
                    {t('unitDetail.backToList')}
                </button>
            </div>
        );
    }

    const processedImage = processImageUrl(unit.imageUrl);
    const guideSlug = unit.guideSlug || unitName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem',
            minHeight: '100vh'
        }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'var(--color-text)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '2rem',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'var(--color-gold)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
            >
                <ArrowLeft size={20} />
                {t('unitDetail.backToList')}
            </button>

            <div style={{
                background: 'rgba(20, 20, 22, 0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden'
            }}>
                {/* Hero section with image and title */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '2rem',
                    padding: '2rem',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(0, 0, 0, 0.2)'
                }}>
                    <div style={{
                        width: '200px',
                        height: '280px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        {processedImage && (
                            <img
                                src={processedImage}
                                alt={unitName}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        )}
                    </div>

                    <div>
                        <h1 style={{
                            fontSize: '2.5rem',
                            margin: 0,
                            color: 'var(--color-gold)',
                            fontFamily: 'var(--font-display)'
                        }}>
                            {unitName}
                        </h1>
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            marginTop: '1rem',
                            fontSize: '1rem',
                            color: 'var(--color-text-secondary)'
                        }}>
                            <div>
                                <strong style={{ color: 'var(--color-gold)' }}>{t('unitDetail.type')}:</strong> {unit.type}
                            </div>
                            <div>
                                <strong style={{ color: 'var(--color-gold)' }}>{t('unitDetail.leadership')}:</strong> {unit.leadership}
                            </div>
                            <div>
                                <strong style={{ color: 'var(--color-gold)' }}>{t('unitDetail.tier')}:</strong> {unit.tier_desc}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guide content */}
                <GuideViewer unitSlug={guideSlug} />
            </div>
        </div>
    );
};
