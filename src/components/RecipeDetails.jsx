import { ChefHat, Clock, Printer, Sparkles, Tag as TagIcon, Users } from "lucide-react";
import React from "react";
import { difficultyColors } from "../utils/constants";
import { useCallback } from "react";
import StarRating from "./StarRating";

const RecipeDetails = ({
  data: { theme, isDarkMode, selectedRecipeId, selectedRecipeForDetail, startCooking },
}) => {
  const handlePrint = useCallback(() => {
    alert(
      "Print functionality triggered. For best results, add specific print styles using @media print in your CSS."
    );
  }, []);

  return (
    <article>
      <button
        onClick={() => startCooking(selectedRecipeId)}
        className={`print:hidden mb-6 inline-flex items-center px-5 py-2 rounded-lg font-medium ${
          theme.accent
        } ${
          isDarkMode
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-amber-500 hover:bg-amber-600 text-white"
        } transition-colors ${theme.focusRing} shadow`}
      >
        <ChefHat size={18} className="mr-2" /> Start Interactive Cooking
      </button>
      <div
        className={`${theme.cardBg} rounded-lg ${theme.shadow} overflow-hidden border ${theme.border}`}
      >
        <div className="relative">
          <img
            src={selectedRecipeForDetail.image || "/ai-card.png"}
            alt={selectedRecipeForDetail.title}
            className="w-full h-48 sm:h-64 md:h-96 object-cover border-b ${theme.border}"
          />
          {selectedRecipeForDetail.recipeType === "AI Generated" && (
            <div
              className={`absolute top-0 right-0 flex items-center text-xs p-2 m-2 rounded-md ${difficultyColors.AI}
            `}
              title="This recipe was generated by AI"
            >
              <Sparkles size={14} className="mr-1 flex-shrink-0" /> AI Generated
            </div>
          )}
        </div>
        <div className="p-6 md:p-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{selectedRecipeForDetail.title}</h2>
          <p className={`${theme.subText} mb-6 text-base leading-relaxed`}>
            {selectedRecipeForDetail.description}
          </p>
          <div
            className={`flex flex-wrap items-center gap-x-6 gap-y-3 mb-6 pb-6 border-t border-b ${theme.border} pt-6`}
          >
            <div className="flex items-center" title="Total Time">
              <Clock size={18} className={`mr-1.5 ${theme.subText}`} />
              <span className="text-sm">{selectedRecipeForDetail.totalTime}</span>
            </div>
            <div className="flex items-center" title="Servings">
              <Users size={18} className={`mr-1.5 ${theme.subText}`} />
              <span className="text-sm">{selectedRecipeForDetail.servings} servings</span>
            </div>
            <StarRating rating={selectedRecipeForDetail.rating} theme={theme} />
            <div className="flex items-center gap-1 flex-wrap" title="Tags">
              <TagIcon size={14} className={theme.subText} />
              {selectedRecipeForDetail.tags.map((tag) => (
                <span
                  key={tag}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${theme.tagBg} ${theme.tagText} border ${theme.border}`}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center" title="Difficulty">
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${
                  difficultyColors[selectedRecipeForDetail.difficulty] || theme.tagBg
                }`}
              >
                {selectedRecipeForDetail.difficulty}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-8">
            <div className="md:col-span-1">
              <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
              <ul className="space-y-2 list-none p-0">
                {selectedRecipeForDetail.ingredients.map((ing, index) => (
                  <li
                    key={index}
                    className={`border-b ${theme.border} pb-2 mb-2 last:border-b-0 grid grid-cols-3`}
                  >
                    <span className="mr-3 mt-1 text-xs text-center leading-none">
                      <span className={`block font-medium ${theme.accent}`}>
                        {ing.quantity > 0 && ing.quantity}
                      </span>
                      <span className={`block ${theme.subText}`}>{ing.unit}</span>
                    </span>
                    <span className="pt-0.5 col-span-2 text-sm">{ing.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-xl font-semibold mb-4">Instructions</h3>
              <ol className="space-y-5 list-none p-0">
                {selectedRecipeForDetail.instructions.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span
                      className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${theme.accent} text-xs font-bold mr-4 mt-0.5`}
                    >
                      {index + 1}
                    </span>
                    <p className="leading-relaxed">{step.text}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className={`print:hidden mt-4 inline-flex items-center px-4 py-2 border ${theme.border} rounded-lg text-sm ${theme.hover} transition-colors ${theme.focusRing}`}
          >
            <Printer size={16} className="mr-2" /> Print Recipe
          </button>
        </div>
      </div>
    </article>
  );
};

export default RecipeDetails;
