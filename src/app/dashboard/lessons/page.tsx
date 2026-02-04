import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function LessonsPage() {
  const supabase = await createClient()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, students(name)')
    .order('start_time', { ascending: false })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Naplanovano'
      case 'completed':
        return 'Dokonceno'
      case 'cancelled':
        return 'Zruseno'
      default:
        return status
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Lekce</h1>
        <Link href="/dashboard/lessons/new" className="btn btn-primary">
          + Nova lekce
        </Link>
      </div>

      {lessons && lessons.length > 0 ? (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Nazev</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Zak</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Datum</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Cas</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Stav</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Akce</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson: any) => (
                <tr key={lesson.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 px-4 font-medium">{lesson.title}</td>
                  <td className="py-3 px-4 text-slate-600">{lesson.students?.name}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(lesson.start_time).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(lesson.start_time).toLocaleTimeString('cs-CZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {' - '}
                    {new Date(lesson.end_time).toLocaleTimeString('cs-CZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lesson.status)}`}>
                      {getStatusText(lesson.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/dashboard/lessons/${lesson.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h2 className="text-xl font-semibold mb-2">Zadne lekce</h2>
          <p className="text-slate-600 mb-4">Zacnete vytvorenim prvni lekce</p>
          <Link href="/dashboard/lessons/new" className="btn btn-primary">
            Vytvorit lekci
          </Link>
        </div>
      )}
    </div>
  )
}
