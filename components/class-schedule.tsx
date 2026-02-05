"use client"

import React from 'react'
import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Plus, Trash2, ChevronLeft, ChevronRight, Edit, GripVertical, Calendar, Download, CheckCircle2, Circle, FileText, Send, X } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import NotesEditor from './notes-editor'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ClassSession {
  _id: Id<"classes">
  studentName: string
  startTime: string
  endTime: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  isRecurring: boolean
  notes?: string
  school?: string
}

interface ClassScheduleProps {
  selectedDay: number
  setSelectedDay: (day: number) => void
  showForm: boolean
  setShowForm: (show: boolean) => void
}

export default function ClassSchedule({ selectedDay, setSelectedDay, showForm, setShowForm }: ClassScheduleProps) {
  // Fetch classes from database
  const classes = useQuery(api.classes.getAll)
  const addClass = useMutation(api.classes.add)
  const updateClass = useMutation(api.classes.update)
  const removeClass = useMutation(api.classes.remove)
  
  // Fetch tasks and completions for edit dialog
  const tasks = useQuery(api.tasks.getAll)
  const completions = useQuery(api.tasks.getAllCompletions)
  const toggleCompletion = useMutation(api.tasks.toggleCompletion)
  
  const { toast } = useToast()
  
  // Handle loading state
  const isLoading = classes === undefined
  
  const [studentName, setStudentName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [hasWarned, setHasWarned] = useState<Set<Id<"classes">>>(new Set())
  const [hasStartNotified, setHasStartNotified] = useState<Set<Id<"classes">>>(new Set())
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<Id<"classes"> | null>(null)
  const [editingStudentName, setEditingStudentName] = useState('')
  const [editingStartTime, setEditingStartTime] = useState('')
  const [editingEndTime, setEditingEndTime] = useState('')
  const [editingIsRecurring, setEditingIsRecurring] = useState(false)
  const [editingSelectedDuration, setEditingSelectedDuration] = useState<number | null>(null)
  const [editingNotes, setEditingNotes] = useState('')
  const [editingEmail, setEditingEmail] = useState('')
  const [draggingId, setDraggingId] = useState<Id<"classes"> | null>(null)
  const [dragStartY, setDragStartY] = useState<number>(0)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [selectedSchool, setSelectedSchool] = useState<string>('LANSKROUN')
  const [editingSchool, setEditingSchool] = useState<string>('LANSKROUN')
  const [showLearnKit, setShowLearnKit] = useState(false)
  const [learnKitEmail, setLearnKitEmail] = useState('')

  const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']

  // Hours to display (12 PM to 7 PM = 12 to 19)
  const hours = Array.from({ length: 8 }, (_, i) => i + 12)
 
  // Suppress noisy React.Fragment data-macaly-loc warnings from Macaly dev tooling
  useEffect(() => {
    const originalConsoleError = console.error
    console.log('Setting up console.error filter for React.Fragment data-macaly-loc warning')

    console.error = (...args: any[]) => {
      const firstArg = args[0]
      if (
        typeof firstArg === 'string' &&
        firstArg.includes('Invalid prop `data-macaly-loc` supplied to `React.Fragment`')
      ) {
        return
      }
      originalConsoleError(...args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])
 
  // Update current time every second
  useEffect(() => {
    // Set initial time on mount
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Check for 5-minute warnings
  useEffect(() => {
    if (!currentTime) return
    
    const todayClasses = getClassesForDay(selectedDay)
    
    todayClasses.forEach(cls => {
      const now = new Date()
      const [endHours, endMinutes] = cls.endTime.split(':').map(Number)
      const endDate = new Date()
      endDate.setHours(endHours, endMinutes, 0, 0)
      
      const timeUntilEnd = endDate.getTime() - now.getTime()
      const fiveMinutes = 5 * 60 * 1000

      if (timeUntilEnd <= fiveMinutes && timeUntilEnd > 0 && !hasWarned.has(cls._id)) {
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Konec hodiny za 5 minut!', {
            body: `Hodina se žákem ${cls.studentName} končí za 5 minut`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: `class-warning-${cls._id}`,
            requireInteraction: true
          })
        }
        
        // Vibrate on mobile if supported
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200])
        }
        
        // Play audio notification
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZSA==')
        audio.play().catch(() => {})

        setHasWarned(prev => new Set(prev).add(cls._id))
      }
    })
  }, [currentTime, classes, hasWarned, selectedDay])

  // Check for class start notifications
  useEffect(() => {
    if (!currentTime) return
    
    const todayClasses = getClassesForDay(selectedDay)
    
    todayClasses.forEach(cls => {
      const now = new Date()
      const [startHours, startMinutes] = cls.startTime.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(startHours, startMinutes, 0, 0)
      
      const timeUntilStart = startDate.getTime() - now.getTime()
      const oneSecond = 1000

      // Notify when class starts (within 1 second window)
      if (timeUntilStart <= 0 && timeUntilStart > -oneSecond && !hasStartNotified.has(cls._id)) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Hodina právě začíná! 🎓', {
            body: `Hodina se žákem ${cls.studentName} začíná (${cls.startTime} - ${cls.endTime})`,
            icon: '/icon.png'
          })
        }
        
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZSA==')
        audio.play().catch(() => {})

        setHasStartNotified(prev => new Set(prev).add(cls._id))
      }
    })
  }, [currentTime, classes, hasStartNotified, selectedDay])

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Request permission on first user interaction for better mobile support
      const requestPermission = () => {
        Notification.requestPermission()
        document.removeEventListener('click', requestPermission)
        document.removeEventListener('touchstart', requestPermission)
      }
      document.addEventListener('click', requestPermission)
      document.addEventListener('touchstart', requestPermission)
    }
  }, [])

  // Get classes for specific day
  const getClassesForDay = (dayOfWeek: number) => {
    if (!classes) return []
    return classes.filter(cls => cls.dayOfWeek === dayOfWeek)
  }

  const handleAddClass = async () => {
    if (!studentName || !startTime || !endTime) return

    try {
      await addClass({
        studentName,
        startTime,
        endTime,
        dayOfWeek: selectedDay,
        isRecurring,
        school: selectedSchool
      })
      
      setStudentName('')
      setStartTime('')
      setEndTime('')
      setIsRecurring(false)
      setSelectedDuration(null)
      setShowForm(false)
      
      toast({
        title: "Hodina přidána",
        description: `${studentName} (${startTime} - ${endTime})`,
      })
    } catch (error) {
      console.error('Error adding class:', error)
      toast({
        title: "Chyba při přidání hodiny",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  const handleRemoveClass = async (id: Id<"classes">) => {
    try {
      await removeClass({ id })
      setHasWarned(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      setHasStartNotified(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
      
      toast({
        title: "Hodina smazána",
      })
    } catch (error) {
      console.error('Error removing class:', error)
      toast({
        title: "Chyba při mazání hodiny",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  // Export class notes to TXT file
  const handleExportDayNotes = () => {
    const dayClasses = getClassesForDay(selectedDay)
    
    if (dayClasses.length === 0) {
      toast({
        title: "Žádné hodiny k exportu",
        description: `${dayNames[selectedDay]} nemá žádné naplánované hodiny`,
        variant: "destructive",
      })
      return
    }

    // Sort classes by start time
    const sortedClasses = [...dayClasses].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })

    // Create file content
    let content = `ROZVRH HODIN - ${dayNames[selectedDay].toUpperCase()}\n`
    content += `Datum exportu: ${new Date().toLocaleDateString('cs-CZ')}\n`
    content += `${'='.repeat(60)}\n\n`

    sortedClasses.forEach((cls, index) => {
      const plainTextNotes = cls.notes 
        ? cls.notes.replace(/<[^>]*>/g, '').trim() 
        : 'Žádné poznámky'
      
      content += `${index + 1}. ${cls.studentName}\n`
      content += `   Čas: ${cls.startTime} - ${cls.endTime}\n`
      if (cls.isRecurring) {
        content += `   🔁 Opakující se každý ${dayNames[cls.dayOfWeek].toLowerCase()}\n`
      }
      content += `   Poznámky:\n   ${plainTextNotes.replace(/\n/g, '\n   ')}\n\n`
      content += `${'-'.repeat(60)}\n\n`
    })

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const dateStr = new Date().toLocaleDateString('cs-CZ').replace(/\s/g, '').replace(/\./g, '_')
    link.download = `Rozvrh_${dayNames[selectedDay]}_${dateStr}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Export dokončen",
      description: `Poznámky pro ${dayNames[selectedDay]} (${dayClasses.length} ${dayClasses.length === 1 ? 'hodina' : dayClasses.length < 5 ? 'hodiny' : 'hodin'}) byly staženy`,
    })
  }

  // Export class notes to PDF file
  const handleExportDayPdf = () => {
    const dayClasses = getClassesForDay(selectedDay)
    
    if (dayClasses.length === 0) {
      toast({
        title: "Žádné hodiny k exportu",
        description: `${dayNames[selectedDay]} nemá žádné naplánované hodiny`,
        variant: "destructive",
      })
      return
    }

    // Sort classes by start time
    const sortedClasses = [...dayClasses].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(`ROZVRH HODIN - ${dayNames[selectedDay].toUpperCase()}`, 14, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Datum: ${new Date().toLocaleDateString('cs-CZ')}`, 14, 28)
    doc.setTextColor(0, 0, 0)

    // Separator line
    doc.setDrawColor(180, 180, 180)
    doc.line(14, 32, 196, 32)

    let yPosition = 40

    sortedClasses.forEach((cls, index) => {
      // Check if we need a new page
      if (yPosition > 260) {
        doc.addPage()
        yPosition = 20
      }

      // Numbered student name
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(`${index + 1}. ${cls.studentName}`, 14, yPosition)
      yPosition += 6

      // Time
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(`Cas: ${cls.startTime} - ${cls.endTime}`, 18, yPosition)
      yPosition += 5

      // Recurring info
      if (cls.isRecurring) {
        doc.text(`Opakovani: kazdy ${dayNames[cls.dayOfWeek].toLowerCase()}`, 18, yPosition)
        yPosition += 5
      }

      // Notes
      const plainTextNotes = cls.notes 
        ? cls.notes.replace(/<[^>]*>/g, '').trim() 
        : 'Zadne poznamky'
      
      doc.text('Poznamky:', 18, yPosition)
      yPosition += 5
      
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      const notesLines = doc.splitTextToSize(plainTextNotes, 170)
      doc.text(notesLines, 18, yPosition)
      yPosition += notesLines.length * 4 + 2

      // Separator line
      yPosition += 4
      doc.setDrawColor(200, 200, 200)
      doc.line(14, yPosition, 196, yPosition)
      yPosition += 8
    })

    // Open PDF in new tab
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, '_blank')
  }

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, classId: Id<"classes">) => {
    e.stopPropagation()
    setDraggingId(classId)
    setDragStartY(e.clientY)
    setDragOffset(0)
  }

  // Handle dragging
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingId) return
    const offset = e.clientY - dragStartY
    setDragOffset(offset)
  }

  // Handle drag end
  const handleDragEnd = async () => {
    if (!draggingId || !classes) return

    // Calculate time adjustment based on drag offset
    // 80px per hour = 1.33px per minute, or 6.67px per 5 minutes
    const pixelsPer5Minutes = (80 / 60) * 5
    const fiveMinuteIncrements = Math.round(dragOffset / pixelsPer5Minutes)
    const minutesAdjustment = fiveMinuteIncrements * 5

    if (minutesAdjustment !== 0) {
      const draggedClass = classes.find(cls => cls._id === draggingId)
      if (!draggedClass) return

      // Parse start and end times
      const [startHours, startMinutes] = draggedClass.startTime.split(':').map(Number)
      const [endHours, endMinutes] = draggedClass.endTime.split(':').map(Number)

      // Calculate new times
      const newStartTotalMinutes = startHours * 60 + startMinutes + minutesAdjustment
      const newEndTotalMinutes = endHours * 60 + endMinutes + minutesAdjustment

      // Ensure times are valid (between 0:00 and 23:59)
      if (newStartTotalMinutes >= 0 && newEndTotalMinutes <= 23 * 60 + 59) {
        const newStartHours = Math.floor(newStartTotalMinutes / 60)
        const newStartMinutes = newStartTotalMinutes % 60
        const newEndHours = Math.floor(newEndTotalMinutes / 60)
        const newEndMinutes = newEndTotalMinutes % 60

        try {
          await updateClass({
            id: draggingId,
            studentName: draggedClass.studentName,
            startTime: `${String(newStartHours).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`,
            endTime: `${String(newEndHours).padStart(2, '0')}:${String(newEndMinutes).padStart(2, '0')}`,
            isRecurring: draggedClass.isRecurring,
            notes: draggedClass.notes
          })
          
          toast({
            title: "Čas hodiny změněn",
          })
        } catch (error) {
          console.error('Error updating class time:', error)
          toast({
            title: "Chyba při změně času",
            description: "Zkuste to prosím znovu",
            variant: "destructive",
          })
        }
      }
    }

    setDraggingId(null)
    setDragOffset(0)
    setDragStartY(0)
  }

  // Navigate to previous day
  const previousDay = () => {
    setSelectedDay(selectedDay === 0 ? 6 : selectedDay - 1)
  }

  // Navigate to next day
  const nextDay = () => {
    setSelectedDay(selectedDay === 6 ? 0 : selectedDay + 1)
  }

  // Go to today
  const goToToday = () => {
    setSelectedDay(new Date().getDay())
  }

  // Handle calendar grid click
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    
    // Each hour is 80px (h-20 = 5rem = 80px)
    const pixelsPerHour = 80
    const totalMinutes = (y / pixelsPerHour) * 60
    
    // Calculate hour and minute (starting from 12 PM)
    const clickedHour = Math.floor(totalMinutes / 60) + 12
    const clickedMinute = Math.round((totalMinutes % 60) / 15) * 15 // Round to nearest 15 minutes
    
    // Format time as HH:MM
    const formattedTime = `${String(clickedHour).padStart(2, '0')}:${String(clickedMinute).padStart(2, '0')}`
    
    setStartTime(formattedTime)
    setShowForm(true)
  }

  // Calculate end time based on start time and duration
  const calculateEndTime = (start: string, durationMinutes: number) => {
    if (!start) return ''
    const [hours, minutes] = start.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
  }

  // Strip HTML tags from notes for display
  const getNotesExcerpt = (notes: string) => {
    if (!notes) return ''
    const stripped = notes.replace(/<[^>]*>/g, '').trim()
    return stripped.length > 60 ? `${stripped.substring(0, 60)}...` : stripped
  }

  // Handle duration selection
  const handleDurationSelect = (durationMinutes: number) => {
    setSelectedDuration(durationMinutes)
    const calculatedEndTime = calculateEndTime(startTime, durationMinutes)
    setEndTime(calculatedEndTime)
  }

  // Open edit mode for a class
  const openEdit = (cls: ClassSession) => {
    setEditingId(cls._id)
    setEditingStudentName(cls.studentName)
    setEditingStartTime(cls.startTime)
    setEditingEndTime(cls.endTime)
    setEditingIsRecurring(cls.isRecurring)
    setEditingSelectedDuration(null)
    setEditingNotes(cls.notes || '')
    setEditingSchool(cls.school || 'LANSKROUN')
  }

  // Save edited class
  const handleSaveEdit = async () => {
    if (!editingId || !editingStudentName || !editingStartTime || !editingEndTime) return
    
    try {
      await updateClass({
        id: editingId,
        studentName: editingStudentName,
        startTime: editingStartTime,
        endTime: editingEndTime,
        isRecurring: editingIsRecurring,
        notes: editingNotes,
        school: editingSchool
      })
      
      cancelEdit()
      
      toast({
        title: "Hodina upravena",
      })
    } catch (error) {
      console.error('Error updating class:', error)
      toast({
        title: "Chyba při úpravě hodiny",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setEditingStudentName('')
    setEditingStartTime('')
    setEditingEndTime('')
    setEditingIsRecurring(false)
    setEditingSelectedDuration(null)
    setEditingNotes('')
  }

  // Calculate position and height for a class block
  const getClassPosition = (cls: ClassSession) => {
    const [startHours, startMinutes] = cls.startTime.split(':').map(Number)
    const [endHours, endMinutes] = cls.endTime.split(':').map(Number)
    
    // Position from 12 PM (hour 12)
    const startInMinutes = (startHours - 12) * 60 + startMinutes
    const endInMinutes = (endHours - 12) * 60 + endMinutes
    const durationInMinutes = endInMinutes - startInMinutes
    
    // Total minutes in view: 7 hours (12 PM to 7 PM), each hour is 80px (20 * 4)
    const totalMinutes = 7 * 60
    const pixelsPerMinute = (7 * 80) / totalMinutes  // 7 hours * 80px per hour
    
    const topPx = startInMinutes * pixelsPerMinute
    const heightPx = durationInMinutes * pixelsPerMinute
    
    return { top: `${topPx}px`, height: `${Math.max(heightPx, 30)}px` }
  }

  // Calculate position for current time indicator
  const getCurrentTimePosition = () => {
    if (!currentTime) return null
    
    const hours = currentTime.getHours()
    const minutes = currentTime.getMinutes()
    
    // Position from 12 PM
    const minutesFromStart = (hours - 12) * 60 + minutes
    const totalMinutes = 7 * 60
    const pixelsPerMinute = (7 * 80) / totalMinutes
    
    const topPx = minutesFromStart * pixelsPerMinute
    
    // Only show if between 12 PM and 7 PM
    if (hours < 12 || hours >= 19) return null
    
    return `${topPx}px`
  }

  const currentTimePos = getCurrentTimePosition()
  const isToday = selectedDay === new Date().getDay()

  // Check if class is currently active
  const isActive = (cls: ClassSession) => {
    if (!isToday) return false
    
    const now = new Date()
    const [startHours, startMinutes] = cls.startTime.split(':').map(Number)
    const [endHours, endMinutes] = cls.endTime.split(':').map(Number)
    
    const startDate = new Date()
    startDate.setHours(startHours, startMinutes, 0, 0)
    
    const endDate = new Date()
    endDate.setHours(endHours, endMinutes, 0, 0)

    return now >= startDate && now <= endDate
  }

  const todayClasses = getClassesForDay(selectedDay)

  if (isLoading) {
    return (
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="grid grid-cols-[auto,1fr] gap-2">
            {/* Time labels */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-20 flex items-center justify-end pr-3">
                  <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="relative border-l border-gray-200">
              <div className="absolute inset-0 flex flex-col">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-20 border-b border-gray-200" />
                ))}
              </div>
              
              {/* Sample skeleton class blocks */}
              <div className="absolute top-32 left-2 right-2 h-24 bg-gray-200 rounded-lg animate-pulse" />
              <div className="absolute top-64 left-2 right-2 h-32 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate remaining time for active class
  const getRemainingTime = () => {
    if (!isToday || !currentTime) return null
    
    const activeClass = todayClasses.find(cls => isActive(cls))
    if (!activeClass) return null
    
    const [endHours, endMinutes] = activeClass.endTime.split(':').map(Number)
    const endDate = new Date()
    endDate.setHours(endHours, endMinutes, 0, 0)
    
    const timeRemaining = endDate.getTime() - currentTime.getTime()
    if (timeRemaining <= 0) return null
    
    const remainingMinutes = Math.ceil(timeRemaining / 60000)
    return remainingMinutes
  }

  const remainingTime = getRemainingTime()

  return (
    <>
      {/* Export buttons */}
      {todayClasses.length > 0 && (
        <div className="mb-4 flex justify-end gap-2">
          <Button
            onClick={handleExportDayNotes}
            variant="outline"
            size="sm"
            className="h-8 text-xs border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            TXT
          </Button>
          <Button
            onClick={handleExportDayPdf}
            size="sm"
            className="h-8 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Třídnice PDF
          </Button>
        </div>
      )}

      {/* Add Class Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => { 
        if (!open) {
          setShowForm(false)
          setSelectedDuration(null)
        }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nová hodina</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Jméno žáka</label>
              <Input
                placeholder="Zadejte jméno žáka"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Začátek</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Konec</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Délka hodiny</label>
              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 45, 60].map(duration => (
                  <Button
                    key={duration}
                    variant={selectedDuration === duration ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => handleDurationSelect(duration)}
                    className={selectedDuration === duration 
                      ? 'h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                      : 'h-11 border-gray-200 hover:bg-gray-50'
                    }
                  >
                    {duration}m
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Škola</label>
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger className="h-11 border-gray-200">
                  <SelectValue placeholder="Vyberte školu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LANSKROUN">ZUŠ Lanškroun</SelectItem>
                  <SelectItem value="LETOHRAD">ZUŠ Letohrad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-3 py-2">
              <Checkbox 
                id="recurring" 
                checked={isRecurring}
                onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
                className="border-gray-300 data-[state=checked]:bg-indigo-600"
              />
              <label
                htmlFor="recurring"
                className="text-sm text-gray-700 cursor-pointer select-none font-medium"
              >
                Opakovat každý {dayNames[selectedDay].toLowerCase()}
              </label>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleAddClass} 
                className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
                disabled={!studentName || !startTime || !endTime}
              >
                <Plus className="w-4 h-4 mr-2" />
                Přidat hodinu
              </Button>
              <Button 
                onClick={() => {
                  setShowForm(false)
                  setSelectedDuration(null)
                }}
                variant="outline"
                className="h-11 px-6 border-gray-200 hover:bg-gray-50"
              >
                Zrušit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Class Form */}
      {editingId && (
        <Dialog open={!!editingId} onOpenChange={(open) => { if (!open) cancelEdit() }}>
          <DialogContent 
            className="sm:max-w-4xl"
            onKeyDown={(e) => {
              if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault()
                handleSaveEdit()
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>Upravit hodinu</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {/* Left column: Basic info */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Jméno žáka</label>
                  <Input
                    placeholder="Jméno žáka"
                    value={editingStudentName}
                    onChange={(e) => setEditingStudentName(e.target.value)}
                    className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Začátek</label>
                    <Input
                      type="time"
                      value={editingStartTime}
                      onChange={(e) => setEditingStartTime(e.target.value)}
                      className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Konec</label>
                    <Input
                      type="time"
                      value={editingEndTime}
                      onChange={(e) => setEditingEndTime(e.target.value)}
                      className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Škola</label>
                  <Select value={editingSchool} onValueChange={setEditingSchool}>
                    <SelectTrigger className="h-11 border-gray-200">
                      <SelectValue placeholder="Vyberte školu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LANSKROUN">ZUŠ Lanškroun</SelectItem>
                      <SelectItem value="LETOHRAD">ZUŠ Letohrad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-3 py-2">
                  <Checkbox 
                    id="recurring-edit" 
                    checked={editingIsRecurring}
                    onCheckedChange={(checked) => setEditingIsRecurring(checked as boolean)}
                    className="border-gray-300 data-[state=checked]:bg-indigo-600"
                  />
                  <label
                    htmlFor="recurring-edit"
                    className="text-sm text-gray-700 cursor-pointer select-none font-medium"
                  >
                    Opakovat každý {dayNames[selectedDay].toLowerCase()}
                  </label>
                </div>
              </div>

              {/* Right column: Notes and Tasks */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Poznámky</label>
                    {editingNotes && editingNotes.replace(/<[^>]*>/g, '').trim() && (
                      <button
                        type="button"
                        onClick={() => setShowLearnKit(true)}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                        title="Vytvořit Learn Kit"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Learn Kit</span>
                      </button>
                    )}
                  </div>
                  <NotesEditor
                    content={editingNotes}
                    onChange={setEditingNotes}
                  />
                </div>
                
                {/* Tasks section */}
                {tasks && completions && editingSchool && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Úkoly ({editingSchool === 'LANSKROUN' ? 'ZUŠ Lanškroun' : 'ZUŠ Letohrad'})</label>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      {tasks.filter(t => t.school === editingSchool).length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">
                          Žádné úkoly pro tuto školu
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                          {tasks.filter(t => t.school === editingSchool).map((task) => {
                            const isCompleted = completions.some(
                              c => c.taskId === task._id && c.studentName === editingStudentName
                            )
                            
                            return (
                              <div
                                key={task._id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => {
                                  if (editingStudentName) {
                                    toggleCompletion({
                                      taskId: task._id,
                                      studentName: editingStudentName,
                                    })
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={isCompleted}
                                  onCheckedChange={() => {
                                    if (editingStudentName) {
                                      toggleCompletion({
                                        taskId: task._id,
                                        studentName: editingStudentName,
                                      })
                                    }
                                  }}
                                  className="border-gray-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <span className={`flex-1 text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                  {task.name}
                                </span>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-300" />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons at the bottom, full width */}
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
              <Button 
                onClick={handleSaveEdit} 
                className="flex-1 h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
                disabled={!editingStudentName || !editingStartTime || !editingEndTime}
              >
                Uložit změny
              </Button>
              <Button 
                onClick={cancelEdit}
                variant="outline"
                className="h-11 px-6 border-gray-200 hover:bg-gray-50"
              >
                Zrušit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Schedule Grid */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6">
          <div 
            className="grid grid-cols-[auto,1fr] gap-4"
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            {/* Time labels */}
            <div className="flex flex-col">
              {hours.map((hour) => (
                <div key={hour} className="h-20 flex items-start justify-end pr-4 pt-1">
                  <span className="text-xs font-semibold text-gray-600 bg-white px-1">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div 
              className="relative border-l-2 border-gray-200 cursor-pointer"
              onClick={handleGridClick}
            >
              {/* Hour lines and half-hour lines */}
              <div className="absolute inset-0 pointer-events-none">
                {hours.map((hour) => (
                  <div key={hour}>
                    <div className="h-10 border-b-2 border-gray-200" />
                    <div className="h-10 border-b border-gray-100 border-dashed" />
                  </div>
                ))}
              </div>

              {/* Current time indicator */}
              {isToday && currentTimePos && (
                <div 
                  className="absolute left-0 right-0 z-50 pointer-events-none"
                  style={{ top: currentTimePos }}
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full -ml-1.5 shadow-lg" />
                    <div className="flex-1 h-0.5 bg-red-500" />
                  </div>
                  <div className="absolute left-4 -top-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                    {currentTime?.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                    {remainingTime && ` (${remainingTime} min)`}
                  </div>
                </div>
              )}

              {/* Class blocks */}
              {todayClasses.map((cls) => {
                const position = getClassPosition(cls)
                const active = isActive(cls)
                const isDragging = draggingId === cls._id
                
                return (
                  <div
                    key={cls._id}
                    title={`od ${cls.startTime} do ${cls.endTime}`}
                    className={`absolute left-2 right-2 p-3 rounded-lg transition-all cursor-pointer select-none border-2 ${
                      active
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg border-emerald-600'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md border-indigo-700 hover:shadow-lg hover:border-indigo-800'
                    } ${isDragging ? 'opacity-60 z-50' : 'z-20'}`}
                    style={{
                      top: isDragging ? `calc(${position.top} + ${dragOffset}px)` : position.top,
                      height: position.height,
                    }}
                    onMouseDown={(e) => handleDragStart(e, cls._id)}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Only open edit if not dragging
                      if (!isDragging && Math.abs(dragOffset) < 5) {
                        openEdit(cls)
                      }
                    }}
                  >
                    <div className="flex items-start gap-2 h-full">
                      <GripVertical className="w-4 h-4 opacity-60 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base truncate">{cls.studentName}</div>
                        {cls.notes && (
                          <div className="text-xs opacity-75 truncate mt-0.5">
                            {getNotesExcerpt(cls.notes)}
                          </div>
                        )}
                        <div className="text-sm opacity-90 flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          {cls.startTime} - {cls.endTime}
                        </div>
                        {cls.isRecurring && (
                          <div className="text-xs opacity-75 mt-1">🔁 Opakující se</div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(cls)
                          }}
                          className="h-7 w-7 hover:bg-white/20 text-white rounded-lg"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveClass(cls._id)
                          }}
                          className="h-7 w-7 hover:bg-white/20 text-white rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Empty state */}
              {todayClasses.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Žádné hodiny</p>
                    <p className="text-sm text-gray-400 mt-1">Klikněte do kalendáře pro přidání</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learn Kit Popup */}
      {showLearnKit && (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">Learn Kit</h3>
            </div>
            <button
              onClick={() => {
                setShowLearnKit(false)
                setLearnKitEmail('')
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Email příjemce
              </label>
              <Input
                type="email"
                placeholder="student@email.cz"
                value={learnKitEmail}
                onChange={(e) => setLearnKitEmail(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Obsah:</p>
              <p className="text-sm text-gray-700 font-medium">{editingStudentName}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {editingNotes ? editingNotes.replace(/<[^>]*>/g, '').substring(0, 100) : 'Žádné poznámky'}
                {editingNotes && editingNotes.replace(/<[^>]*>/g, '').length > 100 ? '...' : ''}
              </p>
            </div>
            <Button
              onClick={() => {
                if (!learnKitEmail) {
                  toast({
                    title: "Chybí email",
                    description: "Zadejte emailovou adresu příjemce",
                    variant: "destructive"
                  })
                  return
                }
                // Convert HTML notes to plain text
                const plainNotes = editingNotes ? editingNotes.replace(/<[^>]*>/g, '') : ''
                const subject = encodeURIComponent(`Learn Kit: ${editingStudentName}`)
                const body = encodeURIComponent(`Dobrý den,\n\nposílám studijní materiály pro ${editingStudentName}.\n\n--- Poznámky ---\n${plainNotes}\n\n---\nOdesláno z aplikace Rozvrh hodin`)
                const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(learnKitEmail)}&su=${subject}&body=${body}`
                window.open(gmailUrl, '_blank')
                setShowLearnKit(false)
                setLearnKitEmail('')
                toast({
                  title: "Gmail otevřen",
                  description: "Zkontrolujte a odešlete email v novém okně"
                })
              }}
              className="w-full h-10 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              disabled={!learnKitEmail}
            >
              <Send className="w-4 h-4 mr-2" />
              Otevřít v Gmail
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
