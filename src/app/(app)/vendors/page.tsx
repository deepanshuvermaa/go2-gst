'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';

interface Vendor {
  name: string;
  gstin: string;
  totalSpend: number;
  transactionCount: number;
  lastActivity: string;
  recurring: boolean;
}

const mockVendors: Vendor[] = [
  { name: 'ABC Supplies', gstin: '27AABCU9603R1ZM', totalSpend: 245000, transactionCount: 12, lastActivity: '2026-05-20', recurring: true },
  { name: 'XYZ Traders', gstin: '29AAGCX4572R1Z6', totalSpend: 89000, transactionCount: 5, lastActivity: '2026-05-15', recurring: false },
  { name: 'PQR Industries', gstin: '07AAACR5055K1Z0', totalSpend: 530000, transactionCount: 24, lastActivity: '2026-05-22', recurring: true },
];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/vendors?userId=demo')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setVendors(data))
      .catch(() => setVendors(mockVendors))
      .finally(() => setLoading(false));
  }, []);

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.gstin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontFamily: 'Poppins, sans-serif', color: '#1a1a2e', marginBottom: '1.5rem' }}>Vendors</h1>
      <input
        type="text"
        placeholder="Search by name or GSTIN..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 400, padding: '0.6rem 1rem', borderRadius: 14, border: '1px solid #ddd', marginBottom: '1.5rem', fontSize: 14 }}
      />
      {loading ? (
        <p style={{ color: '#1a1a2e' }}>Loading vendors...</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filtered.map(v => (
            <div key={v.gstin} style={{ background: '#eef2fb', borderRadius: 14, padding: '1.25rem', color: '#1a1a2e' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Poppins, sans-serif', margin: 0, fontSize: 16 }}>{v.name}</h3>
                {v.recurring && <Badge style={{ background: '#3b5bdb', color: '#fff' }}>Recurring</Badge>}
              </div>
              <p style={{ margin: '0.25rem 0', fontSize: 13, opacity: 0.7 }}>GSTIN: {v.gstin}</p>
              <p style={{ margin: '0.25rem 0', fontSize: 13 }}>Total Spend: ₹{v.totalSpend.toLocaleString()}</p>
              <p style={{ margin: '0.25rem 0', fontSize: 13 }}>Transactions: {v.transactionCount}</p>
              <p style={{ margin: '0.25rem 0', fontSize: 13, opacity: 0.7 }}>Last Activity: {v.lastActivity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
