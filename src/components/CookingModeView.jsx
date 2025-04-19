import {
  Timer,
  Play,
  Pause,
  SkipBack,
  Check,
  CheckCircle,
  ChefHat,
  XCircle,
} from "lucide-react";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

const CookingModeView = React.memo(({ recipe, theme, isDarkMode, onExit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepStatus, setStepStatus] = useState("idle"); // idle, timing, paused
  const [stepTimerValue, setStepTimerValue] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const stepContentRef = useRef(null);
  const stepBadgeRef = useRef(null);

  const currentStep = recipe.instructions[currentStepIndex];
  const totalSteps = recipe.instructions.length;
  const progress = totalSteps > 0 ? Math.round((currentStepIndex / totalSteps) * 100) : 0; // Progress before completing current step

  const stepProgressPercent = useMemo(() => {
    if (!currentStep?.estimatedTime || currentStep.estimatedTime <= 0) return 0;
    return Math.min((stepTimerValue / currentStep.estimatedTime) * 100, 100);
  }, [stepTimerValue, currentStep?.estimatedTime]);

  // Determine timer color based on progress
  const timerColorClass = useMemo(() => {
    if (!currentStep?.estimatedTime) return theme.text;
    if (stepProgressPercent >= 100) return "text-red-500"; // Exceeded time
    if (stepProgressPercent >= 80) return "text-yellow-500"; // Approaching time limit
    if (stepStatus === "timing") return "text-cyan-500"; // Normal timing color
    return theme.text; // Default color
  }, [stepProgressPercent, stepStatus, theme, currentStep?.estimatedTime]);

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
        setStepTimerValue((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stepStatus]); 

  // Animate Step Badge Entrance
  useEffect(() => {
    const badge = stepBadgeRef.current;
    if (badge) {
      badge.classList.remove("animate-scale-in");
      void badge.offsetWidth; // Trigger reflow
      badge.classList.add("animate-scale-in");
    }
  }, [currentStepIndex]);

  // Reset step state when changing steps
  const changeStep = useCallback(
    (newIndex) => {
      const contentElement = stepContentRef.current;
      const animateStepChange = (callback) => {
        if (contentElement) {
          contentElement.style.transition = "opacity 0.15s ease-in, transform 0.15s ease-in";
          contentElement.style.opacity = "0";
          contentElement.style.transform = "translateY(-8px)";
          setTimeout(() => {
            callback();
            requestAnimationFrame(() => {
              if (contentElement) {
                contentElement.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
                contentElement.style.opacity = "1";
                contentElement.style.transform = "translateY(0)";
              }
            });
          }, 150);
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

  // Confetti Component
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
    </div>
  );

  return (
    <div
      className={`relative ${theme.cardBg} rounded-xl ${theme.shadow} border ${theme.border
        } p-4 sm:p-6 md:p-8 min-h-[70vh] flex flex-col
      ${stepStatus === "timing"
          ? isDarkMode
            ? "animate-pulse-border-amber-dark"
            : "animate-pulse-border-amber"
          : ""
        } `}
    >
      {showConfetti && <Confetti />}
      {/* Header */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <div>
          <div className="flex items-center text-sm mb-1 ${theme.subText}">
            <ChefHat size={16} className="mr-2" /> Cooking Mode
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight">{recipe.title}</h2>
        </div>
        <button
          onClick={onExit}
          aria-label="Exit Cooking Mode"
          className={`ml-2 p-2 rounded-full ${theme.iconHover} ${theme.focusRing}`}
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
        <div
          className={`w-full ${theme.progressBg} rounded-full h-2.5 overflow-hidden shadow-inner`}
        >
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ease-out`}
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${isDarkMode ? "#fcd34d" : "#fbbf24"}, ${isDarkMode ? "#f59e0b" : "#d97706"
                })`,
            }}
          ></div>
        </div>
      </div>
      <div className="flex-grow flex flex-col mb-6 overflow-hidden">
        {currentStepIndex < totalSteps ? (
          <div
            ref={stepContentRef}
            className={`mt-8 relative flex-grow flex flex-col border ${theme.border} rounded-xl ${isDarkMode ? "bg-gray-800/70 shadow-xl" : "bg-white shadow-lg"
              } transition-opacity duration-200 ease-out`}
          >
            <div
              ref={stepBadgeRef}
              className="flex-shrink-0 flex justify-center -mt-6 mb-3 opacity-0"
            >
              <span
                className={`flex items-center justify-center w-14 h-14 rounded-full text-white text-2xl font-bold shadow-lg`}
                style={{ background: isDarkMode ? "#d97706" : "#f59e0b" }}
              >
                {currentStepIndex + 1}
              </span>
            </div>

            {/* Instruction Text */}
            <div className="px-6 pt-2 pb-6 text-center flex-grow flex items-center justify-center min-h-[120px]">
              <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed font-semibold">
                {currentStep?.text ?? "Loading..."}
              </p>
            </div>

            {currentStep?.estimatedTime && currentStep.estimatedTime > 0 && (
              <div
                className={`mt-auto flex-shrink-0 p-4 border-t ${theme.border} ${isDarkMode ? "bg-gray-900/30" : "bg-gray-100/70"
                  } rounded-b-xl`}
              >
                <div
                  className={`w-full ${theme.progressBg} rounded-full h-1.5 mb-3 overflow-hidden`}
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-1000 linear ${stepProgressPercent >= 100
                      ? "bg-red-500"
                      : stepProgressPercent >= 80
                        ? "bg-yellow-500"
                        : "bg-cyan-500"
                      }`}
                    style={{
                      width: `${stepProgressPercent}%`,
                      backgroundColor:
                        stepProgressPercent < 80
                          ? isDarkMode
                            ? theme.accent.replace("text", "bg").replace("-400", "-500")
                            : theme.accent.replace("text", "bg").replace("-600", "-500")
                          : "",
                    }}
                  ></div>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-3">
                  {/* Estimated Time */}
                  <div className="text-center">
                    <div
                      className={`flex items-center justify-center text-xs ${theme.subText} mb-0.5`}
                    >
                      <Timer size={12} className="mr-1" /> Est. Time
                    </div>
                    <span className="font-semibold text-xl sm:text-2xl tabular-nums tracking-tight">
                      {formatTime(currentStep.estimatedTime)}
                    </span>
                  </div>

                  {/* Separator */}
                  <div className={`h-10 w-px ${theme.border} hidden sm:block`}></div>

                  {/* Your Time */}
                  <div className="text-center">
                    <span className={`block text-xs ${theme.subText} mb-0.5`}>Your Time</span>
                    <span
                      className={`font-semibold text-xl sm:text-2xl tabular-nums tracking-tight ${timerColorClass}`}
                    >
                      {formatTime(stepTimerValue)}
                    </span>
                  </div>

                  {/* Timer Controls */}
                  <button
                    onClick={handleStartPauseResume}
                    aria-label={stepStatus === "timing" ? "Pause timer" : "Start/Resume timer"}
                    className={`p-3 w-12 h-12 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-95 ${theme.focusRing
                      }
                    ${stepStatus === "timing"
                        ? `text-white ${isDarkMode
                          ? "bg-amber-600 hover:bg-amber-700 animate-pulse-button-amber-dark"
                          : "bg-amber-500 hover:bg-amber-600 animate-pulse-button-amber"
                        }`
                        : `${theme.iconHover} ${theme.iconBg} border ${theme.border}`
                      }`}
                  >
                    {stepStatus === "timing" ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Completion View
          <div className="flex-grow flex flex-col justify-center items-center text-center p-4 border ${theme.border} rounded-lg ${isDarkMode ? 'bg-green-900/40' : 'bg-green-50'}">
            <CheckCircle
              size={64}
              className={`${theme.success} animate-scale-in`}
              strokeWidth={1.5}
            />
            <h3 className="text-3xl font-bold mt-4 animate-scale-in animation-delay-100">
              Recipe Complete!
            </h3>
            <p className={`${theme.subText} mt-2 text-lg animate-scale-in animation-delay-200`}>
              Bon appétit!
            </p>
            <p className={`${theme.subText} mt-1 animate-scale-in animation-delay-300`}>
              You successfully cooked {recipe.title}.
            </p>
            <button
              onClick={onExit}
              className={`mt-6 inline-flex items-center px-5 py-2 rounded-lg font-medium ${theme.accent
                } ${isDarkMode
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
                } transition-colors ${theme.focusRing} animate-scale-in animation-delay-400`}
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
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${theme.hover} border ${theme.border} disabled:opacity-50 disabled:cursor-not-allowed ${theme.focusRing} transition transform active:scale-95`}
          >
            <SkipBack size={16} className="mr-1" /> Prev
          </button>
          <button
            onClick={handleCompleteStep}
            aria-label="Complete Step"
            className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium text-white ${isDarkMode ? "bg-green-600 hover:bg-green-700" : "bg-green-500 hover:bg-green-600"
              } transition-colors shadow-sm ${theme.focusRing} transform active:scale-95`}
          >
            Complete Step <Check size={18} className="ml-2" />
          </button>
        </div>
      )}
    </div>
  );
});

export default CookingModeView;
