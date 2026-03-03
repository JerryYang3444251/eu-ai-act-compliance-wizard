import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { EXCLUSIONS, CLASSIFICATIONS } from "../data/checklist";

export default function Screen1_Exclusions() {
  const navigate = useNavigate();
  const { answers, saveAnswer, setClassificationWithPrecedence, navigateBack, markStepsAsCompleted, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  useEffect(() => {
    pushHistory("/screen1");
  }, [pushHistory]);
  const selectedItems = answers.exclusions || [];

  const MATERIAL_SCOPE_EXCLUSIONS = ["military", "R&D_only", "opensource_free", "personal_use", "foreign_LE_only"];
  const hasMaterialExclusion = selectedItems.some(id => MATERIAL_SCOPE_EXCLUSIONS.includes(id));

  // Detailed definitions for what is / is not covered by each exclusion
  const exclusionDefinitions = {
    "military": {
      text: "Covers AI systems developed, placed on the market, put into service, or used for military, defence or national security purposes, regardless of the type of entity carrying out those activities. This exclusion is justified by Article 4(2) TEU (national security remains the sole responsibility of Member States) and the specificities of defence policy under Chapter 2 of Title V TEU. However, if an AI system developed for military/defence/national security purposes is later used temporarily or permanently for other purposes (such as civilian, humanitarian, law enforcement or public security purposes), it would fall within the scope of this Regulation for those other uses.",
      article: "Article 2(3), Recital 24"
    },
    "R&D_only": {
      text: "Covers AI systems and models specifically developed and put into service for the sole purpose of scientific research and development, as well as any research, testing or development activity regarding AI systems prior to being placed on the market or put into service. This exclusion supports innovation and respects freedom of science. However, once an AI system resulting from research and development is placed on the market or put into service, this Regulation applies. Testing in real world conditions is not covered by this exclusion. Any research and development must be carried out in accordance with recognised ethical and professional standards and applicable Union law.",
      article: "Article 2(6), 2(8), Recital 25"
    },
    "opensource_free": {
      text: "Covers AI systems released under free and open-source licences, unless they are placed on the market or put into service as high-risk AI systems or as an AI system that falls under Article 5 (prohibited practices) or Article 50 (transparency obligations). This means free and open-source AI components provided without monetisation or receiving counter-performance are excluded, but only if not used in high-risk or prohibited contexts. Components that are integrated into or used as part of a high-risk product or AI system that is placed on the market or put into service do not benefit from this exclusion. The provider of such a product or system remains responsible for compliance with this Regulation.",
      article: "Article 2(12)"
    },
    "personal_use": {
      text: "Covers obligations of deployers who are natural persons using AI systems in the course of a purely personal, non-professional activity. This exclusion reflects that the Regulation targets AI systems in a professional or commercial context, or systems that otherwise could impact persons beyond the user. It does not include systems used by deployers in a professional capacity or systems whose use could affect other individuals. For example, a personal home assistant used solely by an individual for their own entertainment would be excluded, but an AI system used even occasionally for business purposes or that processes data of other persons (such as guests) would not. Note: This exclusion applies specifically to deployer obligations, not to the obligations of providers placing such systems on the market.",
      article: "Article 2(10), Recital 13"
    },
    "foreign_LE_only": {
      text: "Covers use of AI systems by public authorities of third countries or international organisations when acting in the framework of international cooperation or agreements concluded at Union or national level for law enforcement and judicial cooperation with the Union or Member States, provided the relevant third country or international organisation provides adequate safeguards with respect to the protection of fundamental rights and freedoms. This may cover activities of entities entrusted by third countries to carry out specific tasks in support of such cooperation. However, Union and Member State authorities that receive outputs from such systems remain accountable to ensure their own use of those outputs complies with Union law. This exclusion does not cover use by private operators or deployment in different contexts.",
      article: "Article 2(4), Recital 22"
    }
  };

  // None-exclusive toggle: if "none" selected, deselect all others; if any other selected, deselect "none"
  const handleToggle = (id) => {
    if (id === "none") {
      if (selectedItems.includes("none")) {
        saveAnswer("exclusions", []);
      } else {
        saveAnswer("exclusions", ["none"]);
      }
    } else {
      if (selectedItems.includes("none")) {
        saveAnswer("exclusions", [id]);
      } else {
        const updated = selectedItems.includes(id)
          ? selectedItems.filter(x => x !== id)
          : [...selectedItems, id];
        saveAnswer("exclusions", updated);
      }
    }
  };

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (!selectedItems.length) return;

    if (hasMaterialExclusion) {
      setClassificationWithPrecedence(CLASSIFICATIONS.EXCLUDED);
      // Mark all intermediate screens as completed since we're skipping them due to exclusion
      markStepsAsCompleted(["/screen2", "/screen3", "/screen4", "/screen5", "/screen6", "/screen7", "/screen8", "/screen9", "/screen10", "/screen11"]);
      // Skip directly to classification when exclusion detected
      navigate("/screen12");
    } else {
      // No material scope exclusions found, proceed to role determination
      navigate("/screen2");
    }
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 1: EU AI Act Exclusions</h1>
        <p className="subtitle">Does your AI system fall under any of these exclusions from the EU AI Act?</p>
      </div>

      <div className="screen-content">
        <div className="helper-box alert-info" style={{ marginBottom: "1.5rem" }}>
          <strong>ℹ️ About Exclusions:</strong>
          <p>
            Article 2 of the EU AI Act defines the material scope and lists several categories of AI systems that are 
            excluded from the Regulation. These exclusions are based on specific policy considerations such as national security, 
            freedom of scientific research, and the personal nature of some uses. It is important to correctly interpret each 
            exclusion to avoid over-applying or under-applying them. Select all exclusions that apply to your AI system.
          </p>
        </div>

        <div className="options-group checkbox-group">
          {EXCLUSIONS.flatMap((option) => {
            const el = (
              <label key={option.id} className="checkbox-option">
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
            );
            if (option.id === "none") return [
              <hr key="none-sep" style={{ margin: "8px 0", borderColor: "var(--border-color)" }} />,
              el
            ];
            return el;
          })}
        </div>

        {/* Display detailed definitions for selected exclusions */}
        {selectedItems.filter(id => id !== "none" && exclusionDefinitions[id]).length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "1rem", fontWeight: 600 }}>
              Selected Exclusion Details:
            </h3>
            {selectedItems
              .filter(id => id !== "none" && exclusionDefinitions[id])
              .map(id => {
                const def = exclusionDefinitions[id];
                const option = EXCLUSIONS.find(opt => opt.id === id);
                return (
                  <div key={id} className="helper-box alert-info" style={{ marginBottom: "1rem" }}>
                    <strong>{option.label}</strong>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.9em" }}>{def.text}</p>
                    <span className="source-tag" title={def.article} style={{ marginTop: "0.5rem", display: "inline-block" }}>
                      Source
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {hasMaterialExclusion && (
          <div className="info-box alert-success">
            <strong>✓ Scope Exclusion Applied:</strong>
            You selected one or more material scope exclusion categories. Your AI system is excluded from the EU AI Act scope. <span className="source-tag" title="Article 2 — Material Scope">Source</span>
          </div>
        )}

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={handleNext} disabled={!selectedItems.length}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
