import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/flame-icon.svg" alt="Lulu" className="w-8 h-8" />
          <span className="font-extrabold text-xl">Lulu Recipe Hub</span>
        </div>
        <button aria-label="Menu" className="md:hidden p-2" onClick={() => setOpen(!open)}>
          <Menu />
        </button>
        <nav className="hidden md:flex gap-6 font-medium">
          <a href="#recipes" className="hover:opacity-90">Recipes</a>
          <a href="#pantry" className="hover:opacity-90">Pantry</a>
          <a href="#planner" className="hover:opacity-90">Meal Plan</a>
          <a href="#shopping" className="hover:opacity-90">Shopping</a>
          <a href="#reminders" className="hover:opacity-90">Reminders</a>
        </nav>
      </div>
      {open && (
        <div className="md:hidden px-4 pb-4 grid gap-3 bg-white/10 backdrop-blur">
          <a href="#recipes" className="py-2">Recipes</a>
          <a href="#pantry" className="py-2">Pantry</a>
          <a href="#planner" className="py-2">Meal Plan</a>
          <a href="#shopping" className="py-2">Shopping</a>
          <a href="#reminders" className="py-2">Reminders</a>
        </div>
      )}
    </header>
  );
}
