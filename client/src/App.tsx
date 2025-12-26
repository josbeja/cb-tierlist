import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TierListPage } from './pages/TierListPage';
import { UnitDetailPage } from './pages/UnitDetailPage';

function App() {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const response = await fetch('/data/tierlist.json');
        const data = await response.json();
        setLastUpdated(data.lastUpdated);
      } catch (error) {
        console.error('Error fetching last updated date:', error);
      }
    };
    fetchLastUpdated();
  }, []);

  return (
    <BrowserRouter>
      <Layout lastUpdated={lastUpdated}>
        <Routes>
          <Route path="/" element={<TierListPage />} />
          <Route path="/unit/:unitName" element={<UnitDetailPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
