"use client"

import { useState } from 'react'
import ClassSchedule from '@/components/class-schedule'
import TasksDashboard from '@/components/tasks-dashboard'
import Changelog from '@/components/changelog'
import RemindersPanel from '@/components/reminders-panel'
import ReminderPopup from '@/components/reminder-popup'
import CurriculumGenerator from '@/components/curriculum-generator'
import { Button } from '@/components/ui/button'
import { Calendar, CheckSquare, Plus, HelpCircle, Bell, BookOpen, Download } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'curriculum' | 'tasks' | 'reminders' | 'help'>('schedule')
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay())
  const [showForm, setShowForm] = useState(false)

  const dayNames = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota']
  const dayNamesShort = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                Rozvrh hodin
              </h1>
            </div>
            
            {/* Tabs + New Class Button */}
            <div className="flex items-center gap-3">
              {/* Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'schedule'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Rozvrh
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'curriculum'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Učivo
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Úkoly
                </button>
                <button
                  onClick={() => setActiveTab('reminders')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'reminders'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  To-Do
                </button>
                <button
                  onClick={() => setActiveTab('help')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'help'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  Nápověda
                </button>
              </div>

              {/* Download Database Button */}
              <a
                href="/db-export.zip"
                download="rozvrh-databaze.zip"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                title="Stáhnout zálohu databáze"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* New Class Button - only show on schedule tab */}
              {activeTab === 'schedule' && (
                <Button 
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 h-10 px-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nová hodina
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Reminder Popup - shows on all tabs when reminders are due */}
        <ReminderPopup />

        {/* Day Navigation - only show for schedule and tasks tabs */}
        {(activeTab === 'schedule' || activeTab === 'tasks') && (
          <div className="bg-white border-b border-gray-100 px-6 py-3 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                {dayNamesShort.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedDay === index
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200'
                        : index === new Date().getDay()
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <div className="text-center mt-2">
                <span className="text-sm font-medium text-gray-700">{dayNames[selectedDay]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            {activeTab === 'schedule' ? (
              <ClassSchedule 
                selectedDay={selectedDay} 
                setSelectedDay={setSelectedDay}
                showForm={showForm}
                setShowForm={setShowForm}
              />
            ) : activeTab === 'curriculum' ? (
              <CurriculumGenerator />
            ) : activeTab === 'tasks' ? (
              <TasksDashboard />
            ) : activeTab === 'reminders' ? (
              <RemindersPanel />
            ) : (
              <Changelog />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
