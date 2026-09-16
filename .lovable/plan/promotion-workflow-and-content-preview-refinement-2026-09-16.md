# Promotion workflow and content preview refinement

## Goal
Make promotion creation and maintenance clearly separate from campaign assignment, while showing the selected promotion exactly where guests will see it in both text and email content.

## Changes

### 1. Vertical campaign tools
- Stack Channel strategy, Promotions, and Text media vertically on desktop as well as smaller screens.
- Keep the existing collapsible behavior and overlays unchanged.

### 2. Two clear promotion tabs
- Add a **Promotions** tab for creating, editing, duplicating, and deleting offers.
- Add an **Assignments** tab focused only on where each offer is used, with campaign counts and the existing assignment overlay.
- Keep search and the main action contextual to the active tab.
- Add a confirmation before deletion; removing a promotion will also clear references to it from campaign assignments so no broken selections remain.
- Duplicate an offer with all banner settings and media, using a new identity and a “Copy” name suffix.

### 3. Cleaner promotion editor overlay
- Keep the full-screen pop-up, but simplify the visual hierarchy into a calm single editing column.
- Place the live promotion preview at the bottom of the editing flow instead of above or beside the controls.
- Keep Details and Banner design distinct, with a clear footer for Cancel and Save/Create.
- Preserve template, colour, logo/photo, wording, emoji, date, code, and discount editing.

### 4. Promotion controls inside campaign content editing
- Move the selected promotion section below the text/email content editor rather than above it.
- Show the resolved promotion as a compact summary/banner with a clear **Change** button.
- Use the existing audience-specific assignment rules, including inherited, none, and custom selections.
- Reuse the established promotion selector instead of exposing a dense dropdown.

### 5. Guest-facing text and email previews
- Pass the currently resolved promotion into both content editors.
- In the text preview, show the offer as a natural follow-up message beneath the campaign copy, including the offer headline and code/action.
- In the email preview, render a scaled promotion banner after the editable email content and before the footer.
- Keep promotion content read-only inside campaign editing; the **Change** action changes assignment, while promotion content is maintained in the Promotions tab.

## Validation
- Verify the campaign tools stack vertically at desktop and mobile widths.
- Verify create, edit, duplicate, delete, and delete-confirmation behavior.
- Verify the Assignments tab opens and updates campaign assignments independently.
- Verify Direct and OTA promotions update correctly through Change.
- Verify attached and absent promotion states in both text and email previews.
- Check the full-screen editors at desktop and mobile widths with no overlap or console errors.
