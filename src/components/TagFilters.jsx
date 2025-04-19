import {
    Tag as TagIcon
} from "lucide-react";
import React from "react";

const TagFilters = ({ tags, activeTag, setActiveTag, theme, isDarkMode }) => {
  return (
    <nav aria-label="Recipe Categories" className="mb-8">
      <p className={`text-sm font-medium ${theme.subText} mb-2 flex items-center`}>
        <TagIcon size={16} className="mr-1.5" /> Filter by Tag:
      </p>
      <ul className="flex flex-wrap gap-2">
        <li>
          <button
            onClick={() => setActiveTag("")}
            className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
              theme.focusRing
            } ${
              !activeTag
                ? `${theme.accent} ${
                    isDarkMode
                      ? "bg-amber-900/50 border border-amber-700"
                      : "bg-amber-100 border border-amber-300"
                  } font-semibold shadow-sm`
                : `${theme.tagBg} ${theme.tagText} border ${theme.border} hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
            }`}
          >
            All
          </button>
        </li>
        {tags.map((tag) => (
          <li key={tag}>
            <button
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-all duration-200 ${
                theme.focusRing
              } ${
                activeTag === tag
                  ? `${theme.accent} ${
                      isDarkMode
                        ? "bg-amber-900/50 border border-amber-700"
                        : "bg-amber-100 border border-amber-300"
                    } font-semibold shadow-sm`
                  : `${theme.tagBg} ${theme.tagText} border ${theme.border} hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
              }`}
            >
              {tag}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default React.memo(TagFilters);
