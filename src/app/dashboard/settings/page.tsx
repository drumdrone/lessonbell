'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || '')
        const { data: teacher } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', user.id)
          .single()
        if (teacher) {
          setName(teacher.name)
          setPhone(teacher.phone || '')
        }
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('teachers')
      .update({ name, phone: phone || null })
      .eq('id', user.id)

    if (error) {
      setMessage('Chyba pri ukladani')
    } else {
      setMessage('Ulozeno!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Nastaveni</h1>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Profil</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-sm ${message.includes('Chyba') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Jmeno
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              className="input bg-slate-100"
              disabled
            />
            <p className="text-sm text-slate-500 mt-1">Email nelze zmenit</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Telefon
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Ukladam...' : 'Ulozit zmeny'}
          </button>
        </form>
      </div>
    </div>
  )
}
