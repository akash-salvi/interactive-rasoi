import {
  ArrowLeft,
  BookOpen,
  Moon,
  Search,
  Settings,
  Sun
} from "lucide-react";
import React from "react";

const Header = ({
  data: {
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
  },
}) => {
  return (
    <header
      className={`${theme.cardBg} ${theme.shadow} sticky top-0 z-20 border-b ${theme.border}`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4">
        {selectedRecipeId !== null || cookingModeRecipeId !== null ? (
          <button
            onClick={cookingModeRecipeId !== null ? exitCookingMode : handleGoBack}
            className={`flex items-center text-sm ${theme.accent} hover:underline ${theme.focusRing} rounded p-1 -ml-1`}
          >
            <ArrowLeft size={18} className="mr-1" /> Back
          </button>
        ) : (
          <div className="flex items-center space-x-3 flex-shrink-0">
            <img src="/logo2.jpg" className={"rounded-md"} width={60} />
            <h1 className="text-xl md:text-2xl font-bold hidden sm:block">Interactive Rasoi</h1>
            <h1 className="text-xl font-bold sm:hidden">Recipes</h1>
          </div>
        )}
        {selectedRecipeId === null && cookingModeRecipeId === null && (
          <div className="relative flex-grow max-w-xs sm:max-w-sm md:max-w-md mx-4 hidden sm:block">
            <input
              type="search"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-3 py-1.5 text-sm rounded-full border ${theme.inputBorder} ${theme.inputBg} ${theme.focusRing}`}
            />
            <Search
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${theme.subText}`}
            />
          </div>
        )}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={() => setShowApiKeyModal(true)}
            aria-label="API Key Settings"
            title="API Key Settings"
            className={`p-2 rounded-full ${theme.iconHover} transition-colors ${theme.focusRing}`}
          >
            <Settings size={20} />
          </button>
          <button
            onClick={toggleDarkMode}
            aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            className={`p-2 rounded-full ${theme.iconHover} transition-colors ${theme.focusRing}`}
          >
            {isDarkMode ? <Sun size={20} className={theme.accent} /> : <Moon size={20} />}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
