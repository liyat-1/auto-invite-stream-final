# Promotion Banner and Editor Cleanup

## Goal
Make promotion content clearer and easier to edit: show the offer description on every banner, add polished image-led offer layouts inspired by the reference, keep content editing in a true popup, and prevent the promotion chooser from trapping the screen.

## Changes

### Campaign content popup
- Replace the current full-screen content editor with a centered, large popup over the campaign list.
- Keep its header, audience/channel controls, message editor, promotion controls, and save actions inside one scrollable popup.
- Preserve unsaved-change, save, and revert confirmations.

### Promotion chooser fix
- Correct the popup layering that currently places the promotion chooser behind the content editor.
- Ensure **Change** opens a visible, usable chooser above the editor.
- Close the chooser immediately after selecting, removing, or cancelling, while leaving the content editor open and responsive.

### Banner descriptions
- Display the promotion’s short description as part of every banner template, with readable spacing and sensible truncation for compact previews.
- Keep the headline, description, code, discount, dates, logo, and image visually distinct.
- Update the live banner preview as the description is edited.

### New offer-card templates
- Add image-led, modern offer-card layouts inspired by the supplied examples, without claim buttons.
- Include variations suited to upgrades, time-based offers, and included perks, using the existing photo/logo, offer description, discount, code, and stay details.
- Add matching template thumbnails and descriptions to the promotion editor.

## Validation
- Open an active campaign, continue into content editing, and confirm it appears as a popup rather than a full-screen page.
- Click **Change**, select a different promotion, reopen the chooser, cancel it, and remove the promotion without the screen becoming stuck.
- Create or edit a promotion and verify descriptions and new templates in the live preview, email preview, and text preview.
- Check desktop and mobile layouts for scrolling, popup layering, readable text, and working controls.
