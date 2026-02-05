"use client"

import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Clock, Bell, School, Edit2, X, Check } from 'lucide-react'

const SCHOOLS = [
  { value: 'LANSKROUN', label: 'ZUŠ Lanškroun' },
  { value: 'LETOHRAD', label: 'ZUŠ Letohrad' },
]

export default function RemindersPanel() {
  const [title, setTitle] = useState('')
  const [school, setSchool] = useState('LANSKROUN')
  const [remindDate, setRemindDate] = useState('')
  const [remindTime, setRemindTime] = useState('')
  const [editingId, setEditingId] = useState<Id<"reminders"> | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSchool, setEditSchool] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')

  const reminders = useQuery(api.reminders.getActiveReminders, {})
  const addReminder = useMutation(api.reminders.addReminder)
  const deleteReminder = useMutation(api.reminders.deleteReminder)
  const updateReminder = useMutation(api.reminders.updateReminder)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !remindDate || !remindTime) return

    const remindAt = new Date(`${remindDate}T${remindTime}`).getTime()
    
    await addReminder({
      title: title.trim(),
      school,
      remindAt,
    })

    setTitle('')
    setRemindDate('')
    setRemindTime('')
  }

  const handleStartEdit = (reminder: NonNullable<typeof reminders>[0]) => {
    setEditingId(reminder._id)
    setEditTitle(reminder.title)
    setEditSchool(reminder.school)
    const date = new Date(reminder.remindAt)
    setEditDate(date.toISOString().split('T')[0])
    setEditTime(date.toTimeString().slice(0, 5))
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim() || !editDate || !editTime) return

    const remindAt = new Date(`${editDate}T${editTime}`).getTime()
    
    await updateReminder({
      id: editingId,
      title: editTitle.trim(),
      school: editSchool,
      remindAt,
    })

    setEditingId(null)
  }

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const isToday = date.toDateString() === today.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()

    const timeStr = date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
    
    if (isToday) return `Dnes ${timeStr}`
    if (isTomorrow) return `Zítra ${timeStr}`
    return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' }) + ` ${timeStr}`
  }

  const isPast = (timestamp: number) => timestamp < Date.now()

  if (reminders === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add Reminder Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            Nová připomínka
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Co připomenout..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Škola</label>
                <select
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {SCHOOLS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Datum</label>
                <Input
                  type="date"
                  value={remindDate}
                  onChange={(e) => setRemindDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-500 mb-1 block">Čas</label>
                <Input
                  type="time"
                  value={remindTime}
                  onChange={(e) => setRemindTime(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={!title.trim() || !remindDate || !remindTime}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Přidat
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Připomínky ({reminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Žádné připomínky</p>
              <p className="text-sm">Přidejte první připomínku výše</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`p-4 rounded-lg border transition-all ${
                    isPast(reminder.snoozedUntil || reminder.remindAt)
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-gray-100 hover:border-indigo-200'
                  }`}
                >
                  {editingId === reminder._id ? (
                    <div className="space-y-3">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-base"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <select
                          value={editSchool}
                          onChange={(e) => setEditSchool(e.target.value)}
                          className="h-10 px-3 rounded-md border border-gray-200 bg-white text-sm"
                        >
                          {SCHOOLS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <Input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                        />
                        <Input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{reminder.title}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <School className="w-3 h-3 mr-1" />
                            {SCHOOLS.find(s => s.value === reminder.school)?.label}
                          </Badge>
                          <span className={`text-sm ${
                            isPast(reminder.snoozedUntil || reminder.remindAt)
                              ? 'text-amber-600 font-medium'
                              : 'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatDateTime(reminder.snoozedUntil || reminder.remindAt)}
                          </span>
                          {reminder.snoozedUntil && (
                            <Badge variant="secondary" className="text-xs">
                              Odloženo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(reminder)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReminder({ id: reminder._id })}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
