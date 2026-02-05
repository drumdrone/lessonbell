"use client"

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Changelog() {
  const entries = useQuery(api.changelog.getAll)
  const addEntry = useMutation(api.changelog.add)
  const removeEntry = useMutation(api.changelog.remove)
  
  const { toast } = useToast()
  
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Handle adding a new changelog entry
  const handleAddEntry = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return

    try {
      await addEntry({
        title: newTitle.trim(),
        description: newDescription.trim(),
      })
      setNewTitle('')
      setNewDescription('')
      setShowForm(false)
      toast({
        title: "Záznam přidán",
        description: "Nový záznam byl úspěšně přidán do changelogu",
      })
    } catch (error) {
      console.error('Error adding changelog entry:', error)
      toast({
        title: "Chyba při přidání záznamu",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a changelog entry
  const handleDeleteEntry = async (id: Id<"changelog">) => {
    try {
      await removeEntry({ id })
      toast({
        title: "Záznam smazán",
      })
    } catch (error) {
      console.error('Error deleting changelog entry:', error)
      toast({
        title: "Chyba při mazání záznamu",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  // Format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('cs-CZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Group entries by date
  const groupedEntries = React.useMemo(() => {
    if (!entries) return {}
    
    const groups: Record<string, typeof entries> = {}
    entries.forEach(entry => {
      if (!groups[entry.date]) {
        groups[entry.date] = []
      }
      groups[entry.date].push(entry)
    })
    
    return groups
  }, [entries])

  if (entries === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add button */}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Přidat záznam
        </Button>
      )}

      {/* Add new entry form */}
      {showForm && (
        <Card className="shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg">Nový záznam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Název změny
              </label>
              <Input
                placeholder="Např. 'Přidání zobrazení studentů u úkolů'"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Popis
              </label>
              <Textarea
                placeholder="Podrobný popis změny..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="min-h-[100px] border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAddEntry}
                disabled={!newTitle.trim() || !newDescription.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                Přidat
              </Button>
              <Button
                onClick={() => {
                  setShowForm(false)
                  setNewTitle('')
                  setNewDescription('')
                }}
                variant="outline"
              >
                Zrušit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Changelog entries */}
      {entries.length === 0 ? (
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Žádné změny</p>
            <p className="text-sm text-gray-400 mt-1">
              Historie změn aplikace se zobrazí zde
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEntries).map(([date, dateEntries]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                {new Date(date).toLocaleDateString('cs-CZ', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="space-y-3">
                {dateEntries.map((entry) => (
                  <Card key={entry._id} className="shadow-sm border-gray-100">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900">{entry.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed ml-11">
                            {entry.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2 ml-11">
                            {formatDate(entry.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEntry(entry._id)}
                          className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
