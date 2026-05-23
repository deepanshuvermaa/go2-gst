'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const fields = [
  { key: 'grossSalary', label: 'Gross Salary' },
  { key: 'businessIncome', label: 'Business Income' },
  { key: 'section80C', label: '80C Deduction' },
  { key: 'section80D', label: '80D Deduction' },
  { key: 'hra', label: 'HRA Exemption' },
  { key: 'homeLoanInterest', label: 'Home Loan Interest' },
  { key: 'tdsDeducted', label: 'TDS Deducted' },
] as const

type Result = {
  oldRegime: { taxable: number; tax: number };
  newRegime: { taxable: number; tax: number };
  recommended: 'old' | 'new';
  advanceTax: { q1: number; q2: number; q3: number; q4: number };
}

export default function ITRPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const body = Object.fromEntries(fields.map(f => [f.key, Number(form[f.key] || 0)]))
    const res = await fetch('/api/itr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setResult(await res.json())
    setLoading(false)
  }

  const inputStyle = { height: '44px', borderRadius: '10px' }

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>ITR Calculator</h1>

      <form onSubmit={handleSubmit} style={{ background: '#eef2fb', borderRadius: '12px', padding: '1.5rem', maxWidth: '600px' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: '0.875rem', marginBottom: '4px', display: 'block' }}>{f.label}</label>
              <Input type="number" placeholder="0" value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
            </div>
          ))}
        </div>
        <Button type="submit" disabled={loading} style={{ marginTop: '1rem', background: '#3b5bdb', color: '#fff', borderRadius: '10px', height: '44px', width: '100%' }}>
          {loading ? 'Calculating...' : 'Calculate Tax'}
        </Button>
      </form>

      {result && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem', maxWidth: '600px' }}>
            {(['old', 'new'] as const).map(regime => {
              const data = regime === 'old' ? result.oldRegime : result.newRegime
              const isRecommended = result.recommended === regime
              return (
                <div key={regime} style={{ background: '#eef2fb', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <strong style={{ textTransform: 'capitalize' }}>{regime} Regime</strong>
                    {isRecommended && <Badge style={{ background: '#3b5bdb', color: '#fff' }}>Recommended</Badge>}
                  </div>
                  <p style={{ fontSize: '0.875rem' }}>Taxable: ₹{data.taxable.toLocaleString('en-IN')}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>Tax: ₹{data.tax.toLocaleString('en-IN')}</p>
                </div>
              )
            })}
          </div>

          <div style={{ background: '#eef2fb', borderRadius: '12px', padding: '1.25rem', marginTop: '1.5rem', maxWidth: '600px' }}>
            <h2 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Advance Tax Schedule</h2>
            <table style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead><tr>{['Quarter', 'Due Date', 'Amount'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 0' }}>{h}</th>)}</tr></thead>
              <tbody>
                {[
                  { q: 'Q1', date: '15 Jun', amt: result.advanceTax.q1 },
                  { q: 'Q2', date: '15 Sep', amt: result.advanceTax.q2 },
                  { q: 'Q3', date: '15 Dec', amt: result.advanceTax.q3 },
                  { q: 'Q4', date: '15 Mar', amt: result.advanceTax.q4 },
                ].map(r => (
                  <tr key={r.q}><td style={{ padding: '6px 0' }}>{r.q}</td><td>{r.date}</td><td>₹{r.amt.toLocaleString('en-IN')}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
