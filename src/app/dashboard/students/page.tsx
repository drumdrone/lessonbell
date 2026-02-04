import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Zaci</h1>
        <Link href="/dashboard/students/new" className="btn btn-primary">
          + Pridat zaka
        </Link>
      </div>

      {students && students.length > 0 ? (
        <div className="card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Jmeno</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Telefon</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Akce</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4 text-slate-600">{student.email || '-'}</td>
                  <td className="py-3 px-4 text-slate-600">{student.phone || '-'}</td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/dashboard/students/${student.id}`}
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
          <div className="text-4xl mb-4">👥</div>
          <h2 className="text-xl font-semibold mb-2">Zadni zaci</h2>
          <p className="text-slate-600 mb-4">Zacnete pridanim prvniho zaka</p>
          <Link href="/dashboard/students/new" className="btn btn-primary">
            Pridat zaka
          </Link>
        </div>
      )}
    </div>
  )
}
