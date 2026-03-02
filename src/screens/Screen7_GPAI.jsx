import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen7_GPAI() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, getPreviousScreen, navigateBack, shouldReevaluateRules, setShouldReevaluateRules, pushHistory, roles_raw } = useWizard();

  useEffect(() => {
    pushHistory("/screen7");
  }, [pushHistory]);

  const modelRelationship = answers.modelRelationship || null;
  const isGPAI = answers.isGPAI || null;
  const isOpenSourceGPAI = answers.isOpenSourceGPAI || null;

  // Smart pre-selection based on Part 2 activities
  const predictModelRelationship = (activities) => {
    if (!activities || activities.length === 0) return null;
    
    // Priority 1: Model development → provider
    if (activities.includes("develop_model") || activities.includes("fine_tune")) {
      return "provider";
    }
    
    // Priority 2: System development/integration/manufacturing → integrator
    if (activities.includes("develop_system") || activities.includes("modify") || activities.includes("change_purpose") || activities.includes("product_manufacturer")) {
      return "integrator";
    }
    
    // Priority 3: Operational roles → deployer
    if (activities.includes("deploy") || activities.includes("import") || activities.includes("distribute")) {
      return "deployer";
    }
    
    return null;
  };

  // Detect inconsistency between predicted and selected role
  const detectInconsistency = () => {
    if (!modelRelationship || !roles_raw || roles_raw.length === 0) return null;
    
    const predicted = predictModelRelationship(roles_raw);
    if (!predicted || predicted === modelRelationship) return null;
    
    // Map roles to friendly names
    const roleNames = {
      provider: "Model Provider",
      integrator: "System Integrator",
      deployer: "System Operator"
    };
    
    return {
      predicted: roleNames[predicted],
      selected: roleNames[modelRelationship]
    };
  };

  // Check if user selected both model development AND system integration
  const hasDualRole = () => {
    if (!roles_raw || roles_raw.length === 0) return false;
    
    const hasModelDev = roles_raw.includes("develop_model") || roles_raw.includes("fine_tune");
    const hasSystemDev = roles_raw.includes("develop_system") || roles_raw.includes("modify");
    
    return hasModelDev && hasSystemDev;
  };

  // Auto-populate on first visit if not already set
  useEffect(() => {
    if (modelRelationship === null && roles_raw && roles_raw.length > 0) {
      const predicted = predictModelRelationship(roles_raw);
      if (predicted) {
        saveAnswer("modelRelationship", predicted);
      }
    }
  }, [modelRelationship, roles_raw, saveAnswer]);

  const inconsistency = detectInconsistency();
  const showDualRoleWarning = hasDualRole();

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    // If deployer/integrator, skip GPAI systemic risk assessment and go to Screen 9
    if (modelRelationship === "deployer" || modelRelationship === "integrator") {
      navigate("/screen9");
      return;
    }

    // If model provider and confirmed as GPAI model
    if (modelRelationship === "provider" && isGPAI === "yes") {
      navigate("/screen8");
      return;
    }

    // If model provider but not GPAI, skip to Screen 9
    if (modelRelationship === "provider" && isGPAI === "no") {
      navigate("/screen9");
      return;
    }
  };

  const canProceed = () => {
    if (modelRelationship === null) return false;
    if (modelRelationship === "deployer" || modelRelationship === "integrator") return true;
    if (modelRelationship === "provider" && isGPAI === null) return false;
    if (modelRelationship === "provider" && isGPAI === "yes" && isOpenSourceGPAI === null) return false;
    return true;
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 7: General Purpose AI (GPAI) Assessment</h1>
        <p className="subtitle">Determine your obligations related to General Purpose AI models</p>
      </div>

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

        {/* Pre-selection info banner */}
        {roles_raw && roles_raw.length > 0 && predictModelRelationship(roles_raw) && (
          <div className="info-box alert-info" style={{ marginBottom: "24px" }}>
            <strong>ℹ️ Auto-Selection:</strong> Based on your Part 2 activities, we've pre-selected your role below. You can change this selection if it doesn't match your situation.
          </div>
        )}

        {/* Inconsistency warning */}
        {inconsistency && (
          <div className="info-box alert-warning" style={{ marginBottom: "24px" }}>
            <strong>⚠️ Potential Inconsistency:</strong> Your current selection (<strong>{inconsistency.selected}</strong>) differs from your Part 2 activities, which suggest <strong>{inconsistency.predicted}</strong>. Please verify this is correct for your situation.
          </div>
        )}

        {/* Dual-role precedence guidance */}
        {showDualRoleWarning && modelRelationship === "provider" && (
          <div className="info-box alert-warning" style={{ marginBottom: "24px", backgroundColor: "#fff3cd", borderColor: "#ffc107" }}>
            <strong>⚠️ Model Provider + System Integrator:</strong> You selected both model development and system integration activities in Part 2. Under the EU AI Act, when you develop AI models AND integrate them into systems, your model provider obligations take precedence and apply in addition to system provider obligations.
            <span className="source-tag" title="Article 25">Source</span>
          </div>
        )}

        {/* Step 1: What is your relationship to AI models? */}
        <div style={{ marginBottom: "32px" }}>
          <h3>Your Relationship to AI Models</h3>
          <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>Select the option that best describes your organization's work:</p>
          <div className="options-group radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="model_relationship"
                value="provider"
                checked={modelRelationship === "provider"}
                onChange={() => {
                  saveAnswer("modelRelationship", "provider");
                  saveAnswer("isGPAI", null);
                  saveAnswer("isOpenSourceGPAI", null);
                }}
              />
              <div>
                <strong>Model Provider:</strong> We develop, train, or place AI models on the market
                <div style={{ fontSize: "0.9rem", color: "var(--text-lighter)", marginTop: "4px" }}>
                  Examples: Training foundation models, developing language models, creating AI model tools for others to use
                </div>
              </div>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="model_relationship"
                value="integrator"
                checked={modelRelationship === "integrator"}
                onChange={() => {
                  saveAnswer("modelRelationship", "integrator");
                  saveAnswer("isGPAI", null);
                  saveAnswer("isOpenSourceGPAI", null);
                }}
              />
              <div>
                <strong>System Integrator:</strong> We integrate existing AI models into our AI systems
                <div style={{ fontSize: "0.9rem", color: "var(--text-lighter)", marginTop: "4px" }}>
                  Examples: Building applications using GPT-4 API, creating diagnosis tools powered by AI models
                </div>
              </div>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="model_relationship"
                value="deployer"
                checked={modelRelationship === "deployer"}
                onChange={() => {
                  saveAnswer("modelRelationship", "deployer");
                  saveAnswer("isGPAI", null);
                  saveAnswer("isOpenSourceGPAI", null);
                }}
              />
              <div>
                <strong>System Operator (Importer/Distributor/Deployer):</strong> We import, distribute, or deploy complete AI systems without developing or integrating the models ourselves
                <div style={{ fontSize: "0.9rem", color: "var(--text-lighter)", marginTop: "4px" }}>
                  Select this if you work with complete AI systems but not the underlying AI models. Your obligations depend on your specific role (importer/distributor/deployer), not on whether the systems contain GPAI models. Examples: Importing AI-powered products, distributing AI systems, deploying ChatGPT Enterprise.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Step 2: Determine if model is GPAI (only for model providers) */}
        {modelRelationship === "provider" && (
          <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "2px solid var(--border-color)" }}>
            <h3>Is Your Model a General Purpose AI Model?</h3>
            <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>
              Assess whether your AI model qualifies as a General Purpose AI (GPAI) model:
            </p>
            <div className="helper-box" style={{ marginBottom: "16px", fontSize: "0.9rem" }}>
              <strong>GPAI model characteristics:</strong>
              <ul style={{ marginTop: "8px", marginLeft: "20px" }}>
                <li>Displays <strong>significant generality</strong> — not limited to one specific task or domain</li>
                <li>Can <strong>competently perform a wide range of distinct tasks</strong> (text, images, code, reasoning, etc.)</li>
                <li>Typically trained on large amounts of data using self-supervised or unsupervised learning</li>
                <li>Can be integrated into various downstream systems or applications</li>
                <li>Examples: Large language models (GPT, Claude), multimodal models, foundation models</li>
              </ul>
              <p style={{ marginTop: "8px" }}>
                <strong>Not GPAI:</strong> Task-specific models (e.g., fraud detection model, medical image classifier, recommendation engine for one website)
              </p>
              <span className="source-tag" title="Article 3(63)">Source</span>
            </div>
            <div className="options-group radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_gpai"
                  value="yes"
                  checked={isGPAI === "yes"}
                  onChange={() => saveAnswer("isGPAI", "yes")}
                />
                <span>Yes, my model is a general-purpose AI model</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="is_gpai"
                  value="no"
                  checked={isGPAI === "no"}
                  onChange={() => { saveAnswer("isGPAI", "no"); saveAnswer("isOpenSourceGPAI", null); }}
                />
                <span>No, my model is specialized/task-specific</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Open-source licence status (only for GPAI providers) */}
        {modelRelationship === "provider" && isGPAI === "yes" && (
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

        {/* Result messages based on choices */}
        {modelRelationship === "integrator" && (
          <div className="info-box alert-info" style={{ marginTop: "24px" }}>
            <strong>ℹ️ System Provider — No GPAI Model Obligations:</strong> As a system provider who integrates existing AI models into your systems, GPAI model provider requirements do not apply to you. Those obligations remain with the original model provider.
            <span className="source-tag" title="Article 25(3), Article 25(4)">Source</span>
          </div>
        )}

        {modelRelationship === "deployer" && (
          <div className="info-box alert-success" style={{ marginTop: "24px" }}>
            <strong>✓ No GPAI Model Obligations:</strong> As an importer, distributor, or deployer of complete AI systems, GPAI model provider requirements do not apply to you. Your obligations are based on your specific role determined in Part 2.
            <span className="source-tag" title="Articles 23, 24, 25, 26">Source</span>
          </div>
        )}

        {modelRelationship === "provider" && isGPAI === "yes" && isOpenSourceGPAI === "yes" && (
          <div className="info-box alert-warning" style={{ marginTop: "24px" }}>
            <strong>⚠️ GPAI Provider — Open-Source Exception Applies:</strong> Technical
            documentation and downstream-provider information obligations do not apply to
            you. Your copyright compliance policy and training data summary obligations still apply.
            If your model is found to have systemic risk in the next step, the full set of obligations applies.
            <span className="source-tag" title="Article 53(2), Recital 470">Source</span>
          </div>
        )}
        {modelRelationship === "provider" && isGPAI === "yes" && isOpenSourceGPAI === "no" && (
          <div className="info-box alert-warning" style={{ marginTop: "24px" }}>
            <strong>⚠️ GPAI Provider Classification:</strong> As a proprietary general-purpose AI model
            provider, the full set of GPAI obligations applies. Next, we will assess whether your
            model presents systemic risks, which would add further obligations.
            <span className="source-tag" title="Article 53, Chapter V">Source</span>
          </div>
        )}

        {modelRelationship === "provider" && isGPAI === "no" && (
          <div className="info-box alert-success" style={{ marginTop: "24px" }}>
            <strong>✓ Task-Specific AI Model:</strong> Your model does not qualify as general-purpose AI. GPAI-specific requirements do not apply to you.
            <span className="source-tag" title="Article 3(1), Chapter V">Source</span>
          </div>
        )}

        <div className="screen-navigation" style={{ marginTop: "40px" }}>
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
