# EU AI Act Compliance Wizard — Global Design Guidelines

> Apply these guidelines to every screen. Reference screens: Screen 2 (Roles),
> Screen 3 (Annex IA), and Screen 9 (Prohibited) establish the baseline pattern.

---

## 1. Source Citations

- **Always use** `<span className="source-tag" title="Article X">Source</span>`.
  The article/annex/paragraph reference belongs in the `title` attribute only (visible on hover).
  The visible text is **always** exactly `Source` — never `Source: Article X` or any variant.
- Source tags must **never** appear as standalone prose. Do not write "under Article 5" or
  "per Annex III" as plain text. All legislative references go in a source tag `title`.
- Source tags may appear inside: checkbox/radio option labels, info-box body text,
  modal body text, and screen header subtitles.
- Inside `.screen-header`, source tags receive automatic inverted (white-on-blue) styling
  via `.screen-header .source-tag` — no inline style needed.
- Source tags are alway at the end of the sentence
---

## 2. Result Banners (Info Boxes)

Result banners use `<div className="info-box [variant]">`. Structure is always:

```jsx
<div className="info-box alert-[variant]">
  <strong>[Icon] [Title]:</strong>
  <p>
    [Single complete-sentence explanation.]{" "}
    <span className="source-tag" title="Article X">Source</span>
  </p>
</div>
```

### Variant selection

| Variant | Class | When to use |
|---|---|---|
| Blue informational | `alert-info` | Context, guidance, auto-populated values carried from prior steps |
| Yellow warning | `alert-warning` | High-risk classification, reclassification, conflicts, potential impact |
| Green success | `alert-success` | Cleared / not triggered / role confirmed / no obligations |
| Red danger | `alert-danger` | Prohibited practice, hard error, missing required data |

### Colour override rule

**Never override banner colours with inline styles.** Use only the CSS modifier classes above.
Inline `backgroundColor`, `borderColor`, `background`, or `borderLeft` overrides on
`.info-box` or `.helper-box` elements are not permitted.
Spacing adjustments such as `style={{ marginTop: "24px" }}` are acceptable.

The `helper-box` class is for guidance and definition boxes that appear *before* a question,
not as result banners. It uses the same variant modifier classes.

---

## 3. Typography Hierarchy

| Element | Usage |
|---|---|
| `<h1>` | Screen title inside `.screen-header` only |
| `<h2>` | Major section headings within `.screen-content` (rare) |
| `<h3>` | Step and sub-section headings within `.screen-content` |
| `<h4>` | Item titles inside step cards (e.g. `.step-content`) |
| `<strong>` | Banner title prefix, key terms on first use, label role prefix before ` — ` |
| `<p>` / plain text | All explanatory and body text |

**What should NOT be bold:** general body sentences, source tag text, option descriptions,
body `<p>` content inside banners (only the leading `<strong>` prefix is bold).

**ALL-CAPS** text is acceptable only inside `helper-box` definition bullet lists as a visual key
(e.g. `AI SYSTEM`, `GENERAL-PURPOSE AI MODEL`). Do not use ALL-CAPS elsewhere.

---

## 4. Spacing and Layout

- **Screen content padding:** `.screen-content` has `padding: 28px 32px` built in —
  do not add extra wrapper padding.
- **Between major step sections:** use
  `style={{ marginBottom: "32px", paddingTop: "24px", borderTop: "2px solid var(--border-color)" }}`
  on the section wrapper `<div>`.
- **Text-to-source-tag spacing:** use `{" "}` before a source tag that follows a sentence
  without trailing punctuation. The CSS `margin-left: 3px` provides visual separation —
  no `&nbsp;` needed.
- **Option groups:** use `.options-group.radio-group` or `.options-group.checkbox-group`.
  The `gap: 10px` between items comes from CSS — do not add margins to individual labels.
- **Navigation bar:** always `<div className="screen-navigation">` at the bottom of
  `.screen-content`. Back button: `.btn.btn-secondary`; Next/Continue: `.btn.btn-primary`.

---

## 5. Punctuation Spacing

- **Em-dash in labels and titles:** `[Term] — [Description]` with a space on **both sides**
  of the em-dash.
- **Colon after bold label:** `<strong>Label:</strong>{" "}Text` — always include `{" "}`
  after the closing `</strong>` so text is not flush against the bold.
- **Parentheses/colons/hyphens** must **not** be preceded by a space:
  write `Article 3(1)`, not `Article 3 (1)`.
- **Sentence-ending punctuation** goes before a trailing source tag:
  `...in this Regulation.{" "}<span className="source-tag" ...>Source</span>`

---

## 6. User-Facing Display of Role Names

Never display internal identifier strings with underscores.

- ✅ Display: `Product Manufacturer`, `Authorised Representative`
- ❌ Never show: `Product_Manufacturer`, `Authorised_Representative`

In React, convert before rendering via `.replace(/_/g, " ")`, a lookup map
(e.g. `legalRoleDefinitions[r]?.title`), or a dedicated display table.
Safe fallback: `` `legalRoleDefinitions[r]?.title || r.replace(/_/g, " ")` ``.

---

## 7. Modal Pattern — Selection Conflict and Override Confirmation

All modals use component-local state (`pendingX` / `confirmX` / `cancelX` — no shared context).

```jsx
{pendingX && (
  <div className="modal-overlay" onClick={cancelX}>
    <div className="modal-box" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <strong>⚠️ [Short Title]</strong>
      </div>
      <div className="modal-body">
        <p style={{ marginBottom: "12px" }}>[What will change — complete sentence.]</p>
        <p style={{ marginBottom: "14px" }}>[Legal explanation — complete sentence.]</p>
        <span className="source-tag" title="Article X">Source</span>
      </div>
      <div className="modal-footer">
        {/* Swap conflict: two buttons */}
        <button className="btn btn-secondary" onClick={cancelX}>Cancel</button>
        <button className="btn btn-primary" onClick={confirmX}>Confirm — [action label]</button>
        {/* Block conflict: single button */}
        <button className="btn btn-primary" onClick={cancelX}>Understood</button>
      </div>
    </div>
  </div>
)}
```

### Swap vs. Block principle

**Step 1 selections always take priority over Step 2.**

- **Swap** — a Step 1 item is selected while a conflicting Step 2 item is already active:
  show Cancel + Confirm. The Step 2 item is removed on confirm. The Step 1 selection proceeds.
- **Block** — a Step 2 item is attempted while a conflicting Step 1 item is already selected:
  show "Understood" only. The attempted Step 2 selection is not applied.

Both directions apply for every mutual-exclusivity rule (Rules 2–5 in Screen 2).

Source tag inside modal body: `title` attribute only, visible text is always `Source`.

---

## 8. Screen Header

Every screen starts with:

```jsx
<div className="screen-header">
  <h1>Part N: [Title]</h1>
  <p className="subtitle">
    [One-sentence description of this screen's purpose.]{" "}
    <span className="source-tag" title="Article X">Source</span>
  </p>
</div>
```

The `<ProgressBar />` component appears inside `.screen-header` only on Screens 13 and 14.

---

## 9. Step Section Headers

Within `.screen-content`, each logical step uses:

```jsx
<h3>
  Step N: [Title]{" "}
  <span className="source-tag" title="Article X">Source</span>
</h3>
```

The source tag is optional on step headers but must follow Guideline 1 when present.

---

## 10. Checkbox and Radio Option Labels

```jsx
<label className="checkbox-option">
  <input type="checkbox" checked={...} onChange={...} />
  <span>
    {action.role && <strong>{action.role}</strong>}
    {action.role && " — "}
    {action.label}
    {action.article && (
      <span className="source-tag" title={action.article} style={{ marginLeft: "6px" }}>Source</span>
    )}
  </span>
</label>
```

- Bold role prefix (`action.role`) followed by ` — ` em-dash separator, then plain label text.
- Source tag at end with `marginLeft: "6px"`.
- "None of the above" options: no bold prefix, no source tag.