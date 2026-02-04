import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch stats
  const { count: studentsCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })

  const { count: lessonsCount } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')

  const { data: upcomingLessons } = await supabase
    .from('lessons')
    .select('*, students(name)')
    .eq('status', 'scheduled')
    .gte('start_time', new Date().toISOString())
    .order('start_time')
    .limit(5)

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Vitejte zpet!</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Celkem zaku"
          value={studentsCount || 0}
          icon="👥"
          href="/dashboard/students"
        />
        <StatCard
          title="Naplanovane lekce"
          value={lessonsCount || 0}
          icon="📅"
          href="/dashboard/lessons"
        />
        <StatCard
          title="Tento mesic"
          value="0 Kc"
          icon="💰"
          href="/dashboard/payments"
        />
      </div>

      {/* Upcoming Lessons */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nadchazejici lekce</h2>
          <Link href="/dashboard/lessons/new" className="btn btn-primary">
            + Nova lekce
          </Link>
        </div>

        {upcomingLessons && upcomingLessons.length > 0 ? (
          <div className="space-y-3">
            {upcomingLessons.map((lesson: any) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-sm text-slate-600">
                    {lesson.students?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Date(lesson.start_time).toLocaleDateString('cs-CZ')}
                  </p>
                  <p className="text-sm text-slate-600">
                    {new Date(lesson.start_time).toLocaleTimeString('cs-CZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>Zadne naplanovane lekce</p>
            <Link href="/dashboard/lessons/new" className="text-primary-600 hover:underline">
              Vytvorit prvni lekci
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  href,
}: {
  title: string
  value: number | string
  icon: string
  href: string
}) {
  return (
    <Link href={href} className="card hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Link>
  )
}
