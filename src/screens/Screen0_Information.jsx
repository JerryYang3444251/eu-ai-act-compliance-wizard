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
            This wizard is designed to guide you through a comprehensive assessment of your AI system's 
            compliance with the <strong>Artificial Intelligence Act (Regulation (EU) 2024/1689), Official Journal version of 13 June 2024 (EU AI Act).</strong> 
            The tool will help you determine the classification of your AI system and identify applicable 
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
          <h3>Note</h3>
          <p>
          <ul>
            <li> This tool concerns Articles over Recitals. Please refer to the Act for Recital guidances"</li>
          </ul>
          </p>
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
