import { createClient } from '@/lib/supabase/server'

export default async function PaymentsPage() {
  const supabase = await createClient()

  const { data: unpaidLessons } = await supabase
    .from('lessons')
    .select('*, students(name)')
    .eq('status', 'completed')
    .eq('is_paid', false)
    .order('start_time', { ascending: false })

  const { data: paidLessons } = await supabase
    .from('lessons')
    .select('*, students(name)')
    .eq('is_paid', true)
    .order('start_time', { ascending: false })
    .limit(10)

  const totalUnpaid = (unpaidLessons as any[])?.reduce((sum, l) => sum + (l.price || 0), 0) || 0

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Platby</h1>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-orange-50 border-orange-200">
          <p className="text-sm text-orange-600 mb-1">Neuhrazeno</p>
          <p className="text-3xl font-bold text-orange-700">{totalUnpaid} Kc</p>
          <p className="text-sm text-orange-600 mt-1">{unpaidLessons?.length || 0} lekci</p>
        </div>
        <div className="card bg-green-50 border-green-200">
          <p className="text-sm text-green-600 mb-1">Uhrazeno tento mesic</p>
          <p className="text-3xl font-bold text-green-700">0 Kc</p>
        </div>
      </div>

      {/* Unpaid Lessons */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Neuhrazene lekce</h2>
        {unpaidLessons && unpaidLessons.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Lekce</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Zak</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Datum</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Castka</th>
              </tr>
            </thead>
            <tbody>
              {unpaidLessons.map((lesson: any) => (
                <tr key={lesson.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 px-4 font-medium">{lesson.title}</td>
                  <td className="py-3 px-4 text-slate-600">{lesson.students?.name}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(lesson.start_time).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {lesson.price ? `${lesson.price} Kc` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-8 text-slate-500">Vsechny lekce jsou uhrazeny</p>
        )}
      </div>

      {/* Recent Paid */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Nedavno uhrazene</h2>
        {paidLessons && paidLessons.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Lekce</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Zak</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Datum</th>
                <th className="text-right py-3 px-4 font-medium text-slate-600">Castka</th>
              </tr>
            </thead>
            <tbody>
              {paidLessons.map((lesson: any) => (
                <tr key={lesson.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 px-4 font-medium">{lesson.title}</td>
                  <td className="py-3 px-4 text-slate-600">{lesson.students?.name}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(lesson.start_time).toLocaleDateString('cs-CZ')}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-green-600">
                    {lesson.price ? `${lesson.price} Kc` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-8 text-slate-500">Zadne uhrazene lekce</p>
        )}
      </div>
    </div>
  )
}
