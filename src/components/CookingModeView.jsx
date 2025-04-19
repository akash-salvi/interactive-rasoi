import {
    Check,
    CheckCircle,
    ChefHat,
    Pause,
    Play,
    SkipBack,
    XCircle
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

const CookingModeView = ({ recipe, theme, isDarkMode, onExit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatus, setStepStatus] = useState("idle"); // idle, timing, paused
  const [stepTimerValue, setStepTimerValue] = useState(0);
  const [intervalIdState, setIntervalIdState] = useState(null); // Renamed to avoid conflict
  const [showConfetti, setShowConfetti] = useState(false);
  const stepContentRef = useRef(null);

  const currentStep = recipe.instructions[currentStepIndex];
  const totalSteps = recipe.instructions.length;
  const progress = Math.round(((currentStepIndex + 1) / totalSteps) * 100);

  // Format Time Helper
  const formatTime = useCallback((totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  // Timer Logic Effect
  useEffect(() => {
    let intervalId = null;
    if (stepStatus === "timing") {
      intervalId = setInterval(() => {
        setStepTimerValue((prev) => prev + 1);
      }, 1000);
      setIntervalIdState(intervalId); // Store interval ID
    } else {
      if (intervalIdState) {
        // Clear using stored ID
        clearInterval(intervalIdState);
        setIntervalIdState(null);
      }
    }
    // Cleanup function
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [stepStatus]); // Rerun only when status changes

  // Reset step state when changing steps
  const changeStep = useCallback(
    (newIndex) => {
      const contentElement = stepContentRef.current;
      const animateStepChange = (callback) => {
        if (contentElement) {
          contentElement.style.transition = "opacity 0.2s ease-in, transform 0.2s ease-in";
          contentElement.style.opacity = "0";
          contentElement.style.transform = "translateY(-10px)";
          setTimeout(() => {
            callback(); // Change state after fade out
            requestAnimationFrame(() => {
              // Ensure state update is processed
              if (contentElement) {
                contentElement.style.transition =
                  "opacity 0.25s ease-out, transform 0.25s ease-out";
                contentElement.style.opacity = "1";
                contentElement.style.transform = "translateY(0)";
              }
            });
          }, 200); // Match fade-out duration
        } else {
          callback();
        }
      };

      animateStepChange(() => {
        if (newIndex >= 0 && newIndex < totalSteps) {
          setStepStatus("idle");
          setStepTimerValue(0);
          setCurrentStepIndex(newIndex);
        } else if (newIndex >= totalSteps) {
          setStepStatus("idle");
          setStepTimerValue(0);
          setCurrentStepIndex(totalSteps);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      });
    },
    [totalSteps]
  );

  const handleStartPauseResume = useCallback(() => {
    setStepStatus((prev) => (prev === "timing" ? "paused" : "timing"));
  }, []);

  const handleCompleteStep = useCallback(() => {
    changeStep(currentStepIndex + 1);
  }, [currentStepIndex, changeStep]);

  // Confetti Component (Simple CSS Animation)
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute text-xl animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 1}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        >
          {["🎉", "🎊", "🥳", "✨"][Math.floor(Math.random() * 4)]}
        </div>
      ))}
      {/* Basic CSS for fall animation defined globally or in index.css:
                  @keyframes fall { 0% { top: -10%; opacity: 1; } 100% { top: 110%; opacity: 0.5; } }
                  .animate-fall { animation: fall linear infinite; }
              */}
    </div>
  );

  return (
    <div
      className={`relative ${theme.cardBg} rounded-lg ${theme.shadow} border ${theme.border} p-6 md:p-8 min-h-[70vh] flex flex-col`}
    >
      {showConfetti && <Confetti />}
      {/* Header */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center text-sm mb-1 ${theme.subText}">
            <ChefHat size={16} className="mr-2" /> Cooking Mode
          </div>
          <h2 className="text-2xl md:text-3xl font-bold">{recipe.title}</h2>
        </div>
        <button
          onClick={onExit}
          aria-label="Exit Cooking Mode"
          className={`p-2 rounded-full ${theme.iconHover} ${theme.focusRing}`}
        >
          <XCircle size={24} />
        </button>
      </div>
      {/* Progress Bar */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex justify-between text-sm ${theme.subText} mb-1">
          <span>
            Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
          </span>
          <span>{progress}% Complete</span>
        </div>
        <div className={`w-full ${theme.progressBg} rounded-full h-2.5 overflow-hidden`}>
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ease-out`}
            style={{
              width: `${progress}%`,
              background: isDarkMode
                ? "linear-gradient(90deg, #fcd34d, #fbbf24)"
                : "linear-gradient(90deg, #fbbf24, #f59e0b)",
            }}
          ></div>
        </div>
      </div>
      {/* Step Display Area */}
      <div className="flex-grow flex flex-col mb-6 overflow-hidden">
        {currentStepIndex < totalSteps ? (
          <div
            ref={stepContentRef}
            className="flex-grow flex flex-col justify-center items-center text-center p-4 border ${theme.border} rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'} transition-opacity duration-200 ease-out"
          >
            {/* Added transition class */}
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed">
              {currentStep?.text ?? "Loading..."}
            </p>
            {currentStep?.estimatedTime && (
              <div
                className={`mt-4 flex items-center gap-4 p-3 rounded-lg ${theme.iconBg} border ${theme.border}`}
              >
                <div className="flex flex-col items-center px-2">
                  <span className={`text-xs ${theme.subText}`}>Est. Time</span>
                  <span className="font-medium text-lg">
                    {formatTime(currentStep.estimatedTime)}
                  </span>
                </div>
                <div className="border-l ${theme.border} h-10"></div>
                <div className="flex flex-col items-center px-2">
                  <span className={`text-xs ${theme.subText}`}>Your Time</span>
                  <span
                    className={`font-medium text-lg tabular-nums ${
                      stepStatus === "timing" ? theme.accent : ""
                    }`}
                  >
                    {formatTime(stepTimerValue)}
                  </span>
                </div>
                <button
                  onClick={handleStartPauseResume}
                  aria-label={stepStatus === "timing" ? "Pause timer" : "Start timer"}
                  className={`p-2 rounded-full ${theme.iconHover} ${theme.focusRing}`}
                >
                  {stepStatus === "timing" ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-grow flex flex-col justify-center items-center text-center p-4 border ${theme.border} rounded-lg ${isDarkMode ? 'bg-green-900/30' : 'bg-green-50/80'}">
            <CheckCircle size={48} className={theme.success} />
            <h3 className="text-2xl font-bold mt-4">Recipe Complete!</h3>
            <p className={`${theme.subText} mt-2`}>
              Bon appétit! We hope you enjoyed making {recipe.title}.
            </p>
            <button
              onClick={onExit}
              className={`mt-6 inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                theme.accent
              } ${
                isDarkMode
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              } transition-colors ${theme.focusRing}`}
            >
              Finish Cooking
            </button>
          </div>
        )}
      </div>
      {/* Navigation Controls */}
      {currentStepIndex < totalSteps && (
        <div className="flex justify-between items-center mt-auto pt-4 border-t ${theme.border} flex-shrink-0">
          <button
            onClick={() => changeStep(currentStepIndex - 1)}
            disabled={currentStepIndex === 0}
            aria-label="Previous Step"
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${theme.hover} border ${theme.border} disabled:opacity-50 disabled:cursor-not-allowed ${theme.focusRing}`}
          >
            <SkipBack size={16} className="mr-1" /> Prev
          </button>
          <button
            onClick={handleCompleteStep}
            aria-label="Complete Step"
            className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium text-white ${
              isDarkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
            } transition-colors shadow-sm ${theme.focusRing}`}
          >
            Complete Step <Check size={18} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(CookingModeView);
