import { useState } from 'react';
import type { TierList as TierListType, UnitMap } from '../types';
import { TierRow } from './TierRow';

interface TierListProps {
    data: TierListType;
    units: UnitMap;
}

export const TierList: React.FC<TierListProps> = ({ data, units }) => {
    const [viewMode, setViewMode] = useState<'scroll' | 'wrap'>('scroll');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTiers, setSelectedTiers] = useState<string[]>(data.map(t => t.id));

    // Get all unique tier IDs for the filter controls
    const allTierIds = data.map(t => t.id);

    const toggleTier = (tierId: string) => {
        setSelectedTiers(prev =>
            prev.includes(tierId)
                ? prev.filter(id => id !== tierId)
                : [...prev, tierId]
        );
    };

    const filteredData = data
        .filter(tier => selectedTiers.includes(tier.id))
        .map(tier => ({
            ...tier,
            units: tier.units.filter(unitName =>
                unitName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }));

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Search units..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #555',
                            backgroundColor: '#222',
                            color: '#fff',
                            minWidth: '200px'
                        }}
                    />

                    {/* View Toggle */}
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
                        {viewMode === 'scroll' ? 'Show All (Wrap)' : 'Show Rows (Scroll)'}
                    </button>
                </div>

                {/* Tier Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#aaa', marginRight: '0.5rem' }}>Filter Tiers:</span>
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

            {filteredData.map((tier) => (
                <TierRow key={tier.id} tier={tier} units={units} viewMode={viewMode} />
            ))}
        </div>
    );
};
