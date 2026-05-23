'use client'

import { useState } from 'react'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'

interface LineItem {
  description: string
  hsn: string
  qty: number
  rate: number
  gst: number
}

const emptyItem = (): LineItem => ({ description: '', hsn: '', qty: 1, rate: 0, gst: 18 })

export default function CreateInvoicePage() {
  const [buyer, setBuyer] = useState({ name: '', gstin: '', address: '' })
  const [items, setItems] = useState<LineItem[]>([emptyItem()])
  const [loading, setLoading] = useState(false)

  const seller = { name: 'Your Company Name', gstin: '29ABCDE1234F1Z5', address: '123 Business St, City, State - 560001' }

  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items]
    updated[i] = { ...updated[i], [field]: value }
    setItems(updated)
  }

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const addItem = () => setItems([...items, emptyItem()])

  const calcTaxable = (item: LineItem) => item.qty * item.rate
  const calcGst = (item: LineItem) => calcTaxable(item) * item.gst / 100
  const totalTaxable = items.reduce((s, it) => s + calcTaxable(it), 0)
  const totalGst = items.reduce((s, it) => s + calcGst(it), 0)
  const grandTotal = totalTaxable + totalGst

  const submit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller, buyer, items }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { height: 44, borderRadius: 10 }

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Create Invoice</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Seller */}
        <div style={{ background: '#eef2fb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Seller Details</h2>
          <p><strong>Name:</strong> {seller.name}</p>
          <p><strong>GSTIN:</strong> {seller.gstin}</p>
          <p><strong>Address:</strong> {seller.address}</p>
        </div>

        {/* Buyer */}
        <div style={{ background: '#eef2fb', borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Buyer Details</h2>
          <Input placeholder="Buyer Name" value={buyer.name} onChange={e => setBuyer({ ...buyer, name: e.target.value })} style={inputStyle} />
          <Input placeholder="GSTIN" value={buyer.gstin} onChange={e => setBuyer({ ...buyer, gstin: e.target.value })} style={{ ...inputStyle, marginTop: 8 }} />
          <Input placeholder="Address" value={buyer.address} onChange={e => setBuyer({ ...buyer, address: e.target.value })} style={{ ...inputStyle, marginTop: 8 }} />
        </div>
      </div>

      {/* Line Items */}
      <div style={{ background: '#eef2fb', borderRadius: 12, padding: 20, marginBottom: 32 }}>
        <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Line Items</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Description', 'HSN', 'Qty', 'Rate', 'GST %', 'Amount', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 4px', fontSize: 13 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td><Input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} style={inputStyle} /></td>
                <td><Input value={item.hsn} onChange={e => updateItem(i, 'hsn', e.target.value)} style={{ ...inputStyle, width: 100 }} /></td>
                <td><Input type="number" value={item.qty} onChange={e => updateItem(i, 'qty', +e.target.value)} style={{ ...inputStyle, width: 70 }} /></td>
                <td><Input type="number" value={item.rate} onChange={e => updateItem(i, 'rate', +e.target.value)} style={{ ...inputStyle, width: 100 }} /></td>
                <td><Input type="number" value={item.gst} onChange={e => updateItem(i, 'gst', +e.target.value)} style={{ ...inputStyle, width: 70 }} /></td>
                <td style={{ padding: '0 8px', fontWeight: 500 }}>₹{(calcTaxable(item) + calcGst(item)).toFixed(2)}</td>
                <td><Button onClick={() => removeItem(i)} style={{ background: '#e03131', color: '#fff', borderRadius: 8 }}>✕</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button onClick={addItem} style={{ marginTop: 12, background: '#3b5bdb', color: '#fff', borderRadius: 10 }}>+ Add Item</Button>
      </div>

      {/* Totals */}
      <div style={{ background: '#eef2fb', borderRadius: 12, padding: 20, marginBottom: 24, maxWidth: 320, marginLeft: 'auto' }}>
        <p>Taxable: ₹{totalTaxable.toFixed(2)}</p>
        <p>GST: ₹{totalGst.toFixed(2)}</p>
        <p style={{ fontWeight: 700, fontSize: 18 }}>Total: ₹{grandTotal.toFixed(2)}</p>
      </div>

      <Button onClick={submit} disabled={loading} style={{ background: '#3b5bdb', color: '#fff', height: 44, borderRadius: 10, padding: '0 32px', fontSize: 16 }}>
        {loading ? 'Generating...' : 'Generate Invoice'}
      </Button>
    </div>
  )
}
