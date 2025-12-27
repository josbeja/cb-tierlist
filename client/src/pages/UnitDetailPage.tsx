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
    const [hasGuide, setHasGuide] = useState(false);
    const [guideHeadings, setGuideHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const { t } = useTranslation();

    const handleGuideLoaded = (loaded: boolean, headings?: { id: string; text: string; level: number }[]) => {
        setHasGuide(loaded);
        if (headings) {
            setGuideHeadings(headings);
        }
    };

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
            {/* Back button moved to overlay */}
            <div style={{
                background: 'rgba(20, 20, 22, 0.5)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative'
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'var(--color-text)',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        zIndex: 10,
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    <ArrowLeft size={16} />
                    <span style={{ fontSize: '0.9rem' }}>{t('unitDetail.back')}</span>
                </button>
                {hasGuide ? (
                    /* Layout with Guide: Sidebar (Image + Details) + Main Content (Guide) */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '160px 1fr',
                        gap: '2rem',
                        padding: '2rem'
                    }}>
                        {/* Sidebar: Image and Details */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            width: '100%'
                        }}>
                            <div style={{
                                width: '100%',
                                aspectRatio: '200/280',
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

                            {/* Details below image, left aligned */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.8rem',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-secondary)',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div>
                                    <strong style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>{t('unitDetail.type')}</strong>
                                    {unit.type}
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>{t('unitDetail.leadership')}</strong>
                                    {unit.leadership}
                                </div>
                                <div>
                                    <strong style={{ color: 'var(--color-gold)', display: 'block', marginBottom: '0.2rem', fontSize: '0.8rem' }}>{t('unitDetail.tier')}</strong>
                                    {unit.tier_desc}
                                </div>
                            </div>

                            {/* Table of Contents */}
                            {guideHeadings.length > 0 && (
                                <div style={{
                                    position: 'sticky',
                                    top: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem',
                                    fontSize: '0.9rem',
                                    color: 'var(--color-text-secondary)',
                                    background: 'rgba(0,0,0,0.2)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <strong style={{ color: 'var(--color-gold)', marginBottom: '0.5rem', display: 'block' }}>Index</strong>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {guideHeadings.map(heading => (
                                            <a
                                                key={heading.id}
                                                href={`#${heading.id}`}
                                                style={{
                                                    color: 'var(--color-text-secondary)',
                                                    textDecoration: 'none',
                                                    paddingLeft: heading.level === 3 ? '1rem' : '0',
                                                    fontSize: heading.level === 3 ? '0.85rem' : '0.9rem',
                                                    transition: 'color 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-gold)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
                                            >
                                                {heading.text}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content: Guide */}
                        <div style={{ minWidth: 0 }}>
                            <GuideViewer unitSlug={guideSlug} onLoaded={handleGuideLoaded} />
                        </div>
                    </div>
                ) : (
                    /* Default Layout: Hero (Image | Title+Details) + Guide (Error/Loading) */
                    <>
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

                        <GuideViewer unitSlug={guideSlug} onLoaded={handleGuideLoaded} />
                    </>
                )}
            </div>
        </div>
    );
};
