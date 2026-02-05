"use client"

import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Clock, X, AlarmClock, Check, School } from 'lucide-react'

const SCHOOLS = [
  { value: 'LANSKROUN', label: 'ZUŠ Lanškroun' },
  { value: 'LETOHRAD', label: 'ZUŠ Letohrad' },
]

const SNOOZE_OPTIONS = [
  { minutes: 5, label: '5 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 30, label: '30 min' },
  { minutes: 60, label: '1 hod' },
]

export default function ReminderPopup() {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastPlayedRef = useRef<number>(0)

  const dueReminders = useQuery(api.reminders.getDueReminders, {})
  const snoozeReminder = useMutation(api.reminders.snoozeReminder)
  const dismissReminder = useMutation(api.reminders.dismissReminder)

  // Filter out locally dismissed reminders
  const visibleReminders = dueReminders?.filter(r => !dismissedIds.has(r._id)) || []

  // Dismiss all visible reminders
  const handleDismissAll = async () => {
    for (const reminder of visibleReminders) {
      setDismissedIds(prev => new Set(prev).add(reminder._id))
      await dismissReminder({ id: reminder._id as Parameters<typeof dismissReminder>[0]['id'] })
    }
  }

  // Keyboard shortcut: Ctrl+Enter to dismiss all
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && visibleReminders.length > 0) {
        e.preventDefault()
        handleDismissAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [visibleReminders])

  // Play sound when new reminders appear
  useEffect(() => {
    if (visibleReminders.length > 0) {
      const now = Date.now()
      // Only play sound if at least 30 seconds have passed since last play
      if (now - lastPlayedRef.current > 30000) {
        playNotificationSound()
        lastPlayedRef.current = now
      }
    }
  }, [visibleReminders.length])

  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3
      
      oscillator.start()
      
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Could not play notification sound:', e)
    }
  }

  const handleSnooze = async (id: string, minutes: number) => {
    // Immediately hide locally
    setDismissedIds(prev => new Set(prev).add(id))
    await snoozeReminder({ id: id as Parameters<typeof snoozeReminder>[0]['id'], minutes })
  }

  const handleDismiss = async (id: string) => {
    // Immediately hide locally
    setDismissedIds(prev => new Set(prev).add(id))
    await dismissReminder({ id: id as Parameters<typeof dismissReminder>[0]['id'] })
  }

  if (visibleReminders.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-w-4xl w-full mx-4 flex flex-col max-h-[90vh]">
        {/* Header with global dismiss button */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 animate-bounce" />
            <span className="text-xl font-semibold">Připomínky ({visibleReminders.length})</span>
          </div>
          <Button
            onClick={handleDismissAll}
            className="bg-white/20 hover:bg-white/30 text-white border-0"
          >
            <Check className="w-4 h-4 mr-2" />
            Zavřít vše (Ctrl+Enter)
          </Button>
        </div>

        {/* Reminders list */}
        <div className="bg-white rounded-b-lg p-4 overflow-y-auto">
          <div className="space-y-3">
            {visibleReminders.map((reminder) => (
              <Card key={reminder._id} className="border shadow-md">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    {/* Left column: Title and school */}
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-medium text-gray-900 truncate">{reminder.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <School className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{SCHOOLS.find(s => s.value === reminder.school)?.label}</span>
                      </div>
                    </div>

                    {/* Right column: Snooze options and dismiss button */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                      {/* Snooze options */}
                      <div className="flex items-center gap-1">
                        <AlarmClock className="w-4 h-4 text-gray-400" />
                        {SNOOZE_OPTIONS.map((option) => (
                          <Button
                            key={option.minutes}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSnooze(reminder._id, option.minutes)}
                            className="hover:bg-amber-50 hover:border-amber-300 text-xs px-2 py-1 h-8"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>

                      {/* Individual dismiss button */}
                      <Button
                        onClick={() => handleDismiss(reminder._id)}
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-8 px-4"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Hotovo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
