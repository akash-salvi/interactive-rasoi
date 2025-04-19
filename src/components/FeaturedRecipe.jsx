import { Clock, Users } from "lucide-react";
import React from "react";
import { difficultyColors } from "../utils/constants";
import StarRating from "./StarRating";
import { ArrowRight } from "../utils/helpers";

const FeaturedRecipe = ({ recipe, theme, onSelect, isDarkMode }) => {
  if (!recipe) return null;

  return (
    <section
      aria-labelledby="featured-recipe-title"
      className={`mb-10 ${theme.cardBg} rounded-lg ${theme.shadow} overflow-hidden border ${theme.border} flex flex-col md:flex-row items-center group`}
    >
      <div className="md:w-1/2 lg:w-2/5 flex-shrink-0 overflow-hidden">
        <img
          src={recipe.image || "https://via.placeholder.com/600x400.png?text=Featured"}
          alt={recipe.title}
          className="w-full h-64 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6 md:p-8 flex-grow">
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${theme.accent} ${
              isDarkMode ? "bg-amber-900/50" : "bg-amber-100"
            }`}
          >
            ✨ Featured Recipe
          </span>
        </div>
        <h2 id="featured-recipe-title" className="text-2xl md:text-3xl font-bold mb-2">
          {recipe.title}
        </h2>
        <p className={`${theme.subText} mb-4 text-base leading-relaxed line-clamp-3`}>
          {recipe.description}
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm mb-5">
          <div className="flex items-center">
            <Clock size={16} className={`mr-1.5 ${theme.subText}`} /> {recipe.totalTime}
          </div>
          <div className="flex items-center">
            <Users size={16} className={`mr-1.5 ${theme.subText}`} /> {recipe.servings} servings
          </div>
          <StarRating rating={recipe.rating} theme={theme} />
          <div className="flex items-center" title="Difficulty">
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${
                difficultyColors[recipe.difficulty] || theme.tagBg
              }`}
            >
              {recipe.difficulty}
            </span>
          </div>
        </div>
        <button
          onClick={() => onSelect(recipe.id)}
          className={`inline-flex items-center px-5 py-2 rounded-lg font-medium ${theme.accent} ${
            isDarkMode
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : "bg-amber-500 hover:bg-amber-600 text-white"
          } transition-colors ${theme.focusRing}`}
        >
          View Recipe <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </section>
  );
};

export default React.memo(FeaturedRecipe);
