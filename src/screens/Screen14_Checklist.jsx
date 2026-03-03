import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { ALL_OBLIGATIONS, CONFORMITY_ASSESSMENT_ROUTES, CLASSIFICATIONS, CLASSIFICATION_LABELS } from "../data/checklist";

export default function Screen14() {
  const navigate = useNavigate();
  const {
    roles,
    classification,
    completedItems,
    toggleItemCompletion,
    navigateBack,
    obligations,
    conformityRoute,
    shouldReevaluateRules,
    setShouldReevaluateRules,
    clearAnswers,
    pushHistory,
    answers,
    // NEW: Additional context variables for FRIA rule
    isPublicServiceProvider,
    deploymentSector,
    annexIIIPoint,
    // NEW: Transparency filtering variables
    systemFunctionality,
    contentCharacteristics,
  } = useWizard();

  // Register this screen in navigation history
  useEffect(() => {
    pushHistory("/screen14");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obligations: persisted array of categories (e.g., ["A","C","O","H"])
  // Deduplicate to avoid repeated categories (e.g., double 'O')
  const applicableCategories = Array.from(new Set(obligations || []));

  // Normalize conformityRoute into human-readable route label
  const routeLabelMap = {
    [CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL]: "Internal Control",
    [CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY]: "Notified Body",
    [CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION]: "Sectoral Legislation",
  };
  const selectedRouteLabel = conformityRoute ? routeLabelMap[conformityRoute] : null;

  // Mapping for readable route names
  const routeDisplayMap = {
    [CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL]: "Internal Control (Harmonised Standards / Common Specifications)",
    [CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY]: "Notified Body (Third-Party Assessment)",
    [CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION]: "Sectoral Legislation",
  };

  // Check if system is high-risk and user is a provider
  const isProvider = roles.includes("Provider");
  const isDeployer = roles.includes("Deployer");
  const isPublicAuthority = roles.includes("Public_Authority");
  
  const isHighRisk = [
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

  // FRIA Logic (matching FRIA_001 rule)
  const friaRequired = 
    isHighRisk &&
    annexIIIPoint !== 2 && // Exclude employment (Annex III point 2)
    (
      isPublicAuthority ||
      isPublicServiceProvider ||
      deploymentSector?.some(sector => 
        ['law_enforcement', 'migration', 'asylum', 'border_control', 'justice'].includes(sector)
      )
    );

  // Validate FRIA obligation assignment
  const hasFRIAObligation = applicableCategories.includes("G");
  if (friaRequired && !hasFRIAObligation) {
    console.warn("FRIA is required but not assigned to obligations. Check rule engine logic.");
  }
  if (!friaRequired && hasFRIAObligation) {
    console.warn("FRIA assigned but not required. Check rule engine logic.");
  }

  // ERROR HANDLING: High-risk Provider systems must have a conformity route assigned
  if (isProvider && isHighRisk && applicableCategories.includes("O") && !selectedRouteLabel) {
    return (
      <div className="screen-container">
        <div className="screen-header">
          <h1>Error: Conformity Route Missing</h1>
          <p className="subtitle">
            High-risk systems require a conformity assessment route, but none was assigned.
          </p>
        </div>
        <div className="screen-content">
          <div className="info-box alert-danger" style={{ marginTop: "24px" }}>
            <strong>Configuration Error:</strong>
            <p>
              No conformity assessment route was determined for this high-risk AI system. 
              This violates the EU AI Act. <span className="source-tag" title="Article 43">Source</span>
            </p>
            <p>
              <strong>Required:</strong> All high-risk AI systems placed on the market must undergo 
              conformity assessment via one of these routes:
            </p>
            <ul>
              <li>Internal Control (Harmonised Standards or Common Specifications)</li>
              <li>Notified Body Assessment</li>
              <li>Sectoral Legislation</li>
            </ul>
            <p>
              Please go back and complete the conformity assessment routing questions (Screen 13).
            </p>
          </div>
          <div className="screen-navigation">
            <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
              ← Back to Fix
            </button>
            <button className="btn btn-danger" onClick={() => {
              clearAnswers();
              navigate("/");
            }}>
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter applicable obligations (matching OUTPUT_001 logic)
  const applicableItems = Object.values(ALL_OBLIGATIONS).filter((item) => {
    // Conformity Assessment obligations (category "O")
    if (item.category === "O") {
      if (!applicableCategories.includes("O")) return false;
      if (!selectedRouteLabel) return false;
      // Only show obligations for the selected conformity route
      if (item.route !== selectedRouteLabel) return false;
      // CS-only items (O26-O36) only appear when the user confirmed they are using Common Specifications
      if (item.csOnly && answers.conformity_uses_cs !== "cs") return false;
      return true;
    }
    
    // Transparency obligations (category "H") - Article 50 only
    // Filter based on actual system capabilities per TRANS_001-005
    if (item.category === "H") {
      if (!applicableCategories.includes("H")) return false;
      
      // H1: Disclose AI Interaction (Article 50(1)) — PROVIDER obligation (design) + DEPLOYER obligation (operation).
      // Art. 50(1): "Providers shall ensure that AI systems intended to interact directly with natural
      // persons are DESIGNED AND DEVELOPED in such a way that natural persons are informed".
      // Deployers also inherit this operational duty, so it applies to both roles.
      if (item.number === "H1") {
        return (isProvider || isDeployer) && systemFunctionality?.includes("human_interaction");
      }
      
      // H2: Disclose Emotion Recognition (Article 50(3)) — DEPLOYER ONLY.
      // Art. 50(3): "Deployers of an emotion recognition system or a biometric categorisation
      // system shall inform the natural persons exposed thereto". Provider has no parallel duty.
      if (item.number === "H2") {
        return isDeployer &&
          (systemFunctionality?.includes("emotion_recognition") ||
           systemFunctionality?.includes("biometric_categorization"));
      }
      
      // H3: Label AI-Generated Content (Article 50(2)) — PROVIDER ONLY.
      // Art. 50(2): "Providers of AI systems...generating synthetic audio, image, video or text
      // content, shall ensure that the outputs of the AI system are marked in a machine-readable
      // format and detectable as artificially generated or manipulated".
      if (item.number === "H3") {
        return isProvider &&
          systemFunctionality?.some(f =>
            ["text", "audio", "images", "video"].includes(f)
          );
      }
      
      // H4: Label Deepfakes (Article 50(4)) — DEPLOYER ONLY.
      // Art. 50(4): "Deployers of an AI system that generates or manipulates image, audio or video
      // content constituting a deep fake, shall disclose that the content has been artificially
      // generated or manipulated".
      if (item.number === "H4") {
        const generatesMedia = systemFunctionality?.some(f => ["images", "video", "audio"].includes(f));
        return isDeployer && contentCharacteristics?.includes("realistic") && generatesMedia;
      }
      
      // H5: Ensure Detectability (Article 50(5)) — applies when H3 (provider) or H4 (deployer) apply.
      // Art. 50(5): disclosures shall be clear, distinguishable, and easily perceivable.
      // Since H3 is provider-only and H4 is deployer-only, H5 follows the same role scoping.
      if (item.number === "H5") {
        const hasH3 = isProvider && systemFunctionality?.some(f =>
          ["text", "audio", "images", "video"].includes(f)
        );
        const hasH4 = isDeployer &&
          contentCharacteristics?.includes("realistic") &&
          systemFunctionality?.some(f => ["images", "video", "audio"].includes(f));
        return hasH3 || hasH4;
      }
      
      // H6-H9: General transparency obligations - apply whenever H category present
      if (["H6", "H7", "H8", "H9"].includes(item.number)) return true;
      
      return false; // Default: don't show if no specific trigger
    }
    
    // Prohibited obligations (category "L") - Role-specific per OBL_011-016
    // Filter based on actual role per Article 5
    if (item.category === "L") {
      if (!applicableCategories.includes("L")) return false;
      
      const isProvider = roles.includes("Provider");
      const isImporter = roles.includes("Importer");
      const isDistributor = roles.includes("Distributor");
      const isDeployer = roles.includes("Deployer");
      
      // L1: Do not place/use - applies to ALL roles
      if (item.number === "L1") return true;
      
      // L2: Cease Development - Provider only
      if (item.number === "L2") return isProvider;
      
      // L3: Cease Distribution - Provider and Distributor
      if (item.number === "L3") return isProvider || isDistributor;
      
      // L4: Withdraw System - Provider only
      if (item.number === "L4") return isProvider;
      
      // L5: Disable System - Deployer only
      if (item.number === "L5") return isDeployer;
      
      // L6: Notify Authorities - ALL roles
      if (item.number === "L6") return true;
      
      // L7: Document Cessation - Provider only
      if (item.number === "L7") return isProvider;
      
      // L8: Verify Exceptions - ALL roles
      if (item.number === "L8") return true;
      
      // L9: Cooperate with Investigations - ALL roles
      if (item.number === "L9") return true;
      
      return false;
    }
    
    // Exemption Documentation obligations (category "X") - Based on specific exemptions claimed
    if (item.category === "X") {
      if (!applicableCategories.includes("X")) return false;
      
      const exceptions = answers.prohibitedExceptions || {};
      
      // X1: Criminal Risk Assessment Exemption
      if (item.number === "X1") {
        return exceptions.criminal_risk === true;
      }
      
      // X2: Medical/Safety Emotion Recognition Exemption
      if (item.number === "X2") {
        return exceptions.emotion_workplace_education === true;
      }
      
      // X3: Biometric Law Enforcement Exemption
      if (item.number === "X3") {
        return exceptions.biometric_categorisation === true;
      }
      
      // X4: Real-time Remote Biometric Identification Exemption
      if (item.number === "X4") {
        return exceptions.real_time_rbi === true;
      }
      
      // X5: Ancillary Feature Exemption
      if (item.number === "X5") {
        return answers.ancillaryFeature === true;
      }
      
      return false; // Don't show if exemption not claimed
    }

    // Deployer obligations (F) — item-level filters for conditional obligations
    if (item.category === "F") {
      if (!applicableCategories.includes("F")) return false;
      // F10: Inform workers' representatives — Article 26(10) — employment deployment only
      if (item.number === "F10") {
        return deploymentSector?.includes("employment") ||
               answers.annexIIIUsecases?.some(u => ["employment_recruitment", "employment_management"].includes(u));
      }
      // F11: Register use in EU database — Article 49(3) — public authorities only
      if (item.number === "F11") {
        return isPublicAuthority;
      }
      return true;
    }

    // AI Literacy obligations (Q) — Q1 for providers, Q2 for deployers
    if (item.category === "Q") {
      if (!applicableCategories.includes("Q")) return false;
      if (item.number === "Q1") return isProvider;
      if (item.number === "Q2") return isDeployer;
      return false;
    }

    // GPAI obligations (J) — Article 53
    // Open-source exception (Article 53(2)): exempts obligations under 53(1)(a) [tech docs] and
    // 53(1)(b) [downstream info] for models released under free and open-source licence with
    // publicly available parameters. Exception does NOT apply if model has systemic risk.
    // Articles 53(1)(c) (J6 copyright policy) and 53(1)(d) (J7 training summary) always apply.
    if (item.category === "J") {
      if (!applicableCategories.includes("J")) return false;
      const openSourceExempt =
        answers.isOpenSourceGPAI === "yes" &&
        answers.hasSystemicRisk !== "yes" &&
        answers.hasSystemicRisk !== "commission_determined";
      if (openSourceExempt && ["J1", "J2", "J3", "J4", "J5", "J12"].includes(item.number)) {
        return false; // Article 53(1)(a)/(b) — exempt for qualifying open-source models
      }
      return true;
    }

    // All other obligation categories
    return applicableCategories.includes(item.category);
  });

  // Group items by category
  const itemsByCategory = {};
  applicableItems.forEach((item) => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = [];
    }
    itemsByCategory[item.category].push(item);
  });

  // Sort categories in logical order (Provider → High-Risk → Role-specific → GPAI → Other)
  const categoryOrder = ["A", "C", "O", "H", "Q", "G", "F", "D", "E", "R", "N", "J", "K", "I", "L", "M", "X", "P"];
  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Category titles mapping
  const categoryTitles = {
    A: "Provider Obligations",
    C: "Handover Obligations (Documentation Transfer)",
    D: "Importer Obligations",
    E: "Distributor Obligations",
    F: "Deployer Obligations",
    G: "Fundamental Rights Impact Assessment",
    H: "Transparency Obligations",
    I: "Non-High-Risk Assessment & Registration",
    J: "GPAI Obligations",
    K: "GPAI Systemic Risk Obligations",
    L: "Prohibited System Obligations",
    M: "Exclusion Documentation",
    N: "Product Manufacturer Obligations",
    O: "Conformity Assessment Obligations",
    P: "Prohibited Product Manufacturer Obligations",
    Q: "AI Literacy Obligations",
    R: "Authorised Representative Obligations",
    X: "Exemption Documentation",
  };

  // Category source citations
  const categorySources = {
    A: "Articles 9-17, 20-22, 64, 72-73",
    C: "Articles 13, 16",
    D: "Article 23",
    E: "Article 24",
    F: "Article 26",
    G: "Article 27",
    H: "Article 50",
    I: "Articles 6(3), 6(4), 49(2)",
    J: "Article 53",
    K: "Article 55",
    L: "Article 5",
    M: "Article 2",
    N: "Article 25(1)",
    O: "Article 43",
    P: "Articles 5, 24",
    Q: "Article 4",
    R: "Article 22",
    X: "Article 5, Recital 16",
  };

  // Category descriptions
  const categoryDescriptions = {
    A: "Core obligations for providers of high-risk AI systems (risk management, data governance, logging, human oversight, accuracy, QMS, post-market monitoring, corrective actions, cooperation)",
    C: "Documentation and information to be provided to downstream actors",
    D: "Obligations when importing AI systems into the EU",
    E: "Obligations when distributing AI systems in the EU market",
    F: "Obligations when deploying AI systems for use (includes Article 13 & 29 transparency for deployers)",
    G: "Assessment of impacts on fundamental rights (public authorities & sensitive sectors)",
    H: "Transparency obligations for AI-generated content, deepfake disclosure, and AI interaction disclosure.",
    I: "Assessment documentation and registration for Annex III systems where the provider has self-determined the system is not high-risk (Art. 6(3) assessment + Art. 49(2) EU database registration).",
    J: "Obligations for general-purpose AI model providers. These only apply where you are the provider placing the GPAI model on the market or putting it into service.",
    K: "Additional obligations for GPAI models with systemic risk. These only apply where you are the provider of the systemic GPAI model.",
    L: "Actions required when AI system is prohibited",
    M: "Documentation for systems excluded from AI Act scope.",
    N: "Obligations when AI is integrated as a safety component in products",
    O: `Conformity assessment obligations via: ${routeDisplayMap[conformityRoute] || "Not Required"}`,
    P: "Obligations for product manufacturers integrating prohibited AI systems",
    Q: "AI literacy obligations applicable to all providers and deployers regardless of risk level.",
    R: "Obligations for authorised representatives acting on behalf of providers established outside the EU.",
    X: "Documentation to prove compliance with exemption conditions for prohibited practices and ancillary features",
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  
  // Calculate progress: cap at 100% and use correct denominator
  const totalItems = Math.max(completedCount, applicableItems.length);
  const progressPercent = totalItems > 0
    ? Math.min((completedCount / totalItems) * 100, 100)
    : 100;

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Final Compliance Checklist</h1>
        <p className="subtitle">Complete list of applicable EU AI Act obligations</p>
        
        {/* Compact Summary Box - Horizontal Layout */}
        <div className="info-box" style={{ 
          marginTop: "1rem", 
          marginBottom: "1rem", 
          padding: "14px 20px",
          fontSize: "0.9rem"
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
            gap: "12px 20px",
            alignItems: "start"
          }}>
            <div>
              <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#555" }}>Classification</strong>
              <span style={{ fontWeight: 600, color: "#000" }}>{CLASSIFICATION_LABELS[classification] || classification}</span>
            </div>
            <div>
              <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#555" }}>Your Role(s)</strong>
              <span style={{ fontWeight: 600, color: "#000" }}>{roles.map(r => r.replace(/_/g, " ")).join(", ")}</span>
            </div>
            {isProvider && isHighRisk && (
              <div>
                <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#555" }}>Conformity Route</strong>
                <span style={{ fontWeight: 600, color: "#000" }}>{routeDisplayMap[conformityRoute]}</span>
              </div>
            )}
            <div>
              <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#555" }}>Obligation Categories</strong>
              <span style={{ fontWeight: 600, color: "#000" }}>{applicableCategories.join(", ")}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: progressPercent === 100 ? "var(--success-color)" : "var(--primary-color)",
            }}
          ></div>
          <p className="progress-text">
            {Math.round(progressPercent)}% Completed — {completedCount} of {totalItems} items
          </p>
        </div>
      </div>

      <div className="screen-content">
        {/* Instructions */}
          <div className="info-box" style={{ marginBottom: "1.2rem" }}>
          <strong>How to use this checklist:</strong>
          <ol style={{ margin: "0.4rem 0 0 0", paddingLeft: "1.4rem", fontSize: "0.85rem" }}>
            <li style={{ marginBottom: "3px" }}>Review each obligation category applicable to your role</li>
            <li style={{ marginBottom: "3px" }}>Check off items as you complete them</li>
            <li style={{ marginBottom: "3px" }}>For parent items with sub-items, all sub-items must be completed</li>
            <li style={{ marginBottom: "3px" }}>Click the [Source] badges to see the specific Article reference</li>
            <li>Your progress is automatically saved</li>
          </ol>
        </div>

        {/* Checklist grouped by category */}
        <div className="checklist">
          {sortedCategories.map((category) => (
            <div key={category} className="checklist-category">
              <div className="category-header">
                <h3 className="category-title">
                  {categoryTitles[category] || `Category ${category}`}
                  {categorySources[category] && (
                    <span className="source-tag" title={categorySources[category]}>
                      Source
                    </span>
                  )}
                </h3>
                {categoryDescriptions[category] && (
                  <p className="category-description">{categoryDescriptions[category]}</p>
                )}
              </div>

              {itemsByCategory[category].map((item) => {
                // Only use 2-level hierarchy if there are 2+ sub-items
                const hasMultipleSubItems = item.items && item.items.length > 1;
                const subItemsCompleted = hasMultipleSubItems
                  ? item.items.filter((_, idx) => completedItems[`${item.number}-${idx}`]).length
                  : 0;
                const allSubItemsCompleted = hasMultipleSubItems && subItemsCompleted === item.items.length;
                
                // Main item is complete if: (no multi-items and checked) OR (has multi-items and all are checked)
                const isMainItemCompleted = hasMultipleSubItems ? allSubItemsCompleted : (completedItems[item.number] || false);

                // Extract description: use item.description if exists, or use single sub-item text as description
                let displayDescription = item.description;
                if (!displayDescription && item.items && item.items.length === 1) {
                  displayDescription = typeof item.items[0] === 'string' ? item.items[0] : item.items[0].text;
                }

                return (
                  <div key={item.number} className="checklist-item-wrapper">
                    {/* Main item */}
                    <label className={`checklist-item ${isMainItemCompleted ? "completed" : ""} ${hasMultipleSubItems ? "parent" : ""}`}>
                      <input
                        type="checkbox"
                        checked={isMainItemCompleted}
                        onChange={() => {
                          if (hasMultipleSubItems) {
                            // Toggle all sub-items
                            if (allSubItemsCompleted) {
                              // Uncheck all
                              item.items.forEach((_, idx) => {
                                const subKey = `${item.number}-${idx}`;
                                if (completedItems[subKey]) {
                                  toggleItemCompletion(subKey);
                                }
                              });
                            } else {
                              // Check all
                              item.items.forEach((_, idx) => {
                                const subKey = `${item.number}-${idx}`;
                                if (!completedItems[subKey]) {
                                  toggleItemCompletion(subKey);
                                }
                              });
                            }
                          } else {
                            toggleItemCompletion(item.number);
                          }
                        }}
                      />
                      <div className="step-content">
                        <div className="title-row">
                          <span className="item-number">{item.number}</span>
                          <span className="item-title">{item.title}</span>
                          {item.source && (
                            <span 
                              className="source-tag" 
                              title={typeof item.source === 'object' 
                                ? [item.source.article, item.source.annex].filter(Boolean).join(', ')
                                : item.source
                              }
                            >
                              Source
                            </span>
                          )}
                        </div>
                        {displayDescription && <span className="item-description">{displayDescription}</span>}
                        {hasMultipleSubItems && (
                          <span className="sub-items-count">
                            {subItemsCompleted}/{item.items.length} completed
                          </span>
                        )}
                      </div>
                    </label>

                    {/* Sub-items only if multiple items */}
                    {hasMultipleSubItems && (
                      <div className="sub-items-container">
                        {item.items.map((subitem, idx) => {
                          const subKey = `${item.number}-${idx}`;
                          // Handle both string items and object items with source
                          const itemText = typeof subitem === 'string' ? subitem : subitem.text;
                          const itemSource = typeof subitem === 'string' ? null : subitem.source;
                          
                          return (
                            <label
                              key={subKey}
                              className={`checklist-item sub-item ${completedItems[subKey] ? "completed" : ""}`}
                            >
                              <input
                                type="checkbox"
                                checked={completedItems[subKey] || false}
                                onChange={() => toggleItemCompletion(subKey)}
                              />
                              <div className="step-content">
                                <p className="sub-item-text">
                                  {itemText}
                                  {itemSource && (
                                    <span 
                                      className="source-tag" 
                                      title={typeof itemSource === 'object' 
                                        ? [itemSource.article, itemSource.annex].filter(Boolean).join(', ')
                                        : itemSource
                                      }
                                    >
                                      Source
                                    </span>
                                  )}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Completion Status */}
        {progressPercent === 100 && (
          <div className="info-box alert-success" style={{ marginTop: "24px" }}>
            <strong>Checklist Complete</strong>
            <p>
              You have reviewed all {applicableItems.length} applicable obligations. 
              Please ensure all items are implemented and documented for compliance with 
              Regulation (EU) 2024/1689 (EU AI Act).
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              if (window.confirm("This will clear all your answers and progress. Are you sure?")) {
                clearAnswers();
                navigate("/");
              }
            }}
          >
            Start Over
          </button>
          <button 
            className="btn btn-success" 
            onClick={() => {
              window.print();
            }}
          >
            🖨️ Print Checklist
          </button>
        </div>
      </div>
    </div>
  );
}
