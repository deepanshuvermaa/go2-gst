'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const mockClients = [
  { id: '1', name: 'Rajesh Kumar', phone: '9876543210', billCount: 12, totalExpenses: 245000, lastActivity: '2026-05-20' },
  { id: '2', name: 'Priya Sharma', phone: '9123456789', billCount: 8, totalExpenses: 182000, lastActivity: '2026-05-22' },
  { id: '3', name: 'Amit Patel', phone: '9988776655', billCount: 5, totalExpenses: 97000, lastActivity: '2026-05-18' },
]

export default function CAPage() {
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#fcfcfc' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Clients</h1>
          <Button
            onClick={() => setShowInvite(!showInvite)}
            style={{ backgroundColor: '#3b5bdb', borderRadius: 14 }}
          >
            Invite Client
          </Button>
        </div>

        {showInvite && (
          <div className="flex gap-3 mb-6 p-4" style={{ backgroundColor: '#eef2fb', borderRadius: 14 }}>
            <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <Button style={{ backgroundColor: '#3b5bdb' }}>Send</Button>
          </div>
        )}

        <div className="space-y-3">
          {mockClients.map(client => (
            <div
              key={client.id}
              onClick={() => router.push(`/ca/client/${client.id}`)}
              className="flex items-center justify-between p-4 cursor-pointer hover:shadow-sm transition-shadow"
              style={{ backgroundColor: '#eef2fb', borderRadius: 14 }}
            >
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">{client.phone}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="primary">{client.billCount} bills</Badge>
                <span>₹{client.totalExpenses.toLocaleString('en-IN')}</span>
                <span className="text-gray-400">{client.lastActivity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
