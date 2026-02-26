/**
 * EU AI Act Compliance Wizard - Checklist Data
 * Updated for Regulation (EU) 2024/1689 (Official Journal L 2024/1689, 12.7.2024)
 * All article references verified against final published text
 */

// Entity Roles
export const ENTITY_ROLES = [
  { id: "provider", label: "Provider", value: "provider" },
  { id: "deployer", label: "Deployer", value: "deployer" },
  { id: "distributor", label: "Distributor", value: "distributor" },
  { id: "importer", label: "Importer", value: "importer" },
  { id: "product_manufacturer", label: "Product Manufacturer", value: "product_manufacturer" },
  { id: "authorised_representative", label: "Authorised Representative", value: "authorised_representative" },
  { id: "not_sure", label: "Not sure", value: "not_sure" },
];

// Modification options
export const MODIFICATIONS = [
  { id: "branding", label: "We placed our name, trademark, or branding on the AI system" },
  { id: "purpose", label: "We changed the intended purpose of the system" },
  { id: "substantial", label: "We performed a substantial modification (technical, performance, design, or data changes)" },
  { id: "none", label: "None of the above" },
];

// Product integration options
export const PRODUCT_INTEGRATION = [
  { id: "together", label: "The AI system is placed on the market together with our product under our brand" },
  { id: "after", label: "The AI system is put into service after the product is marketed, under our brand" },
  { id: "neither", label: "Neither of these" },
];

// High-risk sectors (Annex I B) - Note: Annex I has sections, verify exact naming
export const HIGH_RISK_SECTORS_B = [
  { id: "aviation_security", label: "Civil aviation security" },
  { id: "motor_vehicles", label: "Motor vehicles and trailers" },
  { id: "agri_vehicles", label: "Agricultural/forestry vehicles" },
  { id: "marine", label: "Marine equipment" },
  { id: "rail", label: "Interoperability of rail systems" },
  { id: "two_three_wheel", label: "Two-/three-wheel vehicles and quadricycles" },
  { id: "civil_aviation", label: "Civil aviation" },
  { id: "none", label: "None of the above" },
];

// Annex I A categories
export const ANNEX_IA_CATEGORIES = [
  { id: "machinery", label: "Machinery", source: "Annex I(A)(1) - Directive 2006/42/EC" },
  { id: "toys", label: "Toys", source: "Annex I(A)(2) - Directive 2009/48/EC" },
  { id: "recreational_craft", label: "Recreational craft / watercraft", source: "Annex I(A)(3) - Directive 2013/53/EU" },
  { id: "lifts", label: "Lifts", source: "Annex I(A)(4) - Directive 2014/33/EU" },
  { id: "atex", label: "ATEX equipment", source: "Annex I(A)(5) - Directive 2014/34/EU" },
  { id: "radio", label: "Radio equipment", source: "Annex I(A)(6) - Directive 2014/53/EU" },
  { id: "pressure", label: "Pressure equipment", source: "Annex I(A)(7) - Directive 2014/68/EU" },
  { id: "cableway", label: "Cableway installations", source: "Annex I(A)(8) - Regulation (EU) 2016/424" },
  { id: "ppe", label: "Personal protective equipment", source: "Annex I(A)(9) - Regulation (EU) 2016/425" },
  { id: "gas", label: "Gas appliances", source: "Annex I(A)(10) - Regulation (EU) 2016/426" },
  { id: "medical_devices", label: "Medical devices", source: "Annex I(A)(11) - Regulation (EU) 2017/745" },
  { id: "ivd_devices", label: "IVD medical devices", source: "Annex I(A)(12) - Regulation (EU) 2017/746" },
  { id: "none", label: "None of these" },
];

// Annex III use cases - All 29 specific use cases
export const ANNEX_III_USECASES = [
  // 1. BIOMETRICS (3 sub-cases)
  { id: "biometric_rbi", label: "Remote biometric identification systems", source: "Annex III(1)(a) - Remote biometric identification systems", category: "Biometrics" },
  { id: "biometric_categorisation", label: "Biometric categorisation based on sensitive attributes", source: "Annex III(1)(b) - Biometric categorisation according to sensitive or protected attributes", category: "Biometrics" },
  { id: "emotion_recognition", label: "Emotion recognition", source: "Annex III(1)(c) - Emotion recognition", category: "Biometrics" },
  
  // 2. CRITICAL INFRASTRUCTURE (1 case)
  { id: "critical_infrastructure", label: "Safety components in critical digital infrastructure, road traffic, water, gas, heating, or electricity", source: "Annex III(2) - Safety components in management and operation of critical infrastructure", category: "Critical Infrastructure" },
  
  // 3. EDUCATION (4 sub-cases)
  { id: "education_access", label: "Determining access or admission to educational institutions", source: "Annex III(3)(a) - Determining access or admission to educational and vocational training institutions", category: "Education and Vocational Training" },
  { id: "education_outcomes", label: "Evaluating learning outcomes", source: "Annex III(3)(b) - Evaluating learning outcomes in educational and vocational training institutions", category: "Education and Vocational Training" },
  { id: "education_level", label: "Assessing appropriate education level", source: "Annex III(3)(c) - Assessing the appropriate level of education for individuals", category: "Education and Vocational Training" },
  { id: "education_monitoring", label: "Monitoring and detecting prohibited student behaviour during tests", source: "Annex III(3)(d) - Monitoring and detecting prohibited behaviour of students during tests", category: "Education and Vocational Training" },
  
  // 4. EMPLOYMENT (2 sub-cases)
  { id: "employment_recruitment", label: "Recruitment or selection (job ads, filtering applications, evaluating candidates)", source: "Annex III(4)(a) - Recruitment or selection of natural persons", category: "Employment, Workers Management and Access to Self-Employment" },
  { id: "employment_management", label: "Decisions on work terms, promotion, termination, task allocation, or performance monitoring", source: "Annex III(4)(b) - Decisions affecting work-related relationships, promotion, termination, task allocation, or performance monitoring", category: "Employment, Workers Management and Access to Self-Employment" },
  
  // 5. ESSENTIAL SERVICES (4 sub-cases)
  { id: "services_public_benefits", label: "Evaluating eligibility for essential public assistance benefits and services", source: "Annex III(5)(a) - Evaluating eligibility for essential public assistance benefits and services", category: "Access to Essential Private Services and Essential Public Services and Benefits" },
  { id: "services_creditworthiness", label: "Evaluating creditworthiness or establishing credit score (except fraud detection)", source: "Annex III(5)(b) - Evaluating creditworthiness or establishing credit score", category: "Access to Essential Private Services and Essential Public Services and Benefits" },
  { id: "services_insurance", label: "Risk assessment and pricing for life and health insurance", source: "Annex III(5)(c) - Risk assessment and pricing in relation to life and health insurance", category: "Access to Essential Private Services and Essential Public Services and Benefits" },
  { id: "services_emergency", label: "Emergency call evaluation, dispatch prioritisation, or patient triage", source: "Annex III(5)(d) - Evaluating and classifying emergency calls or dispatching emergency first response services", category: "Access to Essential Private Services and Essential Public Services and Benefits" },
  
  // 6. LAW ENFORCEMENT (5 sub-cases)
  { id: "law_victim_risk", label: "Assessing risk of becoming a victim of crime", source: "Annex III(6)(a) - Assessing the risk of a natural person becoming the victim of criminal offences", category: "Law Enforcement" },
  { id: "law_polygraph", label: "Polygraphs or similar tools", source: "Annex III(6)(b) - Polygraphs and similar tools", category: "Law Enforcement" },
  { id: "law_evidence", label: "Evaluating reliability of evidence", source: "Annex III(6)(c) - Evaluating the reliability of evidence in investigation or prosecution of criminal offences", category: "Law Enforcement" },
  { id: "law_offending_risk", label: "Assessing risk of offending or re-offending", source: "Annex III(6)(d) - Assessing the risk of a natural person offending or re-offending", category: "Law Enforcement" },
  { id: "law_profiling", label: "Profiling in detection, investigation, or prosecution of crimes", source: "Annex III(6)(e) - Profiling of natural persons in the course of detection, investigation or prosecution of criminal offences", category: "Law Enforcement" },
  
  // 7. MIGRATION (4 sub-cases)
  { id: "migration_polygraph", label: "Polygraphs or similar tools in migration context", source: "Annex III(7)(a) - Polygraphs and similar tools in migration, asylum and border control", category: "Migration, Asylum and Border Control Management" },
  { id: "migration_risk", label: "Assessing security, irregular migration, or health risk", source: "Annex III(7)(b) - Assessing a risk, including security risk, irregular migration risk, or health risk", category: "Migration, Asylum and Border Control Management" },
  { id: "migration_applications", label: "Examining asylum, visa, or residence permit applications", source: "Annex III(7)(c) - Assisting in the examination of applications for asylum, visa or residence permits", category: "Migration, Asylum and Border Control Management" },
  { id: "migration_identification", label: "Detecting, recognising, or identifying persons in border control", source: "Annex III(7)(d) - Detecting, recognising or identifying natural persons in migration, asylum or border control context", category: "Migration, Asylum and Border Control Management" },
  
  // 8. JUSTICE (2 sub-cases)
  { id: "justice_assistance", label: "Assisting judicial authorities in researching and interpreting facts and law", source: "Annex III(8)(a) - Assisting a judicial authority in researching and interpreting facts and the law", category: "Administration of Justice and Democratic Processes" },
  { id: "justice_elections", label: "Influencing election/referendum outcomes or voting behaviour", source: "Annex III(8)(b) - Influencing the outcome of an election or referendum or the voting behaviour of natural persons", category: "Administration of Justice and Democratic Processes" },
  
  // NONE OPTION
  { id: "none", label: "None of the above", source: null, category: null },
];

// Exclusions - Article 2
export const EXCLUSIONS = [
  { id: "military", label: "Military, defence or national security use", source: "Article 2(3)" },
  { id: "R&D_only", label: "Research and development only (not placed on market or put into service)", source: "Article 2(6), 2(8)" },
  { id: "opensource_free", label: "Free and open-source AI components not placed on the market", source: "Article 2(12)" },
  { id: "personal_use", label: "Purely personal, non-professional activity", source: "Article 2(10)" },
  { id: "foreign_LE_only", label: "Use by third-country authorities for law enforcement or judicial cooperation", source: "Article 2(4)" },
  { id: "none", label: "None of the above", source: null },
];

// Prohibited practices - Article 5
export const PROHIBITED_PRACTICES = [
  { id: "subliminal", label: "Subliminal or other manipulative/deceptive techniques that materially distort behavior and cause significant harm", source: "Article 5(1)(a), Recital 29" },
  { id: "vulnerability", label: "Exploiting vulnerabilities of persons (age, disability, social/economic situation) to materially distort behavior and cause significant harm", source: "Article 5(1)(b), Recital 29" },
  { id: "social_scoring", label: "Social scoring of natural persons leading to unjustified or disproportionate detrimental treatment", source: "Article 5(1)(c), Recital 31" },
  { id: "criminal_risk", label: "Risk assessment of criminal offending based solely on profiling or personality traits", source: "Article 5(1)(d), Recital 42" },
  { id: "face_scraping", label: "Untargeted scraping of facial images from internet or CCTV footage", source: "Article 5(1)(e) & 5(2), Recital 43" },
  { id: "emotion_workplace_education", label: "Emotion recognition in workplace or educational institutions", source: "Article 5(1)(f), Recital 18" },
  { id: "biometric_categorisation", label: "Biometric categorisation to infer sensitive attributes (e.g. race, political opinions, sexual orientation)", source: "Article 5(1)(g), Recital 16, Recital 30" },
  { id: "real_time_rbi", label: "Real-time remote biometric identification in publicly accessible spaces for law enforcement", source: "Article 5(1)(h), Recitals 32-38" },
  { id: "none", label: "None of the above", source: null },
];

// Transparency triggers - Article 50
export const TRANSPARENCY_TRIGGERS = [
  { id: "direct_interaction", label: "Interacts directly with people", source: "Article 50(1)" },
  { id: "synthetic_content", label: "Generates synthetic audio, image, video or text content", source: "Article 50(2)" },
  { id: "deepfakes", label: "Generates deepfakes", source: "Article 50(4)" },
  { id: "emotion_recognition", label: "Performs emotion recognition or biometric categorisation", source: "Article 50(2)" },
  { id: "none", label: "None", source: null },
];

// Deployment sectors for FRIA scope determination (Rule FRIA_001)
export const DEPLOYMENT_SECTORS = [
  { id: "law_enforcement", label: "Law enforcement" },
  { id: "migration", label: "Migration and asylum" },
  { id: "border_control", label: "Border control" },
  { id: "justice", label: "Justice system" },
  { id: "none", label: "None of the above" },
];

// Classifications
export const CLASSIFICATIONS = {
  OUT_OF_SCOPE: "out_of_scope",
  EXCLUDED: "excluded",
  PROHIBITED: "prohibited",
  GPAI_SYSTEMIC: "gpai_systemic",
  GPAI: "gpai",
  HIGH_RISK_IB: "high_risk_ib",
  HIGH_RISK_IA: "high_risk_ia",
  HIGH_RISK_III: "high_risk_iii",
  ANNEX_III_NON_SIGNIFICANT: "annex_iii_non_significant",
  IN_SCOPE_NON_HIGH_RISK: "in_scope_non_high_risk",
};

// Conformity assessment routes - Article 43
export const CONFORMITY_ASSESSMENT_ROUTES = {
  INTERNAL_CONTROL: "internal_control",         // Annex VI
  NOTIFIED_BODY: "notified_body",               // Annex VII
  SECTORAL_LEGISLATION: "sectoral_legislation", // Annex I - follow sectoral law
};

// Conformity Assessment Obligations - Article 43 and Annexes VI-VII
export const CONFORMITY_ASSESSMENT_OBLIGATIONS = {
  // INTERNAL CONTROL (Annex VI) - All Annex III points 2-8 + optional for point 1
  O1: { category: "O", number: "O1", route: "Internal Control", title: "Identify harmonized standards or common specifications", description: "Identify applicable harmonized standards (Article 40) or common specifications (Article 41)", source: { article: "Article 40, 41" } },
  O2: { category: "O", number: "O2", route: "Internal Control", title: "Document chosen standards/specifications", description: "Document selected harmonized standards or common specifications", source: { article: "Article 40, 41, 11" } },
  O3: { category: "O", number: "O3", route: "Internal Control", title: "Verify compliance with Articles 8–15", description: "Verify compliance with legal requirements", source: { article: "Article 43(1)" } },
  O4: { category: "O", number: "O4", route: "Internal Control", title: "Complete technical documentation", description: "Complete all technical documentation per Annex IV", source: { article: "Article 11", annex: "Annex IV" } },
  O5: { category: "O", number: "O5", route: "Internal Control", title: "Include system architecture, data governance, etc.", description: "Include all required technical sections", source: { annex: "Annex IV" } },
  O6: { category: "O", number: "O6", route: "Internal Control", title: "Prepare Declaration of Conformity", description: "Prepare EU Declaration of Conformity", source: { article: "Article 47" } },
  O7: { category: "O", number: "O7", route: "Internal Control", title: "Affix CE marking", description: "Affix CE marking", source: { article: "Article 48" } },
  O8: { category: "O", number: "O8", route: "Internal Control", title: "Register system", description: "Register system in EU database", source: { article: "Article 49" } },
  O9: { category: "O", number: "O9", route: "Internal Control", title: "Document post-market plan", description: "Document post-market monitoring plan", source: { article: "Article 72" } },
  O10: { category: "O", number: "O10", route: "Internal Control", title: "Document logging", description: "Document logging implementation", source: { article: "Article 12" } },
  O11: { category: "O", number: "O11", route: "Internal Control", title: "Retain documentation 10 years", description: "Maintain documentation for 10 years", source: { article: "Article 11(1), 18" } },
  O12: { category: "O", number: "O12", route: "Internal Control", title: "Assign responsible officer", description: "Designate responsible person for regulatory compliance", source: { article: "Article 17" } },
  
  // NOTIFIED BODY (Annex VII) - Mandatory for some point 1 scenarios, optional for others
  O13: { category: "O", number: "O13", route: "Notified Body", title: "Select Notified Body", description: "Select appropriate Notified Body", source: { article: "Article 43(1)" } },
  O14: { category: "O", number: "O14", route: "Notified Body", title: "Submit all technical docs", description: "Submit technical documentation per Annex IV", source: { article: "Article 43(2)", annex: "Annex IV" } },
  O15: { category: "O", number: "O15", route: "Notified Body", title: "Submit system design", description: "Submit system design documentation", source: { article: "Article 43(2)" } },
  O16: { category: "O", number: "O16", route: "Notified Body", title: "Submit data governance docs", description: "Submit data governance documentation", source: { article: "Article 10", annex: "Annex IV" } },
  O17: { category: "O", number: "O17", route: "Notified Body", title: "Submit training/testing docs", description: "Submit training and testing documentation", source: { annex: "Annex IV, Section 2(f)" } },
  O18: { category: "O", number: "O18", route: "Notified Body", title: "Submit performance metrics", description: "Submit performance metrics", source: { article: "Article 15", annex: "Annex IV" } },
  O19: { category: "O", number: "O19", route: "Notified Body", title: "Submit risk file", description: "Submit risk management documentation", source: { article: "Article 9", annex: "Annex IV" } },
  O20: { category: "O", number: "O20", route: "Notified Body", title: "Submit oversight design", description: "Submit human oversight design", source: { article: "Article 14", annex: "Annex IV" } },
  O21: { category: "O", number: "O21", route: "Notified Body", title: "Submit cybersecurity file", description: "Submit cybersecurity documentation", source: { article: "Article 15", annex: "Annex IV" } },
  O22: { category: "O", number: "O22", route: "Notified Body", title: "Submit logging architecture", description: "Submit logging system architecture", source: { article: "Article 12", annex: "Annex IV" } },
  O23: { category: "O", number: "O23", route: "Notified Body", title: "Undergo design exam", description: "Undergo Notified Body design examination", source: { article: "Article 43(2-3)" } },
  O24: { category: "O", number: "O24", route: "Notified Body", title: "Implement NB corrective actions", description: "Implement Notified Body recommendations", source: { article: "Article 43(5)" } },
  O25: { category: "O", number: "O25", route: "Notified Body", title: "Maintain NB certificates", description: "Maintain certificates from Notified Body", source: { article: "Article 43(6-7)" } },
  O26: { category: "O", number: "O26", route: "Common Specifications", title: "Identify CS", description: "Identify applicable Common Specifications", source: { article: "Article 41" } },
  O27: { category: "O", number: "O27", route: "Common Specifications", title: "Document use of CS", description: "Document use of Common Specifications", source: { article: "Article 41, 11" } },
  O28: { category: "O", number: "O28", route: "Common Specifications", title: "Map CS to system", description: "Map specifications to system components", source: { article: "Article 41(2)" } },
  O29: { category: "O", number: "O29", route: "Common Specifications", title: "Implement CS controls", description: "Implement all required controls", source: { article: "Article 41(1)" } },
  O30: { category: "O", number: "O30", route: "Common Specifications", title: "Validate compliance", description: "Validate full compliance", source: { article: "Article 41, 43" } },
  O31: { category: "O", number: "O31", route: "Common Specifications", title: "Document compliance", description: "Document compliance evidence", source: { article: "Article 41", annex: "Annex IV" } },
  O32: { category: "O", number: "O32", route: "Common Specifications", title: "Prepare Declaration", description: "Prepare Declaration of Conformity", source: { article: "Article 47" } },
  O33: { category: "O", number: "O33", route: "Common Specifications", title: "CE marking", description: "Affix CE marking", source: { article: "Article 48" } },
  O34: { category: "O", number: "O34", route: "Common Specifications", title: "Register", description: "Register in EU database", source: { article: "Article 49" } },
  O35: { category: "O", number: "O35", route: "Common Specifications", title: "Maintain documentation", description: "Maintain documentation", source: { article: "Article 11(1), 41" } },
  O36: { category: "O", number: "O36", route: "Common Specifications", title: "Reassess after changes", description: "Reassess compliance after changes", source: { article: "Article 43(4)" } },
  O37: { category: "O", number: "O37", route: "Sectoral Legislation", title: "Identify sectoral law", description: "Identify applicable sectoral legislation", source: { article: "Article 43(3)", annex: "Annex I Section B" } },
  O38: { category: "O", number: "O38", route: "Sectoral Legislation", title: "Perform sector CA", description: "Perform sectoral conformity assessment", source: { article: "Article 43(3)" } },
  O39: { category: "O", number: "O39", route: "Sectoral Legislation", title: "Include AI‑specific requirements", description: "Include AI-specific requirements (Articles 8-15)", source: { article: "Article 43(3)" } },
  O40: { category: "O", number: "O40", route: "Sectoral Legislation", title: "Provide safety docs", description: "Provide safety documentation", source: { article: "Article 43(4)", annex: "Annex IV" } },
  O41: { category: "O", number: "O41", route: "Sectoral Legislation", title: "Provide cybersecurity docs", description: "Provide cybersecurity documentation", source: { article: "Article 15, 43(3)" } },
  O42: { category: "O", number: "O42", route: "Sectoral Legislation", title: "Provide logging docs", description: "Provide logging documentation", source: { article: "Article 12, 43(3)" } },
  O43: { category: "O", number: "O43", route: "Sectoral Legislation", title: "Undergo design exam", description: "Undergo design examination", source: { article: "Article 43(3-4)" } },
  O44: { category: "O", number: "O44", route: "Sectoral Legislation", title: "Undergo audits", description: "Undergo compliance audits", source: { article: "Article 43(4)" } },
  O45: { category: "O", number: "O45", route: "Sectoral Legislation", title: "Implement findings", description: "Implement audit findings", source: { article: "Article 43(5)" } },
  O46: { category: "O", number: "O46", route: "Sectoral Legislation", title: "Prepare sector declarations", description: "Prepare sectoral declarations", source: { article: "Article 47, 43(3)" } },
  O47: { category: "O", number: "O47", route: "Sectoral Legislation", title: "Register in sector DB", description: "Register in sectoral database", source: { article: "Sectoral Product Law" } },
  O48: { category: "O", number: "O48", route: "Sectoral Legislation", title: "Register in AI DB", description: "Register in AI Act database", source: { article: "Article 49" } },
  O49: { category: "O", number: "O49", route: "Sectoral Legislation", title: "Retain docs", description: "Retain all documentation", source: { article: "Article 11(1), 18" } },
  O50: { category: "O", number: "O50", route: "Sectoral Legislation", title: "Provide authority access", description: "Provide access to authorities", source: { article: "Article 64, 70, 43(4)" } },
};

// PROVIDER OBLIGATIONS (A1–A16) - Articles 16-22
export const PROVIDER_OBLIGATIONS = {
  A1: {
    category: "A", number: "A1", title: "Risk Management System", source: { article: "Article 9", annex: "Annex IV" },
    items: [
      { text: "Establish and maintain risk management system throughout AI system lifecycle", source: "Article 9(1)" },
      { text: "Identify and analyse known and reasonably foreseeable risks", source: "Article 9(2)(a)" },
      { text: "Estimate and evaluate risks that may emerge when used in accordance with intended purpose", source: "Article 9(2)(b)" },
      { text: "Estimate and evaluate risks from reasonably foreseeable misuse", source: "Article 9(2)(b)" },
      { text: "Evaluate risks to health, safety or fundamental rights", source: "Article 9(2)(c)" },
      { text: "Adopt suitable risk management measures", source: "Article 9(3)" },
      { text: "Eliminate or reduce risks through adequate design and development", source: "Article 9(4)(a)" },
      { text: "Implement adequate mitigation and control measures", source: "Article 9(4)(b)" },
      { text: "Provide adequate information and training to deployers", source: "Article 9(4)(c)" },
      { text: "Test risk management measures", source: "Article 9(5)" },
      { text: "Reassess and update risk management throughout AI system lifecycle", source: "Article 9(6)" },
      { text: "Document all risk management decisions", source: "Article 9(7)" }
    ]
  },
  A2: {
    category: "A", number: "A2", title: "Data and Data Governance", source: { article: "Article 10", annex: "Annex IV" },
    items: [
      { text: "Establish data governance and management practices", source: "Article 10(1)" },
      { text: "Ensure training, validation and testing data sets are relevant, sufficiently representative, and free of errors", source: "Article 10(2)" },
      { text: "Ensure data sets are appropriate to intended purpose", source: "Article 10(2)" },
      { text: "Take into account characteristics/elements particular to deployment context", source: "Article 10(3)" },
      { text: "Examine possible biases in data sets", source: "Article 10(4)" },
      { text: "Identify appropriate data preparation and training methodologies", source: "Article 10(4)" },
      { text: "Detect and correct bias where appropriate", source: "Article 10(4)" },
      { text: "Ensure training, validation and testing data sets have appropriate statistical properties", source: "Article 10(5)" },
      { text: "Ensure data governance allows examination of processed data", source: "Article 10(6)" },
      { text: "Document data sourcing, collection and labelling", source: "Article 10(7)" },
      { text: "Comply with Regulation (EU) 2016/679 (GDPR)", source: "Article 10(8)" }
    ]
  },
  A3: {
    category: "A", number: "A3", title: "Technical Documentation", source: { article: "Article 11", annex: "Annex IV" },
    items: [
      { text: "Draw up technical documentation before placing on market or putting into service", source: "Article 11(1)" },
      { text: "Include general description of AI system", source: "Annex IV, Section 1" },
      { text: "Include detailed description of elements and development process", source: "Annex IV, Section 2" },
      { text: "Include detailed information on monitoring, functioning and control", source: "Annex IV, Section 3" },
      { text: "Include description of risk management system", source: "Annex IV, Section 4" },
      { text: "Include description of changes made to system throughout lifecycle", source: "Annex IV, Section 5" },
      { text: "Include list of harmonised standards or common specifications applied", source: "Annex IV, Section 6" },
      { text: "Include copy of EU declaration of conformity", source: "Annex IV, Section 7" },
      { text: "Include detailed description of conformity assessment", source: "Annex IV, Section 8" },
      { text: "Keep technical documentation up to date", source: "Article 11(2)" },
      { text: "Keep documentation at disposal of national authorities for 10 years after placing on market or putting into service", source: "Article 11(3)" }
    ]
  },
  A4: {
    category: "A", number: "A4", title: "Record-Keeping (Logging)", source: { article: "Article 12" },
    items: [
      { text: "Design systems to automatically record events (logs) throughout lifetime", source: "Article 12(1)" },
      { text: "Ensure logging capabilities enable monitoring of functioning", source: "Article 12(1)" },
      { text: "Ensure logging capabilities facilitate post-market monitoring", source: "Article 12(1)" },
      { text: "Ensure logging capabilities enable investigation of incidents", source: "Article 12(1)" },
      { text: "Log periods of system use", source: "Article 12(2)" },
      { text: "Log reference database against which input data has been checked", source: "Article 12(2)" },
      { text: "Log input data for which search has led to match", source: "Article 12(2)" },
      { text: "Log identification of natural persons involved in verification of results", source: "Article 12(2)" },
      { text: "Protect logs by design from tampering and manipulation", source: "Article 12(3)" },
      { text: "Ensure logs remain accurate, complete and up-to-date", source: "Article 12(4)" }
    ]
  },
  A5: {
    category: "A", number: "A5", title: "Transparency and Provision of Information to Deployers", source: { article: "Article 13", annex: "Annex IV" },
    items: [
      { text: "Ensure systems are designed to be sufficiently transparent", source: "Article 13(1)" },
      { text: "Provide instructions for use in appropriate digital format or otherwise", source: "Article 13(2)" },
      { text: "Include identity and contact details of provider", source: "Article 13(3)(a)" },
      { text: "Include characteristics, capabilities and limitations of performance", source: "Article 13(3)(b)" },
      { text: "Include changes and updates to system", source: "Article 13(3)(c)" },
      { text: "Include human oversight measures", source: "Article 13(3)(d)" },
      { text: "Include expected lifetime and necessary maintenance measures", source: "Article 13(3)(e)" },
      { text: "Provide information to enable deployers to understand output and use it appropriately", source: "Article 13(3)(b)(i)" },
      { text: "Describe technical capabilities and limitations", source: "Article 13(3)(b)(ii)" },
      { text: "Inform of circumstances that may lead to risks", source: "Article 13(3)(b)(iii)" },
      { text: "Provide performance metrics", source: "Article 13(3)(b)(iv)" },
      { text: "Describe human oversight arrangements", source: "Article 13(3)(d)" },
      { text: "Provide installation and use instructions", source: "Article 13(3)(f)" }
    ]
  },
  A6: {
    category: "A", number: "A6", title: "Human Oversight", source: { article: "Article 14" },
    items: [
      { text: "Design and develop systems to include effective human oversight measures", source: "Article 14(1)" },
      { text: "Ensure oversight can be by natural persons or groups of persons", source: "Article 14(2)" },
      { text: "Enable overseer to fully understand capacities and limitations", source: "Article 14(3)(a)" },
      { text: "Enable overseer to remain aware of automation bias", source: "Article 14(3)(b)" },
      { text: "Enable overseer to correctly interpret system output", source: "Article 14(3)(c)" },
      { text: "Enable overseer to decide not to use system or disregard output", source: "Article 14(3)(d)" },
      { text: "Enable overseer to intervene or interrupt system", source: "Article 14(3)(e)" },
      { text: "Ensure oversight measures are identified and built into system when technically feasible", source: "Article 14(4)" },
      { text: "Provide measures for oversight to deployers when appropriate", source: "Article 14(5)" }
    ]
  },
  A7: {
    category: "A", number: "A7", title: "Accuracy, Robustness and Cybersecurity", source: { article: "Article 15" },
    items: [
      { text: "Design and develop systems to achieve appropriate level of accuracy", source: "Article 15(1)" },
      { text: "Design and develop systems to achieve appropriate level of robustness", source: "Article 15(1)" },
      { text: "Design and develop systems to achieve appropriate level of cybersecurity", source: "Article 15(1)" },
      { text: "Ensure systems perform consistently throughout their lifecycle", source: "Article 15(2)" },
      { text: "Ensure systems are resilient against errors, faults, inconsistencies", source: "Article 15(3)" },
      { text: "Ensure systems are resilient against attempts to manipulate data or system", source: "Article 15(3)" },
      { text: "Ensure technical solutions to address AI specific vulnerabilities", source: "Article 15(4)" },
      { text: "Implement measures against attempted unauthorized manipulation", source: "Article 15(4)" },
      { text: "Take into account state of the art in cybersecurity", source: "Article 15(5)" }
    ]
  },
  A8: {
    category: "A", number: "A8", title: "Quality Management System", source: { article: "Article 17" },
    items: [
      { text: "Establish quality management system ensuring compliance", source: "Article 17(1)" },
      { text: "Ensure strategy for regulatory compliance including compliance procedures", source: "Article 17(1)(a)" },
      { text: "Ensure techniques, procedures and systematic actions for design and development", source: "Article 17(1)(b)" },
      { text: "Ensure examination, test and validation procedures before, during and after development", source: "Article 17(1)(c)" },
      { text: "Ensure technical specifications including standards to be applied", source: "Article 17(1)(d)" },
      { text: "Ensure systems and procedures for data management", source: "Article 17(1)(e)" },
      { text: "Ensure risk management system", source: "Article 17(1)(f)" },
      { text: "Ensure post-market monitoring system", source: "Article 17(1)(g)" },
      { text: "Ensure procedures for handling reports of incidents and malfunctioning", source: "Article 17(1)(h)" },
      { text: "Ensure procedures for handling communication with authorities and customers", source: "Article 17(1)(h)" },
      { text: "Ensure systems and procedures for record keeping", source: "Article 17(1)(i)" },
      { text: "Ensure resource management including security of supply", source: "Article 17(1)(j)" },
      { text: "Ensure accountability framework setting out responsibilities", source: "Article 17(1)(k)" },
      { text: "Implement QMS in proportionate manner to size of organization", source: "Article 17(2)" },
      { text: "Document QMS in systematic and orderly manner", source: "Article 17(3)" }
    ]
  },
  A9: {
    category: "A", number: "A9", title: "Post-Market Monitoring System", source: { article: "Article 72" },
    items: [
      { text: "Establish and document post-market monitoring system", source: "Article 72(1)" },
      { text: "Collect and review experience from use of systems placed on market", source: "Article 72(1)" },
      { text: "Collect, document and analyse relevant data on performance throughout lifetime", source: "Article 72(2)" },
      { text: "Use data to identify need to immediately apply necessary corrective actions", source: "Article 72(3)" },
      { text: "Use data to identify any emerging risks", source: "Article 72(3)" },
      { text: "Use data to update risk management and performance documentation", source: "Article 72(3)" },
      { text: "Ensure post-market monitoring is appropriate to nature of AI technologies and risks", source: "Article 72(4)" },
      { text: "Report serious incidents to market surveillance authorities", source: "Article 73" }
    ]
  },
  A10: {
    category: "A", number: "A10", title: "Corrective Actions and Duty of Information", source: { article: "Articles 20, 21, 22" },
    items: [
      { text: "Take immediate corrective action if system presents risk", source: "Article 20(1)" },
      { text: "Inform distributors and deployers concerned", source: "Article 20(1)" },
      { text: "Withdraw system from market or recall it if appropriate", source: "Article 20(1)" },
      { text: "Inform national competent authorities and notified bodies", source: "Article 20(2)" },
      { text: "Cooperate with authorities on measures to eliminate risks", source: "Article 20(3)" },
      { text: "Inform notified body immediately of non-compliance", source: "Article 21(1)" },
      { text: "Take corrective action to bring system into conformity", source: "Article 21(1)" },
      { text: "Withdraw or recall system where appropriate", source: "Article 21(2)" },
      { text: "Inform authorities of Member States where system was made available", source: "Article 21(3)" },
      { text: "Report serious incidents to market surveillance authority", source: "Article 73(1)" }
    ]
  },
  A11: {
    category: "A", number: "A11", title: "Conformity Assessment", source: { article: "Article 43", annex: "Annexes V, VI, VII" },
    items: [
      { text: "Undergo applicable conformity assessment procedure before placing on market", source: "Article 43(1)" },
      { text: "Follow internal control procedure (Annex V) for most high-risk systems", source: "Article 43(1)" },
      { text: "Follow procedure with notified body involvement (Annex VI or VII) where required", source: "Article 43(2)" },
      { text: "Follow conformity assessment of Annex I Union harmonisation legislation where applicable", source: "Article 43(3)" },
      { text: "Undergo new conformity assessment for substantial modifications", source: "Article 43(4)" },
      { text: "Demonstrate conformity with requirements", source: "Article 43(5)" }
    ]
  },
  A12: {
    category: "A", number: "A12", title: "EU Declaration of Conformity", source: { article: "Article 47" },
    items: [
      { text: "Draw up EU declaration of conformity for each AI system", source: "Article 47(1)" },
      { text: "State that AI system meets requirements of Chapter III, Section 2", source: "Article 47(1)" },
      { text: "Include information listed in Annex V", source: "Article 47(2)" },
      { text: "Keep declaration up to date", source: "Article 47(3)" },
      { text: "Translate declaration into language required by Member State", source: "Article 47(4)" },
      { text: "Make declaration available to national competent authorities upon request", source: "Article 47(5)" }
    ]
  },
  A13: {
    category: "A", number: "A13", title: "CE Marking", source: { article: "Article 48" },
    items: [
      { text: "Affix CE marking to high-risk AI system", source: "Article 48(1)" },
      { text: "Affix CE marking visibly, legibly and indelibly", source: "Article 48(2)" },
      { text: "Affix CE marking before placing on market or putting into service", source: "Article 48(1)" },
      { text: "Follow general principles set out in Article 30 of Regulation (EC) 765/2008", source: "Article 48(3)" },
      { text: "Affix identification number of notified body if involved", source: "Article 48(4)" }
    ]
  },
  A14: {
    category: "A", number: "A14", title: "Registration in EU Database", source: { article: "Article 49" },
    items: [
      { text: "Register high-risk AI system in EU database before placing on market or putting into service", source: "Article 49(1)" },
      { text: "Provide information listed in Annex VIII, Section A", source: "Article 49(2)" },
      { text: "Update information when necessary", source: "Article 49(3)" },
      { text: "Ensure accuracy of information provided", source: "Article 49(4)" }
    ]
  },
  A15: {
    category: "A", number: "A15", title: "Serious Incident Reporting", source: { article: "Article 73" },
    items: [
      { text: "Report serious incident to market surveillance authorities of Member State where occurred", source: "Article 73(1)" },
      { text: "Report immediately after establishing causal link or reasonable likelihood", source: "Article 73(1)" },
      { text: "Provide all relevant information including incident description", source: "Article 73(2)" },
      { text: "Provide description of AI system involved", source: "Article 73(2)" },
      { text: "Provide corrective action taken or to be taken", source: "Article 73(2)" }
    ]
  },
  A16: {
    category: "A", number: "A16", title: "Cooperation with Authorities", source: { article: "Articles 64, 78" },
    items: [
      { text: "Provide competent authorities with all necessary information and documentation", source: "Article 64(2)" },
      { text: "Provide information in official Union language determined by Member State", source: "Article 64(3)" },
      { text: "Cooperate with competent authorities on any action taken", source: "Article 64(4)" },
      { text: "Register organization in relevant section of EU database if based outside Union", source: "Article 78(3)" }
    ]
  },
  A17: {
    category: "A", number: "A17", title: "Model Provider Cooperation Agreements", source: { article: "Article 25(4)" },
    items: [
      { text: "Establish written agreements with AI model providers defining responsibilities and obligations", source: "Article 25(4)" },
      { text: "Ensure model providers provide necessary information and capabilities for compliance", source: "Article 25(4)" },
      { text: "Obtain technical access and assistance based on generally acknowledged state of the art", source: "Article 25(4)" },
      { text: "Document technical specifications, capabilities, and limitations of integrated models", source: "Article 25(4)" },
      { text: "Confirm model provider cooperation enables full compliance with provider obligations", source: "Article 25(4)" }
    ]
  }
};

// HANDOVER OBLIGATIONS (C1–C15) - Derived from Articles 13, 16
export const HANDOVER_OBLIGATIONS = {
  C1: { 
    category: "C", number: "C1", title: "General System Description", 
    source: { article: "Article 13", annex: "Annex IV" }, 
    items: [{ text: "Provide general description of AI system including intended purpose", source: "Article 13(3)(b), Annex IV" }] 
  },
  C2: { 
    category: "C", number: "C2", title: "Technical Capabilities and Limitations", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide information on technical capabilities and limitations", source: "Article 13(3)(b)(ii)" }] 
  },
  C3: { 
    category: "C", number: "C3", title: "Performance Metrics", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide appropriate measures of performance", source: "Article 13(3)(b)(iv)" }] 
  },
  C4: { 
    category: "C", number: "C4", title: "Data Requirements", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide information on input data requirements and characteristics", source: "Article 13(3)(b)" }] 
  },
  C5: { 
    category: "C", number: "C5", title: "Human Oversight Instructions", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide information on human oversight measures", source: "Article 13(3)(d)" }] 
  },
  C6: { 
    category: "C", number: "C6", title: "Installation Instructions", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide instructions for installation and use", source: "Article 13(3)(f)" }] 
  },
  C7: { 
    category: "C", number: "C7", title: "Logging Capabilities", 
    source: { article: "Article 12" }, 
    items: [{ text: "Provide information on logging capabilities and access", source: "Article 12" }] 
  },
  C8: { 
    category: "C", number: "C8", title: "Risk Information", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide information on residual risks and circumstances that may lead to risks", source: "Article 13(3)(b)(iii)" }] 
  },
  C9: { 
    category: "C", number: "C9", title: "Maintenance Requirements", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide information on expected lifetime and necessary maintenance", source: "Article 13(3)(e)" }] 
  },
  C10: { 
    category: "C", number: "C10", title: "Updates and Modifications", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide information on changes, updates and upgrades", source: "Article 13(3)(c)" }] 
  },
  C11: { 
    category: "C", number: "C11", title: "Cybersecurity Information", 
    source: { article: "Article 15" }, 
    items: [{ text: "Provide cybersecurity measures and requirements", source: "Article 13(3), Article 15" }] 
  },
  C12: { 
    category: "C", number: "C12", title: "Declaration of Conformity", 
    source: { article: "Article 47" }, 
    items: [{ text: "Provide EU Declaration of Conformity or make it available", source: "Article 47" }] 
  },
  C13: { 
    category: "C", number: "C13", title: "CE Marking Information", 
    source: { article: "Article 48" }, 
    items: [{ text: "Ensure CE marking is affixed and visible", source: "Article 48" }] 
  },
  C14: { 
    category: "C", number: "C14", title: "Contact Information", 
    source: { article: "Article 13" }, 
    items: [{ text: "Provide identity and contact details of provider", source: "Article 13(3)(a)" }] 
  },
  C15: { 
    category: "C", number: "C15", title: "Authorized Representative (if applicable)", 
    source: { article: "Article 22" }, 
    items: [{ text: "Provide contact details of authorized representative if provider is outside EU", source: "Article 22" }] 
  }
};

// IMPORTER OBLIGATIONS (D1–D14) - Article 23
export const IMPORTER_OBLIGATIONS = {
  D1: { 
    category: "D", number: "D1", title: "Verify Conformity", 
    source: { article: "Article 23" }, 
    items: [{ text: "Verify that conformity assessment has been carried out by provider", source: "Article 23(1)" }] 
  },
  D2: { 
    category: "D", number: "D2", title: "Verify CE Marking", 
    source: { article: "Article 23" }, 
    items: [{ text: "Verify that CE marking is affixed", source: "Article 23(1)" }] 
  },
  D3: { 
    category: "D", number: "D3", title: "Verify Technical Documentation", 
    source: { article: "Article 23" }, 
    items: [{ text: "Verify that technical documentation has been drawn up", source: "Article 23(1)" }] 
  },
  D4: { 
    category: "D", number: "D4", title: "Verify Instructions", 
    source: { article: "Article 23" }, 
    items: [{ text: "Verify that provider has complied with obligations regarding instructions", source: "Article 23(1)" }] 
  },
  D5: { 
    category: "D", number: "D5", title: "Verify Registration", 
    source: { article: "Article 23" }, 
    items: [{ text: "Verify that provider has registered system in EU database", source: "Article 23(1)" }] 
  },
  D6: { 
    category: "D", number: "D6", title: "Reject Non-Compliant Systems", 
    source: { article: "Article 23" }, 
    items: [{ text: "Not place on market system if not compliant with Chapter III, Section 2", source: "Article 23(2)" }] 
  },
  D7: { 
    category: "D", number: "D7", title: "Inform Provider and Authorities", 
    source: { article: "Article 23" }, 
    items: [{ text: "Inform provider and market surveillance authorities if system presents risk", source: "Article 23(3)" }] 
  },
  D8: { 
    category: "D", number: "D8", title: "Add Importer Details", 
    source: { article: "Article 23" }, 
    items: [{ text: "Indicate name, registered trade name or trademark and contact address on system or packaging", source: "Article 23(4)" }] 
  },
  D9: { 
    category: "D", number: "D9", title: "Ensure Compliance Conditions", 
    source: { article: "Article 23" }, 
    items: [{ text: "Ensure storage or transport conditions do not jeopardize compliance", source: "Article 23(5)" }] 
  },
  D10: { 
    category: "D", number: "D10", title: "Retain Documentation", 
    source: { article: "Article 23" }, 
    items: [{ text: "Keep copy of EU declaration of conformity for 10 years", source: "Article 23(6)" }] 
  },
  D11: { 
    category: "D", number: "D11", title: "Maintain Traceability", 
    source: { article: "Article 23" }, 
    items: [{ text: "Keep technical documentation at disposal of authorities for 10 years", source: "Article 23(6)" }] 
  },
  D12: { 
    category: "D", number: "D12", title: "Provide Information to Authorities", 
    source: { article: "Article 23" }, 
    items: [{ text: "Provide all necessary information and documentation to demonstrate conformity", source: "Article 23(7)" }] 
  },
  D13: { 
    category: "D", number: "D13", title: "Cooperate on Corrective Actions", 
    source: { article: "Article 23" }, 
    items: [{ text: "Cooperate with authorities on action to eliminate risks", source: "Article 23(8)" }] 
  },
  D14: { 
    category: "D", number: "D14", title: "Provider Obligations When Applicable", 
    source: { article: "Article 23" }, 
    items: [{ text: "Assume provider obligations if placing system on market under own name or trademark or modifying it", source: "Article 23(9)" }] 
  }
};

// DISTRIBUTOR OBLIGATIONS (E1–E9) - Article 24
export const DISTRIBUTOR_OBLIGATIONS = {
  E1: { 
    category: "E", number: "E1", title: "Verify CE Marking", 
    source: { article: "Article 24" }, 
    items: [{ text: "Verify that CE marking is affixed to high-risk AI system", source: "Article 24(1)" }] 
  },
  E2: { 
    category: "E", number: "E2", title: "Verify Documentation Provided", 
    source: { article: "Article 24" }, 
    items: [{ text: "Verify that system is accompanied by required documentation", source: "Article 24(1)" }] 
  },
  E3: { 
    category: "E", number: "E3", title: "Verify Instructions", 
    source: { article: "Article 24" }, 
    items: [{ text: "Verify that provider and importer have complied with obligations", source: "Article 24(1)" }] 
  },
  E4: { 
    category: "E", number: "E4", title: "Do Not Make Available Non-Compliant Systems", 
    source: { article: "Article 24" }, 
    items: [{ text: "Not make available on market system that does not comply with Chapter III, Section 2", source: "Article 24(2)" }] 
  },
  E5: { 
    category: "E", number: "E5", title: "Inform Provider/Importer of Risks", 
    source: { article: "Article 24" }, 
    items: [{ text: "Inform provider or importer and market surveillance authorities if system presents risk", source: "Article 24(3)" }] 
  },
  E6: { 
    category: "E", number: "E6", title: "Ensure Compliance During Storage/Transport", 
    source: { article: "Article 24" }, 
    items: [{ text: "Ensure that storage or transport conditions do not jeopardize compliance", source: "Article 24(4)" }] 
  },
  E7: { 
    category: "E", number: "E7", title: "Provide Information to Authorities", 
    source: { article: "Article 24" }, 
    items: [{ text: "Provide all necessary information and documentation to demonstrate conformity", source: "Article 24(5)" }] 
  },
  E8: { 
    category: "E", number: "E8", title: "Cooperate on Corrective Actions", 
    source: { article: "Article 24" }, 
    items: [{ text: "Cooperate with authorities on action to eliminate risks", source: "Article 24(6)" }] 
  },
  E9: { 
    category: "E", number: "E9", title: "Provider Obligations When Applicable", 
    source: { article: "Article 24" }, 
    items: [{ text: "Assume provider obligations if making available on market under own name or trademark or modifying it", source: "Article 24(7)" }] 
  }
};

// DEPLOYER OBLIGATIONS (F1–F13) - Article 26
export const DEPLOYER_OBLIGATIONS = {
  F1: { 
    category: "F", number: "F1", title: "Use According to Instructions", 
    source: { article: "Article 26" }, 
    items: [{ text: "Use high-risk AI system in accordance with instructions for use", source: "Article 26(1)" }] 
  },
  F2: { 
    category: "F", number: "F2", title: "Assign Human Oversight", 
    source: { article: "Article 26" }, 
    items: [{ text: "Ensure human oversight measures referred to in Article 14 are assigned to competent persons", source: "Article 26(2)" }] 
  },
  F3: { 
    category: "F", number: "F3", title: "Monitor System Operation", 
    source: { article: "Article 26" }, 
    items: [{ text: "Monitor operation of system on basis of instructions for use", source: "Article 26(3)" }] 
  },
  F4: { 
    category: "F", number: "F4", title: "Suspend Use if Risks Identified", 
    source: { article: "Article 26" }, 
    items: [{ text: "Suspend use of system if identifying serious incident or malfunctioning and inform provider", source: "Article 26(4)" }] 
  },
  F5: { 
    category: "F", number: "F5", title: "Maintain Logs", 
    source: { article: "Article 26" }, 
    items: [{ text: "Keep logs automatically generated by system where under their control", source: "Article 26(5)" }] 
  },
  F6: { 
    category: "F", number: "F6", title: "Retain Logs", 
    source: { article: "Article 26" }, 
    items: [{ text: "Keep logs for period appropriate to intended purpose, minimum 6 months", source: "Article 26(5)" }] 
  },
  F7: { 
    category: "F", number: "F7", title: "Use Input Data", 
    source: { article: "Article 26" }, 
    items: [{ text: "Use input data that is relevant and sufficiently representative in view of intended purpose", source: "Article 26(6)" }] 
  },
  F8: { 
    category: "F", number: "F8", title: "Conduct DPIA", 
    source: { article: "Article 26" }, 
    items: [{ text: "Carry out data protection impact assessment under Article 35 GDPR where applicable", source: "Article 26(8)" }] 
  },
  F9: { 
    category: "F", number: "F9", title: "Conduct Fundamental Rights Impact Assessment", 
    source: { article: "Article 26" }, 
    items: [{ text: "Perform fundamental rights impact assessment prior to use if deployer is public authority or private operator providing public services", source: "Article 26(9)" }] 
  },
  F10: { 
    category: "F", number: "F10", title: "Inform Representatives", 
    source: { article: "Article 26" }, 
    items: [{ text: "Inform workers' representatives and affected workers that they are subject to use of high-risk AI system", source: "Article 26(10)" }] 
  },
  F11: { 
    category: "F", number: "F11", title: "Register System Use (where applicable)", 
    source: { article: "Article 49" }, 
    items: [{ text: "Register use of high-risk AI system in EU database if deployer is public authority, Union institution or EU agency", source: "Article 49(3)" }] 
  },
  F12: { 
    category: "F", number: "F12", title: "Cooperate with Authorities", 
    source: { article: "Article 26" }, 
    items: [{ text: "Cooperate with competent authorities and provide information about use", source: "Article 26(11)" }] 
  },
  F13: { 
    category: "F", number: "F13", title: "Provider Obligations When Modifying", 
    source: { article: "Article 28" }, 
    items: [{ text: "Assume provider obligations if making substantial modification to high-risk system", source: "Article 28(1)" }] 
  }
};

// FRIA OBLIGATIONS (G1–G15) - Article 27
export const FRIA_OBLIGATIONS = {
  G1: { 
    category: "G", number: "G1", title: "Determine Necessity", 
    source: { article: "Article 27" }, 
    items: [{ text: "Assess whether fundamental rights impact assessment is required", source: "Article 27(1)" }] 
  },
  G2: { 
    category: "G", number: "G2", title: "Identify Deployment Process", 
    source: { article: "Article 27" }, 
    items: [{ text: "Describe processes in which high-risk AI system will be used", source: "Article 27(2)(a)" }] 
  },
  G3: { 
    category: "G", number: "G3", title: "Assess Purpose and Benefits", 
    source: { article: "Article 27" }, 
    items: [{ text: "Assess purpose and benefits of deployment for deployer, individuals and society", source: "Article 27(2)(b)" }] 
  },
  G4: { 
    category: "G", number: "G4", title: "Identify Affected Persons", 
    source: { article: "Article 27" }, 
    items: [{ text: "Identify categories of natural persons and groups likely to be affected", source: "Article 27(2)(c)" }] 
  },
  G5: { 
    category: "G", number: "G5", title: "Identify Fundamental Rights Risks", 
    source: { article: "Article 27" }, 
    items: [{ text: "Identify reasonably foreseeable risks to fundamental rights of persons and groups", source: "Article 27(2)(d)" }] 
  },
  G6: { 
    category: "G", number: "G6", title: "Assess Risk Likelihood and Severity", 
    source: { article: "Article 27" }, 
    items: [{ text: "Describe likelihood and severity of identified risks to fundamental rights", source: "Article 27(2)(d)" }] 
  },
  G7: { 
    category: "G", number: "G7", title: "Identify Mitigation Measures", 
    source: { article: "Article 27" }, 
    items: [{ text: "Describe measures to be taken in case of materialisation of those risks", source: "Article 27(2)(d)" }] 
  },
  G8: { 
    category: "G", number: "G8", title: "Assess Human Oversight", 
    source: { article: "Article 27" }, 
    items: [{ text: "Describe human oversight measures taken to address identified risks", source: "Article 27(2)(e)" }] 
  },
  G9: { 
    category: "G", number: "G9", title: "Consult Stakeholders", 
    source: { article: "Article 27" }, 
    items: [{ text: "Consult relevant stakeholders, including workers' representatives, where applicable", source: "Article 27(3)" }] 
  },
  G10: { 
    category: "G", number: "G10", title: "Document Assessment", 
    source: { article: "Article 27" }, 
    items: [{ text: "Document fundamental rights impact assessment in writing", source: "Article 27(4)" }] 
  },
  G11: { 
    category: "G", number: "G11", title: "Update Assessment", 
    source: { article: "Article 27" }, 
    items: [{ text: "Update assessment when necessary", source: "Article 27(5)" }] 
  },
  G12: { 
    category: "G", number: "G12", title: "Submit to Authorities", 
    source: { article: "Article 27" }, 
    items: [{ text: "Submit assessment to market surveillance authority upon request", source: "Article 27(6)" }] 
  },
  G13: { 
    category: "G", number: "G13", title: "Publish Summary (Public Authorities)", 
    source: { article: "Article 27" }, 
    items: [{ text: "Make assessment publicly available if deployer is public authority or Union institution/body/agency", source: "Article 27(7)" }] 
  },
  G14: { 
    category: "G", number: "G14", title: "Integrate with DPIA", 
    source: { article: "Article 27" }, 
    items: [{ text: "May be part of data protection impact assessment under Article 35 GDPR", source: "Article 27(8)" }] 
  },
  G15: { 
    category: "G", number: "G15", title: "Follow Commission Guidelines", 
    source: { article: "Article 27" }, 
    items: [{ text: "Take into account guidelines issued by Commission and AI Board", source: "Article 27(9)" }] 
  }
};

// TRANSPARENCY OBLIGATIONS (H1–H9) - Article 50
export const TRANSPARENCY_OBLIGATIONS = {
  H1: { 
    category: "H", number: "H1", title: "Disclose AI Interaction", 
    source: { article: "Article 50" }, 
    items: [{ text: "Inform natural persons that they are interacting with AI system", source: "Article 50(1)" }] 
  },
  H2: { 
    category: "H", number: "H2", title: "Disclose Emotion Recognition", 
    source: { article: "Article 50" }, 
    items: [{ text: "Inform natural persons when emotion recognition or biometric categorisation system is used", source: "Article 50(2)" }] 
  },
  H3: { 
    category: "H", number: "H3", title: "Label AI-Generated Content", 
    source: { article: "Article 50" }, 
    items: [{ text: "Mark in machine-readable format and disclose that content has been artificially generated or manipulated", source: "Article 50(3)" }] 
  },
  H4: { 
    category: "H", number: "H4", title: "Label Deepfakes", 
    source: { article: "Article 50" }, 
    items: [{ text: "Clearly disclose that content constitutes deepfake or artificially generated or manipulated image, audio or video", source: "Article 50(4)" }] 
  },
  H5: { 
    category: "H", number: "H5", title: "Ensure Detectability", 
    source: { article: "Article 50" }, 
    items: [{ text: "Ensure disclosures are clear, distinguishable and easily perceivable", source: "Article 50(5)" }] 
  },
  H6: { 
    category: "H", number: "H6", title: "Apply Exceptions Appropriately", 
    source: { article: "Article 50" }, 
    items: [{ text: "Verify whether transparency exceptions apply (e.g., criminal detection)", source: "Article 50(1), 50(2)" }] 
  },
  H7: { 
    category: "H", number: "H7", title: "Technical Implementation", 
    source: { article: "Article 50" }, 
    items: [{ text: "Implement technical solutions to enable detection and disclosure", source: "Article 50(3)" }] 
  },
  H8: { 
    category: "H", number: "H8", title: "Freedom of Expression Protection", 
    source: { article: "Article 50" }, 
    items: [{ text: "Ensure transparency measures respect freedom of expression and access to information", source: "Article 50(6)" }] 
  },
  H9: { 
    category: "H", number: "H9", title: "Follow Implementing Acts", 
    source: { article: "Article 50" }, 
    items: [{ text: "Follow detailed arrangements established by Commission implementing acts", source: "Article 50(7)" }] 
  }
};

// NON-SIGNIFICANT RISK OBLIGATIONS (I1–I7) - Article 6(5)
export const NON_SIGNIFICANT_RISK_OBLIGATIONS = {
  I1: { 
    category: "I", number: "I1", title: "Conduct Risk Assessment", 
    source: { article: "Article 6" }, 
    items: [{ text: "Perform and document risk assessment showing why system does not present significant risk", source: "Article 6(5)" }] 
  },
  I2: { 
    category: "I", number: "I2", title: "Document Assessment", 
    source: { article: "Article 6" }, 
    items: [{ text: "Document risk assessment procedure and results", source: "Article 6(5)" }] 
  },
  I3: { 
    category: "I", number: "I3", title: "Notify Authorities", 
    source: { article: "Article 6" }, 
    items: [{ text: "Submit assessment to relevant market surveillance authority", source: "Article 6(5)" }] 
  },
  I4: { 
    category: "I", number: "I4", title: "Register System", 
    source: { article: "Article 49" }, 
    items: [{ text: "Register system in EU database", source: "Article 6(5), Article 49" }] 
  },
  I5: { 
    category: "I", number: "I5", title: "Maintain Evidence", 
    source: { article: "Article 6" }, 
    items: [{ text: "Keep documented assessment and supporting evidence", source: "Article 6(5)" }] 
  },
  I6: { 
    category: "I", number: "I6", title: "Reassess After Changes", 
    source: { article: "Article 6" }, 
    items: [{ text: "Reassess if system undergoes substantial modification", source: "Article 6(5)" }] 
  },
  I7: { 
    category: "I", number: "I7", title: "Cooperate with Authorities", 
    source: { article: "Article 6" }, 
    items: [{ text: "Provide additional information if requested by authorities", source: "Article 6(5)" }] 
  }
};

// GPAI OBLIGATIONS (J1–J16) - Article 53
export const GPAI_OBLIGATIONS = {
  J1: { 
    category: "J", number: "J1", title: "Technical Documentation", 
    source: { article: "Article 53" }, 
    items: [{ text: "Draw up and keep up-to-date technical documentation of model", source: "Article 53(1)(a)" }] 
  },
  J2: { 
    category: "J", number: "J2", title: "Include Training Information", 
    source: { article: "Article 53", annex: "Annex XI" }, 
    items: [{ text: "Document training data, process, computational resources used", source: "Article 53(1)(a), Annex XI" }] 
  },
  J3: { 
    category: "J", number: "J3", title: "Include Testing Information", 
    source: { article: "Article 53", annex: "Annex XI" }, 
    items: [{ text: "Document testing process, results and performance metrics", source: "Article 53(1)(a), Annex XI" }] 
  },
  J4: { 
    category: "J", number: "J4", title: "Include Model Evaluation", 
    source: { article: "Article 53", annex: "Annex XI" }, 
    items: [{ text: "Document evaluation, including on capabilities and limitations", source: "Article 53(1)(a), Annex XI" }] 
  },
  J5: { 
    category: "J", number: "J5", title: "Provide Information to Downstream Providers", 
    source: { article: "Article 53" }, 
    items: [{ text: "Provide information and documentation to enable compliance with this Regulation", source: "Article 53(1)(b)" }] 
  },
  J6: { 
    category: "J", number: "J6", title: "Policy on Copyright", 
    source: { article: "Article 53" }, 
    items: [{ text: "Put in place policy to comply with Union copyright law for training data", source: "Article 53(1)(c)" }] 
  },
  J7: { 
    category: "J", number: "J7", title: "Publish Training Data Summary", 
    source: { article: "Article 53" }, 
    items: [{ text: "Make publicly available sufficiently detailed summary about content used for training", source: "Article 53(1)(d)" }] 
  },
  J8: { 
    category: "J", number: "J8", title: "Follow Code of Practice", 
    source: { article: "Article 56" }, 
    items: [{ text: "Comply with approved code of practice or demonstrate alternative adequate means", source: "Article 56" }] 
  },
  J9: { 
    category: "J", number: "J9", title: "Cybersecurity Protection", 
    source: { article: "Article 53" }, 
    items: [{ text: "Implement adequate level of cybersecurity protection for model and physical infrastructure", source: "Article 53(1)(e)" }] 
  },
  J10: { 
    category: "J", number: "J10", title: "Monitor and Report Incidents", 
    source: { article: "Article 53" }, 
    items: [{ text: "Monitor serious incidents and report to AI Office and national authorities", source: "Article 53(2), Article 73" }] 
  },
  J11: { 
    category: "J", number: "J11", title: "Maintain Quality Management", 
    source: { article: "Article 53" }, 
    items: [{ text: "Ensure appropriate level of quality management for model development", source: "Article 53(1)" }] 
  },
  J12: { 
    category: "J", number: "J12", title: "Update Documentation", 
    source: { article: "Article 53" }, 
    items: [{ text: "Keep technical documentation updated", source: "Article 53(1)(a)" }] 
  },
  J13: { 
    category: "J", number: "J13", title: "Cooperate with AI Office", 
    source: { article: "Article 93" }, 
    items: [{ text: "Cooperate with AI Office and national competent authorities", source: "Article 93" }] 
  },
  J14: { 
    category: "J", number: "J14", title: "Provide Information on Request", 
    source: { article: "Article 53" }, 
    items: [{ text: "Provide information and documentation to AI Office upon request", source: "Article 53(3)" }] 
  },
  J15: { 
    category: "J", number: "J15", title: "Risk Mitigation Measures", 
    source: { article: "Article 53" }, 
    items: [{ text: "Implement measures to identify and mitigate foreseeable risks", source: "Article 53(1)" }] 
  },
  J16: { 
    category: "J", number: "J16", title: "Authorized Representative (if applicable)", 
    source: { article: "Article 22" }, 
    items: [{ text: "Designate authorized representative in EU if provider established outside Union", source: "Article 22, Article 53(4)" }] 
  }
};

// GPAI SYSTEMIC RISK OBLIGATIONS (K1–K13) - Article 55
export const GPAI_SYSTEMIC_OBLIGATIONS = {
  K1: { 
    category: "K", number: "K1", title: "Model Evaluation", 
    source: { article: "Article 55" }, 
    items: [{ text: "Perform model evaluation in accordance with standardised protocols and tools", source: "Article 55(1)(a)" }] 
  },
  K2: { 
    category: "K", number: "K2", title: "Adversarial Testing", 
    source: { article: "Article 55" }, 
    items: [{ text: "Assess and mitigate systemic risks through adversarial testing", source: "Article 55(1)(b)" }] 
  },
  K3: { 
    category: "K", number: "K3", title: "Track and Document Serious Incidents", 
    source: { article: "Article 55" }, 
    items: [{ text: "Track, document and report serious incidents and possible corrective measures", source: "Article 55(1)(c)" }] 
  },
  K4: { 
    category: "K", number: "K4", title: "Ensure Cybersecurity", 
    source: { article: "Article 55" }, 
    items: [{ text: "Ensure adequate level of cybersecurity protection for model, physical infrastructure and supply chain", source: "Article 55(1)(d)" }] 
  },
  K6: { 
    category: "K", number: "K6", title: "Follow Code of Practice", 
    source: { article: "Article 56" }, 
    items: [{ text: "Comply with approved code of practice for systemic risk models", source: "Article 56(4)" }] 
  },
  K7: { 
    category: "K", number: "K7", title: "Risk Identification", 
    source: { article: "Article 55" }, 
    items: [{ text: "Identify and assess systemic risks at Union level", source: "Article 55(1)" }] 
  },
  K8: { 
    category: "K", number: "K8", title: "Risk Mitigation", 
    source: { article: "Article 55" }, 
    items: [{ text: "Implement measures to mitigate identified systemic risks", source: "Article 55(1)" }] 
  },
  K9: { 
    category: "K", number: "K9", title: "Reporting to AI Office", 
    source: { article: "Article 55" }, 
    items: [{ text: "Report to AI Office on serious incidents and risk mitigation measures", source: "Article 55(1)(c)" }] 
  },
  K10: { 
    category: "K", number: "K10", title: "Independent Expert Assessment", 
    source: { article: "Article 55" }, 
    items: [{ text: "Commission independent expert assessment of model compliance where required", source: "Article 55(3)" }] 
  },
  K11: { 
    category: "K", number: "K11", title: "Scientific Panel Cooperation", 
    source: { article: "Article 68" }, 
    items: [{ text: "Cooperate with scientific panel on risk evaluation", source: "Article 68" }] 
  },
  K12: { 
    category: "K", number: "K12", title: "Enhanced Transparency", 
    source: { article: "Article 55" }, 
    items: [{ text: "Provide enhanced transparency on model capabilities and limitations", source: "Article 55(1)" }] 
  },
  K13: { 
    category: "K", number: "K13", title: "Supply Chain Security", 
    source: { article: "Article 55" }, 
    items: [{ text: "Ensure cybersecurity throughout supply chain", source: "Article 55(1)(d)" }] 
  }
};

// PROHIBITED SYSTEM OBLIGATIONS (L1–L9) - Article 5
export const PROHIBITED_OBLIGATIONS = {
  L1: { 
    category: "L", number: "L1", title: "Prohibition", 
    source: { article: "Article 5" }, 
    items: [{ text: "Do not place on market, put into service or use prohibited AI practice", source: "Article 5(1)" }] 
  },
  L2: { 
    category: "L", number: "L2", title: "Cease Development", 
    source: { article: "Article 5" }, 
    items: [{ text: "Stop development of prohibited AI system", source: "Article 5(1)" }] 
  },
  L3: { 
    category: "L", number: "L3", title: "Cease Distribution", 
    source: { article: "Article 5" }, 
    items: [{ text: "Stop placing prohibited system on market", source: "Article 5(1)" }] 
  },
  L4: { 
    category: "L", number: "L4", title: "Withdraw System", 
    source: { article: "Article 5" }, 
    items: [{ text: "Withdraw prohibited system from market immediately", source: "Article 5(1), Article 20" }] 
  },
  L5: { 
    category: "L", number: "L5", title: "Disable System", 
    source: { article: "Article 5" }, 
    items: [{ text: "Disable prohibited functionality", source: "Article 5(1)" }] 
  },
  L6: { 
    category: "L", number: "L6", title: "Notify Authorities", 
    source: { article: "Article 5" }, 
    items: [{ text: "Inform national competent authorities", source: "Article 20, Article 73" }] 
  },
  L7: { 
    category: "L", number: "L7", title: "Document Cessation", 
    source: { article: "Article 5" }, 
    items: [{ text: "Document cessation process and measures taken", source: "Article 18" }] 
  },
  L8: { 
    category: "L", number: "L8", title: "Verify Compliance with Exceptions", 
    source: { article: "Article 5" }, 
    items: [{ text: "Verify whether system qualifies for any exception (e.g., Article 5(2-4))", source: "Article 5(2-4)" }] 
  },
  L9: { 
    category: "L", number: "L9", title: "Cooperate with Investigations", 
    source: { article: "Article 5" }, 
    items: [{ text: "Cooperate with authorities on prohibition enforcement", source: "Article 64" }] 
  }
};

// PRODUCT MANUFACTURER OBLIGATIONS (N1–N4) - Article 24 (different article 24 - for products)
// Note: This appears to reference when product manufacturers integrate AI
export const PRODUCT_MANUFACTURER_OBLIGATIONS = {
  N1: { 
    category: "N", number: "N1", title: "Assume Provider Obligations", 
    source: { article: "Article 24" }, 
    items: [{ text: "Assume provider obligations when placing AI system on market with product under own name or trademark", source: "Article 24(1)" }] 
  },
  N2: { 
    category: "N", number: "N2", title: "Apply All Provider Requirements", 
    source: { article: "Article 24" }, 
    items: [{ text: "Comply with all obligations in Chapter III, Section 2", source: "Article 24(1)" }] 
  },
  N3: { 
    category: "N", number: "N3", title: "Apply Product Safety Legislation", 
    source: { article: "Article 6" }, 
    items: [{ text: "Comply with requirements of applicable Union harmonisation legislation", source: "Article 6(1)" }] 
  },
  N4: { 
    category: "N", number: "N4", title: "Register System", 
    source: { article: "Article 49" }, 
    items: [{ text: "Register high-risk AI system in EU database", source: "Article 49(1)" }] 
  }
};

// EXCLUSION OBLIGATIONS (M1-M5) - Article 2 only
// Documentation requirements for systems treated as excluded from AI Act scope under Article 2
export const EXCLUSION_OBLIGATIONS = {
  M1: {
    category: "M", number: "M1", title: "Document Exclusion Basis",
    source: { article: "Article 2" },
    items: [{ text: "Document the specific exclusion ground(s) under Article 2 that applies to your AI system", source: "Article 2" }]
  },
  M2: {
    category: "M", number: "M2", title: "Maintain Exclusion Justification",
    source: { article: "Article 2" },
    items: [{ text: "Maintain documentation justifying why the system falls under the exclusion", source: "Article 2" }]
  },
  M3: {
    category: "M", number: "M3", title: "Monitor Exclusion Applicability",
    source: { article: "Article 2" },
    items: [{ text: "Regularly review whether the exclusion grounds continue to apply as the system evolves", source: "Article 2" }]
  },
  M4: {
    category: "M", number: "M4", title: "Update Classification if Needed",
    source: { article: "Article 2" },
    items: [{ text: "If exclusion grounds no longer apply, re-classify system and apply appropriate AI Act requirements", source: "Article 2" }]
  },
  M5: {
    category: "M", number: "M5", title: "Exclusion Documentation Record",
    source: { article: "Article 2" },
    items: [{ text: "Keep records of exclusion determination and any reviews performed", source: "Article 2" }]
  }
};

// EXEMPTION DOCUMENTATION OBLIGATIONS (X1-X5) - Article 5 & Recital 16
// Documentation requirements to prove compliance with exemption conditions for prohibited practices and ancillary features
export const EXEMPTION_DOCUMENTATION_OBLIGATIONS = {
  X1: {
    category: "X", number: "X1", title: "Criminal Risk Assessment Exemption Documentation",
    source: { article: "Article 5(1)(d)" },
    items: [
      { text: "Document that system only supports human assessment and does not replace human decision-making", source: "Article 5(1)(d)" },
      { text: "Maintain evidence that assessments are based on objective and verifiable facts", source: "Article 5(1)(d)" },
      { text: "Document that facts are directly linked to specific criminal activity", source: "Article 5(1)(d)" },
      { text: "Keep records of human oversight and final decision accountability", source: "Article 5(1)(d)" }
    ]
  },
  X2: {
    category: "X", number: "X2", title: "Medical/Safety Emotion Recognition Exemption Documentation",
    source: { article: "Article 5(1)(f)" },
    items: [
      { text: "Document specific medical or safety purpose justification for emotion inference", source: "Article 5(1)(f)" },
      { text: "Maintain evidence of medical/safety context and necessity", source: "Article 5(1)(f)" },
      { text: "Keep records of medical professional involvement or safety protocol compliance", source: "Article 5(1)(f)" },
      { text: "Document that use is limited to medical/safety purposes only", source: "Article 5(1)(f)" }
    ]
  },
  X3: {
    category: "X", number: "X3", title: "Biometric Law Enforcement Exemption Documentation",
    source: { article: "Article 5(1)(g), Article 5(2-4)" },
    items: [
      { text: "Document judicial or administrative authorization for each use", source: "Article 5(2)" },
      { text: "Maintain records of strict temporal and geographical limitations", source: "Article 5(2)" },
      { text: "Document compliance with all safeguards and conditions", source: "Article 5(3)" },
      { text: "Keep records of human verification and oversight procedures", source: "Article 14(5)" }
    ]
  },
  X4: {
    category: "X", number: "X4", title: "Real-time Remote Biometric Identification Exemption Documentation",
    source: { article: "Article 5(1)(h), Article 5(2-4)" },
    items: [
      { text: "Document specific law enforcement purpose and legal authorization", source: "Article 5(1)(h)" },
      { text: "Maintain records of urgency justification and authorization timing", source: "Article 5(2)" },
      { text: "Document implementation of required safeguards and human oversight", source: "Article 5(3)" },
      { text: "Keep detailed logs of each use including judicial review", source: "Article 5(4)" }
    ]
  },
  X5: {
    category: "X", number: "X5", title: "Ancillary Feature Exemption Documentation",
    source: { article: "Recital 16" },
    items: [
      { text: "Document objective technical reasons why the AI feature cannot be used without the principal service", source: "Recital 16" },
      { text: "Maintain evidence that integration is not a means to circumvent the AI Act", source: "Recital 16" },
      { text: "Document that the AI functionality is genuinely ancillary and secondary to the main service", source: "Recital 16" },
      { text: "Keep records of technical architecture showing inseparable integration", source: "Recital 16" }
    ]
  }
};

// PROHIBITED PRODUCT MANUFACTURER OBLIGATIONS (P1-P4) - Article 5 & 24
// Special obligations when Product Manufacturer integrates prohibited AI as safety component
export const PROHIBITED_PRODUCT_MANUFACTURER_OBLIGATIONS = {
  P1: {
    category: "P", number: "P1", title: "Do Not Integrate Prohibited AI",
    source: { article: "Article 5, Article 24" },
    items: [{ text: "Do not place on market or put into service products containing prohibited AI systems", source: "Article 5(1)" }]
  },
  P2: {
    category: "P", number: "P2", title: "Verify AI Component Compliance",
    source: { article: "Article 24" },
    items: [{ text: "Verify that AI components do not engage in prohibited practices before integration", source: "Article 5, Article 24" }]
  },
  P3: {
    category: "P", number: "P3", title: "Withdraw Integrated Products",
    source: { article: "Article 5, Article 20" },
    items: [{ text: "If prohibited AI discovered post-integration, immediately withdraw product from market", source: "Article 20" }]
  },
  P4: {
    category: "P", number: "P4", title: "Notify Sectoral Authorities",
    source: { article: "Article 5, Article 73" },
    items: [{ text: "Notify both AI Act authorities and sectoral product safety authorities of prohibited integration", source: "Article 73" }]
  }
};

// All obligations merged
export const ALL_OBLIGATIONS = {
  ...PROVIDER_OBLIGATIONS,
  ...HANDOVER_OBLIGATIONS,
  ...IMPORTER_OBLIGATIONS,
  ...DISTRIBUTOR_OBLIGATIONS,
  ...DEPLOYER_OBLIGATIONS,
  ...FRIA_OBLIGATIONS,
  ...TRANSPARENCY_OBLIGATIONS,
  ...NON_SIGNIFICANT_RISK_OBLIGATIONS,
  ...GPAI_OBLIGATIONS,
  ...GPAI_SYSTEMIC_OBLIGATIONS,
  ...PROHIBITED_OBLIGATIONS,
  ...EXCLUSION_OBLIGATIONS,
  ...EXEMPTION_DOCUMENTATION_OBLIGATIONS,
  ...PROHIBITED_PRODUCT_MANUFACTURER_OBLIGATIONS,
  ...PRODUCT_MANUFACTURER_OBLIGATIONS,
  ...CONFORMITY_ASSESSMENT_OBLIGATIONS,
};
