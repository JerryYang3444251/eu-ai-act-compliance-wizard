import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useWizard } from "../state/WizardContext";
import { CLASSIFICATIONS } from "../data/checklist";

export default function Screen13() {
  const navigate = useNavigate();
  const {
    roles,
    classification,
    answers,
    setObligations,
    navigateBack,
    completedItems,
    toggleItemCompletion,
    hasModifications,
    shouldReevaluateRules,
    setShouldReevaluateRules,
    pushHistory,
  } = useWizard();

  useEffect(() => {
    pushHistory("/screen13");
  }, [pushHistory]);

  // -------------------------------------------------------------------------
  // RULE ENGINE: Non-providers skip directly to checklist
  // Only Providers require Conformity Assessment routing
  // -------------------------------------------------------------------------
  const isProvider = roles.includes("Provider");
  const isHighRisk = classification && [
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  useEffect(() => {
    // If not a Provider, skip Screen13 entirely and go directly to Screen14
    if (!isProvider) {
      navigate("/screen14");
    }
  }, [isProvider, navigate]);

  // Don't render if not a Provider
  if (!isProvider) return null;

  // -------------------------------------------------------------------------
  // Build obligation groups based on rule engine logic (MODULE 11)
  // -------------------------------------------------------------------------
  const getObligationGroups = () => {
    const groups = [];

    const transparencyTriggered =
      answers?.transparencyTriggers &&
      Array.isArray(answers.transparencyTriggers) &&
      answers.transparencyTriggers.length > 0 &&
      !answers.transparencyTriggers.includes("none");

    const isHighRiskStrict =
      classification &&
      ["high_risk_ib", "high_risk_ia", "high_risk_iii"].includes(classification);

    const push = (id, name) => {
      if (!groups.find((g) => g.id === id)) {
        groups.push({ id, name });
      }
    };

    // ---------------------------------------------------------------------
    // OVERRIDES for Prohibited / Excluded (Rule engine terminal logic)
    // ---------------------------------------------------------------------
    if (classification === "prohibited") {
      return [{ id: "L", name: "Prohibited System Obligations (L1–L9)" }];
    }

    if (classification === "excluded") {
      return [{ id: "M", name: "Exclusion Rules (M1–M4)" }];
    }

    // ---------------------------------------------------------------------
    // GLOBAL OBLIGATIONS (always apply where classification matches)
    // ---------------------------------------------------------------------

    // GPAI
    if (classification === "gpai") {
      push("J", "GPAI Obligations (J1–J16)");
    }

    // GPAI Systemic
    if (classification === "gpai_systemic") {
      push("K", "GPAI Systemic Obligations (K1–K13)");
    }

    // Transparency (OBL_008 — ALWAYS applied if triggered)
    if (transparencyTriggered) {
      push("H", "Transparency Obligations (H1–H9)");
    }

    // Annex III non-significant risk notification (OBL_010)
    if (classification === "annex_iii_non_significant") {
      push("I", "Non‑Significant Risk Notification (I1–I7)");
    }

    // FRIA (MODULE 8 — ONLY public authorities + high risk)
    if (roles.includes("Public_Authority") && isHighRiskStrict) {
      push("G", "FRIA Obligations (G1–G15)");
    }

    // ---------------------------------------------------------------------
    // ROLE‑SPECIFIC OBLIGATIONS
    // ---------------------------------------------------------------------

    // Provider
    if (roles.includes("Provider")) {
      push("A", "Provider Obligations (A1–A16)");
      if (isHighRiskStrict) {
        push("O", "Conformity Assessment Obligations (O1–O50)");
      }
      if (hasModifications) {
        push("C", "Handover Obligations (C1–C15)");
      }
    }

    // Product Manufacturer (Remains manufacturer unless safety component)
    if (roles.includes("Product_Manufacturer")) {
      push("N", "Product Manufacturer Obligations (N1–N4)");
    }

    // Deployer
    if (roles.includes("Deployer")) {
      push("F", "Deployer Obligations (F1–F12)");
    }

    // Importer
    if (roles.includes("Importer")) {
      push("D", "Importer Obligations (D1–D14)");
    }

    // Distributor
    if (roles.includes("Distributor")) {
      push("E", "Distributor Obligations (E1–E9)");
    }

    // Authorised Representative
    if (roles.includes("Authorised_Representative")) {
      push("A", "Provider Documentation Obligations (A1–A16)");
      if (hasModifications) {
        push("C", "Handover Obligations (C1–C15)");
      }
    }

    return groups;
  };

  const obligationGroups = getObligationGroups();

  // -------------------------------------------------------------------------
  // MASTER CHECKLIST — unchanged content (long list)
  // -------------------------------------------------------------------------
  const MASTER_CHECKLIST = {
    A: [
      "A1 Risk Management: Identify known risks",
      "Identify foreseeable risks",
      "Analyse risks at system/subsystem/component levels",
      "Evaluate risk severity and likelihood",
      "Implement risk elimination",
      "Implement risk reduction",
      "Validate mitigation",
      "Confirm residual risk",
      "Reassess after modifications",
      "Document everything",
      "A2 Data Governance: Ensure training data relevance",
      "Ensure validation data relevance",
      "Ensure testing data relevance",
      "Ensure representativeness",
      "Ensure minimal errors",
      "Ensure completeness",
      "Document data collection",
      "Document data cleaning",
      "Document data labeling",
      "Document dataset governance",
      "Assess bias",
      "Document bias assessment",
      "Apply dataset versioning",
      "Ensure integrity protections",
      "Ensure compliance with data protection laws",
      "A3 Technical Documentation: Provide architecture",
      "Provide component diagrams",
      "Provide training procedure",
      "Provide dataset sources",
      "Provide test methodology",
      "Provide metrics",
      "Provide intended purpose",
      "Provide environmental conditions",
      "Provide limitations",
      "Provide cybersecurity",
      "Provide human oversight plan",
      "Provide risk mitigations",
      "Keep version history",
      "Keep configuration records",
      "Retain for 10 years",
      "A4 Logging: Enable automated logging",
      "Log system operations",
      "Log anomalies",
      "Log major outputs where lawful",
      "Protect logs",
      "Provide logs to deployers/authorities",
      "Retain logs for required duration",
      "Document logging process",
      "A5 Instructions: Installation instructions",
      "Operation instructions",
      "Maintenance instructions",
      "Intended purpose",
      "System performance",
      "Error rates",
      "Limitations",
      "Probabilistic output info",
      "Cybersecurity instructions",
      "Human oversight instructions",
      "A6 Human Oversight: Enable monitoring",
      "Enable override",
      "Enable stop",
      "Outputs understandable",
      "Mitigate automation bias",
      "Document oversight roles",
      "Provide instructions for oversight",
      "A7 Accuracy & Robustness: Define accuracy",
      "Validate accuracy",
      "Ensure robustness",
      "Error handling",
      "Fault tolerance",
      "Adversarial resistance",
      "Poisoning resistance",
      "Provide fallback",
      "Provide fail-safe",
      "Monitor accuracy post-market",
      "A8 Quality Management System: Design procedures",
      "Development procedures",
      "Testing procedures",
      "Data procedures",
      "Supplier controls",
      "Risk integration",
      "Cybersecurity processes",
      "Internal audits",
      "Competence management",
      "Version/Configuration management",
      "Corrective & preventive actions",
      "A9 Post-market Monitoring: Monitoring plan",
      "Collect real data",
      "Detect anomalies",
      "Detect new risks",
      "Update risk file",
      "Update QMS",
      "Maintain reporting channel",
      "A10 Corrective Actions: Correct non-compliance",
      "Withdraw system",
      "Recall system",
      "Notify partners",
      "Notify authorities",
      "Document actions",
      "A11 Conformity Assessment: Choose route",
      "Prepare technical file",
      "Perform tests",
      "Fix issues",
      "Maintain certificates",
      "A12 Declaration of Conformity: Prepare declaration",
      "Identify provider",
      "Identify system",
      "List standards",
      "Sign",
      "Retain",
      "A13 CE Marking: Affix marking",
      "Ensure visibility",
      "Ensure permanence",
      "A14 High-Risk Registration: Register in database",
      "Provide data",
      "Update changes",
      "A15 Incident Reporting: Notify authorities immediately",
      "Provide details",
      "Retain records",
      "A16 Cooperation: Provide documents",
      "Provide logs",
      "Provide samples",
      "Support inspections",
    ],
    C: [
      "C1 Design docs",
      "C2 Architecture diagrams",
      "C3 Model docs",
      "C4 Dataset docs",
      "C5 Performance metrics",
      "C6 Bias assessments",
      "C7 Logging interfaces",
      "C8 Risk documents",
      "C9 Human oversight design",
      "C10 Cybersecurity info",
      "C11 Conformity documents",
      "C12 Declarations of Conformity",
      "C13 Monitoring data",
      "C14 Incident reports",
      "C15 Version/data lineage",
    ],
    D: [
      "D1 Verify CE",
      "D2 Verify Declaration",
      "D3 Verify technical file",
      "D4 Verify instructions",
      "D5 Reject unsafe systems",
      "D6 Maintain compliance during storage",
      "D7 Add importer details",
      "D8 Retain Declaration",
      "D9 Maintain traceability",
      "D10 Provide documents",
      "D11 Cooperate with authorities",
      "D12 Correct issues",
      "D13 Notify authorities",
      "D14 Forward complaints",
    ],
    E: [
      "E1 Verify CE",
      "E2 Verify documentation",
      "E3 Reject unsafe systems",
      "E4 Preserve compliance",
      "E5 Maintain supplier/customer list",
      "E6 Provide documents",
      "E7 Cooperate",
      "E8 Remove/stop unsafe distribution",
      "E9 Report risks",
    ],
    F: [
      "F1 Follow instructions",
      "F2 Use only intended purpose",
      "F3 Ensure data quality",
      "F4 Maintain logs",
      "F5 Assign human oversight",
      "F6 Stop system if needed",
      "F7 Conduct DPIA if needed",
      "F8 Report incidents",
      "F9 Provide docs/logs",
      "F10 Follow cybersecurity",
      "F11 Protect vulnerable persons",
      "F12 Provide transparency",
    ],
    G: [
      "G1 Identify affected persons",
      "G2 Identify rights impacts",
      "G3 Direct impacts",
      "G4 Indirect impacts",
      "G5 Cumulative impacts",
      "G6 Vulnerabilities",
      "G7 Safeguards",
      "G8 Mitigations",
      "G9 Assess oversight",
      "G10 Stakeholder input",
      "G11 Prepare FRIA",
      "G12 Submit",
      "G13 Publish (unless exception)",
      "G14 Update",
      "G15 Retain FRIA",
    ],
    H: [
      "H1 Notify human interaction",
      "H2 Label synthetic content",
      "H3 Label deepfakes",
      "H4 Justify exceptions",
      "H5 Provide deployer guidance",
      "H6 Ensure detectability",
      "H7 Notify biometric categorisation",
      "H8 Notify emotion recognition",
      "H9 Update transparency measures",
    ],
    I: [
      "I1 Document risk assessment",
      "I2 Notify authorities",
      "I3 Register system",
      "I4 Maintain evidence",
      "I5 Provide evidence",
      "I6 Reassess after changes",
      "I7 Notify new risk",
    ],
    J: [
      "J1 Document model",
      "J2 Document capabilities",
      "J3 Document limitations",
      "J4 Document performance",
      "J5 Foreseeable misuse",
      "J6 Evaluation methods",
      "J7 Integration guidance",
      "J8 Cybersecurity guidance",
      "J9 Training data summary",
      "J10 Implement security",
      "J11 Monitor post-market",
      "J12 Detect emergent harms",
      "J13 Incident reporting",
      "J14 Provide authority info",
      "J15 Correct issues",
      "J16 Document modifications",
    ],
    K: [
      "K1 Adversarial testing",
      "K2 Red-teaming",
      "K3 Identify systemic risks",
      "K4 Mitigation measures",
      "K5 Stress testing",
      "K6 Environmental impact documentation",
      "K7 Maintain deep documentation",
      "K8 Provide model information",
      "K9 Report systemic incidents",
      "K10 Vulnerability reporting",
      "K11 Publish model cards",
      "K12 Track versions",
      "K13 Track training lineage",
    ],
    L: [
      "L1 Stop development",
      "L2 Stop distribution",
      "L3 Disable system",
      "L4 Withdraw",
      "L5 Notify authorities",
      "L6 Provide documents",
      "L7 Document cessation",
      "L8 Prevent recurrence",
      "L9 Block prohibited features",
    ],
    M: [
      "M1 Research not placed on market",
      "M2 Open-source + no remuneration",
      "M3 Personal non-professional use",
      "M4 Military or foreign LE use",
    ],
    N: [
      "N1 Become Provider if safety component",
      "N2 Apply Provider obligations",
      "N3 Apply sectoral product law",
      "N4 Register high-risk AI",
    ],
  };

  // -------------------------------------------------------------------------
  // Save applicable obligations into context
  // -------------------------------------------------------------------------
  useEffect(() => {
    const ids = obligationGroups.map((g) => g.id);
    setObligations(ids);
  }, [obligationGroups, setObligations]);

  // -------------------------------------------------------------------------
  // Checklist construction
  // -------------------------------------------------------------------------
  const parseSubcategories = (list, letter) => {
    const subcats = [];
    let current = null;
    const headerRegex = new RegExp(`^${letter}\\d+`, "i");

    list.forEach((line) => {
      if (headerRegex.test(line)) {
        const parts = line.split(":");
        const headerPart = parts[0].trim();

        const headerMatch = headerPart.match(
          new RegExp(`^(${letter}\\d+)(?:\\s+(.*))?`, "i")
        );

        const id = headerMatch ? headerMatch[1] : headerPart;
        const title =
          headerMatch && headerMatch[2] ? headerMatch[2] : headerPart;

        current = { id, title, items: [] };
        subcats.push(current);

        if (parts.length > 1) {
          const rest = parts.slice(1).join(":").trim();
          if (rest) current.items.push(rest);
        }
      } else if (current) {
        current.items.push(line);
      } else {
        current = {
          id: `${letter}-0`,
          title: `${letter} Misc`,
          items: [line],
        };
        subcats.push(current);
      }
    });

    return subcats;
  };

  const checklistItems = [];
  obligationGroups.forEach((g) => {
    const list = MASTER_CHECKLIST[g.id] || [];

    if (g.id === "A") {
      const subs = parseSubcategories(list, "A");
      subs.forEach((sub) => {
        sub.items.forEach((item, idx) =>
          checklistItems.push({
            id: `${sub.id}-${idx}`,
            category: g.id,
            subcategory: sub.id,
            title: item,
          })
        );
      });
    } else {
      list.forEach((item, idx) => {
        checklistItems.push({
          id: `${g.id}-${idx}`,
          category: g.id,
          title: item,
        });
      });
    }
  });

  const completedCount = checklistItems.filter((it) => completedItems[it.id])
    .length;
  const completionPercent =
    checklistItems.length > 0
      ? Math.round((completedCount / checklistItems.length) * 100)
      : 0;

  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    const hasO = obligationGroups.find((g) => g.id === "O");
    if (hasO) {
      navigate("/screen13a");
    } else {
      navigate("/screen14");
    }
  };

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------
  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 13: Obligation Category Identification</h1>
        <p className="subtitle">
          Based on your role and classification, the following obligation groups
          apply:
        </p>
        <div className="progress-bar" style={{ marginTop: 16 }}>
          <div className="progress" style={{ width: `${completionPercent}%` }}></div>
          <p className="progress-text">
            {completionPercent}% Completed — {completedCount} of{" "}
            {checklistItems.length} items
          </p>
        </div>
      </div>

      <div className="screen-content">
        <div className="obligation-groups">
          {obligationGroups.length > 0 ? (
            <ul className="obligation-list">
              {obligationGroups.map((group) => (
                <li key={group.id} className="obligation-item">
                  <span className="obligation-badge">✓</span>
                  {group.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="info-box alert-info">
              <p>No specific obligations identified.</p>
            </div>
          )}
        </div>

        {/* Checklist */}
        <div className="checklist">
          {obligationGroups.map((group) => (
            <div key={`check-${group.id}`} className="checklist-section">
              <h3>{group.name}</h3>
              <div>
                {group.id === "A"
                  ? parseSubcategories(MASTER_CHECKLIST.A || [], "A").map(
                      (sub) => (
                        <div
                          key={sub.id}
                          className="checklist-subsection"
                        >
                          <h4 style={{ marginTop: 8 }}>
                            {sub.id} {sub.title}
                          </h4>
                          {sub.items.map((item, idx) => {
                            const id = `${sub.id}-${idx}`;
                            return (
                              <label
                                key={id}
                                className={`checklist-item compact ${
                                  completedItems[id] ? "completed" : ""
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={!!completedItems[id]}
                                  onChange={() => toggleItemCompletion(id)}
                                />
                                <div className="step-content">
                                  <p>{item}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )
                    )
                  : (MASTER_CHECKLIST[group.id] || []).map((item, idx) => {
                      const id = `${group.id}-${idx}`;
                      return (
                        <label
                          key={id}
                          className={`checklist-item compact ${
                            completedItems[id] ? "completed" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={!!completedItems[id]}
                            onChange={() => toggleItemCompletion(id)}
                          />
                          <div className="step-content">
                            <p>{item}</p>
                          </div>
                        </label>
                      );
                    })}

                {!(MASTER_CHECKLIST[group.id] || []).length && (
                  <div className="info-box alert-info">
                    No detailed checklist available for {group.name}.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="screen-navigation">
          <button
            className="btn btn-secondary"
            onClick={() => navigateBack(navigate)}
          >
            ← Back
          </button>

          <button className="btn btn-primary" onClick={handleNext}>
            Next: Conformity Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
