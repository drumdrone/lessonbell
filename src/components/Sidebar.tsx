'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Prehled', href: '/dashboard', icon: '🏠' },
  { name: 'Zaci', href: '/dashboard/students', icon: '👥' },
  { name: 'Lekce', href: '/dashboard/lessons', icon: '📅' },
  { name: 'Platby', href: '/dashboard/payments', icon: '💰' },
  { name: 'Nastaveni', href: '/dashboard/settings', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="text-xl font-bold text-primary-600">
          LessonBell
        </Link>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Odhlasit se</span>
        </button>
      </div>
    </aside>
  )
}
