'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Student } from '@/types/database'

export default function NewLessonPage() {
  const [title, setTitle] = useState('')
  const [studentId, setStudentId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase.from('students').select('*').order('name')
      if (data) setStudents(data)
    }
    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setError('Nejste prihlaseni')
      setLoading(false)
      return
    }

    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(`${date}T${endTime}`)

    const { error } = await supabase.from('lessons').insert({
      teacher_id: user.id,
      student_id: studentId,
      title,
      description: description || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      price: price ? parseFloat(price) : null,
    })

    if (error) {
      setError('Chyba pri vytvareni lekce')
      setLoading(false)
      return
    }

    router.push('/dashboard/lessons')
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/lessons" className="text-primary-600 hover:underline">
          &larr; Zpet na seznam
        </Link>
        <h1 className="text-3xl font-bold mt-4">Nova lekce</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Nazev lekce *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="napr. Hodina klaviru"
              required
            />
          </div>

          <div>
            <label htmlFor="student" className="block text-sm font-medium text-slate-700 mb-1">
              Zak *
            </label>
            <select
              id="student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="input"
              required
            >
              <option value="">Vyberte zaka</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-sm text-slate-500 mt-1">
                Nejprve <Link href="/dashboard/students/new" className="text-primary-600">pridejte zaka</Link>
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">
                Datum *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-slate-700 mb-1">
                Zacatek *
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-slate-700 mb-1">
                Konec *
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">
              Cena (Kc)
            </label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              placeholder="500"
              min="0"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Poznamky
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || students.length === 0}
              className="btn btn-primary"
            >
              {loading ? 'Ukladam...' : 'Vytvorit lekci'}
            </button>
            <Link href="/dashboard/lessons" className="btn btn-secondary">
              Zrusit
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
