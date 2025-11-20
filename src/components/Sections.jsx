import { useEffect, useMemo, useState } from "react";
import RecipeCard from "./RecipeCard";

const API = import.meta.env.VITE_BACKEND_URL || "";

async function api(path, opts) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function RecipesSection() {
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = async () => {
    const [list, sug] = await Promise.all([
      api('/api/recipes?include_reviews=1'),
      api('/api/suggest'),
    ]);
    const map = Object.fromEntries(sug.suggestions.map(s => [s.id, s]));
    const withFlags = list.recipes.map(r => ({ ...r, can_make: map[r.id]?.can_make }));
    setRecipes(withFlags);
  };

  useEffect(() => { load(); }, []);

  return (
    <section id="recipes" className="py-6 sm:py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-extrabold">Lulu's Recipes</h2>
        <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-full bg-pink-500 text-white text-sm font-bold">Add Recipe</button>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {recipes.map(r => (
          <RecipeCard key={r.id} recipe={r} onSelect={setSelected} />
        ))}
      </div>

      {formOpen && <AddRecipeForm onClose={() => { setFormOpen(false); load(); }} />}
      {selected && <RecipeModal recipeId={selected.id} onClose={() => setSelected(null)} />}
    </section>
  );
}

function AddRecipeForm({ onClose }) {
  const [form, setForm] = useState({ title: '', description: '', image: '', prep_time_min: 10, age_range: '6-12 months', ingredients: [], steps: [''] });
  const addIng = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', quantity: 1, unit: 'pc', substitutions: [] }] }));
  const addStep = () => setForm(f => ({ ...f, steps: [...f.steps, ''] }));
  const submit = async () => {
    await api('/api/recipes', { method: 'POST', body: JSON.stringify(form) });
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black/40 p-4 overflow-auto z-50">
      <div className="bg-white rounded-2xl p-4 max-w-2xl mx-auto">
        <h3 className="text-lg font-bold">Add Recipe</h3>
        <div className="grid gap-3 mt-3">
          <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
          <input className="input" placeholder="Image URL" value={form.image} onChange={e=>setForm(f=>({...f,image:e.target.value}))} />
          <textarea className="input" placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input" type="number" placeholder="Prep time (min)" value={form.prep_time_min} onChange={e=>setForm(f=>({...f,prep_time_min:+e.target.value}))} />
            <input className="input" placeholder="Age range" value={form.age_range} onChange={e=>setForm(f=>({...f,age_range:e.target.value}))} />
          </div>
          <div>
            <div className="flex items-center justify-between"><span className="font-semibold">Ingredients</span><button onClick={addIng} className="text-pink-600 text-sm">+ Add</button></div>
            <div className="grid gap-2 mt-2">
              {form.ingredients.map((ing, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2">
                  <input className="input col-span-2" placeholder="Name" value={ing.name} onChange={e=>setForm(f=>{const a=[...f.ingredients];a[idx]={...a[idx],name:e.target.value};return {...f,ingredients:a}})} />
                  <input className="input" type="number" placeholder="Qty" value={ing.quantity} onChange={e=>setForm(f=>{const a=[...f.ingredients];a[idx]={...a[idx],quantity:+e.target.value};return {...f,ingredients:a}})} />
                  <input className="input" placeholder="Unit" value={ing.unit||''} onChange={e=>setForm(f=>{const a=[...f.ingredients];a[idx]={...a[idx],unit:e.target.value};return {...f,ingredients:a}})} />
                  <input className="input" placeholder="Substitutions (comma-separated)" onChange={e=>setForm(f=>{const a=[...f.ingredients];a[idx]={...a[idx],substitutions:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)};return {...f,ingredients:a}})} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between"><span className="font-semibold">Steps</span><button onClick={addStep} className="text-pink-600 text-sm">+ Add</button></div>
            <div className="grid gap-2 mt-2">
              {form.steps.map((s, idx) => (
                <input key={idx} className="input" placeholder={`Step ${idx+1}`} value={s} onChange={e=>setForm(f=>{const a=[...f.steps];a[idx]=e.target.value;return {...f,steps:a}})} />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded-full bg-slate-100" onClick={onClose}>Cancel</button>
            <button className="px-4 py-2 rounded-full bg-pink-600 text-white" onClick={submit}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecipeModal({ recipeId, onClose }) {
  const [data, setData] = useState(null);
  const [review, setReview] = useState({ rating: 5, note: '' });
  useEffect(() => { (async () => setData(await api(`/api/recipes/${recipeId}`)))(); }, [recipeId]);
  const addReview = async () => {
    await api(`/api/recipes/${recipeId}/reviews`, { method: 'POST', body: JSON.stringify({ recipe_id: recipeId, rating: review.rating, note: review.note }) });
    setData(await api(`/api/recipes/${recipeId}`));
    setReview({ rating: 5, note: '' });
  };
  if (!data) return null;
  return (
    <div className="fixed inset-0 bg-black/40 p-4 overflow-auto z-50">
      <div className="bg-white rounded-2xl p-4 max-w-2xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-extrabold">{data.title}</h3>
            <p className="text-slate-600">{data.description}</p>
          </div>
          <button onClick={onClose} className="px-3 py-2 rounded-full bg-slate-100">Close</button>
        </div>
        {data.image && <img src={data.image} alt="" className="w-full h-56 object-cover rounded-xl mt-3" />}
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div>
            <h4 className="font-bold mb-2">Ingredients</h4>
            <ul className="grid gap-2">
              {data.ingredients?.map((ing, i) => (
                <li key={i} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50">
                  <div>
                    <div className="font-medium">{ing.name} <span className="text-xs text-slate-500">{ing.quantity} {ing.unit}</span></div>
                    {ing.substitutions?.length > 0 && (
                      <div className="text-xs text-emerald-700">Sub: {ing.substitutions.join(', ')}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-2">Steps</h4>
            <ol className="grid gap-2 list-decimal list-inside">
              {data.steps?.map((s, i) => (
                <li key={i} className="bg-slate-50 rounded-lg p-2">{s}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-bold mb-2">Your ratings & notes</h4>
          <div className="flex items-center gap-2">
            <select className="input w-28" value={review.rating} onChange={e=>setReview(r=>({...r, rating:+e.target.value}))}>
              {[1,2,3,4,5].map(n=> <option key={n} value={n}>{n} Star{n>1?'s':''}</option>)}
            </select>
            <input className="input flex-1" placeholder="Personal note (optional)" value={review.note} onChange={e=>setReview(r=>({...r, note:e.target.value}))} />
            <button onClick={addReview} className="px-4 py-2 rounded-full bg-emerald-600 text-white">Save</button>
          </div>
          <div className="grid gap-2 mt-2">
            {data.reviews?.map(rv => (
              <div key={rv.id} className="text-sm p-2 bg-slate-50 rounded-lg">⭐ {rv.rating} – {rv.note}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PantrySection() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'pc' });
  const load = async () => setItems((await api('/api/pantry')).items);
  useEffect(() => { load(); }, []);
  const add = async () => { await api('/api/pantry', { method: 'POST', body: JSON.stringify(form) }); setForm({ name: '', quantity: 1, unit: 'pc' }); load(); };
  const remove = async (id) => { await api(`/api/pantry/${id}`, { method: 'DELETE' }); load(); };
  return (
    <section id="pantry" className="py-6 sm:py-10">
      <h2 className="text-xl sm:text-2xl font-extrabold">Lulu's Pantry</h2>
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2">
        <input className="input col-span-2" placeholder="Add ingredient" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
        <input className="input" type="number" placeholder="Qty" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:+e.target.value}))} />
        <input className="input" placeholder="Unit" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} />
        <button onClick={add} className="px-3 py-2 rounded-full bg-indigo-600 text-white col-span-1">Add</button>
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {items.map(i => (
          <div key={i.id} className="p-3 rounded-xl bg-white shadow flex items-center justify-between">
            <div>
              <div className="font-bold">{i.name}</div>
              <div className="text-xs text-slate-500">{i.quantity} {i.unit}</div>
            </div>
            <button onClick={() => remove(i.id)} className="text-sm text-pink-600">Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PlannerSection() {
  const [week, setWeek] = useState(getMonday());
  const [plan, setPlan] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const load = async () => {
    const p = await api(`/api/mealplan/${week}`);
    const r = await api('/api/recipes');
    setPlan(p); setRecipes(r.recipes);
  };
  useEffect(() => { load(); }, [week]);
  const autoFill = async () => { await api(`/api/mealplan/${week}/auto-fill`, { method: 'POST' }); load(); };
  const save = async () => { await api('/api/mealplan', { method: 'POST', body: JSON.stringify({ week_start: week, days: plan.days }) }); alert('Saved week'); };
  if (!plan) return null;
  const days = Object.keys(plan.days);
  const setSlot = (d, s, id) => setPlan(p => ({ ...p, days: { ...p.days, [d]: { ...p.days[d], [s]: id } } }));
  return (
    <section id="planner" className="py-6 sm:py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-extrabold">Weekly Meal Plan</h2>
        <div className="flex gap-2">
          <button onClick={autoFill} className="px-3 py-2 rounded-full bg-emerald-600 text-white text-sm">Auto-fill Week</button>
          <button onClick={save} className="px-3 py-2 rounded-full bg-indigo-600 text-white text-sm">Save</button>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {days.map(d => (
          <div key={d} className="bg-white rounded-xl shadow p-3">
            <div className="font-bold text-pink-600">{d}</div>
            {['breakfast','lunch','dinner'].map(slot => (
              <div key={slot} className="mt-2">
                <div className="text-xs text-slate-500 mb-1 uppercase">{slot}</div>
                <select className="input w-full" value={plan.days[d][slot] || ''} onChange={e=>setSlot(d,slot,e.target.value)}>
                  <option value="">-- choose recipe --</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShoppingSection() {
  const [week, setWeek] = useState(getMonday());
  const [items, setItems] = useState([]);
  const load = async () => setItems((await api(`/api/shopping-list/${week}`)).items);
  useEffect(() => { load(); }, [week]);
  return (
    <section id="shopping" className="py-6 sm:py-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-extrabold">Shopping List</h2>
        <input className="input w-44" type="date" value={week} onChange={e=>setWeek(e.target.value)} />
      </div>
      <div className="mt-3 grid gap-2">
        {items.map((it, idx) => (
          <label key={idx} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow">
            <input type="checkbox" onChange={e=>setItems(arr=>arr.map((a,i)=> i===idx?{...a, purchased:e.target.checked}:a))} />
            <span className={it.purchased? 'line-through text-slate-400': ''}>{it.name} – {it.quantity} {it.unit}</span>
          </label>
        ))}
        {items.length === 0 && <div className="text-slate-500">No items needed. Pantry covers the plan. 🎉</div>}
      </div>
    </section>
  );
}

export function RemindersSection() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', due_at: new Date().toISOString().slice(0,16), type: 'meal' });
  const load = async () => setItems((await api('/api/reminders')).reminders);
  useEffect(() => { load(); }, []);
  const add = async () => { await api('/api/reminders', { method: 'POST', body: JSON.stringify(form) }); setForm({ ...form, title: '' }); load(); };
  const remove = async (id) => { await api(`/api/reminders/${id}`, { method: 'DELETE' }); load(); };
  return (
    <section id="reminders" className="py-6 sm:py-10">
      <h2 className="text-xl sm:text-2xl font-extrabold">Reminders</h2>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
        <input className="input" type="datetime-local" value={form.due_at} onChange={e=>setForm(f=>({...f,due_at:e.target.value}))} />
        <select className="input" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
          <option value="meal">Meal</option>
          <option value="shopping">Shopping</option>
          <option value="other">Other</option>
        </select>
        <button onClick={add} className="px-3 py-2 rounded-full bg-indigo-600 text-white">Add</button>
      </div>
      <div className="mt-3 grid gap-2">
        {items.map(r => (
          <div key={r.id} className="bg-white p-3 rounded-xl shadow flex items-center justify-between">
            <div>
              <div className="font-bold">{r.title}</div>
              <div className="text-xs text-slate-500">{r.type} • {new Date(r.due_at).toLocaleString()}</div>
            </div>
            <button onClick={() => remove(r.id)} className="text-sm text-pink-600">Remove</button>
          </div>
        ))}
        {items.length===0 && <div className="text-slate-500">No reminders yet.</div>}
      </div>
    </section>
  );
}

function getMonday(d = new Date()) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day; // adjust to Monday
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diff);
  return monday.toISOString().slice(0,10);
}

// small input style
const style = document.createElement('style');
style.innerHTML = `.input{ @apply px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 }`;
document.head.appendChild(style);
