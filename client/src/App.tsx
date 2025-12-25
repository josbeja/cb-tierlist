import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { TierList } from './components/TierList';
import type { TierList as TierListType, UnitMap } from './types';

function App() {
  const [tierData, setTierData] = useState<TierListType | null>(null);
  const [unitData, setUnitData] = useState<UnitMap>({});
  const [lastUpdated, setLastUpdated] = useState<string>('');
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
        setLastUpdated(tierlistData.lastUpdated);
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
      <Layout lastUpdated={lastUpdated}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
          Loading tier list data...
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout lastUpdated={lastUpdated}>
        <div style={{ padding: '2rem', textAlign: 'center', color: '#ff4444' }}>
          Error loading data: {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout lastUpdated={lastUpdated}>
      {tierData && <TierList data={tierData} units={unitData} />}
    </Layout>
  );
}

export default App;
