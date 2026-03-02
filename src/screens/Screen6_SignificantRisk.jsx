import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen6_SignificantRisk() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen6");
  }, [pushHistory]);

  const derogationChecks = answers.impact_checks || [];
  const profiling = answers.profiling || null;

  // -------------------------------------------------------------------
  // Article 6(3) EU AI Act: Four derogation conditions
  // An Annex III system is NOT high-risk if ANY of these applies,
  // UNLESS the system performs profiling of natural persons (absolute override).
  // -------------------------------------------------------------------
  const DEROGATION_OPTIONS = [
    {
      id: "narrow_procedural",
      label: "Narrow procedural task",
      description: "The system is intended to perform a narrow procedural task (e.g., scheduling, routing, formatting) with no influence on substantive decisions.",
      article: "Article 6(3)(a)"
    },
    {
      id: "improve_prior_human",
      label: "Improves result of a previously completed human activity",
      description: "The system is intended to improve the result of a previously completed human activity (e.g., spell-checking a completed human-written report, quality-checking a human-made decision).",
      article: "Article 6(3)(b)"
    },
    {
      id: "detect_patterns_no_replace",
      label: "Detects decision-making patterns without replacing human assessment",
      description: "The system is intended to detect decision-making patterns or deviations from prior decision-making patterns, and is not meant to replace or influence the previously completed human assessment, without proper human review.",
      article: "Article 6(3)(c)"
    },
    {
      id: "preparatory_task",
      label: "Preparatory task to an Annex III assessment",
      description: "The system is intended to perform a preparatory task to an assessment relevant for an Annex III use case (e.g., pre-sorting documents, collecting data that a human will then assess).",
      article: "Article 6(3)(d)"
    },
  ];

  const hasDerogation = derogationChecks.length > 0;
  const isProfilingYes = profiling === "yes";
  const isProfilingNo = profiling === "no";

  // Classification result:
  // - Profiling = yes → always HIGH-RISK (Art. 6(3) absolute override)
  // - Any derogation + no profiling → ANNEX_III_NON_SIGNIFICANT
  // - No derogation → HIGH-RISK (default under Art. 6(2))
  const canProceed = hasDerogation ? (profiling !== null) : true;

  const getClassification = () => {
    if (isProfilingYes) return CLASSIFICATIONS.HIGH_RISK_III;
    if (hasDerogation && isProfilingNo) return CLASSIFICATIONS.ANNEX_III_NON_SIGNIFICANT;
    return CLASSIFICATIONS.HIGH_RISK_III;
  };

  const handleToggleDerogation = (id) => {
    const updated = derogationChecks.includes(id)
      ? derogationChecks.filter((v) => v !== id)
      : [...derogationChecks, id];
    saveAnswer("impact_checks", updated);
    // Reset profiling if all derogations removed
    if (updated.length === 0) saveAnswer("profiling", null);
  };

  const handleNext = () => {
    if (shouldReevaluateRules) setShouldReevaluateRules(false);
    setClassificationWithPrecedence(getClassification());
    navigate("/screen7");
  };

  // Live classification preview
  const previewClassification = !hasDerogation
    ? "high_risk"
    : isProfilingYes
    ? "high_risk"
    : isProfilingNo
    ? "non_significant"
    : null;

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 6: Significant Risk Assessment</h1>
        <p className="subtitle">
          Determines whether your Annex III system qualifies for the Article&nbsp;6(3) derogation from high-risk status.
        </p>
      </div>

      <div className="screen-content">
        <div className="helper-box alert-info" style={{ marginBottom: "24px" }}>
          <strong>ℹ️ Default: High-Risk</strong>
          <p style={{ marginTop: "8px" }}>
            All Annex III systems are classified as <strong>high-risk by default</strong> under Article&nbsp;6(2).
            Article&nbsp;6(3) provides a narrow derogation: a system escapes the high-risk designation
            only if at least one of the four conditions below is met <em>and</em> the system does not
            perform profiling of natural persons.
          </p>
          <span className="source-tag" title="Article 6(2), Article 6(3)">Source</span>
        </div>

        <h3>Step 1: Article&nbsp;6(3) Derogation Conditions</h3>
        <p style={{ color: "var(--text-light)", marginBottom: "16px" }}>
          Select <strong>all conditions that apply</strong> to your system. If none apply, leave all unchecked.
        </p>

        <div className="options-group checkbox-group">
          {DEROGATION_OPTIONS.map((opt) => (
            <label key={opt.id} className="checkbox-option" style={{ alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={derogationChecks.includes(opt.id)}
                onChange={() => handleToggleDerogation(opt.id)}
                style={{ marginTop: "3px" }}
              />
              <div>
                <strong>{opt.label}</strong>
                <span className="source-tag" style={{ marginLeft: "6px" }} title={opt.article}>Source</span>
                <div style={{ fontSize: "0.875rem", color: "var(--text-lighter)", marginTop: "4px" }}>
                  {opt.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {hasDerogation && (
          <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "2px solid var(--border-color)" }}>
            <h3>Step 2: Profiling of Natural Persons</h3>
            <div className="helper-box" style={{ marginBottom: "16px", fontSize: "0.9rem" }}>
              <p>
                Even where a derogation condition applies, the system is <strong>always high-risk</strong> if
                it performs <strong>profiling of natural persons</strong> within the meaning of Article 4(4)
                of Regulation (EU) 2016/679 (automated processing to evaluate, analyse or predict aspects
                of a person — work performance, economic situation, health, preferences, behaviour, location, etc.).
              </p>
              <span className="source-tag" title="Article 6(3), third subparagraph">Source</span>
            </div>
            <p style={{ color: "var(--text-light)", marginBottom: "12px" }}>
              Does your Annex III system perform <strong>profiling of natural persons</strong>?
            </p>
            <div className="options-group radio-group">
              <label className="radio-option">
                <input type="radio" name="profiling" value="yes"
                  checked={profiling === "yes"} onChange={() => saveAnswer("profiling", "yes")} />
                <div>
                  <strong>Yes</strong> — the system profiles natural persons
                  <div style={{ fontSize: "0.875rem", color: "var(--text-lighter)", marginTop: "2px" }}>
                    System will be classified as High-Risk regardless of derogation conditions.
                  </div>
                </div>
              </label>
              <label className="radio-option">
                <input type="radio" name="profiling" value="no"
                  checked={profiling === "no"} onChange={() => saveAnswer("profiling", "no")} />
                <div>
                  <strong>No</strong> — the system does not profile natural persons
                  <div style={{ fontSize: "0.875rem", color: "var(--text-lighter)", marginTop: "2px" }}>
                    Derogation condition(s) will apply; system qualifies as Not High-Risk.
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {previewClassification === "high_risk" && (
          <div className="info-box alert-warning" style={{ marginTop: "24px" }}>
            <strong>⚠️ High-Risk (Annex III):</strong>{" "}
            {isProfilingYes
              ? "Your system performs profiling. Full high-risk obligations apply regardless of derogation conditions."
              : "No derogation condition applies. Your system is High-Risk by default."}
            {" "}<span className="source-tag" title={isProfilingYes ? "Article 6(3), third subparagraph" : "Article 6(2)"}>Source</span>
          </div>
        )}

        {previewClassification === "non_significant" && (
          <div className="info-box alert-success" style={{ marginTop: "24px" }}>
            <strong>✓ Not High-Risk (Annex III):</strong>{" "}
            At least one derogation condition applies and the system does not perform profiling.
            Reduced obligations apply.
            {" "}<span className="source-tag" title="Article 6(3), Article 6(4), Article 49(2)">Source</span>
          </div>
        )}

        <div className="screen-navigation" style={{ marginTop: "32px" }}>
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>Back</button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!canProceed}>Next</button>
        </div>
      </div>
    </div>
  );
}


