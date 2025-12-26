import { useState, useEffect } from 'react';
import { TierList } from '../components/TierList';
import type { TierList as TierListType, UnitMap } from '../types';

export const TierListPage = () => {
    const [tierData, setTierData] = useState<TierListType | null>(null);
    const [unitData, setUnitData] = useState<UnitMap>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tierlistRes, unitsRes] = await Promise.all([
                    fetch('/data/tierlist.json'),
                    fetch('/data/units.json')
                ]);

                if (!tierlistRes.ok || !unitsRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const tierlistData = await tierlistRes.json();
                const units = await unitsRes.json();

                setTierData(tierlistData.tiers);
                setUnitData(units);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                Loading tier list data...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>
                Error loading data: {error}
            </div>
        );
    }

    return (
        <>
            {tierData && <TierList data={tierData} units={unitData} />}
        </>
    );
};
