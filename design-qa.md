# Design QA — musicacom.ia home

## Comparison target

- Source visual truth: `/var/folders/qr/3kw6mcn52rs3n2v1mz_chblc0000gn/T/codex-clipboard-e6dc28ee-9ce5-4bac-80ea-494e342b5f6f.png`
- Normalized source crop: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/suno-reference-page.png`
- Final background asset: `/Users/saraiva/academiamusica/public/hero-studio-empty-v3.webp`
- Final desktop implementation: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-no-person-desktop.jpg`
- Final mobile implementation: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-no-person-mobile-final.jpg`
- Full-view comparison: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/comparison-no-person-final.jpg`
- Focused center comparison: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/comparison-focus-final.png`

## Normalization

- Desktop source pixels: 1920 × 912.
- Desktop implementation pixels: 1920 × 912.
- CSS viewport: 1920 × 912.
- Density: 1 CSS pixel to 1 captured pixel; no density downsampling required.
- Mobile implementation pixels and CSS viewport: 390 × 844.
- State: anonymous home, measurement consent dismissed for unobstructed comparison, prompt empty, audio paused.

## Full-view comparison evidence

The implementation carries over the source's useful composition principles: a full-bleed music scene, minimal top navigation, one dominant promise, a single creation control, peripheral music cards, and restrained proof near the bottom. It intentionally does not clone Suno's palette, copy, branding, or artwork. The revised musicacom.ia hero uses an empty recording studio, real music equipment, a visible sound wave, and its emerald identity, with no personal photography.

## Focused region comparison evidence

The earlier focused center comparison remains applicable to the unchanged creation control. The final revision specifically changes background relevance and composition: the desktop content occupies intentional dark space while the microphone, speakers, console, keyboard, and vinyl stay peripheral. The mobile crop deliberately reveals the console and speakers so the scene still reads as a studio at 390 px.

## Required fidelity surfaces

- Fonts and typography: the source's direct sans-serif hierarchy is preserved. The implementation uses a heavier display weight and larger scale as an intentional musicacom.ia brand decision. Desktop alignment follows the studio image's negative space; mobile returns to centered copy. Wrapping is controlled with no truncation.
- Spacing and layout rhythm: navigation, headline, copy, prompt, micro-proof, and bottom proof form a stable sequence. Desktop edge cards remain peripheral. The 390 px layout has no horizontal page overflow.
- Colors and visual tokens: the implementation replaces Suno's amber-red field with the existing musicacom.ia emerald and obsidian palette. The studio's blue-purple waveform provides a restrained secondary accent. Text and controls remain legible.
- Image quality and asset fidelity: the hero uses a high-resolution raster scene generated specifically as an empty music studio with no people, faces, silhouettes, logos, or text. Personal photos were also removed from the floating cards, player cover, tutorial art, and launch-kit visual. No source logos, placeholder art, handcrafted SVGs, or CSS-drawn hero imagery are used.
- Copy and content: the page is product-specific and truthful: one free music creation per day, no card, no technical prompt, and two versions per creation. The input captures the user's story and passes it into the existing creator route after registration.

## Interaction and runtime checks

- Suggestion button fills the story field and enables the primary action.
- Primary action routes to registration with the story preserved in the allowed `next` creator URL.
- The music example starts and pauses successfully.
- Desktop and mobile browser consoles reported no warnings or errors.
- Desktop and mobile page width matched the viewport with no horizontal overflow.

## Comparison history

### Iteration 1

- Finding: [P2] the existing fixed mobile CTA duplicated the new prompt action and obscured the bottom of the first viewport.
- Evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-after-mobile-v1.png`
- Fix: removed the fixed mobile CTA presentation so the story prompt remains the single primary action in the opening experience.
- Post-fix evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-after-mobile-fresh.png`

### Iteration 2

- Finding: [P1] the generated abstract background felt disconnected from music creation and did not explain why this was musicacom.ia.
- Evidence: user review of `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-after-desktop-final.png`.
- Fix: replaced the abstract soundscape with the existing recording-studio image, moved desktop content into the image's negative space, repositioned the album cards, and selected a sound-wave crop for mobile.
- Post-fix desktop evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-background-studio-desktop.png`.
- Post-fix mobile evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-background-studio-mobile.png`.
- Post-fix comparison: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/comparison-background-studio.png`.

### Iteration 3

- Finding: [P1] the studio revision used the founder's image, while the user explicitly does not want personal photography in the homepage.
- Evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-background-studio-desktop.png`.
- Fix: generated an empty studio background and replaced every remaining personal-photo asset referenced by the homepage with music, product, or brand imagery.
- Post-fix desktop evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-no-person-desktop.jpg`.
- Post-fix mobile evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/home-no-person-mobile-final.jpg`.
- Post-fix comparison: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-home/comparison-no-person-final.jpg`.

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] Revisit the exact headline-to-prompt scale after real traffic reveals whether users start typing or scroll first.

## Implementation checklist

- [x] Match the source's immersive, direct interaction model without copying its brand.
- [x] Use a hero image that visibly communicates music creation.
- [x] Use product-specific copy and assets.
- [x] Make the hero prompt functional.
- [x] Verify desktop and mobile layouts.
- [x] Test the primary route and audio interaction.
- [x] Confirm a production-compatible build.

Previous review result: passed

---

# Design QA — etapa de clima do criador

## Comparison target

- Source visual truth: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/01-current-sensation.png`
- Final desktop implementation: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/05-final-desktop.png`
- Final mobile implementation: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/04-redesigned-mobile.png`
- Full-view side-by-side comparison: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/06-before-after.png`

## Normalization

- Source pixels: 1280 × 720.
- Desktop implementation pixels: 1280 × 720.
- Desktop CSS viewport: 1280 × 720.
- Density: 1 CSS pixel to 1 captured pixel; no downsampling required.
- Mobile CSS viewport: 390 × 844.
- Mobile full-page implementation pixels: 390 × 1333.
- State: authenticated creator, step 3 of 5, a story already provided, `Saudade` selected in the final capture.

## Full-view comparison evidence

The combined comparison was opened and reviewed as one 2560 × 720 image. The previous screen asked users to translate their story into six abstract emotion nouns. The new screen preserves the route, container, progress, controls, brand palette, and six engine-compatible values, while making each option an everyday intention such as “Quero abrir um sorriso” and “Quero lembrar com carinho”. The change is intentionally denser vertically because the phrases need more room, but the entire choice set and primary action remain visible in the same desktop viewport.

## Focused region comparison evidence

A separate focused crop was not needed: the full comparison uses native 1:1 desktop captures and the heading, helper, six choices, selected state, and navigation controls are all legible at original size. The 390 px full-page capture was reviewed separately for wrapping, target size, selection state, and sticky controls.

## Required fidelity surfaces

- Fonts and typography: the existing sans-serif family, uppercase eyebrow, heading scale, weights, line height, and selected-label treatment are preserved. Longer choices wrap without truncation on mobile.
- Spacing and layout rhythm: desktop moves from three compact columns to two readable columns; mobile keeps two columns while placing the semantic label below the phrase. The sticky controls remain reachable and no content overlaps them.
- Colors and visual tokens: existing obsidian, muted gray, emerald border, and selected-state tokens are reused. No new brand color was introduced.
- Image quality and asset fidelity: this step does not require image assets. No placeholder imagery, fake illustration, custom SVG, or decorative emoji was added.
- Copy and content: the task language now describes a recognizable outcome instead of demanding emotional taxonomy. The engine still receives the established values `Alegria`, `Saudade`, `Esperança`, `Paixão`, `Superação`, or `Festa`; only the decision language changed.

## Interaction and runtime checks

- Selecting “Quero lembrar com carinho” updates `aria-pressed` to `true`.
- Continuing advances to “Qual estilo combina com a sua ideia?”.
- Returning restores the redesigned climate step and selected state.
- Desktop and mobile DOM expose one heading, six buttons, and the expected next action.
- Browser console reported no errors.

## Comparison history

### Iteration 1

- Finding: [P1] the emotion nouns were abstract and forced users to classify their story before they could make a simple creative decision.
- Evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/01-current-sensation.png`
- Fix: rewrote the heading around the listening moment, added one sentence of guidance, and converted every option into a first-person intention while retaining the internal emotion value.
- Post-fix evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/05-final-desktop.png`

### Iteration 2

- Finding: [P2] the first revision added text-glyph decoration that did not improve the decision and conflicted with the product's asset-quality standard.
- Fix: removed decorative glyphs, gave the phrase more horizontal room, and kept the compact emotion value only as a supporting chip.
- Post-fix desktop evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/05-final-desktop.png`
- Post-fix mobile evidence: `/Users/saraiva/.codex/visualizations/2026/07/29/019fab87-1632-7441-8339-27ace7dec5d6/musicacom-sensation/04-redesigned-mobile.png`

## Findings

No actionable P0, P1, or P2 findings remain.

## Follow-up polish

- [P3] Validate with real sessions whether users prefer the current two-column mobile scan or a one-column list; both remain functionally clear.

## Implementation checklist

- [x] Preserve all six values expected by the generation brief.
- [x] Replace abstract labels with recognizable listening intentions.
- [x] Keep the existing product visual language.
- [x] Verify selection and continuation behavior.
- [x] Verify desktop and 390 px mobile layouts.
- [x] Check the browser console.

final result: passed
