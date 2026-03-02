import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";

export default function Screen0_Information() {
  const navigate = useNavigate();
  const { pushHistory } = useWizard();

  // Track navigation to this screen
  useEffect(() => {
    pushHistory("/screen0");
  }, [pushHistory]);

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>EU AI Act Compliance Wizard</h1>
        <p className="subtitle">Part 0: System Information & User Guide</p>
      </div>

      <div className="screen-content">
        <div className="info-box">
          <p>
            This wizard is designed to guide you through a comprehensive assessment of your AI system or AI model's 
            compliance with the <strong>Artificial Intelligence Act (Regulation (EU) 2024/1689), Official Journal version of 13 June 2024 (EU AI Act).</strong> 
            The tool will help you determine the classification of your AI system or AI model and identify applicable 
            compliance obligations.
          </p>
        </div>

        <div className="info-box">
          <h3>What to Expect</h3>
          <p>
            The wizard consists of 14 parts that guide you through the EU AI Act assessment process:
          </p>
          <ul>
            <li><strong>Parts 1-2:</strong> Determine scope and your organizational roles</li>
            <li><strong>Parts 3-6:</strong> Assess risk categories (Annex I-A, I-B, Annex III)</li>
            <li><strong>Parts 7-8:</strong> Evaluate General Purpose AI (GPAI) and systemic risk</li>
            <li><strong>Parts 9-11:</strong> Check for prohibited practices, transparency requirements, and FRIA obligations</li>
            <li><strong>Part 12:</strong> Receive your system's final classification</li>
            <li><strong>Parts 13-14:</strong> Review conformity assessment routes and compliance checklist</li>
          </ul>
        </div>

        <div className="info-box">
          <h3>Key Definitions</h3>
          <p>Before starting, it's important to understand these core concepts from the EU AI Act:</p>
          <ul>
            <li>
              <strong>AI System:</strong> A machine-based system that is designed to operate with varying levels of autonomy 
              and that may exhibit adaptiveness after deployment, and that, for explicit or implicit objectives, infers, from the 
              input it receives, how to generate outputs such as predictions, content, recommendations, or decisions that can 
              influence physical or virtual environments. <span className="source-tag" title="Article 3(1)">Source</span>
            </li>
            <li>
              <strong>AI Model:</strong> An essential component of AI systems that does not constitute an AI system on its own. 
              AI models require the addition of further components, such as a user interface, to become AI systems. 
              AI models are typically integrated into and form part of AI systems. A general-purpose AI model displays significant 
              generality and is capable of competently performing a wide range of distinct tasks. <span className="source-tag" title="Recital (442), Article 3(63)">Source</span>
            </li>
          </ul>
        </div>

        <div className="info-box">
          <h3>Note — When Re-Assessment is Required</h3>
          <p style={{ marginBottom: "8px" }}>
            A new conformity assessment is triggered for a high-risk AI system in the following situations:
          </p>
          <ol>
            <li style={{ marginBottom: "8px" }}>
              <strong>Substantial modification</strong> <span className="source-tag" title="Article 43(4), Article 3(23)">Source</span> — any change after deployment that was not planned in the initial assessment and either affects compliance with Chapter III, Section 2 requirements or changes the system's intended purpose. Performance changes in continuing-to-learn systems are exempt if pre-determined and documented.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Notified body certificate expiry</strong> <span className="source-tag" title="Article 44(2), Article 44(3)">Source</span> — certificates are valid for four years (Annex III systems) or five years (Annex I systems). Renewal, or suspension due to non-compliance, requires a new assessment.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>QMS modification procedures</strong> <span className="source-tag" title="Article 17(1)(a)">Source</span> — where the provider's quality management system identifies a modification that qualifies as substantial, a new assessment is triggered.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Post-market monitoring or serious incident</strong> <span className="source-tag" title="Article 72(2), Article 73(6)">Source</span> — where corrective actions taken in response to monitoring findings or a serious incident constitute a substantial modification, a new assessment is required.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Market surveillance enforcement</strong> <span className="source-tag" title="Articles 79(2), 82(1), 83">Source</span> — authorities may order corrective action, withdrawal, or recall. Where remedial changes constitute a substantial modification, a new assessment is required.
            </li>
            <li style={{ marginBottom: "8px" }}>
              <strong>Revised harmonised standards</strong> <span className="source-tag" title="Article 40(1), Article 17(1)(e)">Source</span> — if applicable standards are updated or withdrawn, providers must re-verify compliance. Where re-verification requires changes that constitute a substantial modification, a new assessment is triggered.
            </li>
          </ol>
        </div>

        <div className="screen-navigation">
          <button className="btn btn-primary" onClick={() => navigate("/screen1")}>
            Start Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
