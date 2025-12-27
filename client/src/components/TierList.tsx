import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Crosshair } from 'lucide-react';
import { GiHorseHead, GiSwordsEmblem } from 'react-icons/gi';
import type { TierList as TierListType, UnitMap } from '../types';
import { TierRow } from './TierRow';

interface TierListProps {
    data: TierListType;
    units: UnitMap;
}

export const TierList: React.FC<TierListProps> = ({ data, units }) => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'scroll' | 'wrap'>('scroll');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTiers, setSelectedTiers] = useState<string[]>(data.map(t => t.id));
    const [showAllTiers, setShowAllTiers] = useState(true);
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // New filter states
    const [minLeadership, setMinLeadership] = useState<string>('');
    const [maxLeadership, setMaxLeadership] = useState<string>('');
    const [selectedEras, setSelectedEras] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

    // Get all unique tier IDs for the filter controls
    const allTierIds = data.map(t => t.id);

    // Era configuration
    const ERA_COLORS: Record<string, string> = {
        'Chivalric Era': '#009500ff', // Dark Green
        'Feudal Era': '#555555ff',    // Gray
        'Golden Era': '#FFD700',    // Gold
        'Heroic Era': '#ca2ecae2',    // Violet
        'Rustic Era': '#c0c0c0ff',    // Light Gray
        'Silver Era': '#3553c0ff',    // Light Blue
    };

    const ERA_ORDER = [
        'Golden Era',
        'Heroic Era',
        'Silver Era',
        'Chivalric Era',
        'Feudal Era',
        'Rustic Era',
    ];

    // Get unique eras and types from all units
    const { uniqueEras, uniqueTypes } = useMemo(() => {
        const eras = new Set<string>();
        const types = new Set<string>();
        Object.values(units).forEach(unit => {
            eras.add(unit.era_desc);
            types.add(unit.type);
        });
        return {
            uniqueEras: Array.from(eras).sort((a, b) => {
                const indexA = ERA_ORDER.indexOf(a);
                const indexB = ERA_ORDER.indexOf(b);
                // Handle cases where era might not be in the list (put them at the end)
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            }),
            uniqueTypes: Array.from(types).sort()
        };
    }, [units]);

    const toggleTier = (tierId: string) => {
        const newSelected = selectedTiers.includes(tierId)
            ? selectedTiers.filter(id => id !== tierId)
            : [...selectedTiers, tierId];

        setSelectedTiers(newSelected);
        // If all tiers are selected, enable ALL
        if (newSelected.length === allTierIds.length) {
            setShowAllTiers(true);
        } else {
            setShowAllTiers(false);
        }
    };

    const toggleAllTiers = () => {
        if (showAllTiers) {
            // If ALL is currently on, turn it off (deselect all)
            setSelectedTiers([]);
            setShowAllTiers(false);
        } else {
            // If ALL is currently off, turn it on (select all)
            setSelectedTiers(allTierIds);
            setShowAllTiers(true);
        }
    };

    const toggleEra = (era: string) => {
        setSelectedEras(prev =>
            prev.includes(era)
                ? prev.filter(e => e !== era)
                : [...prev, era]
        );
    };

    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        );
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setMinLeadership('');
        setMaxLeadership('');
        setSelectedEras([]);
        setSelectedTypes([]);
        setSelectedTiers(allTierIds);
        setShowAllTiers(true);
    };

    const filteredData = data
        .filter(tier => selectedTiers.includes(tier.id))
        .map(tier => ({
            ...tier,
            units: tier.units.filter(unitName => {
                const unit = units[unitName];
                if (!unit) return false;

                // Search query filter
                if (!unitName.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                }

                // Leadership filter
                const min = minLeadership ? parseInt(minLeadership) : 0;
                const max = maxLeadership ? parseInt(maxLeadership) : Infinity;
                if (unit.leadership < min || unit.leadership > max) {
                    return false;
                }

                // Era filter
                if (selectedEras.length > 0 && !selectedEras.includes(unit.era_desc)) {
                    return false;
                }

                // Type filter
                if (selectedTypes.length > 0 && !selectedTypes.includes(unit.type)) {
                    return false;
                }

                return true;
            })
        }))
        // Hide empty tier rows
        .filter(tier => tier.units.length > 0);

    return (
        <div className="tier-list">
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '1.5rem',
                backgroundColor: 'rgba(0,0,0,0.2)',
                padding: '1rem',
                borderRadius: '8px'
            }}>
                {/* Top row: Search and buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    {/* Left group: Search, Filters, and Clear Filters */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder={t('filters.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '0.5rem',
                                borderRadius: '4px',
                                border: '1px solid #555',
                                backgroundColor: '#222',
                                color: '#fff',
                                width: '200px'
                            }}
                        />

                        {/* Filters Toggle Button */}
                        <button
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: filtersExpanded ? '#4a4a4a' : '#333',
                                color: '#fff',
                                border: '1px solid #555',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span style={{ fontSize: '1rem' }}>{filtersExpanded ? '▼' : '▶'}</span>
                            {t('filters.button')}
                        </button>

                        {/* Clear Filters Button */}
                        <button
                            onClick={clearAllFilters}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#444',
                                color: '#fff',
                                border: '1px solid #666',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            {t('filters.clear')}
                        </button>
                    </div>

                    {/* Right group: View Toggle */}
                    <button
                        onClick={() => setViewMode(viewMode === 'scroll' ? 'wrap' : 'scroll')}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#333',
                            color: '#fff',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {viewMode === 'scroll' ? t('view.showWrap') : t('view.showScroll')}
                    </button>
                </div>

                {/* Collapsible Filters Section */}
                {filtersExpanded && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {/* Leadership Filter */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#aaa', marginRight: '0.5rem', minWidth: '80px' }}>{t('filters.leadership')}:</span>
                            <input
                                type="number"
                                placeholder={t('filters.min')}
                                value={minLeadership}
                                onChange={(e) => setMinLeadership(e.target.value)}
                                style={{
                                    padding: '0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid #555',
                                    backgroundColor: '#222',
                                    color: '#fff',
                                    width: '80px'
                                }}
                            />
                            <span style={{ color: '#aaa' }}>-</span>
                            <input
                                type="number"
                                placeholder={t('filters.max')}
                                value={maxLeadership}
                                onChange={(e) => setMaxLeadership(e.target.value)}
                                style={{
                                    padding: '0.4rem',
                                    borderRadius: '4px',
                                    border: '1px solid #555',
                                    backgroundColor: '#222',
                                    color: '#fff',
                                    width: '80px'
                                }}
                            />
                        </div>

                        {/* Era Filter */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#aaa', marginRight: '0.5rem', minWidth: '80px' }}>{t('filters.era')}:</span>
                            {uniqueEras.map(era => (
                                <label key={era} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedEras.includes(era)}
                                        onChange={() => toggleEra(era)}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: ERA_COLORS[era] || 'inherit', fontWeight: 'bold' }}>{era}</span>
                                </label>
                            ))}
                        </div>

                        {/* Type Filter */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#aaa', marginRight: '0.5rem', minWidth: '80px' }}>{t('filters.type')}:</span>
                            {uniqueTypes.map(type => {
                                let icon = null;
                                if (type.includes('Cavalry')) {
                                    icon = <GiHorseHead size={16} />;
                                } else if (type.includes('Melee')) {
                                    icon = <GiSwordsEmblem size={16} />;
                                } else if (type.includes('Ranged')) {
                                    icon = <Crosshair size={16} />;
                                }

                                return (
                                    <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedTypes.includes(type)}
                                            onChange={() => toggleType(type)}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {icon}
                                            <span style={{ fontSize: '0.9rem' }}>{type}</span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Tier Filters */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', color: '#aaa', marginRight: '0.5rem', minWidth: '80px' }}>{t('filters.tiers')}:</span>

                            {/* ALL option */}
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                backgroundColor: showAllTiers ? 'rgba(70,130,180,0.2)' : 'rgba(255,255,255,0.05)',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: showAllTiers ? '1px solid rgba(70,130,180,0.5)' : '1px solid transparent'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={showAllTiers}
                                    onChange={toggleAllTiers}
                                />
                                <span style={{ fontSize: '0.9rem', fontWeight: showAllTiers ? 'bold' : 'normal' }}>{t('filters.all')}</span>
                            </label>

                            {allTierIds.map(tierId => (
                                <label key={tierId} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTiers.includes(tierId)}
                                        onChange={() => toggleTier(tierId)}
                                    />
                                    <span style={{ fontSize: '0.9rem' }}>{tierId}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {filteredData.map((tier) => (
                <TierRow key={tier.id} tier={tier} units={units} viewMode={viewMode} />
            ))}
        </div>
    );
};

