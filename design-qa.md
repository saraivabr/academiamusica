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

final result: passed
