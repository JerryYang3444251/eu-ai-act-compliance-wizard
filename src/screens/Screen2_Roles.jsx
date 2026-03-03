import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWizard } from "../state/WizardContext";

export default function Screen1() {
  const navigate = useNavigate();
  const { roles_raw, setRoles_raw, navigateBack, reclassifyRoles, setRoles, saveAnswer, answers, shouldReevaluateRules, setShouldReevaluateRules, pushHistory } = useWizard();

  // Pending toggle — staged when a mutual-exclusivity conflict is detected; user must confirm
  const [pendingToggle, setPendingToggle] = useState(null);

  useEffect(() => {
    pushHistory("/screen2");
  }, [pushHistory]);

  // When the user is already unconditionally Provider (develop_* or place_on_market via Art. 3(3)),
  // Step 3 no longer affects their role — reframe to conformity assessment scope (Art. 43(4)).
  const isAlreadyUnconditionalProvider =
    roles_raw.some(a => ["develop_system", "develop_model"].includes(a)) ||
    roles_raw.includes("place_on_market");

  // change_purpose is definitionally substantial (Article 3(23) prong 2 — always a change of
  // intended purpose). No gate needed for it — but Step 3 should inform the user of consequences.
  const baseOperationalSelected = ["deploy", "import", "distribute", "product_manufacturer"]
    .some(id => roles_raw.includes(id));

  // Show Step 3 when:
  // - modify is selected + (any base operational role OR already unconditional provider)
  // - change_purpose is selected + (any base operational role OR already unconditional provider)
  // change_purpose is always substantial — no Yes/No gate, but an informational notice.
  const showSubstantialityGate =
    (roles_raw.includes("modify") || roles_raw.includes("change_purpose")) &&
    (baseOperationalSelected || isAlreadyUnconditionalProvider);

  // Clear the gate answer when the trigger condition is no longer met
  useEffect(() => {
    if (!showSubstantialityGate && answers.isSubstantialModification !== undefined) {
      saveAnswer("isSubstantialModification", undefined);
    }
  }, [showSubstantialityGate]);

  // ----------------------------------------------------------------------
  // MODULE 2 — RAW ROLE INPUT CAPTURE
  // This list MUST match the rule engine trigger inputs EXACTLY.
  // ----------------------------------------------------------------------
  const orgActions = [
    // Step 1 — primary roles (Art. 3 definitions); grouped by role type
    { id: "develop_system",      role: "Provider",                  label: "We develop an AI system and place it on the EU market or put it into service under our own name or trademark",                                                                    article: "Article 3(3), Article 16" },
    { id: "develop_model",       role: "Provider (GPAI model)",      label: "We develop a general-purpose AI model and place it on the EU market or put it into service under our own name or trademark",                                                   article: "Article 3(3), Article 53" },
    { id: "place_on_market",     role: "Provider",                  label: "We commission the development of an AI system and place it on the EU market or put it into service under our own name or trademark (without having developed it ourselves)",   article: "Article 3(3), Article 16" },
    { id: "import",              role: "Importer",                  label: "We bring an AI system into the EU from a provider established outside the EU, placing it on the market under the original provider's name",                                     article: "Article 3(6), Article 23" },
    { id: "distribute",          role: "Distributor",               label: "We supply or make available an AI system on the EU market without being its provider or importer",                                                                            article: "Article 3(7), Article 24" },
    { id: "deploy",              role: "Deployer",                  label: "We use an AI system under our own authority in the course of our professional activities",                                                                                      article: "Article 3(4), Article 26" },
    { id: "product_manufacturer",role: "Product Manufacturer",      label: "We manufacture a product in which an AI system performs a safety function under applicable sectoral legislation",                                                              article: "Article 25(3)" },
    { id: "act_as_ar",           role: "Authorised Representative", label: "We are mandated in writing by a provider established outside the EU to act on their behalf for the purposes of the AI Act",                                                     article: "Article 22" },
    // Step 2 — Art. 25 reclassification triggers (actions on an existing system)
    { id: "modify",              role: "Substantial Modification",  label: "We make changes to an existing AI system that was developed or placed on the market by another party — including modifications to its components, parameters, data inputs, or operational configuration", article: "Article 3(23), Article 25(1)(b)" },
    { id: "change_purpose",      role: "Purpose Change",            label: "We modify the intended purpose of an AI system already on the market or in service that was not previously classified as high-risk, in such a way that it becomes a high-risk AI system under Article 6", article: "Article 25(1)(c)" },
    { id: "brand",               role: "Rebranding",                label: "We place the AI system on the EU market or put it into service under our own name or trademark",                                                                               article: "Article 25(1)(a)" },
  ];

  const baseActivities = orgActions.slice(0, 8);
  const modificationActivities = orgActions.slice(8);
  const modificationIds = modificationActivities.map(a => a.id);

  // "None of the above" state for Step 2 — stored alongside answers
  const step2None = !!answers.step2_none;

  const handleToggleAction = (actionId) => {
    const isSelecting = !roles_raw.includes(actionId);

    // Compute base toggle result
    let updated = isSelecting
      ? [...roles_raw, actionId]
      : roles_raw.filter(id => id !== actionId);

    // Check for mutual-exclusivity conflicts (Act-defined incompatibilities).
    // If found, stage the change as pendingToggle and wait for user confirmation.
    let conflict = null;

    if (isSelecting) {
      // Rule 2 — develop_*/place_on_market + brand (Art. 3(3) vs Art. 25(1)(a))
      // Art. 25(1)(a) targets importers/distributors rebranding a third party's system.
      // Original developer's Provider status flows from Art. 3(3) — Art. 25(1)(a) does not apply.
      if (!conflict && ["develop_system", "develop_model", "place_on_market"].includes(actionId) && roles_raw.includes("brand")) {
        updated = updated.filter(id => id !== "brand");
        conflict = { type: "swap", removed: "Rebranding", reason: "Article 25(1)(a) applies to importers or distributors who place a third party's AI system under their own name or trademark. As original developer or market placer, your Provider status arises from Article 3(3) directly — Article 25(1)(a) is directed at other persons in the supply chain and does not apply to you.", article: "Article 3(3), Article 25(1)(a)" };
      } else if (!conflict && actionId === "brand" && roles_raw.some(id => ["develop_system", "develop_model", "place_on_market"].includes(id))) {
        updated = updated.filter(id => id !== "brand");
        conflict = { type: "block", removed: "Rebranding", reason: "Article 25(1)(a) applies to importers or distributors who place a third party's AI system under their own name or trademark. You have indicated that you are the original developer or market placer of this system — your Provider status already arises from Article 3(3) directly. Article 25(1)(a) is directed at other persons in the supply chain and does not apply to you.", article: "Article 3(3), Article 25(1)(a)" };
      }

      // Rule 3 — develop_* + modify (Art. 25(1)(b): "other than the provider")
      // Art. 25(1)(b) applies to any person other than the provider. The original developer
      // IS the provider — their changes are governed by Art. 43(4), not Art. 25(1)(b).
      if (!conflict && ["develop_system", "develop_model"].includes(actionId) && roles_raw.includes("modify")) {
        updated = updated.filter(id => id !== "modify");
        conflict = { type: "swap", removed: "Substantial Modification", reason: "Article 25(1)(b) applies to 'any other natural or legal person, other than the provider'. As the original developer you are the provider — changes you make to your own system are governed by Article 43(4) (updated conformity assessment), not the Article 25(1)(b) third-party trigger.", article: "Article 25(1)(b), Article 43(4)" };
      } else if (!conflict && actionId === "modify" && roles_raw.some(id => ["develop_system", "develop_model"].includes(id))) {
        updated = updated.filter(id => id !== "modify");
        conflict = { type: "block", removed: "Substantial Modification", reason: "Article 25(1)(b) applies to 'any other natural or legal person, other than the provider'. You have indicated that you are the original developer of this system — any changes you make fall under Article 43(4) (updated conformity assessment), not the Article 25(1)(b) third-party modification trigger.", article: "Article 25(1)(b), Article 43(4)" };
      }

      // Rule 4 — develop_* + change_purpose (Art. 25(1)(c): "other third party")
      // Art. 25(1)(c) applies to any distributor, importer, deployer or other third party.
      // As the original developer there is no upstream provider above you.
      if (!conflict && ["develop_system", "develop_model"].includes(actionId) && roles_raw.includes("change_purpose")) {
        updated = updated.filter(id => id !== "change_purpose");
        conflict = { type: "swap", removed: "Purpose Change", reason: "Article 25(1)(c) applies to 'any other distributor, importer, deployer or other third party' using the system outside its originally assessed purpose. As the original developer, there is no separate upstream provider above you — intended purpose is defined by your own conformity assessment under Articles 9 and 43.", article: "Article 25(1)(c), Article 9, Article 43" };
      } else if (!conflict && actionId === "change_purpose" && roles_raw.some(id => ["develop_system", "develop_model"].includes(id))) {
        updated = updated.filter(id => id !== "change_purpose");
        conflict = { type: "block", removed: "Purpose Change", reason: "Article 25(1)(c) applies to 'any other distributor, importer, deployer or other third party' using the system outside its originally assessed purpose. You have indicated that you are the original developer — intended purpose is defined by your own conformity assessment, not by a third party's original specification.", article: "Article 25(1)(c), Article 9, Article 43" };
      }

      // Rule 5 — act_as_ar + any Step 2 action (Art. 22)
      // Art. 22: an AR is mandated solely to act on behalf of the provider.
      // An AR performs no independent technical operations and holds no separate operator role.
      const step2Ids = ["modify", "change_purpose", "brand"];
      if (!conflict && actionId === "act_as_ar" && step2Ids.some(id => roles_raw.includes(id))) {
        const removedNames = step2Ids.filter(id => roles_raw.includes(id)).map(id => orgActions.find(a => a.id === id)?.role || id).join(", ");
        updated = updated.filter(id => !step2Ids.includes(id));
        conflict = { type: "swap", removed: removedNames, reason: "Article 22 defines an Authorised Representative as a person mandated in writing solely to act on behalf of the provider. An Authorised Representative performs no independent technical operations on the system and holds no separate operator obligations. The Step 2 actions describe independent operator activities that are legally incompatible with the Authorised Representative mandate.", article: "Article 22" };
      } else if (!conflict && step2Ids.includes(actionId) && roles_raw.includes("act_as_ar")) {
        updated = updated.filter(id => id !== actionId);
        conflict = { type: "block", removed: orgActions.find(a => a.id === actionId)?.role || actionId, reason: "Article 22 defines an Authorised Representative as a person mandated solely to act on behalf of the provider, performing no independent technical operations on the system. Step 2 actions describe independent operator activities that are legally incompatible with the Authorised Representative mandate. To select a Step 2 action, first deselect Authorised Representative in Step 1.", article: "Article 22" };
      }
    }

    if (conflict) {
      // Stage the pending change — apply only on user confirmation
      setPendingToggle({ actionId, isSelecting, resultingRoles: updated, ...conflict });
      return;
    }

    // No conflict — apply immediately
    if (modificationIds.includes(actionId) && isSelecting) {
      saveAnswer("step2_none", false);
    }
    setRoles_raw(updated);
    saveAnswer("roles_raw", updated);
  };

  const confirmToggle = () => {
    if (!pendingToggle) return;
    const { actionId, isSelecting, resultingRoles } = pendingToggle;
    if (modificationIds.includes(actionId) && isSelecting) {
      saveAnswer("step2_none", false);
    }
    setRoles_raw(resultingRoles);
    saveAnswer("roles_raw", resultingRoles);
    setPendingToggle(null);
  };

  const cancelToggle = () => setPendingToggle(null);

  const handleNoneOfAboveStep2 = () => {
    if (step2None) {
      // Unchecking "None" — just clear the flag
      saveAnswer("step2_none", false);
    } else {
      // Checking "None" — remove all modification activity IDs from roles_raw
      const updated = roles_raw.filter(id => !modificationIds.includes(id));
      setRoles_raw(updated);
      saveAnswer("roles_raw", updated);
      saveAnswer("step2_none", true);
    }
  };

  // Legal role definitions with MODULE 2B reclassification rules
  const legalRoleDefinitions = {
    Provider: {
      title: "Provider",
      description: `
        Under the EU AI Act, you have Provider obligations if you:
        • develop an AI system or AI model and place it on the market,
        • substantially modify an AI system — where the change affects its compliance characteristics (e.g., altering outputs, retraining on new data, changing safety-relevant behaviour),
        • repurpose an AI system for a different intended purpose than originally specified,
        • place an AI system on the market under your own name or trademark.

        You are also reclassified as Provider if you:
        • import AND rebrand an AI system,
        • distribute AND rebrand an AI system, or
        • manufacture a product where the AI system is a safety component.
      `,
      articles: "Articles 3(3), 3(23), 16, 25, 28"
    },
    Importer: {
      title: "Importer",
      description: `
        You are an Importer if you import an AI system from outside the EU
        without placing it under your own name or trademark.
      `,
      articles: "Articles 3(6), 25"
    },
    Distributor: {
      title: "Distributor",
      description: `
        You are a Distributor if you supply or resell the AI system to the market
        without modifying or rebranding it.
      `,
      articles: "Articles 3(7), 26"
    },
    Deployer: {
      title: "Deployer",
      description: `
        You are a Deployer if you use the AI system in your internal operations
        without modifying, retraining, re‑purposing, or rebranding it.
      `,
      articles: "Articles 3(4), 29"
    },
    Product_Manufacturer: {
      title: "Product Manufacturer",
      description: `
        You are a Product Manufacturer if you manufacture a product that integrates an AI system.
        If the AI system fulfils a safety function under sectoral product law, you will be
        reclassified as a Provider automatically.
      `,
      articles: "Article 24"
    },
    Authorised_Representative: {
      title: "Authorised Representative",
      description: `
        You are an Authorised Representative if you are established in the EU and have been
        mandated in writing by a provider established outside the EU to act on their behalf
        for the purposes of the EU AI Act.
      `,
      articles: "Article 22"
    }
  };

  // Preview of MODULE 2B (dynamic live reclassification)
  const computedRoles = roles_raw.length > 0 ? reclassifyRoles(roles_raw || []) : [];

  // Next screen handler
  const handleNext = () => {
    // Clear re-evaluation flag if set
    if (shouldReevaluateRules) {
      setShouldReevaluateRules(false);
    }

    if (roles_raw.length === 0) {
      alert("Please select at least one activity. (Rule ROLE_008)");
      return;
    }

    // The substantiality gate (Yes/No) only applies to 'modify', not 'change_purpose'.
    // change_purpose is definitionally substantial — no answer needed from the user.
    const modifyNeedsGateAnswer =
      roles_raw.includes("modify") &&
      (baseOperationalSelected || isAlreadyUnconditionalProvider);
    if (modifyNeedsGateAnswer && answers.isSubstantialModification === undefined) {
      alert("Please answer the substantiality question before proceeding.");
      return;
    }

    // MODULE 2B — apply legal reclassification
    try {
      const computed = reclassifyRoles(roles_raw || []);
      setRoles(computed);
    } catch (err) {
      console.error("Role reclassification error:", err);
    }

    navigate("/screen3");
  };

  return (
    <div className="screen-container">
      <div className="screen-header">
        <h1>Part 2: What Does Your Organisation Do?</h1>
        <p className="subtitle">
          Select all applicable activities with AI systems or AI models.
          These will be transformed into legal EU AI Act roles automatically.
        </p>
      </div>

      {/* Mutual-exclusivity confirmation modal */}
      {pendingToggle && (
        <div className="modal-overlay" onClick={cancelToggle}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <strong>⚠️ Selection Conflict</strong>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: "12px" }}>
                {pendingToggle.type === "swap"
                  ? <><strong>{pendingToggle.removed}</strong> will be deselected because it is legally incompatible with your new selection.</>                  : <><strong>{pendingToggle.removed}</strong> cannot be selected in combination with your current selections.</>}
              </p>
              <p style={{ marginBottom: "14px" }}>{pendingToggle.reason}</p>
              <span className="source-tag" title={pendingToggle.article}>Source</span>
            </div>
            <div className="modal-footer">
              {pendingToggle.type === "swap" ? (
                <>
                  <button className="btn btn-secondary" onClick={cancelToggle}>Cancel</button>
                  <button className="btn btn-primary" onClick={confirmToggle}>Confirm — remove {pendingToggle.removed}</button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={cancelToggle}>Understood</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="screen-content">
        {/* STEP 1: Organisational Activities — always shown */}
        <div style={{ marginBottom: "32px" }}>
          <h3>Step 1: What is your organisation's role?</h3>
          <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>
            Select all roles your organisation holds in relation to this AI system or AI model. Multiple selections are allowed.
          </p>
          <div className="helper-box" style={{ marginBottom: "16px", fontSize: "0.9em" }}>
            <strong>📘 Key distinction — AI system vs. AI model:</strong>
            <ul style={{ marginTop: "8px", marginBottom: "8px", marginLeft: "20px" }}>
              <li><strong>AI SYSTEM</strong> <span className="source-tag" title="Article 3(1)">Source</span>: A machine-based system designed to operate with varying levels of autonomy that, for a given set of objectives, infers from inputs how to generate outputs such as predictions, content, recommendations, or decisions that can influence physical or virtual environments.</li>
              <li><strong>GENERAL-PURPOSE AI MODEL</strong> <span className="source-tag" title="Article 3(63)">Source</span>: An AI model trained on large amounts of data, capable of serving a variety of purposes, and that can be integrated into a variety of downstream AI systems or applications.</li>
            </ul>
          </div>
          <div className="options-group checkbox-group">
            {baseActivities.map((action) => (
              <label key={action.id} className="checkbox-option">
                <input
                  type="checkbox"
                  checked={roles_raw.includes(action.id)}
                  onChange={() => handleToggleAction(action.id)}
                />
                <span>
                  {action.role && <strong>{action.role}</strong>}
                  {action.role && " — "}
                  {action.label}
                  {action.article && (
                    <span className="source-tag" title={action.article} style={{ marginLeft: "6px" }}>Source</span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* STEP 2: Actions on Existing AI Systems — shown after any Step 1 selection */}
        {roles_raw.length > 0 && (
        <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "2px solid var(--border-color)" }}>
          <h3>Step 2: Actions on Existing AI Systems</h3>
          <p style={{ marginBottom: "12px", color: "var(--text-light)" }}>
            If you are working with an AI system that you did not develop — select any additional actions that apply. These may trigger Provider reclassification under Article 25:
          </p>

          <div className="options-group checkbox-group">
            {modificationActivities.map((action) => {
              return (
                <label key={action.id} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={roles_raw.includes(action.id)}
                    onChange={() => handleToggleAction(action.id)}
                  />
                  <span>
                    {action.role && <strong>{action.role}</strong>}
                    {action.role && " — "}
                    {action.label}
                    {action.article && (
                      <span className="source-tag" title={action.article} style={{ marginLeft: "6px" }}>Source</span>
                    )}
                  </span>
                </label>
              );
            })}
            <hr style={{ margin: "8px 0", borderColor: "var(--border-color)" }} />
            {/* None of the above — mutually exclusive with all Step 2 options */}
            <label className="checkbox-option">
              <input
                type="checkbox"
                checked={step2None}
                onChange={handleNoneOfAboveStep2}
              />
              <span>
                None of the above — we do not modify, change the purpose of, or rebrand this AI system
              </span>
            </label>
          </div>
        </div>

        )}

        {/* STEP 3 (conditional): Modification Analysis — change_purpose informational + modify gate */}
        {showSubstantialityGate && (
          <div style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "2px solid var(--border-color)" }}>
            <h3>
              Step 3: Modification Analysis{" "}
              <span className="source-tag" title="Article 3(23), Article 25(1)(b)/(c), Article 43(4)">Source</span>
            </h3>

            {/* Part B: modify — substantiality Yes/No gate */}
            {roles_raw.includes("modify") && (
              <>
                <p style={{ marginBottom: "12px"}}>
                  Does your modification qualify as a substantial modification under Article 3(23)?
                </p>
                <div className="options-group radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="isSubstantialModification"
                      value="yes"
                      checked={answers.isSubstantialModification === "yes"}
                      onChange={() => saveAnswer("isSubstantialModification", "yes")}
                    />
                    <span>
                      Yes — this change was not foreseen in the original provider’s conformity assessment and affects the system’s outputs, capabilities, risk thresholds, or compliance with this Regulation{" "}
                      <span className="source-tag" title={isAlreadyUnconditionalProvider ? "Article 43(4)" : "Article 3(23), Article 25(1)(b)"}>Source</span>
                    </span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="isSubstantialModification"
                      value="no"
                      checked={answers.isSubstantialModification === "no"}
                      onChange={() => saveAnswer("isSubstantialModification", "no")}
                    />
                    <span>
                      No — this change was pre-planned in the original conformity assessment or does not affect the system’s compliance characteristics{" "}
                      <span className="source-tag" title="Article 43(4), Article 3(23)">Source</span>
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Unified result banner — single banner covering all active triggers */}
            {(() => {
              const hasChangePurpose = roles_raw.includes("change_purpose");
              const hasModify = roles_raw.includes("modify");
              const gateYes = answers.isSubstantialModification === "yes";
              const gateNo = answers.isSubstantialModification === "no";

              if (hasModify && !gateYes && !gateNo) return null;
              if (!hasChangePurpose && !hasModify) return null;

              const modifySubstantial = hasModify && gateYes;
              const anySubstantial = hasChangePurpose || modifySubstantial;

              let description = "";
              if (hasChangePurpose && hasModify) {
                description = gateYes
                  ? "Both your intended purpose change and your modification qualify as substantial."
                  : "Your intended purpose change qualifies as substantial. Your modification falls within pre-planned parameters and does not independently trigger reclassification.";
              } else if (hasChangePurpose) {
                description = "Changing the intended purpose always qualifies as a substantial modification.";
              } else {
                description = gateYes
                  ? "This modification qualifies as substantial."
                  : "This modification falls within pre-planned parameters and is not substantial.";
              }

              let consequence = "";
              if (anySubstantial) {
                consequence = isAlreadyUnconditionalProvider
                  ? "As Provider, a new or updated conformity assessment is required if the system is high-risk."
                  : "If the system is confirmed high-risk in Parts 3–6, you will be reclassified as Provider. For minimal or limited-risk systems, this trigger does not apply.";
              } else {
                consequence = isAlreadyUnconditionalProvider
                  ? "Your existing conformity assessment remains valid and covers this modification."
                  : "The substantial modification trigger does not apply. You will retain your base operational role regardless of risk level.";
              }

              const sourceArticle = (() => {
                if (hasChangePurpose && modifySubstantial)
                  return isAlreadyUnconditionalProvider ? "Article 3(23), Article 43(4)" : "Article 3(23), Article 25(1)(b), Article 25(1)(c)";
                if (hasChangePurpose)
                  return isAlreadyUnconditionalProvider ? "Article 3(23), Article 43(4)" : "Article 3(23), Article 25(1)(c)";
                if (modifySubstantial)
                  return isAlreadyUnconditionalProvider ? "Article 43(4)" : "Article 3(23), Article 25(1)(b)";
                return "Article 43(4), Article 3(23)";
              })();

              const bannerClass = anySubstantial ? "alert-warning" : "alert-info";
              const icon = anySubstantial ? "⚠️" : "ℹ️";
              const title = anySubstantial
                ? (isAlreadyUnconditionalProvider ? "New Conformity Assessment Required" : "Conditional Reclassification")
                : (isAlreadyUnconditionalProvider ? "Conformity Assessment Remains Valid" : "No Reclassification — Even If High-Risk");

              return (
                <div className={`info-box ${bannerClass}`} style={{ marginTop: "16px" }}>
                  <strong>{icon} {title}:</strong>{" "}
                  {description} {consequence}{" "}
                  <span className="source-tag" title={sourceArticle}>Source</span>
                </div>
              );
            })()}
          </div>
        )}

        {/* STEP 3 or 4: Legal Roles result — shown as soon as any role is computed */}
        {computedRoles.length > 0 && (
          <div style={{ marginTop: "32px", paddingTop: "32px", borderTop: "2px solid var(--border-color)" }}>
            <h3>Step {showSubstantialityGate ? "4" : "3"}: Your Legal Roles Under the EU AI Act</h3>
            {(() => {
              // Detect reclassifications - ALL MODULE 2B scenarios
              const hasProductManufacturer = roles_raw.includes("product_manufacturer");
              const hasImporter = roles_raw.includes("import");
              const hasDistributor = roles_raw.includes("distribute");
              const hasDeployer = roles_raw.includes("deploy");
              const hasBranding = roles_raw.includes("brand");
              const hasPlaceOnMarket = roles_raw.includes("place_on_market");

              // D1 fix: separate original development (Art. 3(3) — unconditional Provider) from
              // reclassification triggers (Art. 25(1)/28(1) — conditional on base operational role).
              const hasDevelopmentActivity = roles_raw.some(a => ["develop_system", "develop_model"].includes(a));
              const hasModificationActivity = roles_raw.some(a => ["modify", "change_purpose"].includes(a));

              const isProviderNow = computedRoles.includes("Provider");

              // When the user is already unconditionally Provider through a primary path (market
              // placement or original development under Art. 3(3)), don't show reclassification
              // framing — they are accumulating additional obligations, not being "converted" from
              // a different base role. Art. 25(1) triggers are additive in this context.
              const isAlreadyUnconditionalProvider = hasDevelopmentActivity || hasPlaceOnMarket;

              // Detect PENDING reclassification — Article 25(1) triggers that apply only to
              // high-risk systems. At Part 2, risk level is unknown, so these cannot yet fire.
              // They are confirmed (or not) once Parts 3–6 are completed.
              const hasPendingBranding = hasBranding && !hasDevelopmentActivity;
              // Standalone modify/change_purpose are ALSO high-risk conditional (Art. 25(1)(b)/(c)).
              // The requirement for a base operational role is removed: Art. 25 covers "other third parties".
              // The substantiality gate (Yes/No) only applies to 'modify'. 'change_purpose' is
              // definitionally substantial under Art. 3(23) prong 2 — ruling out the gate answer
              // for 'modify' must NOT extinguish 'change_purpose' as a pending trigger.
              const modificationIsRuledOutByGate =
                roles_raw.includes("modify") &&
                !roles_raw.includes("change_purpose") &&
                answers.isSubstantialModification === "no";
              const hasPendingModification = hasModificationActivity && !hasDevelopmentActivity && !modificationIsRuledOutByGate;
              // Show pending notice only when these triggers exist but Provider is NOT yet assigned
              // (i.e., risk is not yet confirmed). Once high-risk is confirmed and the user revisits
              // Part 2, isProviderNow will be true and the confirmed reclassification banner shows.
              const hasPendingReclassification = (hasPendingBranding || hasPendingModification) && !isProviderNow;

              // Determine reclassification scenario — covers ALL paths that convert a base role to Provider.
              let reclassificationReason = null;
              let reclassificationArticle = null;
              let originalRoles = []; // the base role(s) before reclassification

              if (isProviderNow && !isAlreadyUnconditionalProvider) {
                // RECLASS_005: Importer + Branding → Provider (Article 25(1)(a))
                if (hasImporter && hasBranding && !hasModificationActivity && !hasPlaceOnMarket && !hasDevelopmentActivity) {
                  originalRoles = ["Importer"];
                  reclassificationReason = "As an Importer placing this AI system under your own name or trademark, you have been reclassified to Provider.";
                  reclassificationArticle = "Article 25(1)(a)";
                }
                // RECLASS_006: Distributor + Branding → Provider (Article 25(1)(a))
                else if (hasDistributor && hasBranding && !hasImporter && !hasModificationActivity && !hasPlaceOnMarket && !hasDevelopmentActivity) {
                  originalRoles = ["Distributor"];
                  reclassificationReason = "As a Distributor placing this AI system under your own name or trademark, you have been reclassified to Provider.";
                  reclassificationArticle = "Article 25(1)(a)";
                }
                // D2 fix: Deployer + change_purpose → Provider (Article 25(1)(c))
                else if (hasDeployer && roles_raw.includes("change_purpose") && !roles_raw.includes("modify") && !hasBranding && !hasPlaceOnMarket && !hasDevelopmentActivity) {
                  originalRoles = ["Deployer"];
                  reclassificationReason = "As a Deployer using this AI system outside its originally specified intended purpose, you have been reclassified to Provider. The new intended purpose brings the system within the high-risk category.";
                  reclassificationArticle = "Article 25(1)(c)";
                }
                // D2 fix: Deployer + modify → Provider (Article 25(1)(b))
                else if (hasDeployer && roles_raw.includes("modify") && !hasBranding && !hasPlaceOnMarket && !hasDevelopmentActivity) {
                  originalRoles = ["Deployer"];
                  reclassificationReason = "As a Deployer making a substantial modification to this high-risk AI system, you have been reclassified to Provider.";
                  reclassificationArticle = "Article 25(1)(b)";
                }
                // Importer or Distributor + substantial modification → Provider (Article 25(1)(b)/(c))
                else if ((hasImporter || hasDistributor) && hasModificationActivity && !hasBranding && !hasPlaceOnMarket && !hasDevelopmentActivity) {
                  const baseRole = hasImporter ? "an Importer" : "a Distributor";
                  const isChangePurpose = roles_raw.includes("change_purpose") && !roles_raw.includes("modify");
                  originalRoles = [hasImporter ? "Importer" : "Distributor"];
                  reclassificationReason = isChangePurpose
                    ? `As ${baseRole} changing this AI system's intended purpose to a high-risk use, you have been reclassified to Provider.`
                    : `As ${baseRole} making a substantial modification to this high-risk AI system, you have been reclassified to Provider.`;
                  reclassificationArticle = isChangePurpose ? "Article 25(1)(c)" : "Article 25(1)(b)";
                }
                // Standalone change_purpose (no base op role) → Provider (Article 25(1)(c))
                else if (roles_raw.includes("change_purpose") && !roles_raw.includes("modify") && !hasDeployer && !hasImporter && !hasDistributor && !hasProductManufacturer && !hasBranding && !hasDevelopmentActivity) {
                  originalRoles = [];
                  reclassificationReason = "By changing this AI system's intended purpose in a way that makes it high-risk, you are reclassified as Provider under the EU AI Act.";
                  reclassificationArticle = "Article 25(1)(c)";
                }
                // Standalone modify (no base op role) → Provider (Article 25(1)(b))
                else if (roles_raw.includes("modify") && !hasDeployer && !hasImporter && !hasDistributor && !hasProductManufacturer && !hasBranding && !hasDevelopmentActivity) {
                  originalRoles = [];
                  reclassificationReason = "By making a substantial modification to this high-risk AI system, you are reclassified as Provider under the EU AI Act.";
                  reclassificationArticle = "Article 25(1)(b)";
                }
                // Product Manufacturer + branding or modification → Provider (Article 25(1))
                else if (hasProductManufacturer && (hasModificationActivity || hasBranding) && !hasDevelopmentActivity) {
                  originalRoles = ["Product Manufacturer"];
                  reclassificationReason = "As a Product Manufacturer placing this AI system under your own name or making a substantial modification, you have been reclassified to Provider.";
                  reclassificationArticle = "Article 25(1)";
                }
                // Branding alone (no base operational role) → Provider (Article 25(1)(a))
                else if (hasBranding && !hasImporter && !hasDistributor && !hasDeployer && !hasProductManufacturer && !hasDevelopmentActivity && !hasModificationActivity) {
                  originalRoles = [];
                  reclassificationReason = "By placing this AI system under your own name or trademark, you are legally a Provider regardless of your other activities.";
                  reclassificationArticle = "Article 25(1)(a)";
                }
                // Place on market alone → Provider (Article 16)
                else if (hasPlaceOnMarket && !hasDevelopmentActivity && !hasModificationActivity && !hasBranding) {
                  originalRoles = [];
                  reclassificationReason = "By placing this AI system on the EU market, you bear Provider obligations under the AI Act.";
                  reclassificationArticle = "Article 16, Article 3(3)";
                }
                // Generic fallback for any remaining base role + trigger combo (D4 fix: cite Art. 25(1))
                else if ((hasImporter || hasDistributor || hasDeployer || hasProductManufacturer) && (hasModificationActivity || hasBranding) && !hasDevelopmentActivity) {
                  const baseRole = hasImporter ? "Importer" : hasDistributor ? "Distributor" : hasDeployer ? "Deployer" : "Product Manufacturer";
                  originalRoles = [baseRole];
                  reclassificationReason = `Your base role as ${baseRole} has been reclassified to Provider.`;
                  reclassificationArticle = "Article 25(1)";
                }
              }

              const wasReclassified = reclassificationReason !== null;

              // Build full role list for display, including any retained non-Provider roles
              const retainedNonProviderRoles = computedRoles
                .filter(r => r !== "Provider")
                .map(r => legalRoleDefinitions[r]?.title || r);

              // Cooperation (Article 25(2)) applies only when you are building on or modifying
              // someone else's AI system/model. It does NOT apply when you are the original
              // model developer (you ARE the upstream provider — there is no one above you).
              // D3 fix: exclude develop_model from triggering needsCooperation.
              const hasModelDev = roles_raw.includes("develop_model");
              const hasDerivativeActivity = roles_raw.some(id =>
                ["develop_system", "modify", "change_purpose", "brand"].includes(id)
              );
              const needsCooperation = computedRoles.includes("Provider") && hasDerivativeActivity && !hasModelDev;

              // Build description of what would change if the system is confirmed high-risk
              let pendingTriggerArticle = "";
              let pendingTriggerFrom = [];
              let pendingTriggerReason = "";
              if (hasPendingReclassification) {
                if (hasPendingBranding && hasPendingModification) {
                  const baseRole = hasDeployer ? "Deployer" : hasImporter ? "Importer" : hasDistributor ? "Distributor" : null;
                  pendingTriggerFrom = baseRole ? [baseRole] : [];
                  pendingTriggerReason = "You are placing this AI system under your own name or trademark and making a substantial modification.";
                  pendingTriggerArticle = "Article 25(1)(a), Article 25(1)(b)";
                } else if (hasPendingBranding) {
                  pendingTriggerFrom = [
                    hasDeployer ? "Deployer" : hasImporter ? "Importer" : hasDistributor ? "Distributor" : "Operator"
                  ];
                  pendingTriggerReason = "You are placing this AI system under your own name or trademark.";
                  pendingTriggerArticle = "Article 25(1)(a)";
                } else if (hasPendingModification) {
                  const baseRole = hasDeployer ? "Deployer" : hasImporter ? "Importer" : hasDistributor ? "Distributor" : null;
                  pendingTriggerFrom = baseRole ? [baseRole] : [];
                  const isChangePurpose = roles_raw.includes("change_purpose") && !roles_raw.includes("modify");
                  pendingTriggerReason = isChangePurpose
                    ? "You are using this AI system outside its originally specified intended purpose. If this new use is high-risk, you become Provider."
                    : "You are making a substantial modification to this AI system. If the system is high-risk, you become Provider.";
                  pendingTriggerArticle = isChangePurpose ? "Article 25(1)(c)" : "Article 25(1)(b)";
                }
              }

              // Flag when model development is selected — obligations depend on GPAI status in Part 7
              const hasSystemDev = roles_raw.some(id => ["develop_system", "modify", "change_purpose", "place_on_market", "brand"].includes(id));

              // Build role sentence — distinguish AI Model Provider from AI System Provider
              const roleNames = computedRoles.flatMap(r => {
                if (r === "Provider") {
                  if (hasModelDev && hasSystemDev) return ["AI Model Provider", "AI System Provider"];
                  if (hasModelDev) return ["AI Model Provider"];
                  return ["AI System Provider"];
                }
                return [legalRoleDefinitions[r]?.title || r];
              });
              const roleSentence = roleNames.length === 1
                ? roleNames[0]
                : roleNames.slice(0, -1).join(", ") + " and " + roleNames[roleNames.length - 1];

              return (
                <>
                  {wasReclassified ? (
                    <div className="info-box alert-warning">
                      <strong>⚠️ Role Reclassification</strong> <span className="source-tag" title={reclassificationArticle}>Source</span>
                      <div style={{ marginTop: "8px" }}>{reclassificationReason}</div>
                      <div style={{ marginTop: "6px" }}>
                        Your legal role: <strong>{roleSentence}</strong>
                      </div>
                      {retainedNonProviderRoles.length > 0 && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Also retained:</strong> {retainedNonProviderRoles.join(", ")} obligations continue to apply alongside Provider obligations.
                        </div>
                      )}
                      <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                        You have full Provider obligations under the EU AI Act.
                      </div>
                      {needsCooperation && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Note:</strong> The original provider must cooperate with you by providing necessary technical documentation, information, and access to enable your compliance <span className="source-tag" title="Article 25(2)">Source</span>.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="info-box alert-success">
                      <strong>✓ Legal Role Determined:</strong>
                      Your legal role(s) under the EU AI Act: <strong>{roleSentence}</strong>.
                      {computedRoles.map((r, idx) => {
                        const arts = legalRoleDefinitions[r]?.articles;
                        return arts ? (
                          <span key={idx} className="source-tag" title={arts}>
                            Source
                          </span>
                        ) : null;
                      })}
                      {hasModelDev && !hasSystemDev && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Note:</strong> Your exact Provider obligations — whether for a General Purpose AI (GPAI) model or a narrowly scoped AI system — will be determined in Part 7.
                        </div>
                      )}
                      {hasModelDev && hasSystemDev && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Note:</strong> You are developing both an AI model and an AI system. Part 7 will determine whether GPAI model obligations apply in addition to your AI system Provider obligations.
                        </div>
                      )}
                      {hasDevelopmentActivity && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Legal basis{" "}<span className="source-tag" title="Article 3(3)">Source</span>:</strong>{" "}
                          Any entity that develops an AI system or a general-purpose AI model and places it on the market or puts it into service under its own name or trademark is a Provider — regardless of the system’s risk level.
                        </div>
                      )}
                      {hasDevelopmentActivity && hasDeployer && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Note (Art. 3(3) path 2):</strong> By developing this AI system AND operating it under your own authority, you are putting it “into service under your own name” — a Provider path that does not require external market placement.
                        </div>
                      )}
                      {hasDevelopmentActivity && !hasPlaceOnMarket && !hasDeployer && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em", borderTop: "1px solid #c3e6cb", paddingTop: "8px" }}>
                          <strong>⚠️ Contract development?</strong> This classification assumes you will place the system on the EU market or use it under your own name or trademark. If you are developing as a contracted third party and the commissioning entity will commercialise the system under their own name, they may be the Provider — not you. In that case, consider selecting only the activities that genuinely apply to your organisation.
                        </div>
                      )}
                      {needsCooperation && (
                        <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                          <strong>Note:</strong> The original provider must cooperate with you by providing necessary technical documentation, information, and access to enable your compliance <span className="source-tag" title="Article 25(2)">Source</span>.
                        </div>
                      )}
                    </div>
                  )}
                  {hasPendingReclassification && (
                    <div className="info-box alert-info" style={{ marginTop: "12px" }}>
                      <strong>⚠️ Conditional Reclassification — Awaiting Risk Classification</strong>
                      <span className="source-tag" style={{ marginLeft: "6px" }} title={pendingTriggerArticle}>Source</span>
                      <div style={{ marginTop: "8px" }}>
                        {pendingTriggerReason} Under the EU AI Act, this reclassifies you as Provider only if this system is determined to be high-risk in Parts 3–6.
                        For minimal or limited-risk AI systems this trigger does not apply.
                      </div>

                      <div style={{ marginTop: "8px", fontSize: "0.9em" }}>
                        Continue to Parts 3–6 to determine whether your system qualifies as high-risk.
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
        <div className="screen-navigation">
          <button className="btn btn-secondary" onClick={() => navigateBack(navigate)}>
            ← Back
          </button>

          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={roles_raw.length === 0}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
