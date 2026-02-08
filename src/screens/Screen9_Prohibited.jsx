import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { PROHIBITED_PRACTICES, CLASSIFICATIONS } from "../data/checklist";

export default function Screen10_Prohibited() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen9");
  }, [pushHistory]);
  
  const selectedItems = answers.prohibitedPractices || [];
  const exceptions = answers.prohibitedExceptions || {};

  // Practices that have exceptions in Article 5
  const practicesWithExceptions = {
    criminal_risk: {
      question: "Does your system support human assessment based on objective and verifiable facts directly linked to criminal activity?",
      article: "Article 5(1)(d)"
    },
    emotion_workplace_education: {
      question: "Is your emotion recognition system intended for medical or safety reasons?",
      article: "Article 5(1)(f)"
    },
    biometric_categorisation: {
      question: "Is your system only used for labelling or filtering of lawfully acquired biometric datasets in the area of law enforcement?",
      article: "Article 5(1)(g)"
    },
    real_time_rbi: {
      question: "Does your system fall under one of these exceptions: (i) targeted search for victims/missing persons, (ii) prevention of imminent threat to life/safety or terrorist attack, or (iii) locating suspects of serious crimes (Annex II, 4+ years)?",
      article: "Article 5(1)(h)"
    }
  };

  // None-exclusive toggle
  const handleToggle = (id) => {
    if (id === "none") {
      if (selectedItems.includes("none")) {
        saveAnswer("prohibitedPractices", []);
        saveAnswer("prohibitedExceptions", {});
      } else {
        saveAnswer("prohibitedPractices", ["none"]);
        saveAnswer("prohibitedExceptions", {});
      }
    } else {
      let updated;
      if (selectedItems.includes("none")) {
        updated = [id];
      } else {
        updated = selectedItems.includes(id)
          ? selectedItems.filter(x => x !== id)
          : [...selectedItems, id];
      }
      saveAnswer("prohibitedPractices", updated);
      
      // Clear exception for this practice if deselected
      if (!updated.includes(id) && exceptions[id] !== undefined) {
        const newExceptions = { ...exceptions };
        delete newExceptions[id];
        saveAnswer("prohibitedExceptions", newExceptions);
      }
    }
  };

  const handleExceptionChange = (practiceId, value) => {
    saveAnswer("prohibitedExceptions", {
      ...exceptions,
      [practiceId]: value
    });
  };

  const hasProhibited = selectedItems.some(s => s !== "none");
  const selectedWithExceptions = selectedItems.filter(s => practicesWithExceptions[s]);
  
  // Check if all selected practices with exceptions have been answered
  const allExceptionsAnswered = selectedWithExceptions.every(id => exceptions[id] !== undefined);
  
  // Determine if system is truly prohibited (selected practices without valid exceptions)
  const isTrulyProhibited = hasProhibited && (
    selectedItems.some(s => s !== "none" && !practicesWithExceptions[s]) || // Has non-exceptionable practices
    selectedWithExceptions.some(id => exceptions[id] === false) // Has exceptionable practices where exception doesn't apply
  );

  const handleNext = () => {
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (!selectedItems.length) return;

    // Validate that all exception questions are answered
    if (selectedWithExceptions.length > 0 && !allExceptionsAnswered) {
      alert("Please answer all exception questions for the selected prohibited practices.");
      return;
    }

    if (isTrulyProhibited) {
      setClassificationWithPrecedence(CLASSIFICATIONS.PROHIBITED);
      navigate("/screen14");
    } else {
      // No prohibited practices or all have valid exceptions
      navigate("/screen10");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 9: Prohibited Practices</h1>
        <p className="subtitle">Does your AI system implement any of these prohibited practices? <span className="source-tag" title="Article 5">Source</span></p>
      </div>

      <div className="screen-content">
        <div className="options-group checkbox-group">
          {PROHIBITED_PRACTICES.map((option) => (
            <div key={option.id}>
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(option.id)}
                  onChange={() => handleToggle(option.id)}
                />
                <span>
                  {option.label}{option.source && (
                    <span className="source-tag" title={option.source}>
                      Source
                    </span>
                  )}
                </span>
              </label>

              {/* Show exception question if this practice is selected and has exceptions */}
              {selectedItems.includes(option.id) && practicesWithExceptions[option.id] && (
                <div style={{ 
                  marginLeft: "40px", 
                  marginTop: "12px", 
                  marginBottom: "12px",
                  padding: "14px",
                  background: "#fff8e1",
                  border: "1px solid #ffd54f",
                  borderRadius: "6px"
                }}>
                  <p style={{ 
                    margin: "0 0 10px 0", 
                    fontSize: "0.9rem", 
                    fontWeight: 600,
                    color: "#f57c00"
                  }}>
                    Exception Evaluation:
                  </p>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {practicesWithExceptions[option.id].question}
                  </p>
                  <div className="radio-group" style={{ gap: "8px" }}>
                    <label className="radio-option" style={{ padding: "10px 12px" }}>
                      <input
                        type="radio"
                        name={`exception_${option.id}`}
                        checked={exceptions[option.id] === true}
                        onChange={() => handleExceptionChange(option.id, true)}
                      />
                      <span>Yes - Exception applies (NOT prohibited)</span>
                    </label>
                    <label className="radio-option" style={{ padding: "10px 12px" }}>
                      <input
                        type="radio"
                        name={`exception_${option.id}`}
                        checked={exceptions[option.id] === false}
                        onChange={() => handleExceptionChange(option.id, false)}
                      />
                      <span>No - Exception does NOT apply (PROHIBITED)</span>
                    </label>
                  </div>
                  <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem" }}>
                    <span className="source-tag" title={practicesWithExceptions[option.id].article}>
                      Source
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Result banner */}
        {hasProhibited && allExceptionsAnswered && (
          <div className={`info-box ${isTrulyProhibited ? 'alert-danger' : 'alert-success'}`} style={{ marginTop: "24px" }}>
            {isTrulyProhibited ? (
              <>
                <strong>System is Prohibited:</strong>
                Your AI system engages in prohibited practices under Article 5. The system cannot be placed on the market, put into service, or used. These practices must be removed immediately. <span className="source-tag" title="Article 5 — Prohibited Artificial Intelligence Practices">Source</span>
              </>
            ) : (
              <>
                <strong>No Prohibited Practices:</strong>
                {selectedWithExceptions.length > 0 
                  ? "All selected practices qualify for exceptions under Article 5. Your system is not prohibited."
                  : "Your system does not engage in prohibited practices."} <span className="source-tag" title="Article 5">Source</span>
              </>
            )}
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleNext} 
            disabled={!selectedItems.length || (selectedWithExceptions.length > 0 && !allExceptionsAnswered)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
