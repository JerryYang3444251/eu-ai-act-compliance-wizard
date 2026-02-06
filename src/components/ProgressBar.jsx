import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";

const STEPS = [
  { path: "/screen0", label: "Part 0", title: "Information" },
  { path: "/screen1", label: "Part 1", title: "Exclusions" },
  { path: "/screen2", label: "Part 2", title: "Roles" },
  { path: "/screen3", label: "Part 3", title: "Annex IA" },
  { path: "/screen4", label: "Part 4", title: "Annex IB" },
  { path: "/screen5", label: "Part 5", title: "Annex III" },
  { path: "/screen6", label: "Part 6", title: "Impact" },
  { path: "/screen7", label: "Part 7", title: "GPAI" },
  { path: "/screen8", label: "Part 8", title: "GPAI Systemic" },
  { path: "/screen9", label: "Part 9", title: "Prohibited" },
  { path: "/screen10", label: "Part 10", title: "Transparency" },
  { path: "/screen11", label: "Part 11", title: "FRIA" },
  { path: "/screen12", label: "Part 12", title: "Classification" },
  { path: "/screen13", label: "Part 13", title: "CA Route" },
  { path: "/screen14", label: "Part 14", title: "Checklist" },
];

export default function ProgressBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearAnswersAfter, navigationHistory, obligations } = useWizard();

  // Treat /screenFinal as /screen14 for progress calculation
  const currentPath = location.pathname === "/screenFinal" ? "/screen14" : location.pathname;
  const currentIndex = STEPS.findIndex(s => s.path === currentPath);
  const total = STEPS.length;
  // Completion: (number of completed pages / (total pages - 1)) * 100
  // Screen 0 (Information) doesn't count toward completion
  const completedPages = Math.max(0, currentIndex); // Pages after Part 0
  const totalCompletablePages = Math.max(1, total - 1); // Total pages excluding Part 0
  let percent = completedPages > 0 ? Math.round((completedPages / totalCompletablePages) * 100) : 0;
  
  // If on final screen and no applicable obligations, set to 100%
  const isFinalScreen = currentPath === "/screen14";
  if (isFinalScreen && (!obligations || obligations.length === 0)) {
    percent = 100;
  }

  // Determine which steps have been visited (not skipped)
  const isStepVisited = (stepPath) => navigationHistory.includes(stepPath);

  const handleClick = (step) => {
    if (step.path === location.pathname) return;
    const ok = window.confirm("Navigating to this step will erase progress after it. Continue?");
    if (!ok) return;
    clearAnswersAfter(step.path);
    navigate(step.path);
  };

  return (
    <div className="sidebar-wrapper">
      <div className="sidebar-header">
        <div className="progress-percentage">{percent}%</div>
        <div className="progress-label">Complete</div>
      </div>

      <nav className="sidebar-nav">
        <ul className="steps-list">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isDone = idx < currentIndex;
            const isVisited = isStepVisited(step.path);
            const isSkipped = isDone && !isVisited;

            return (
              <li key={step.path} className={`step-node ${isDone ? 'done' : ''} ${isActive ? 'active' : ''} ${isSkipped ? 'skipped' : ''}`}>
                <button
                  className="step-button"
                  onClick={() => handleClick(step)}
                  disabled={isActive}
                  title={`${step.label}: ${step.title}`}
                >
                  <div className="step-marker">
                    {isDone ? (
                      <span className="step-icon">{isSkipped ? '−' : '✓'}</span>
                    ) : (
                      <span className="step-number">{idx + 1}</span>
                    )}
                  </div>
                  <div className="step-info">
                    <div className="step-label">{step.label}</div>
                    <div className="step-title">{step.title}</div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="progress-track">
          <div className="progress-fill" style={{ height: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
