"use client"

import React, { useState, useRef } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, 
  Trash2, 
  User, 
  BookOpen, 
  Music,
  ChevronRight,
  FileText,
  Download,
  Calendar,
  Circle,
  Zap,
  ExternalLink
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type StatusType = 'hotovo' | 'nesplneno' | 'ukol' | 'tedka' | ''

export default function CurriculumGenerator() {
  const classes = useQuery(api.classes.getAll)
  const allSongs = useQuery(api.songs.getAll)
  const allSessions = useQuery(api.songs.getAllSessions)
  const allProgress = useQuery(api.songs.getAllProgress)
  const allStatuses = useQuery(api.songs.getAllStatuses)
  
  const addSong = useMutation(api.songs.addSong)
  const deleteSong = useMutation(api.songs.deleteSong)
  const addSession = useMutation(api.songs.addSession)
  const deleteSession = useMutation(api.songs.deleteSession)
  const toggleProgress = useMutation(api.songs.toggleProgress)
  const updateStatus = useMutation(api.songs.updateStatus)
  
  const { toast } = useToast()
  
  const [selectedSchool, setSelectedSchool] = useState<string>('LANSKROUN')
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  
  // Form states
  const [newSongName, setNewSongName] = useState('')
  const [newSongMonth, setNewSongMonth] = useState('')
  const [newMilestonesCSV, setNewMilestonesCSV] = useState('')
  const [newSessionDate, setNewSessionDate] = useState('')
  const [activeSongId, setActiveSongId] = useState<Id<"songs"> | null>(null)
  const [statusNote, setStatusNote] = useState('')

  // Get unique students from classes for the selected school
  const getStudentsForSchool = (school: string): string[] => {
    if (!classes) return []
    const schoolClasses = classes.filter(c => c.school === school)
    const uniqueStudents = Array.from(new Set(schoolClasses.map(c => c.studentName))) as string[]
    return uniqueStudents.sort()
  }

  // Get songs for selected student
  const getStudentSongs = () => {
    if (!allSongs || !selectedStudent) return []
    return allSongs.filter(s => s.studentName === selectedStudent && s.school === selectedSchool)
  }

  // Get sessions for a song
  const getSongSessions = (songId: Id<"songs">) => {
    if (!allSessions) return []
    return allSessions
      .filter(s => s.songId === songId)
      .sort((a, b) => a.sessionNumber - b.sessionNumber)
  }

  // Get progress for a specific milestone and session
  const getProgress = (songId: Id<"songs">, sessionId: Id<"songSessions">, milestoneIndex: number) => {
    if (!allProgress) return false
    const progress = allProgress.find(
      p => p.songId === songId && p.sessionId === sessionId && p.milestoneIndex === milestoneIndex
    )
    return progress?.practiced ?? false
  }

  // Get status for a milestone
  const getStatus = (songId: Id<"songs">, milestoneIndex: number) => {
    if (!allStatuses) return { status: '', note: '' }
    const status = allStatuses.find(
      s => s.songId === songId && s.milestoneIndex === milestoneIndex
    )
    return { status: status?.status ?? '', note: status?.note ?? '' }
  }

  // Handle adding a new song
  const handleAddSong = async () => {
    if (!newSongName.trim() || !selectedStudent || !newMilestonesCSV.trim()) return
    
    try {
      await addSong({
        studentName: selectedStudent,
        school: selectedSchool,
        name: newSongName.trim(),
        month: newSongMonth.trim() || new Date().toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' }),
        milestonesCSV: newMilestonesCSV,
      })
      setNewSongName('')
      setNewSongMonth('')
      setNewMilestonesCSV('')
      toast({ title: "Skladba přidána" })
    } catch (error) {
      console.error('Error adding song:', error)
      toast({ title: "Chyba", variant: "destructive" })
    }
  }

  // Handle adding a session
  const handleAddSession = async (songId: Id<"songs">) => {
    if (!newSessionDate.trim()) return
    
    try {
      await addSession({
        songId,
        date: newSessionDate.trim(),
      })
      setNewSessionDate('')
      toast({ title: "Hodina přidána" })
    } catch (error) {
      console.error('Error adding session:', error)
      toast({ title: "Chyba", variant: "destructive" })
    }
  }

  // Handle toggle progress
  const handleToggleProgress = async (songId: Id<"songs">, sessionId: Id<"songSessions">, milestoneIndex: number) => {
    try {
      await toggleProgress({ songId, sessionId, milestoneIndex })
    } catch (error) {
      console.error('Error toggling progress:', error)
    }
  }

  // Handle status change
  const handleStatusChange = async (songId: Id<"songs">, milestoneIndex: number, newStatus: StatusType, note?: string) => {
    try {
      await updateStatus({
        songId,
        milestoneIndex,
        status: newStatus,
        note: note || undefined,
      })
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  // Generate TXT export
  const exportAsTxt = () => {
    if (!selectedStudent || !allSongs) return
    
    const studentSongs = allSongs.filter(
      s => s.studentName === selectedStudent && s.school === selectedSchool
    )
    
    const lines: string[] = []
    
    studentSongs.forEach((song) => {
      const sessions = getSongSessions(song._id)
      
      lines.push(`${song.name.toUpperCase()} | ${selectedStudent} | ${song.month}`)
      lines.push('═'.repeat(60))
      lines.push('')
      
      // Header row
      let header = 'MILESTONE'.padEnd(25)
      sessions.forEach((s) => {
        header += `| H${s.sessionNumber} `.padEnd(8)
      })
      header += '| STATUS'
      lines.push(header)
      
      // Separator
      lines.push('-'.repeat(60))
      
      // Milestone rows
      song.milestones.forEach((milestone, idx) => {
        let row = milestone.padEnd(25)
        
        sessions.forEach((s) => {
          const practiced = getProgress(song._id, s._id, idx)
          row += `| ${practiced ? '●' : ' '} `.padEnd(8)
        })
        
        const { status, note } = getStatus(song._id, idx)
        const statusText = status === 'hotovo' ? '● HOTOVO (umím)' :
                          status === 'nesplneno' ? '✗ NESPLNĚNO' :
                          status === 'ukol' ? '○ ÚKOL' :
                          status === 'tedka' ? `◀ TEĎKA${note ? ` (${note})` : ''}` : ''
        row += `| ${statusText}`
        
        lines.push(row)
      })
      
      lines.push('')
      lines.push('')
    })
    
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ucivo-${selectedStudent?.replace(/\s+/g, '-').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({ title: 'Učivo exportováno jako TXT' })
  }

  // Generate PDF export
  const exportAsPdf = () => {
    if (!selectedStudent || !allSongs) return
    
    const studentSongs = allSongs.filter(
      s => s.studentName === selectedStudent && s.school === selectedSchool
    )
    
    if (studentSongs.length === 0) {
      toast({ title: 'Žádné učivo k exportu', variant: 'destructive' })
      return
    }
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    let yPosition = 15
    
    studentSongs.forEach((song, songIndex) => {
      const sessions = getSongSessions(song._id)
      
      // Check if we need a new page
      if (songIndex > 0) {
        doc.addPage()
        yPosition = 15
      }
      
      // Header
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(`${song.name.toUpperCase()}`, 14, yPosition)
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`${selectedStudent} | ${song.month}`, 14, yPosition + 7)
      doc.setTextColor(0, 0, 0)
      
      yPosition += 15
      
      // Prepare table data
      const headers = ['Milník', ...sessions.map(s => `H${s.sessionNumber}\n${s.date}`), 'Status']
      
      const body = song.milestones.map((milestone, idx) => {
        const { status, note } = getStatus(song._id, idx)
        
        const sessionCells = sessions.map(s => {
          const practiced = getProgress(song._id, s._id, idx)
          return practiced ? '●' : ''
        })
        
        let statusText = ''
        if (status === 'hotovo') statusText = '● HOTOVO'
        else if (status === 'nesplneno') statusText = '✗ NESPLNĚNO'
        else if (status === 'ukol') statusText = '○ ÚKOL'
        else if (status === 'tedka') statusText = `◀ TEĎKA${note ? ` (${note})` : ''}`
        
        return [milestone, ...sessionCells, statusText]
      })
      
      // Draw table with colors
      autoTable(doc, {
        startY: yPosition,
        head: [headers],
        body: body,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: 'middle',
          halign: 'center',
        },
        headStyles: {
          fillColor: [79, 70, 229], // Indigo
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 50 }, // Milník column wider
        },
        didParseCell: (data) => {
          // Color status column based on status
          if (data.column.index === headers.length - 1 && data.section === 'body') {
            const cellText = String(data.cell.raw)
            if (cellText.includes('HOTOVO')) {
              data.cell.styles.textColor = [5, 150, 105] // Emerald
              data.cell.styles.fontStyle = 'bold'
            } else if (cellText.includes('NESPLNĚNO')) {
              data.cell.styles.textColor = [220, 38, 38] // Red
              data.cell.styles.fontStyle = 'bold'
            } else if (cellText.includes('ÚKOL')) {
              data.cell.styles.textColor = [5, 150, 105] // Emerald
            } else if (cellText.includes('TEĎKA')) {
              data.cell.styles.textColor = [217, 119, 6] // Amber
              data.cell.styles.fontStyle = 'bold'
            }
          }
          // Color the dots in session columns
          if (data.section === 'body' && data.column.index > 0 && data.column.index < headers.length - 1) {
            if (String(data.cell.raw) === '●') {
              data.cell.styles.textColor = [79, 70, 229] // Indigo for practiced
              data.cell.styles.fontSize = 12
            }
          }
        },
        didDrawCell: (data) => {
          // Add colored circles for status
          if (data.column.index === headers.length - 1 && data.section === 'body') {
            const cellText = String(data.cell.raw)
            const x = data.cell.x + 3
            const y = data.cell.y + data.cell.height / 2
            
            if (cellText.includes('HOTOVO')) {
              doc.setFillColor(16, 185, 129) // Emerald-500
              doc.circle(x, y, 2, 'F')
            } else if (cellText.includes('NESPLNĚNO')) {
              doc.setFillColor(239, 68, 68) // Red-500
              doc.circle(x, y, 2, 'F')
            } else if (cellText.includes('ÚKOL')) {
              doc.setDrawColor(16, 185, 129) // Emerald-500
              doc.setLineWidth(0.5)
              doc.circle(x, y, 2, 'S')
            }
          }
        }
      })
    })
    
    // Generate blob and create download
    const pdfBlob = doc.output('blob')
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const fileName = `ucivo-${selectedStudent?.replace(/\s+/g, '-').toLowerCase()}.pdf`
    
    // Create download link
    const a = document.createElement('a')
    a.href = pdfUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    // Show toast with open button
    toast({
      title: '📄 Třídnice vytvořena!',
      description: (
        <div className="flex items-center gap-3 mt-2">
          <span className="text-sm text-gray-600">{fileName}</span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs"
            onClick={() => window.open(pdfUrl, '_blank')}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Otevřít
          </Button>
        </div>
      ),
      duration: 10000,
    })
  }

  const schoolStudents = getStudentsForSchool(selectedSchool)
  const studentSongs = getStudentSongs()

  console.log('CurriculumGenerator - Students:', schoolStudents)
  console.log('CurriculumGenerator - Selected student:', selectedStudent)
  console.log('CurriculumGenerator - Songs:', studentSongs)

  if (classes === undefined || allSongs === undefined || allSessions === undefined || allProgress === undefined || allStatuses === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* School tabs */}
      <Tabs value={selectedSchool} onValueChange={(v) => { setSelectedSchool(v); setSelectedStudent(null); }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger 
            value="LANSKROUN" 
            className="h-10 text-sm font-medium data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
          >
            ZUŠ Lanškroun
          </TabsTrigger>
          <TabsTrigger 
            value="LETOHRAD" 
            className="h-10 text-sm font-medium data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            ZUŠ Letohrad
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Two-column layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left column - Students list */}
        <div className="col-span-3">
          <Card className="shadow-sm border-gray-100 h-[600px]">
            <CardHeader className="pb-3 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Žáci ({schoolStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[530px]">
                {schoolStudents.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Žádní žáci</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Přidejte hodiny v rozvrhu
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {schoolStudents.map((student: string) => {
                      const studentSongsCount = allSongs?.filter(
                        s => s.studentName === student && s.school === selectedSchool
                      ).length || 0

                      return (
                        <button
                          key={student}
                          onClick={() => setSelectedStudent(student)}
                          className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between group ${
                            selectedStudent === student
                              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold ${
                              selectedStudent === student
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {student.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${
                                selectedStudent === student ? 'text-indigo-900' : 'text-gray-900'
                              }`}>
                                {student}
                              </p>
                              <p className="text-xs text-gray-500">
                                {studentSongsCount} {studentSongsCount === 1 ? 'skladba' : studentSongsCount >= 2 && studentSongsCount <= 4 ? 'skladby' : 'skladeb'}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${
                            selectedStudent === student ? 'text-indigo-500' : 'text-gray-300 group-hover:text-gray-400'
                          }`} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Songs with table */}
        <div className="col-span-9">
          <Card className="shadow-sm border-gray-100 h-[600px]">
            <CardHeader className="pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  {selectedStudent ? `Učivo - ${selectedStudent}` : 'Vyberte žáka'}
                </CardTitle>
                {selectedStudent && studentSongs.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportAsTxt}
                      className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50"
                      title="Exportovat jako TXT"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      TXT
                    </Button>
                    <Button
                      size="sm"
                      onClick={exportAsPdf}
                      className="h-8 px-3 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      title="Exportovat jako PDF (Třídnice)"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Třídnice PDF
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[530px]">
                {!selectedStudent ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-indigo-500" />
                    </div>
                    <p className="text-gray-500 font-medium">Vyberte žáka ze seznamu vlevo</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Pro zobrazení a správu učiva
                    </p>
                  </div>
                ) : (
                  <div className="p-4 space-y-6">
                    {/* Add new song form */}
                    <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Přidat novou skladbu
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <Input
                            placeholder="Název skladby (např. Rolling in the Deep)"
                            value={newSongName}
                            onChange={(e) => setNewSongName(e.target.value)}
                            className="h-9 text-sm"
                          />
                          <Input
                            placeholder="Měsíc (např. Leden 2025)"
                            value={newSongMonth}
                            onChange={(e) => setNewSongMonth(e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Input
                            placeholder="Milníky oddělené čárkou: Verse groove, Chorus groove, Fill A, Fill B, Přechody, Celá skladba"
                            value={newMilestonesCSV}
                            onChange={(e) => setNewMilestonesCSV(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newSongName.trim() && newMilestonesCSV.trim()) {
                                handleAddSong()
                              }
                            }}
                            className="h-9 text-sm flex-1"
                          />
                          <Button
                            onClick={handleAddSong}
                            disabled={!newSongName.trim() || !newMilestonesCSV.trim()}
                            size="sm"
                            className="h-9 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Přidat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Songs list */}
                    {studentSongs.length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Music className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Žádné skladby</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Přidejte první skladbu pomocí formuláře výše
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {studentSongs.map((song) => {
                          const sessions = getSongSessions(song._id)
                          const isActive = activeSongId === song._id
                          
                          return (
                            <Card key={song._id} className="border-gray-200 overflow-hidden">
                              {/* Song header */}
                              <CardHeader className="py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Music className="w-5 h-5 text-yellow-400" />
                                    <div>
                                      <CardTitle className="text-sm font-bold tracking-wide">
                                        {song.name.toUpperCase()} | {selectedStudent} | {song.month}
                                      </CardTitle>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteSong({ id: song._id })}
                                    className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-900/30"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              
                              <CardContent className="p-0">
                                {/* Table */}
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-gray-200 bg-gray-50">
                                        <th className="text-left py-2 px-4 font-medium text-gray-600 w-48">
                                          MILESTONE
                                        </th>
                                        {sessions.map((session) => (
                                          <th key={session._id} className="text-center py-2 px-2 font-medium text-gray-600 w-16">
                                            <div className="flex flex-col items-center">
                                              <span>H{session.sessionNumber}</span>
                                              <span className="text-xs text-gray-400 font-normal">{session.date}</span>
                                            </div>
                                          </th>
                                        ))}
                                        <th className="text-center py-2 px-2 w-12">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setActiveSongId(isActive ? null : song._id)}
                                            className="h-7 w-7 text-indigo-600 hover:bg-indigo-50"
                                            title="Přidat hodinu"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </Button>
                                        </th>
                                        <th className="text-left py-2 px-4 font-medium text-gray-600 w-48">
                                          STATUS
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* Add session row if active */}
                                      {isActive && (
                                        <tr className="bg-indigo-50 border-b border-indigo-100">
                                          <td colSpan={sessions.length + 3} className="py-2 px-4">
                                            <div className="flex items-center gap-2">
                                              <Calendar className="w-4 h-4 text-indigo-500" />
                                              <Input
                                                placeholder="Datum hodiny (např. 8.1.)"
                                                value={newSessionDate}
                                                onChange={(e) => setNewSessionDate(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter' && newSessionDate.trim()) {
                                                    handleAddSession(song._id)
                                                  }
                                                }}
                                                className="h-8 w-32 text-sm"
                                                autoFocus
                                              />
                                              <Button
                                                size="sm"
                                                onClick={() => handleAddSession(song._id)}
                                                disabled={!newSessionDate.trim()}
                                                className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                                              >
                                                Přidat H{sessions.length + 1}
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setActiveSongId(null)}
                                                className="h-8 text-xs"
                                              >
                                                Zrušit
                                              </Button>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                      
                                      {/* Milestone rows */}
                                      {song.milestones.map((milestone, idx) => {
                                        const { status, note } = getStatus(song._id, idx)
                                        
                                        return (
                                          <tr key={idx} className={`border-b border-gray-100 ${
                                            status === 'tedka' ? 'bg-yellow-50' :
                                            status === 'hotovo' ? 'bg-emerald-50/50' :
                                            status === 'nesplneno' ? 'bg-red-50/50' :
                                            status === 'ukol' ? 'bg-emerald-50/30' : ''
                                          }`}>
                                            <td className="py-2 px-4 font-medium text-gray-900">
                                              {milestone}
                                            </td>
                                            {sessions.map((session) => {
                                              const practiced = getProgress(song._id, session._id, idx)
                                              return (
                                                <td key={session._id} className="text-center py-2 px-2">
                                                  <button
                                                    onClick={() => handleToggleProgress(song._id, session._id, idx)}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors mx-auto"
                                                  >
                                                    {practiced ? (
                                                      <div className="w-3 h-3 bg-gray-800 rounded-full" />
                                                    ) : (
                                                      <Circle className="w-3 h-3 text-gray-300" />
                                                    )}
                                                  </button>
                                                </td>
                                              )
                                            })}
                                            <td className="py-2 px-2"></td>
                                            <td className="py-2 px-4">
                                              <StatusSelector
                                                status={status as StatusType}
                                                note={note}
                                                onChange={(newStatus, newNote) => 
                                                  handleStatusChange(song._id, idx, newStatus, newNote)
                                                }
                                              />
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Status selector component
function StatusSelector({ 
  status, 
  note, 
  onChange 
}: { 
  status: StatusType
  note: string
  onChange: (status: StatusType, note?: string) => void 
}) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [noteValue, setNoteValue] = useState(note)

  const handleStatusClick = (newStatus: StatusType) => {
    if (newStatus === 'tedka') {
      setShowNoteInput(true)
    } else {
      onChange(newStatus)
      setShowNoteInput(false)
    }
  }

  const handleSaveNote = () => {
    onChange('tedka', noteValue)
    setShowNoteInput(false)
  }

  if (showNoteInput) {
    return (
      <div className="flex items-center gap-1">
        <Input
          placeholder="tempo 60%"
          value={noteValue}
          onChange={(e) => setNoteValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveNote()
            if (e.key === 'Escape') setShowNoteInput(false)
          }}
          className="h-7 w-24 text-xs"
          autoFocus
        />
        <Button size="sm" onClick={handleSaveNote} className="h-7 px-2 text-xs">
          OK
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {status === 'hotovo' && (
        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          HOTOVO
        </span>
      )}
      {status === 'nesplneno' && (
        <span className="inline-flex items-center gap-1 text-red-600 font-medium text-xs">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          NESPLNĚNO
        </span>
      )}
      {status === 'ukol' && (
        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
          <div className="w-3 h-3 border-2 border-emerald-500 rounded-full" />
          ÚKOL
        </span>
      )}
      {status === 'tedka' && (
        <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-xs">
          <Zap className="w-3.5 h-3.5" />
          TEĎKA {note && <span className="text-amber-600">({note})</span>}
        </span>
      )}
      
      <Select 
        value={status || '__none__'}
        onValueChange={(v) => handleStatusClick((v === '__none__' ? '' : v) as StatusType)}
      >
        <SelectTrigger className="h-7 w-7 px-0 border-0 bg-transparent [&>svg]:hidden">
          <SelectValue>
            {!status && <Circle className="w-3 h-3 text-gray-300 mx-auto" />}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className="text-gray-400">Žádný</span>
          </SelectItem>
          <SelectItem value="hotovo">
            <span className="flex items-center gap-2 text-emerald-700">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" /> HOTOVO (umím)
            </span>
          </SelectItem>
          <SelectItem value="nesplneno">
            <span className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full" /> NESPLNĚNO
            </span>
          </SelectItem>
          <SelectItem value="ukol">
            <span className="flex items-center gap-2 text-emerald-600">
              <div className="w-3 h-3 border-2 border-emerald-500 rounded-full" /> ÚKOL
            </span>
          </SelectItem>
          <SelectItem value="tedka">
            <span className="flex items-center gap-2 text-amber-700">
              <Zap className="w-3.5 h-3.5" /> TEĎKA
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
