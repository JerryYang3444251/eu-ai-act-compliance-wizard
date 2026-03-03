import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen7_GPAI() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, roles_raw } = useWizard();

  useEffect(() => {
    pushHistory("/screen7");
  }, [pushHistory]);

  const modelRelationships = Array.isArray(answers.modelRelationship)
    ? answers.modelRelationship
    : (answers.modelRelationship ? [answers.modelRelationship] : []);
  const isGPAI = answers.isGPAI || null;
  const isOpenSourceGPAI = answers.isOpenSourceGPAI || null;

  // Map ALL Part 2 activities to all applicable Part 7 roles (no priority — all can apply simultaneously)
  const predictAllModelRelationships = (activities) => {
    if (!activities || activities.length === 0) return [];
    const result = [];
    // develop_model → Model Provider (GPAI model obligations)
    if (activities.includes("develop_model")) {
      result.push("provider");
    }
    // System development / modification / commissioning / manufacturing → System Developer / Integrator
    if (activities.some(a => ["develop_system", "modify", "change_purpose", "product_manufacturer", "place_on_market"].includes(a))) {
      result.push("integrator");
    }
    // Operational roles: importing, distributing, deploying, rebranding, or acting as AR → System Operator
    if (activities.some(a => ["deploy", "import", "distribute", "brand", "act_as_ar"].includes(a))) {
      result.push("deployer");
    }
    return result;
  };

  // Check if user selected both model development AND system integration
  const hasDualRole = () => {
    if (!roles_raw || roles_raw.length === 0) return false;
    
    const hasModelDev = roles_raw.includes("develop_model");
    const hasSystemDev = roles_raw.includes("develop_system") || roles_raw.includes("modify");
    
    return hasModelDev && hasSystemDev;
  };

  // Auto-populate on first visit: pre-select ALL roles that match Part 2 activities
  // Uses applyRelationship so isGPAI is also auto-set when provider is predicted
  useEffect(() => {
    if (modelRelationships.length === 0 && roles_raw && roles_raw.length > 0) {
      const predicted = predictAllModelRelationships(roles_raw);
      if (predicted.length > 0) {
        applyRelationship(predicted);
      }
    }
  }, []);

  const showDualRoleWarning = hasDualRole();

  const [pendingRelationship, setPendingRelationship] = useState(null);

  const gpaiRoleNames = {
    provider: "Model Provider",
    integrator: "System Developer / Integrator",
    deployer: "System Operator"
  };

  const applyRelationship = (selections) => {
    saveAnswer("modelRelationship", selections);
    if (selections.includes("provider")) {
      // Provider = GPAI model provider by definition (Part 2 develop_model is GPAI-specific)
      saveAnswer("isGPAI", "yes");
    } else {
      saveAnswer("isGPAI", null);
      saveAnswer("isOpenSourceGPAI", null);
    }
  };

  const handleToggleRelationship = (value) => {
    const updated = modelRelationships.includes(value)
      ? modelRelationships.filter(v => v !== value)
      : [...modelRelationships, value];

    // Check deviation against Part 2 prediction
    if (roles_raw && roles_raw.length > 0) {
      const predicted = predictAllModelRelationships(roles_raw);
      if (predicted.length > 0) {
        const added   = updated.filter(r => !predicted.includes(r));
        const removed = predicted.filter(r => !updated.includes(r));
        if (added.length > 0 || removed.length > 0) {
          setPendingRelationship({
            updated,
            predicted,
            resulting: updated.map(r => gpaiRoleNames[r]).join(", ") || "None",
            expected:  predicted.map(r => gpaiRoleNames[r]).join(", "),
          });
          return;
        }
      }
    }

    applyRelationship(updated);
  };

  const confirmRelationship = () => {
    if (!pendingRelationship) return;
    applyRelationship(pendingRelationship.updated);
    setPendingRelationship(null);
  };

  const cancelRelationship = () => setPendingRelationship(null);

  const handleNext = () => {
    if (shouldReevaluateRules) setShouldReevaluateRules(false);

    // GPAI providers always proceed to systemic risk assessment
    if (modelRelationships.includes("provider")) {
      navigate("/screen8");
      return;
    }

    // Integrators / deployers proceed to prohibited practices check
    navigate("/screen9");
  };

  const canProceed = () => {
    if (modelRelationships.length === 0) return false;
    if (modelRelationships.includes("provider") && isOpenSourceGPAI === null) return false;
    return true;
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 7: General Purpose AI (GPAI) Assessment</h1>
        <p className="subtitle">Determine your obligations related to General Purpose AI models</p>
      </div>

      {pendingRelationship && (
        <div className="modal-overlay" onClick={cancelRelationship}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <strong>⚠️ Selection Conflict</strong>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "12px" }}>
                Your updated relationship selection (<strong>{pendingRelationship.resulting}</strong>) differs from what your Part 2 activities suggest.
              </p>
              <p style={{ marginBottom: "14px" }}>
                Based on your Part 2 activities, the expected roles are: <strong>{pendingRelationship.expected}</strong>. Confirm only if your GPAI relationship genuinely differs from your Part 2 answers.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cancelRelationship}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmRelationship}>Confirm — keep my selection</button>
            </div>
          </div>
        </div>
      )}

      <div className="screen-content">
        <div className="helper-box alert-info" style={{ marginBottom: "24px" }}>
          <strong>ℹ️ About This Assessment:</strong>
          <p style={{ marginTop: "8px" }}>
            This section determines if you have GPAI model provider requirements. 
            A General Purpose AI (GPAI) model displays significant generality and can perform 
            a wide range of distinct tasks (e.g., text generation, image creation, code generation), rather than being 
            limited to one specific purpose.
          </p>
          <span className="source-tag" title="Article 3(63), Chapter V">Source</span>
        </div>

        {/* Dual-role precedence guidance */}
        {showDualRoleWarning && modelRelationships.includes("provider") && (
          <div className="info-box alert-warning" style={{ marginBottom: "24px" }}>
            <strong>⚠️ Model Provider + System Developer / Integrator:</strong> You selected both model development and system development or integration activities in Part 2. Under the EU AI Act, when you develop AI models AND integrate them into systems, your model provider obligations take precedence and apply in addition to system provider obligations.
            <span className="source-tag" title="Article 25">Source</span>
          </div>
        )}

        {/* Step 1: What is your relationship to AI models? */}
        <div style={{ marginBottom: "32px" }}>
          <h3>Your Relationship to AI Models</h3>
          <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>Select all that apply to your organization:</p>
          <div className="options-group checkbox-group">
            <label className="checkbox-option">
              <input
                type="checkbox"
                value="provider"
                checked={modelRelationships.includes("provider")}
                onChange={() => handleToggleRelationship("provider")}
              />
              <span><strong>Model Provider:</strong> We develop, train, or place general-purpose AI models on the market</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                value="integrator"
                checked={modelRelationships.includes("integrator")}
                onChange={() => handleToggleRelationship("integrator")}
              />
              <span><strong>System Developer / Integrator:</strong> We develop AI systems or integrate existing AI models into our products and services</span>
            </label>
            <label className="checkbox-option">
              <input
                type="checkbox"
                value="deployer"
                checked={modelRelationships.includes("deployer")}
                onChange={() => handleToggleRelationship("deployer")}
              />
              <span><strong>System Operator (Importer / Distributor / Deployer):</strong> We import, distribute, or deploy complete AI systems without developing or integrating the underlying models</span>
            </label>

          </div>

        </div>
        {modelRelationships.includes("provider") && (
          <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "2px solid var(--border-color)" }}>
            <h3>Is Your Model Released Under a Free and Open-Source Licence?</h3>
            <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>
              The EU AI Act provides a partial exception for open-source GPAI providers. Answering this
              determines which documentation obligations apply to you.
            </p>
            <div className="helper-box" style={{ marginBottom: "16px", fontSize: "0.9rem" }}>
              <strong>Open-source qualifies when all of the following are true:</strong>
              <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
                <li>Model weights, architecture information, and usage information are <strong>publicly available</strong></li>
                <li>Licence allows users to freely access, use, modify and redistribute</li>
                <li>Model is <strong>not monetised</strong> (no payment or paid services linked to the model; no use of personal data beyond security/compatibility purposes)</li>
              </ul>
              <p style={{ marginTop: "8px" }}>
                <strong>Important:</strong> Even if open-source, you must still put in place a copyright
                compliance policy and publish a training data summary.
                If your model also presents systemic risk, the open-source exception does not apply.
                <span className="source-tag" title="Article 53(1)(c), Article 53(1)(d), Article 53(2), Recital 470">Source</span>
              </p>
            </div>
            <div className="options-group radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_open_source_gpai"
                  value="yes"
                  checked={isOpenSourceGPAI === "yes"}
                  onChange={() => saveAnswer("isOpenSourceGPAI", "yes")}
                />
                <div>
                  <strong>Yes — Free and open-source</strong>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-lighter)", marginTop: "4px" }}>
                    Weights, architecture and usage info are publicly available; model is not monetised
                  </div>
                </div>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_open_source_gpai"
                  value="no"
                  checked={isOpenSourceGPAI === "no"}
                  onChange={() => saveAnswer("isOpenSourceGPAI", "no")}
                />
                <div>
                  <strong>No — Proprietary or monetised</strong>
                  <div style={{ fontSize: "0.9rem", color: "var(--text-lighter)", marginTop: "4px" }}>
                    Model is not open-source, or is released open-source but with monetisation
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Unified result banner */}
        {(() => {
          if (modelRelationships.length === 0) return null;

          const isProvider   = modelRelationships.includes("provider");
          const isIntegrator = modelRelationships.includes("integrator");
          const isDeployer   = modelRelationships.includes("deployer");


          // Wait until provider has answered the open-source question
          if (isProvider && isOpenSourceGPAI === null) return null;

          let bannerClass, icon, title, body, sourceArticle;

          const nonProviderRoles = [
            isIntegrator && "System Developer / Integrator",
            isDeployer   && "System Operator",
          ].filter(Boolean);
          const nonProviderNote = nonProviderRoles.length > 0
            ? ` As ${nonProviderRoles.join(" and ")}, your system-level obligations are assessed separately based on the AI system risk classification in Parts 3–6.`
            : "";

          if (isProvider) {
            if (isOpenSourceGPAI === "yes") {
              bannerClass   = "alert-warning";
              icon          = "⚠️";
              title         = "GPAI Provider — Open-Source Partial Exception";
              body          = "Technical documentation and downstream-provider information obligations are reduced under Article 53(2). Copyright compliance policy and training data summary obligations still apply in full. If systemic risk is confirmed in the next step, the full obligation set applies." + nonProviderNote;
              sourceArticle = "Article 53(1)(c), Article 53(1)(d), Article 53(2), Recital 470";
            } else {
              // isOpenSourceGPAI === "no"
              bannerClass   = "alert-warning";
              icon          = "⚠️";
              title         = "GPAI Provider — Full Obligations Apply";
              body          = "As a proprietary general-purpose AI model provider, the full Chapter V obligation set applies, including technical documentation, transparency, and downstream information requirements. The next step assesses whether your model also presents systemic risk, which would add further obligations." + nonProviderNote;
              sourceArticle = "Article 53, Chapter V";
            }
          } else {
            // Only integrator / deployer — no provider
            bannerClass   = "alert-success";
            icon          = "✓";
            title         = "No GPAI Model Obligations";
            const roleList = nonProviderRoles.join(" and ");
            body          = `As ${roleList}, GPAI model provider requirements do not apply to you. Those obligations remain with the original model provider. Your obligations are determined by your role and the AI system risk classification assessed in Parts 3–6.`;
            sourceArticle = [
              isIntegrator && "Article 25(3), Article 25(4)",
              isDeployer   && "Articles 23, 24, 25, 26",
            ].filter(Boolean).join(", ");
          }

          return (
            <div className={`info-box ${bannerClass}`} style={{ marginTop: "24px" }}>
              <strong>{icon} {title}:</strong>{" "}
              {body}{" "}
              <span className="source-tag" title={sourceArticle}>Source</span>
            </div>
          );
        })()}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!canProceed()}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
