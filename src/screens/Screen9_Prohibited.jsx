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

  // Detailed definitions for what is / is not covered by each prohibited practice
  const practiceDefinitions = {
    subliminal: {
      text: "Covers AI systems that use subliminal components or other manipulative or deceptive techniques beyond a person's consciousness in order to materially distort behaviour, where this causes or is reasonably likely to cause significant physical, psychological or financial harm. It does not cover lawful medical or psychological treatment carried out in accordance with applicable law and medical standards.",
      article: "Article 5(1)(a), Recital 29"
    },
    vulnerability: {
      text: "Covers AI systems that exploit the vulnerabilities of a specific person or group (for example because of age, disability, or a specific social or economic situation) in order to materially distort their behaviour, where this causes or is reasonably likely to cause significant harm. Lawful medical or psychological treatment in accordance with applicable law is not covered.",
      article: "Article 5(1)(b), Recital 29"
    },
    social_scoring: {
      text: "Covers AI systems that provide social scoring of natural persons over time, based on multiple data points about their behaviour or characteristics, and that lead to detrimental or unfavourable treatment in contexts unrelated to where the data was generated, or that is disproportionate or unjustified in light of the behaviour.",
      article: "Article 5(1)(c), Recital 31"
    },
    criminal_risk: {
      text: "Covers AI systems that assess the risk of a natural person offending or committing a criminal offence based solely on profiling them or on assessing their personality traits or characteristics, without being based on objective, verifiable facts that provide reasonable suspicion of involvement in criminal activity. Risk analytics that are not based solely on such profiling or traits may fall outside this prohibition.",
      article: "Article 5(1)(d), Recital 42"
    },
    face_scraping: {
      text: "Covers AI systems that create or expand facial recognition databases by the untargeted scraping of facial images from the internet or from CCTV or similar footage, contributing to a feeling of mass surveillance and posing serious risks to fundamental rights.",
      article: "Article 5(1)(e), 5(2), Recital 43"
    },
    emotion_workplace_education: {
      text: "Covers AI systems intended to infer the emotions or intentions of natural persons in the workplace or in educational institutions. It does not include systems that only detect physical states (such as fatigue or pain) for safety purposes, or systems that merely detect readily apparent expressions, gestures or movements without inferring emotions.",
      article: "Article 5(1)(f), Recital 18"
    },
    biometric_categorisation: {
      text: "Covers AI systems that use biometric data (such as facial images, fingerprints or other biometric signals) to assign persons to categories in order to infer sensitive attributes such as race, political opinions, trade union membership, religious or philosophical beliefs, sex life or sexual orientation. It does not cover lawful labelling, filtering or categorisation of biometric datasets in accordance with Union or national law, nor purely ancillary commercial filters intrinsically linked to another service that cannot, for objective technical reasons, be used without the principal service and are not used to circumvent this Regulation (for example, try-on filters on marketplaces or social networks).",
      article: "Article 5(1)(g), Recital 16, Recital 30"
    },
    real_time_rbi: {
      text: "Covers AI systems for real-time remote biometric identification of natural persons in publicly accessible spaces for law enforcement purposes. Such use is generally prohibited, except where a Member State has expressly allowed it in national law and all strict conditions are met (limited, serious purposes; prior authorisation; strict limits in time, place and persons; registration; and a prior fundamental rights impact assessment).",
      article: "Article 5(1)(h), Recitals 32-38"
    }
  };

  // Practices that have exceptions in Article 5 (second-layer questions)
  const practicesWithExceptions = {
    criminal_risk: {
      question: "Does your system supplement (not replace) human assessment and is it based on objective and verifiable facts providing reasonable suspicion linked to criminal activity (not solely on profiling or personality traits)?",
      article: "Article 5(1)(d), Recital 42"
    },
    emotion_workplace_education: {
      question: "Is your system used strictly for medical or safety purposes (for example, detecting physical states such as fatigue or pain to prevent accidents, or therapeutic contexts) and NOT to infer emotions for managing workers or students?",
      article: "Article 5(1)(f), Recital 18"
    },
    biometric_categorisation: {
      question: "Is your system either (a) used exclusively for lawful labelling or filtering of lawfully acquired biometric datasets (for example, in law enforcement under Union or national law), or (b) a purely ancillary feature intrinsically linked to another commercial service that cannot, for objective technical reasons, be used without the principal service and is not used to circumvent this Regulation (for example, try-on or face/body filters on marketplaces or social networks)?",
      article: "Article 5(1)(g), Recital 16, Recital 30"
    },
    real_time_rbi: {
      question: "Does your system meet ALL of these requirements: (1) The Member State where it is used has expressly allowed such use in its national law and this use complies with those national rules; (2) One of these purposes: targeted search for victims/missing persons, prevention of imminent threat to life/physical safety or terrorist attack, or locating/identifying perpetrators or suspects of listed serious crimes; (3) Prior authorization by a judicial authority or an independent administrative authority; (4) Geographically, temporally, and personally limited; (5) Registered in the EU database; (6) A fundamental rights impact assessment has been completed?",
      article: "Article 5(1)(h), Recitals 32-38"
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

              {/* Second layer: detailed definition and, where applicable, exception question */}
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
                  {practiceDefinitions[option.id] && (
                    <p style={{ margin: "0 0 10px 0", fontSize: "0.9rem", lineHeight: "1.5" }}>
                      {practiceDefinitions[option.id].text}
                    </p>
                  )}
                  <p style={{ 
                    margin: "0 0 10px 0", 
                    fontSize: "0.9rem", 
                    fontWeight: 600,
                    color: "#f57c00"
                  }}>
                    ⚠️ Exception Evaluation Required:
                  </p>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.875rem", lineHeight: "1.5", fontWeight: 500 }}>
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

              {selectedItems.includes(option.id) && !practicesWithExceptions[option.id] && practiceDefinitions[option.id] && (
                <div style={{ 
                  marginLeft: "40px", 
                  marginTop: "12px", 
                  marginBottom: "12px",
                  padding: "14px",
                  background: "#f5f5f5",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px"
                }}>
                  <p style={{ margin: "0 0 10px 0", fontSize: "0.875rem", lineHeight: "1.5" }}>
                    {practiceDefinitions[option.id].text}
                  </p>
                  <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem" }}>
                    <span className="source-tag" title={practiceDefinitions[option.id].article}>
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
                <strong>⛔ System is Prohibited:</strong>
                Your AI system engages in prohibited practices under Article 5. The system cannot be placed on the market, put into service, or used in the Union. Prohibited practices must be eliminated immediately, and you must cease development and distribution. <span className="source-tag" title="Article 5 — Prohibited Artificial Intelligence Practices">Source</span>
              </>
            ) : (
              <>
                <strong>✓ No Prohibited Practices:</strong>
                {selectedWithExceptions.length > 0 
                  ? "All selected practices qualify for valid exceptions under Article 5. Your system is not prohibited, but you must maintain documentation demonstrating compliance with exception requirements."
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
