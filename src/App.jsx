import { AlertTriangle, KeyRound, Search, Sparkles } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import { initialMockRecipes } from "./utils/constants";
import { parseGeminiResponseToRecipe } from "./utils/helpers";
import FeaturedRecipe from "./components/FeaturedRecipe";
import TagFilters from "./components/TagFilters";
import RecipeCard from "./components/RecipeCard";
import ApiKeyModal from "./components/ApiKeyModal";
import RecipeDetails from "./components/RecipeDetails";
import CookingModeView from "./components/CookingModeView";

export default function RecipeBlogApp() {
  // --- State ---
  const [recipes, setRecipes] = useState(initialMockRecipes);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [cookingModeRecipeId, setCookingModeRecipeId] = useState(null);

  // --- State for AI Feature ---
  const [aiSearchTerm, setAiSearchTerm] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState(null); // To store API/parsing errors
  const [userApiKey, setUserApiKey] = useState(null); // Store API key in state (session only)
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const nextRecipeId = useRef(initialMockRecipes.length + 1);

  // --- Theme ---
  const theme = useMemo(
    () =>
      isDarkMode
        ? {
            bg: "bg-gray-900",
            cardBg: "bg-gray-800",
            text: "text-gray-100",
            subText: "text-gray-400",
            border: "border-gray-700",
            accent: "text-amber-400",
            shadow: "shadow-lg shadow-black/30",
            hover: "hover:bg-gray-700",
            iconBg: "bg-gray-700",
            iconHover: "hover:bg-gray-600",
            inputBg: "bg-gray-700",
            inputBorder: "border-gray-600",
            focusRing:
              "focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800 outline-none",
            tagBg: "bg-gray-700",
            tagText: "text-gray-300",
            progressBg: "bg-gray-600",
          }
        : {
            bg: "bg-gray-100",
            cardBg: "bg-white",
            text: "text-gray-900",
            subText: "text-gray-500",
            border: "border-gray-200",
            accent: "text-amber-600",
            shadow: "shadow-lg shadow-gray-200/50",
            hover: "hover:bg-gray-100",
            iconBg: "bg-gray-100",
            iconHover: "hover:bg-gray-200",
            inputBg: "bg-gray-50",
            inputBorder: "border-gray-300",
            focusRing:
              "focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white outline-none",
            tagBg: "bg-gray-100",
            tagText: "text-gray-600",
            progressBg: "bg-gray-200",
          },
    [isDarkMode]
  );

  // --- Effects ---
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  // --- Computed Values ---
  const allTags = useMemo(() => {
    const tagsSet = new Set();
    recipes.forEach((recipe) => recipe.tags.forEach((tag) => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        recipe.title.toLowerCase().includes(lowerSearchTerm) ||
        recipe.description.toLowerCase().includes(lowerSearchTerm);
      const matchesTag = !activeTagFilter || recipe.tags.includes(activeTagFilter);
      return matchesSearch && matchesTag;
    });
  }, [recipes, searchTerm, activeTagFilter]);

  const selectedRecipeForDetail = useMemo(() => {
    const id = cookingModeRecipeId ?? selectedRecipeId;
    if (id === null) return null;
    return recipes.find((recipe) => recipe.id === id);
  }, [recipes, selectedRecipeId, cookingModeRecipeId]);

  const featuredRecipe = useMemo(() => recipes.find((r) => r.id === 4), [recipes]);

  // --- Event Handlers ---
  const handleSelectRecipe = useCallback((id) => {
    setCookingModeRecipeId(null);
    setSelectedRecipeId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleGoBack = useCallback(() => {
    setSelectedRecipeId(null);
  }, []);

  const toggleDarkMode = useCallback(() => setIsDarkMode((prev) => !prev), []);

  const startCooking = useCallback((id) => {
    setCookingModeRecipeId(id);
    setSelectedRecipeId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const exitCookingMode = useCallback(() => {
    const justCookedId = cookingModeRecipeId;
    setCookingModeRecipeId(null);
    setSelectedRecipeId(justCookedId);
  }, [cookingModeRecipeId]);

  const handleApiKeySubmit = (key) => {
    setUserApiKey(key);
    setShowApiKeyModal(false);
    setAiError(null); // Clear previous errors
  };

  const handleAiRecipeSearch = useCallback(
    async (event) => {
      event.preventDefault();

      if (!aiSearchTerm.trim() || isAiGenerating) return;

      setAiError(null); // Clear previous errors

      // Check for API key
      if (!userApiKey) {
        setShowApiKeyModal(true);
        return;
      }

      setIsAiGenerating(true);
      setCookingModeRecipeId(null);
      setSelectedRecipeId(null);

      // --- Construct the Prompt ---
      const prompt = `
        Generate a recipe based on the following request: "${aiSearchTerm}".

        Please provide the output ONLY as a single, valid JSON object adhering strictly to this structure:
        {
          "title": "Recipe Title",
          "description": "A short, appealing description (1-2 sentences).",
          "prepTime": "e.g., '15 min'",
          "cookTime": "e.g., '30 min'",
          "totalTime": "e.g., '45 min'",
          "servings": number (e.g., 4),
          "difficulty": "'Easy', 'Medium', or 'Hard'",
          "rating": number (e.g., 4.5, optional, default to 4.0 if unsure),
          "tags": ["string", "string", "string"],
          "ingredients": [ { "quantity": string, "unit": "string", "name": "string" } ],
          "instructions": [ { "text": "string", "estimatedTime": number_in_seconds (optional) } ],
          "image": null
        }

        Ensure all field names and value types match exactly. Do not include any text or formatting outside of this single JSON object. Be creative but provide a realistic recipe. If the request is ambiguous, make a reasonable interpretation (e.g., if they just say "chicken", maybe provide a simple roasted chicken).
        For instructions, provide estimatedTime in seconds for each step where applicable.
      `;

      // --- Make API Call ---
      const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${userApiKey}`;

      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 2048,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error Response:", errorData);
          throw new Error(
            `API Error (${response.status}): ${errorData?.error?.message || "Unknown API error"}`
          );
        }

        const data = await response.json();

        // Extract text content - adjust based on actual Gemini API response structure
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
          throw new Error("No recipe content found in AI response.");
        }

        // --- Parse and Add Recipe ---
        const newRecipe = parseGeminiResponseToRecipe(
          responseText,
          aiSearchTerm,
          nextRecipeId,
          setAiError
        );

        if (newRecipe) {
          setRecipes((prevRecipes) => [...prevRecipes, newRecipe]);
          setSelectedRecipeId(newRecipe.id); // Navigate to detail view
          setAiSearchTerm(""); // Clear search
        }
        // Error handling is done within parseGeminiResponseToRecipe via setAiError
      } catch (error) {
        console.error("Error fetching or processing AI recipe:", error);

        setAiError(
          `An error occurred: ${error.message}. Check your API key and network connection.`
        );
      } finally {
        setIsAiGenerating(false);
      }
    },
    [aiSearchTerm, isAiGenerating, userApiKey]
  ); // Added parse function dependency

  // --- Render ---
  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300 font-sans selection:bg-amber-200 dark:selection:bg-amber-700`}
    >
      <Header
        data={{
          theme,
          isDarkMode,
          cookingModeRecipeId,
          selectedRecipeId,
          searchTerm,
          setSearchTerm,
          exitCookingMode,
          handleGoBack,
          toggleDarkMode,
          setShowApiKeyModal,
        }}
      />

      {/* Main Content Area */}
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {cookingModeRecipeId !== null && selectedRecipeForDetail ? (
          <CookingModeView
            recipe={selectedRecipeForDetail}
            theme={theme}
            isDarkMode={isDarkMode}
            onExit={exitCookingMode}
          />
        ) : selectedRecipeId !== null && selectedRecipeForDetail ? (
          <RecipeDetails
            data={{ theme, isDarkMode, selectedRecipeId, selectedRecipeForDetail, startCooking }}
          />
        ) : (
          <div>
            {/* AI Recipe Search Section */}
            <section
              className={`mb-10 p-6 rounded-lg ${theme.cardBg} border ${theme.border} ${theme.shadow}`}
            >
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <Sparkles size={20} className={`mr-2 ${theme.accent}`} /> Find a New Recipe with AI!
              </h2>
              <form onSubmit={handleAiRecipeSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={aiSearchTerm}
                  onChange={(e) => setAiSearchTerm(e.target.value)}
                  placeholder="e.g., 'Spicy Chicken Tacos', 'Vegan Chocolate Cake'"
                  aria-label="Ask AI for a recipe"
                  className={`flex-grow px-4 py-2 rounded-lg border ${theme.inputBorder} ${theme.inputBg} ${theme.focusRing}`}
                  disabled={isAiGenerating}
                />
                <button
                  type="submit"
                  disabled={isAiGenerating || !aiSearchTerm.trim()}
                  className={`inline-flex items-center justify-center px-5 py-2 rounded-lg font-medium ${
                    theme.accent
                  } ${
                    isDarkMode
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  } transition-colors ${
                    theme.focusRing
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isAiGenerating ? (
                    <>
                      <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white border-[6px] rounded-full border-dotted border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="mr-2" /> Generate Recipe
                    </>
                  )}
                </button>
              </form>
              {aiError && ( // Display AI Errors
                <p className="text-sm text-red-600 dark:text-red-400 mt-3 flex items-center">
                  <AlertTriangle size={16} className="mr-2" /> {aiError}
                </p>
              )}
              {!userApiKey && ( // Prompt to add API key if missing
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center">
                  <KeyRound size={14} className="mr-1.5" /> Please&nbsp;
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="underline font-medium hover:text-amber-500"
                  >
                    enter your API key
                  </button>
                  &nbsp;to use the AI generator.
                </p>
              )}
            </section>
            <FeaturedRecipe
              recipe={featuredRecipe}
              theme={theme}
              onSelect={handleSelectRecipe}
              isDarkMode={isDarkMode}
            />
            <TagFilters
              tags={allTags}
              activeTag={activeTagFilter}
              setActiveTag={setActiveTagFilter}
              theme={theme}
              isDarkMode={isDarkMode}
            />
            <div className="relative mb-6 sm:hidden">
              <input
                type="search"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-3 py-2 text-sm rounded-full border ${theme.inputBorder} ${theme.inputBg} ${theme.focusRing}`}
              />
              <Search
                size={16}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.subText}`}
              />
            </div>
            <h2 className="text-2xl font-semibold mb-6" id="all-recipes">
              {activeTagFilter ? `${activeTagFilter} Recipes` : "All Recipes"} (
              {filteredRecipes.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    theme={theme}
                    onSelect={handleSelectRecipe}
                    isDarkMode
                  />
                ))
              ) : (
                <p className={`sm:col-span-2 lg:col-span-3 text-center ${theme.subText} mt-8 py-8`}>
                  No recipes found{activeTagFilter ? ` for "${activeTagFilter}"` : ""}
                  {searchTerm ? ` matching "${searchTerm}"` : ""}. Try adjusting your filters!
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className={`text-center mt-12 py-6 border-t ${theme.border} text-xs ${theme.subText}`}
      >
        Interactive Rasoi &copy; {new Date().getFullYear()}
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        theme={theme}
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSubmitKey={handleApiKeySubmit}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
