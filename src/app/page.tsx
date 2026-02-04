import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              LessonBell
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Spravujte sve lekce, zaky a rozvrh na jednom miste.
              Jednoducha aplikace pro soukrome ucitele.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login" className="btn btn-secondary">
                Prihlasit se
              </Link>
              <Link href="/auth/register" className="btn bg-white/20 text-white hover:bg-white/30">
                Registrace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Vse co potrebujete</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📅"
            title="Sprava rozvrhu"
            description="Prehledny kalendar s vasi vyukou. Planovani lekci jednim kliknutim."
          />
          <FeatureCard
            icon="👥"
            title="Evidence zaku"
            description="Kompletni prehled o vasich zacich, jejich kontaktech a poznamkach."
          />
          <FeatureCard
            icon="💰"
            title="Sledovani plateb"
            description="Prehled uhrazenych a neuhrazenych lekci. Zadne zapomenute platby."
          />
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Zacnete zdarma</h2>
          <p className="text-slate-600 mb-8">
            Zadna kreditni karta. Zadne zavazky. Jednoducha registrace.
          </p>
          <Link href="/auth/register" className="btn btn-primary text-lg px-8 py-3">
            Vytvorit ucet
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 LessonBell. Vytvoreno pro ucitele.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}
