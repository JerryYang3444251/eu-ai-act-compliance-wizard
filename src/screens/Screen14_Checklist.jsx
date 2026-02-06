import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";
import { ALL_OBLIGATIONS, CONFORMITY_ASSESSMENT_ROUTES, CLASSIFICATIONS } from "../data/checklist";

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
  } = useWizard();

  // Register this screen in navigation history (handle both /screen14 and /screenFinal routes)
  useEffect(() => {
    // Always register as /screen13 for consistency - the previous screen
    pushHistory("/screen13");
  }, [pushHistory, navigate]);

  // obligations: persisted array of categories (e.g., ["A","C","O","H"])
  const applicableCategories = obligations || [];

  // Normalize conformityRoute into human-readable route label
  const routeLabelMap = {
    [CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL]: "InternalControl",
    [CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY]: "NotifiedBody",
    [CONFORMITY_ASSESSMENT_ROUTES.COMMON_SPECIFICATIONS]: "CommonSpecifications",
    [CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LAW]: "SectoralLaw",
    [CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION]: "SectoralLegislation",
  };
  const selectedRouteLabel = conformityRoute ? routeLabelMap[conformityRoute] : null;

  // Mapping for readable route names
  const routeDisplayMap = {
    [CONFORMITY_ASSESSMENT_ROUTES.INTERNAL_CONTROL]: "Internal Control",
    [CONFORMITY_ASSESSMENT_ROUTES.NOTIFIED_BODY]: "Notified Body",
    [CONFORMITY_ASSESSMENT_ROUTES.COMMON_SPECIFICATIONS]: "Common Specifications",
    [CONFORMITY_ASSESSMENT_ROUTES.SECTORAL_LEGISLATION]: "Sectoral Legislation",
  };

  // Check if system is high-risk and user is a provider
  const isProvider = roles.includes("Provider");
  const isHighRisk = [
    CLASSIFICATIONS.HIGH_RISK_IA,
    CLASSIFICATIONS.HIGH_RISK_IB,
    CLASSIFICATIONS.HIGH_RISK_III,
  ].includes(classification);

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
          <div className="info-box alert-danger">
            <strong>Error:</strong>
            <p>
              No conformity assessment route was determined. Please go back and complete
              the conformity assessment routing step.
            </p>
          </div>
          <div className="screen-navigation">
            <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter applicable obligations
  const applicableItems = Object.values(ALL_OBLIGATIONS).filter((item) => {
    // Conformity Assessment obligations (category "O")
    if (item.category === "O") {
      if (!applicableCategories.includes("O")) return false;
      if (!selectedRouteLabel) return false;
      return item.route === selectedRouteLabel;
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

  // Category titles mapping
  const categoryTitles = {
    A: "Provider Obligations",
    C: "Handover Obligations",
    D: "Importer Obligations",
    E: "Distributor Obligations",
    F: "Deployer Obligations",
    G: "FRIA Obligations",
    H: "Transparency Obligations",
    I: "Non-Significant Risk Obligations",
    J: "GPAI Obligations",
    K: "GPAI Systemic Obligations",
    L: "Prohibited System Obligations",
    M: "Exclusion Rules",
    N: "Product Manufacturer Obligations",
    O: "Conformity Assessment Obligations",
  };

  const completedCount = Object.values(completedItems).filter(Boolean).length;
  
  // Calculate progress: 100% if no items, otherwise percentage of completed items
  const progressPercent = applicableItems.length > 0 
    ? (completedCount / applicableItems.length) * 100 
    : 100;

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 14: Compliance Checklist</h1>
        <p className="subtitle">All applicable compliance items</p>
        <div className="progress-bar">
          <div
            className="progress"
            style={{
              width: `${progressPercent}%`,
            }}
          ></div>
          <p className="progress-text">
            {Math.round(progressPercent)}
            % Completed — {completedCount} of {applicableItems.length} items
          </p>
        </div>
      </div>

      <div className="screen-content">
        {/* Checklist grouped by category */}
        <div className="checklist">
          {/* Show CA Details as first section if provider + high-risk */}
          {isProvider && isHighRisk && applicableCategories.includes("O") && (
            <div className="checklist-category">
              <h3 className="category-title">Conformity Assessment Route</h3>
              <div style={{ padding: "8px", marginBottom: "6px", background: "var(--bg-light)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <p style={{ margin: "0", fontSize: "0.9rem" }}>
                  <strong>Selected Route:</strong> {routeDisplayMap[conformityRoute] || "Not required under Article 16, Article 43, Annex I, Annex III"}
                </p>
              </div>
            </div>
          )}

          {/* All obligation categories */}
          {Object.keys(itemsByCategory).map((category) => (
            <div key={category} className="checklist-category">
              <h3 className="category-title">{categoryTitles[category] || `Category ${category}`}</h3>
              {itemsByCategory[category].map((item) => {
                // Only use 2-level hierarchy if there are 2+ sub-items
                const hasMultipleSubItems = item.items && item.items.length > 1;
                const subItemsCompleted = hasMultipleSubItems
                  ? item.items.filter((_, idx) => completedItems[`${item.number}-${idx}`]).length
                  : 0;
                const allSubItemsCompleted = hasMultipleSubItems && subItemsCompleted === item.items.length;
                
                // Main item is complete if: (no multi-items and checked) OR (has multi-items and all are checked)
                const isMainItemCompleted = hasMultipleSubItems ? allSubItemsCompleted : (completedItems[item.number] || false);

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
                        <span className="item-number">{item.number}</span>
                        <p className="item-title">{item.title}</p>
                        {item.description && <span className="item-description">{item.description}</span>}
                        {hasMultipleSubItems && (
                          <span className="sub-items-count">
                            {subItemsCompleted}/{item.items.length}
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
                                  {itemSource && <span className="source-badge" title={itemSource}>[Source]</span>}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Single item - show inline without sub-hierarchy */}
                    {!hasMultipleSubItems && item.items && item.items.length === 1 && (
                      <div className="single-sub-item">
                        <p className="single-sub-text">
                          • {typeof item.items[0] === 'string' ? item.items[0] : item.items[0].text}
                          {typeof item.items[0] !== 'string' && item.items[0].source && (
                            <span className="source-badge" title={item.items[0].source}>[Source]</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={() => {
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
