"use client"

import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TasksDashboard() {
  const tasks = useQuery(api.tasks.getAll)
  const classes = useQuery(api.classes.getAll)
  const completions = useQuery(api.tasks.getAllCompletions)
  
  const addTask = useMutation(api.tasks.add)
  const removeTask = useMutation(api.tasks.remove)
  const toggleCompletion = useMutation(api.tasks.toggleCompletion)
  
  const { toast } = useToast()
  
  const [newTaskName, setNewTaskName] = useState('')
  const [selectedSchool, setSelectedSchool] = useState<string>('LANSKROUN')

  // Get unique students from classes for the selected school (all days)
  const getStudentsForSchool = (school: string): string[] => {
    if (!classes) return []
    const schoolClasses = classes.filter(c => c.school === school)
    const uniqueStudents = Array.from(new Set(schoolClasses.map(c => c.studentName))) as string[]
    return uniqueStudents.sort()
  }

  // Get tasks for selected school
  const getTasksForSchool = (school: string) => {
    if (!tasks) return []
    return tasks.filter(t => t.school === school)
  }

  // Check if student completed a task
  const isTaskCompletedByStudent = (taskId: Id<"tasks">, studentName: string) => {
    if (!completions) return false
    return completions.some(c => c.taskId === taskId && c.studentName === studentName)
  }

  // Handle adding a new task
  const handleAddTask = async () => {
    if (!newTaskName.trim()) return

    try {
      await addTask({
        name: newTaskName.trim(),
        school: selectedSchool,
      })
      setNewTaskName('')
      toast({
        title: "Úkol přidán",
        description: `${newTaskName.trim()} (${selectedSchool === 'LANSKROUN' ? 'ZUŠ Lanškroun' : 'ZUŠ Letohrad'})`,
      })
    } catch (error) {
      console.error('Error adding task:', error)
      toast({
        title: "Chyba při přidání úkolu",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  // Handle toggling task completion
  const handleToggleCompletion = async (taskId: Id<"tasks">, studentName: string) => {
    try {
      await toggleCompletion({
        taskId,
        studentName,
      })
    } catch (error) {
      console.error('Error toggling completion:', error)
      toast({
        title: "Chyba při aktualizaci",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a task
  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await removeTask({ id: taskId })
      toast({
        title: "Úkol smazán",
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Chyba při mazání úkolu",
        description: "Zkuste to prosím znovu",
        variant: "destructive",
      })
    }
  }

  const schoolTasks = getTasksForSchool(selectedSchool)
  const schoolStudents = getStudentsForSchool(selectedSchool)

  console.log('TasksDashboard - School students:', schoolStudents)
  console.log('TasksDashboard - School tasks:', schoolTasks)

  if (tasks === undefined || classes === undefined || completions === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* School tabs */}
      <Tabs value={selectedSchool} onValueChange={setSelectedSchool} className="w-full">
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

      {/* Add new task */}
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Nový úkol..."
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTaskName.trim()) {
                  handleAddTask()
                }
              }}
              className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <Button
              onClick={handleAddTask}
              disabled={!newTaskName.trim()}
              className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Přidat úkol
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks list with students */}
      {schoolTasks.length === 0 ? (
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Žádné úkoly</p>
            <p className="text-sm text-gray-400 mt-1">
              {selectedSchool === 'LANSKROUN' ? 'ZUŠ Lanškroun' : 'ZUŠ Letohrad'} - přidejte nový úkol pomocí formuláře výše
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schoolTasks.map((task) => {
            const completedCount = schoolStudents.filter(s => isTaskCompletedByStudent(task._id, s)).length
            const totalStudents = schoolStudents.length
            
            return (
              <Card key={task._id} className="shadow-sm border-gray-100 overflow-hidden">
                <CardContent className="p-0">
                  {/* Task header with inline student list */}
                  <div className="flex items-start justify-between p-4 gap-4">
                    <div className="flex-1 flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{task.name}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                          {completedCount}/{totalStudents} splněno
                        </p>
                        {/* Students inline list */}
                        {schoolStudents.length === 0 ? (
                          <p className="text-xs text-gray-400">
                            Žádní žáci z {selectedSchool === 'LANSKROUN' ? 'ZUŠ Lanškroun' : 'ZUŠ Letohrad'}
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {schoolStudents.map((studentName) => {
                              const isCompleted = isTaskCompletedByStudent(task._id, studentName)
                              
                              return (
                                <button
                                  key={studentName}
                                  onClick={() => handleToggleCompletion(task._id, studentName)}
                                  className={`text-xs px-2 py-1 rounded-md transition-all ${
                                    isCompleted 
                                      ? 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                  }`}
                                >
                                  {isCompleted && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                                  {studentName}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTask(task._id)}
                      className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
