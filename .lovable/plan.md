# Simplified campaign management and content editor

## Goal
Make campaign setup easier to scan and manage: four chosen promotion drop areas, audience-aware media assignment, a direct channel-strategy launcher, and a reference-matched content editor with separate Direct and OTA sections.

## Promotion management
- Add a visible “No promotion” column beside the selected promotion columns, using the same visual structure as an offer column.
- Place every unassigned campaign in “No promotion” by default instead of keeping a separate campaign row.
- Make campaign cards draggable directly between “No promotion” and promotion columns; dropping back into “No promotion” removes the offer for the applicable guest segments.
- Keep four visible, user-selectable promotion areas and a compact control for changing which offers occupy them.
- After assignment, show Direct and OTA as clear checkboxes on each campaign/offering relationship so either or both guest segments can be enabled.
- Preserve the one-promotion-per-campaign-segment rule, clearly showing when a segment is already assigned elsewhere.
- Keep promotion creation/editing/duplication/deletion in the existing Promotions tab; this surface remains assignment-only.

## Media management
- Replace the single “All campaigns” target with three global targets: All guests, Direct guests, and OTA guests.
- Dropping on All applies media to both segments across every campaign; Direct and OTA apply only to that segment across every campaign.
- Show a thumbnail preview and filename for every assigned image or video in global and individual targets.
- Global targets list files applied across their full scope and provide one remove action that detaches a file from every affected campaign.
- Separate Text and Email into top-level tabs; each tab has its own Direct and OTA targets and assignments.
- Keep individual campaign targets with Direct and OTA controls/removal, and extend media helpers to operate per channel and audience while preserving existing combined campaign summaries.

## Channel strategy
- Replace the collapsible strategy summary on the campaign page with one clear “Manage channel strategy” button.
- Keep all guidance inside the popup rather than in a dropdown/expanded page panel.
- Show the three strategies as visible drop columns with their explanation directly beneath each heading.
- Add a small “What does this mean?” help control for the fuller explanation while keeping drag-and-drop and staged Apply behavior.
- Keep Promotion and Text media as direct management buttons with concise status counts rather than accordion panels.

## Content editing popup
- Retain the large centered popup, and fix its stacking so promotion selection, warnings, and template dialogs always open above it and always restore interaction after close.
- Match the supplied text/email references: editing controls on the left, persistent live preview on the right, compact header/actions, restrained borders, and clear information hierarchy.
- Put Text and Email in top-level tabs. Inside each channel tab, show separate Direct and OTA sections; clicking a section activates it and updates the preview to that audience.
- Text sections show the message and related editable text fields first; Media and Promotion move into an expandable “Media and promotion” area for that audience.
- Email sections show subject, preheader, heading, body, and button fields first; Promotion moves into an expandable “Promotion settings” area. Template/layout controls stay relevant to email and visually secondary to copy editing.
- Add an emoji picker beside the Text message control and beside relevant Email copy fields so chosen emoji are inserted into the active field.
- Promotion Change and Remove remain available inside each audience’s advanced area and continue using the separate promotion picker.

## History, help, and spam checking
- Add History, Help, and Spam check actions to each audience content section in the visual style of the reference.
- History opens a lightweight panel using the existing editor/update metadata and clearly indicates when no earlier revision exists.
- Help opens concise field and merge-tag guidance relevant to Text or Email.
- Spam check provides practical local checks for risky wording, excessive capitals/punctuation, suspicious links, missing context, and text length; results update from the current draft without external services.

## Preview polish
- Keep the text preview synchronized with the active Direct/OTA section, including its media and promotion.
- Rework the phone frame and conversation chrome toward the supplied iPhone 17 Pro Max references: slimmer titanium rails, larger modern proportions, compact contact header, current iMessage bubbles, and a glass composer without compromising readability.
- Keep email promotions naturally before the call-to-action in every layout and synchronize the preview with the active audience.

## Technical details
- Main files: `MarketingTools.tsx`, `PromoDropOverlay.tsx`, `MediaAssignOverlay.tsx`, `StrategyOverlay.tsx`, `CampaignEditor.tsx`, `TextEditor.tsx`, `EmailEditor.tsx`, `SmsPreview.tsx`, `PhoneMockup.tsx`, and focused helpers in `marketing.ts`.
- Reuse existing semantic design tokens and Button components; no new backend or persistence service is required.
- Preserve all current campaign/promotion data and browser-local persistence, adding only backward-compatible UI state where needed.
- Verify drag/drop, segment toggles, picker cancellation, warnings, History/Help/Spam panels, and active preview switching at desktop and mobile widths with no console errors.
