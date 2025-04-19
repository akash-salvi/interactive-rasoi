import {
    AlertTriangle,
    KeyRound,
    X
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const ApiKeyModal = ({ theme, isOpen, onClose, onSubmitKey, isDarkMode }) => {
  const [keyInput, setKeyInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyInput.trim()) {
      onSubmitKey(keyInput.trim());
      setKeyInput(""); // Clear input after submit
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
        isDarkMode ? "bg-black/80" : "bg-black/60"
      } backdrop-blur-sm`}
    >
      <div
        className={`${theme.cardBg} ${theme.text} rounded-xl max-w-md w-full ${theme.shadow} border ${theme.border} p-6 m-4`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <KeyRound size={20} className={`mr-2 ${theme.accent}`} />
            Enter Your Gemini API Key
          </h2>
          <button
            onClick={onClose}
            aria-label="Close API Key modal"
            className={`p-1 rounded-full ${theme.iconHover} ${theme.focusRing}`}
          >
            <X size={20} />
          </button>
        </div>

        <div
          className={`p-3 rounded-md border border-red-500/50 ${
            isDarkMode ? "bg-red-900/20" : "bg-red-50"
          } mb-4`}
        >
          <div className="flex items-start">
            <AlertTriangle size={20} className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400">
              <strong>Security Warning:</strong> Never share your API key. Entering it here stores
              it only for this browser session and is{" "}
              <strong>not recommended for production apps</strong>. For real applications, handle
              API keys on a secure backend server.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="apiKeyInput" className={`block text-sm ${theme.subText} mb-1`}>
            Gemini API Key:
          </label>
          <input
            ref={inputRef}
            id="apiKeyInput"
            type="password" // Use password type
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Enter your key here"
            className={`w-full p-2 rounded-md border ${theme.inputBorder} ${theme.inputBg} ${theme.focusRing} mb-4`}
            required
          />
          <button
            type="submit"
            className={`w-full px-5 py-2 rounded-lg font-medium ${theme.accent} ${
              isDarkMode
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-white"
            } transition-colors ${theme.focusRing}`}
          >
            Save Key for Session
          </button>
        </form>
        <p className={`text-xs ${theme.subText} mt-3 text-center`}>
          Get your key from{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-500"
          >
            Google AI Studio
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;
