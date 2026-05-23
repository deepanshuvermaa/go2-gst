'use client'

import { useState, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Transaction {
  date: string
  description: string
  debit?: number
  credit?: number
  balance: number
  category: string
}

export default function BankStatementsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/bank-statement', { method: 'POST', body: formData })
      const data = await res.json()
      setTransactions(data.transactions ?? [])
    } catch {
      /* handle error */
    } finally {
      setLoading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  return (
    <div style={{ background: '#fcfcfc', minHeight: '100vh', padding: 32 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Bank Statements</h1>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          background: dragging ? '#eef2fb' : '#fcfcfc',
          border: `2px dashed ${dragging ? '#3b5bdb' : '#ccc'}`,
          borderRadius: 14,
          padding: 48,
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.csv,.xlsx"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <p style={{ color: '#555' }}>
          {file ? file.name : 'Drag & drop your bank statement here, or click to browse'}
        </p>
      </div>

      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ background: '#3b5bdb', color: '#fff', borderRadius: 14 }}
      >
        {loading ? 'Uploading...' : 'Upload & Parse'}
      </Button>

      {/* Transactions Table */}
      {transactions.length > 0 && (
        <div style={{ background: '#eef2fb', borderRadius: 14, marginTop: 32, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Date</th>
                <th style={{ padding: 12 }}>Description</th>
                <th style={{ padding: 12 }}>Debit</th>
                <th style={{ padding: 12 }}>Credit</th>
                <th style={{ padding: 12 }}>Balance</th>
                <th style={{ padding: 12 }}>Category</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 12 }}>{tx.date}</td>
                  <td style={{ padding: 12 }}>{tx.description}</td>
                  <td style={{ padding: 12, color: tx.debit ? '#e03131' : undefined }}>
                    {tx.debit ? `₹${tx.debit.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: 12, color: tx.credit ? '#2f9e44' : undefined }}>
                    {tx.credit ? `₹${tx.credit.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: 12 }}>₹{tx.balance.toLocaleString()}</td>
                  <td style={{ padding: 12 }}>
                    <Badge style={{ background: '#3b5bdb', color: '#fff', borderRadius: 14 }}>
                      {tx.category}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
