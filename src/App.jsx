import Navbar from './components/Navbar'
import { RecipesSection, PantrySection, PlannerSection, ShoppingSection, RemindersSection } from './components/Sections'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-indigo-50 to-purple-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
        <Hero />
        <RecipesSection />
        <PantrySection />
        <PlannerSection />
        <ShoppingSection />
        <RemindersSection />
      </main>
      <footer className="text-center text-xs text-slate-500 py-10">Made with ❤️ for Lulu</footer>
    </div>
  )
}

function Hero(){
  return (
    <section className="rounded-2xl p-5 sm:p-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-xl">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
        <img src="/flame-icon.svg" className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-xl" />
        <div className="flex-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold">Lulu Recipe Hub</h1>
          <p className="mt-2 text-white/90">Colorful, friendly cooking assistant to plan Lulu's meals, track pantry, and shop smarter.</p>
        </div>
      </div>
    </section>
  );
}

export default App