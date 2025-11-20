import { Star } from "lucide-react";

export default function RecipeCard({ recipe, onSelect }) {
  const avg = recipe.avg_rating ?? null;
  const canMake = recipe.can_make;
  return (
    <button onClick={() => onSelect?.(recipe)} className="text-left bg-white rounded-xl shadow hover:shadow-lg transition p-3 sm:p-4 relative">
      {recipe.image && (
        <img src={recipe.image} alt={recipe.title} className="w-full h-40 object-cover rounded-lg" />
      )}
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-800 line-clamp-1">{recipe.title}</h3>
          {canMake && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Can Make!</span>}
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{recipe.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <span>{recipe.prep_time_min} min</span>
          <span>•</span>
          <span>{recipe.age_range}</span>
        </div>
        <div className="mt-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={(avg && i < Math.round(avg)) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
          ))}
        </div>
      </div>
    </button>
  );
}
