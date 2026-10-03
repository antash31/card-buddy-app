# Card Buddy — Design System: **Lumen**

> Soft cards on a lit canvas, one confident blue, and a few panes of liquid glass.

Lumen replaces the earlier "Statement" system (paper, hairline rules, Bodoni + Golos, pine). It was
designed from a reference mock-up of a fintech app — bright pale canvas, big bold headlines, white
rounded cards with long soft shadows, vivid stacked card art, a single blue accent, frosted glass —
and then extended with a real iOS-26-style liquid-glass material for the surfaces that float.

**Source of truth:** `src/theme/` (tokens) and `src/components/` (the kit). If this file and the
code disagree, the code wins — fix this file.

| Layer | Where |
| ----- | ----- |
| Colour | `src/theme/colors.js` |
| Material recipes (glass, canvas, shadows, card tones) | `src/theme/materials.js` |
| Type, spacing, radius, metrics | `src/theme/tokens.js`, `src/theme/fonts.js` |
| Motion | `src/theme/motion.js` |
| Components | `src/components/{surfaces,actions,forms,layout,navigation,brand,motion,icons}` |
| Feature compounds | `src/features/*/components` |

Read tokens through the theme — `const theme = useTheme()` — never import the raw `palette` into a
component (the one exception is decorative illustration, e.g. the lime scribble on Welcome).

---

## 1. Principles

1. **A lit canvas, not a white page.** Every screen sits on `AmbientBackground`: a cool gradient
   with three large pools of coloured light (blue, violet, a touch of lime). The light is what gives
   glass something to refract and what makes white cards read as *lit*.
2. **Soft cards, generously rounded.** Grouped content lives on `Surface` cards — white, 28pt
   corners, a long low blue-tinted shadow. Separate cards with space, not borders.
3. **Glass is for what floats.** Liquid glass is reserved for surfaces that genuinely sit above
   moving content or want to feel special: the tab capsule, the composer, round icon lenses, the
   identity card, the verdict. Never for every card — that is just a blur tax.
4. **One accent.** Blue is the only chromatic colour a *control* is ever painted in. Bright
   illustration colours (lime, coral, violet, sun…) appear on decoration only — card art, the
   scribble, ambient light — never on text, buttons or state.
5. **Big, heavy, tight type.** Manrope ExtraBold headlines pulled in tight; medium-weight body.
   Hierarchy comes from weight and size, not from rules and boxes.
6. **Motion confirms.** Springs on press-down, a liquid settle where the user's own tap supplies the
   momentum (tab lens, card re-shuffle). Reduce-motion and reduce-transparency are honoured
   everywhere, always.
7. **Voice is unchanged.** The look got friendlier; the copy did not. Precise, factual, no
   confetti, no "great job!" — "Airtel Axis Bank Credit Card", not "Your awesome Airtel card!".

### How the reference maps onto the system

| In the reference | In Lumen |
| ---------------- | -------- |
| Pale grey-blue page with soft colour bleeding in | `AmbientBackground` |
| Big black headline, tiny blue eyebrow | `ScreenHeader` (eyebrow in `primary`, title `display`) |
| Lime scribble under "people" | `Scribble` on Welcome (decoration only) |
| "BLOG 124 / + CREATE", "LAST ACTIONS 1" | `SectionLabel` (muted caps label, blue count, blue action) |
| White rounded cards with soft shadow | `Surface tone="raised"` |
| Cream "balance" / "subscriptions" tiles | `Surface tone="inset"` / the `inset` material |
| Round glass icon buttons (back, bag, bell) | `IconButton variant="glass"` |
| Blue square arrow button | `IconButton variant="solid"`, `PrimaryButton` |
| Stacked bright cards, glass band with number | `CardArt`, `WalletStack`, `CardStack` |
| Icon tiles (Sketch, Spotify) | the tinted rounded-square tile in `TextField`, `ProfileScreen` rows |
| "Refund" pill, "Week" selector | `Chip` |
| iOS-style toggle with blue knob | `Switch` with `theme.colors.primary` track |
| Orange-to-blue arc chart | proportional bars in the SwipeMax ranking |

---

## 2. Foundations

### 2.1 Colour

Semantic tokens (`theme.colors.*`) — the only names components use.

| Token | Light | Dark | Used for |
| ----- | ----- | ---- | -------- |
| `background` | `#EDF1F6` | `#090C13` | The canvas |
| `surface` | `#FFFFFF` | `#151A27` | Raised cards |
| `surfaceAlt` | `#F4F6FA` | `#0F131D` | Recessed tiles, icon tiles |
| `border` / `borderStrong` | 8% / 16% ink | 9% / 18% white | Hairlines, dividers |
| `text` | `#0F1521` | `#EEF2FA` | Headlines, body |
| `textMuted` | `#566075` | `#9EA9BE` | Secondary copy, labels |
| `textFaint` | `#8791A4` | `#6C778C` | Icons, separators, placeholders — **not facts** |
| `primary` | `#2863E3` | `#6EA3FF` | The accent: actions, links, selection |
| `primaryPressed` / `primarySubtle` / `primaryEdge` | `#1F52C4` / `#E7EFFF` / `#C4D6FA` | `#5890F0` / 16% blue / 34% blue | Pressed, tinted fills, tinted rims |
| `onPrimary` | `#FFFFFF` | `#06132E` | Label on the accent (flips in dark) |
| `success` / `successSubtle` | `#0A7849` / `#E1F5EB` | `#46D39A` / 14% | Positive value, "Held" |
| `warning` / `warningSubtle` | `#A25F00` / `#FFF1D6` | `#F2B24A` / 14% | Caps, fees |
| `danger` / `dangerSubtle` | `#C9301F` / `#FDEBE8` | `#FF7A6B` / 14% | Errors, destructive |
| `overlay` | 40% ink | 66% black | Scrims |

**Contrast is computed, not eyeballed** (WCAG ratios, light mode unless stated):

| Pair | Ratio | Rule |
| ---- | ----- | ---- |
| `text` on white / canvas | 18.3 / 16.1 | any size |
| `textMuted` on white / canvas / inset | 6.3 / 5.6 / 5.8 | any size |
| `primary` on white / canvas / `primarySubtle` | 5.3 / 4.65 / 4.6 | any size |
| `onPrimary` on the button gradient (label position / lit top edge / base) | 4.9 / 4.0 / 6.1 | label is centred |
| `success` / `danger` / `warning` on white, canvas and their own tinted fills | 4.5 – 5.5 (lowest: `warning` on its fill, 4.51) | any size |
| `textFaint` on white | 3.2 | **non-text only** — never a fact the user must read |
| Dark: `text` / `textMuted` / `primary` on card | 15.5 / 7.3 / 6.9 | any size |
| Dark: `onPrimary` on the accent | 7.3 | any size |

If you add a colour, add its ratio here. If you need a small label in `textFaint`, use `textMuted`.

**Illustration accents** (`palette.lime / coral / violet / sky / sun / graphite / mint / peach /
rose`) are decoration only. They live in `materials.cardTones` and `materials.orbs`.

### 2.2 Typography

One family, **Manrope**, loaded in `src/theme/fonts.js` (500 / 600 / 700 / 800). Weight is chosen by
**font family name**, never `fontWeight` — static Google Font files are separate families.

Role names are stable (`fonts.text.regular|medium|semibold|bold`,
`fonts.display.regular|medium|semibold|bold`) and sit **one notch heavier** than the usual mapping:
`text.regular` is Medium 500, `text.semibold` is Bold 700, `display.bold` is ExtraBold 800.

Always use a `theme.textStyles.*` set — family, size, leading and tracking travel together.

| Style | Font | Size / leading | Tracking | Use |
| ----- | ---- | -------------- | -------- | --- |
| `hero` | ExtraBold | 42 / 46 | −1.5 | A landing headline. Once per screen at most |
| `display` | ExtraBold | 33 / 38 | −1.0 | Screen titles (`ScreenHeader`) |
| `title` | ExtraBold | 25 / 30 | −0.6 | Verdict names, avatar initials |
| `heading` | Bold | 19 / 25 | −0.3 | Section headings inside a card |
| `body` | Medium | 16 / 24 | 0 | Paragraphs, field values |
| `bodyStrong` | Bold | 16 / 24 | 0 | Row titles, emphasis |
| `label` | SemiBold | 13 / 18 | 0 | Field helper, links, chips |
| `caption` | Medium | 13 / 18 | 0 | Fine print |
| `micro` | Bold, **uppercase** | 11 / 14 | +0.9 | Eyebrows, section labels, status pills |
| `figure` | ExtraBold, tabular | 38 / 42 | −1.2 | Big money (the verdict amount) |
| `numeric` | Bold, tabular | 16 / 24 | 0 | Figures in a column |
| `button` | Bold | 16 / 24 | −0.1 | Button labels |

Money and anything in a column uses tabular figures (`figure`, `numeric`). Rupee amounts are always
formatted with `formatRupees` in `src/lib/money.js`.

### 2.3 Space, radius, elevation

**Spacing** (4pt grid) — `none 0 · hair 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32 · xxxl 48 ·
huge 64 · giant 96`. Page gutter is `metrics.gutter` = **20**. Cards in a column are **20** apart
(`AppScreen` sets this); rows inside a card are separated by `Rule`.

**Radius** — `xs 8 · sm 12 · md 16 · lg 22 · xl 28 · xxl 36 · full 999`. Radii nest: a surface's
radius is bigger than anything inside it (outer ≈ inner + padding). Cards are `xl`, fields `lg`,
icon tiles `sm`, buttons / chips / tab capsule / avatars `full`.

**Elevation** — `theme.materials.shadow.{sm, md, lg}`, mode-aware (soft blue-tinted in light, deep
black in dark):

| Level | Light | Use |
| ----- | ----- | --- |
| `sm` | 6% · r10 · y4 | Chips, secondary buttons, round lenses |
| `md` | 9% · r24 · y10 | Cards (default) |
| `lg` | 16% · r40 · y18 | The tab capsule, the verdict, the hero card |
| `button.glow` | 38% accent · r18 · y9 | The one primary button; a lit chip |

Shadows go on the **outer** view and clipping on an **inner** one — one view can't both clip and cast
on iOS. On web, give the shadow wrapper the same `borderRadius` as the card or it casts a rectangle.

### 2.4 Motion

`src/theme/motion.js`. Reanimated springs are `{ dampingRatio, duration }` (Apple's model).

| Spring | ζ / ms | Use |
| ------ | ------ | --- |
| `press` | 1 / 180 | Press feedback — starts on touch-down |
| `snappy` | 1 / 280 | Small reveals, floating labels |
| `default` | 1 / 400 | Entrances (`Reveal`) |
| `drawer` | 0.8 / 300 | Sheets |
| `momentum` | 0.8 / 400 | Things the user threw (the welcome card) |
| `liquid` | 0.78 / 460 | The tab-bar lens and the wallet re-shuffle — the tap supplies the momentum |

Reduced motion swaps every spring for a short fade (`timings.fast|base|slow` = 140 / 220 / 320 ms)
and drops translation and scale. Never animate a `TextInput` to `opacity: 0` on iOS (hit-testing dies).

### 2.5 Layout metrics

`theme.metrics`: `fieldHeight 60 · buttonHeight 56 · iconButton 44 · tabBarHeight 66 · tabBarGap 10 ·
tabBarReserve 100 · gutter 20`. Scrolling screens use `AppScreen`, which already reserves
`insets.bottom + tabBarReserve` so the last card clears the floating capsule.

---

## 3. Materials

### 3.1 Liquid glass (`Glass`, `materials.glass`)

Five layers, bottom to top — each is a token, so the effect is tuned in one file:

1. **blur** — `BlurView` (`intensity`, `tint`)
2. **fill** — a translucent wash that sets how much backdrop shows through
3. **sheen** — a diagonal gradient, bright top-left, fading to nothing, faintly back at the
   bottom-right. This is what makes a pane read as a curved lens rather than frosted plastic
4. **edge** — a 1px specular rim brighter than the fill
5. **shadow** — soft, below the pane, so it floats

| Variant | Light fill | Dark fill | Blur | Use |
| ------- | ---------- | --------- | ---- | --- |
| `regular` | 58% white | 7.5% white | 48 / 40 | Round lenses, the identity card |
| `thick` | 66% white | 12% white | 80 / 70 | The tab capsule, the composer |
| `clear` | 32% white | 4% white | 26 / 24 | Over busy imagery |
| `tinted` | 16% accent | 18% accent | 50 / 44 | The verdict — the one place glass is stained |

**Degradation, in order:** full blur (iOS, web) → translucent fill without blur (Android, where live
blur is costly) → opaque fill (reduce-transparency, always honoured).

Glass only reads as glass over something. That is the job of the ambient canvas.

### 3.2 Ambient canvas (`AmbientBackground`)

A vertical gradient (`materials.canvas`) plus three radial pools (`materials.orbs`) at the screen's
corners where content is sparse. **Static** — nothing drifts or breathes (battery, and it reads as a
tool rather than a screensaver). Every screen mounts its own copy: native-stack transitions slide two
screens past each other, and a transparent screen would show its neighbour's text through.

### 3.3 Soft cards (`Surface`) and the ground they sit on

| Tone | Look | Use |
| ---- | ---- | --- |
| `raised` (default) | White, `md` shadow, hairline white rim | Content you read or act on |
| `inset` | 4.5% ink wash, no shadow | A tile inside a raised card, a quiet group |
| `tinted` | `primarySubtle` + `primaryEdge` | Selected / highlighted |
| `danger` | `dangerSubtle` | A failed region |
| `glass`, `glassThick`, `glassClear`, `glassTinted` | `Glass` | Floating / special |

**Never put a raised card inside a raised card.** Inside one, use `inset` or `tinted`.

`Surface` provides a `SurfaceContext` (`canvas` · `card` · `glass`) and controls consult it — a
`TextField` on a raised card **recesses** (`#F3F5F9`, no resting shadow) instead of floating white on
white. You get this for free; don't pass flags.

### 3.4 Card art (`CardArt`)

The catalog has no card images, so cards are drawn: a saturated diagonal gradient, a giant
translucent **monogram** (first two letters of the issuer) cut off by the right edge, the network
mark top-left, and a pane of glass along the bottom carrying the card's name.

- Colour comes from the **bank** (`toneForBank`, `cardTone.js`): all cards from one issuer share a hue
  — an at-a-glance grouping cue, not a claim about real branding.
- The band is **smoked** (dark pane, white type) on blue / graphite / violet / coral and **frosted**
  (light pane, dark type) on sun / mint. White type on a light frosted band measured 1.8–3.4:1, so
  this is not a stylistic choice — don't "unify" it.
- The network mark on the plate is a decorative duplicate of the network shown in text beside the
  card; it carries a soft shadow instead of meeting 4.5:1. **Never make it the only place a fact
  appears.**
- Real card numbers are never stored or shown. Digits on the welcome hero are ornamental.
- Thumbnails (< 150pt wide) drop the band, network and title.

---

## 4. Components

All live under `src/components/` and use `useTheme()`. Feature code imports them; they never import
a feature.

### Surfaces — `surfaces/`
| Component | Props | Notes |
| --------- | ----- | ----- |
| `AmbientBackground` | `children, style` | The ground. Every screen root |
| `Surface` | `tone, radius, padded, shadow, style, contentStyle` | Soft card; provides `SurfaceContext` |
| `Glass` | `variant, radius, shadow, blur, clip, style, contentStyle` | The liquid-glass pane |
| `Rule` | `weight ('hair'\|'strong'), inset` | Divider between rows inside a card; `inset` past the leading icon |

### Actions — `actions/`
| Component | Props | Notes |
| --------- | ----- | ----- |
| `PrimaryButton` | `label, onPress, loading, disabled, icon, trailingIcon, style` | Full pill, lit gradient, specular rim, glow. **One per screen** |
| `SecondaryButton` | `label, onPress, variant ('outline'\|'ghost'), tone ('default'\|'danger'), icon, loading, disabled` | Soft white pill. Solid, not glass — Tracking has a dozen |
| `SocialButton` | `provider ('google'\|'apple')` | Neutral pill; the logo is the only colour |
| `TextLink` | `label, onPress, tone, align, underline` | Blue semibold; pass `underline` mid-sentence |
| `IconButton` | `icon, onPress, accessibilityLabel, variant ('glass'\|'solid'\|'plain'), size, iconSize, disabled, haptic` | 44pt round. `glass` = lens, `solid` = lit accent |
| `Chip` | `label, selected, onPress, icon, showCheck, disabled, accessibilityRole` | Selectable pill; selected = accent fill + glow, unselected = soft white |
| `ToolRow` | `icon, title, subtitle, locked, onPress` | Icon tile + title + one status line + chevron/lock. Group rows in one `Surface padded={false}` with a `Rule` inset by `TOOL_ROW_TILE + spacing` |

### Forms — `forms/`
| Component | Notes |
| --------- | ----- |
| `TextField` | Floating label, tinted leading-icon tile, blue border + glow on focus, red on error, recessed on cards. `multiline` supported. Props: `label, value, onChangeText, error, helperText, leftIcon, secureTextEntry, …TextInput props` |
| `FieldError` | Inline message under a field (shares the helper-text slot so layout doesn't jump) |
| `FormBanner` | `message, tone ('error'\|'success'\|'info'\|'warning')` — tinted card, glyph in a round chip |
| `PasswordStrength` | Live meter + ticking rules |
| `Slider` | Glass track + blue fill + round thumb. Pan only activates on *horizontal* movement (so a vertical scroll over it still scrolls the page); a separate tap gesture jumps to a value. Maths in `sliderMath.js`. Props: `label, hint, value, onChange, min, max, step, formatValue (default rupees), disabled` |

### Layout — `layout/`
| Component | Notes |
| --------- | ----- |
| `AppScreen` | Signed-in shell: ambient canvas, safe-area, 20pt card gap, clears the tab capsule. `scroll, contentStyle, stickyFooter, refreshControl` |
| `AuthLayout` | Signed-out / onboarding shell with an optional glass back lens. `showBack, onBack, footer, contentStyle` |
| `ScreenHeader` | Eyebrow (blue caps) → title (`display`) → description. `trailing` takes the header action (an `IconButton`). No closing rule |
| `SectionLabel` | `label, count, action, onAction, actionIcon` — muted caps label, blue count, blue action |
| `BootSplash`, `Screen` | Launch hold; legacy wrapper for starter screens |

### Navigation — `navigation/TabBar`
A floating **glass capsule** (`Glass variant="thick"`, 66pt, radius = half height) inset by the gutter
and hovering above the home indicator. One shared **lens** (a `primarySubtle` pill) springs
(`springs.liquid`) behind the active tab; it is positioned from a single `onLayout` measurement so it
cannot desync from real item widths. Labels are always visible. Selection is carried by the lens, the
accent colour **and** a heavier label — never colour alone. Non-tab routes keep their parent lit:
Ask → SwipeMax, Tracking / Review → Profile, Card details → Nest.

### Brand — `brand/`
`BrandMark` (lit blue card in front of a glass plate + wordmark), `CardArt`, `CardStack` (the welcome
hero: three cards, the front one draggable with rubber-banding and velocity hand-off).

### Feature compounds
| Component | Where | Pattern |
| --------- | ----- | ------- |
| `WalletStack` | card-nest | Selected card in front, two peeking above; cards **spring** to new slots on selection. Tap front → details, tap peeking → bring forward |
| `NestCardRow` | card-nest | Raised card: art thumb + identity + "Transactions & details" pill + `Remove`; two-step inline remove. Selected row is `tinted` |
| `CatalogResult` / `BankFilter` | card-nest | Results grouped in one raised card with inset rules; bank filter is a strip of `Chip`s |
| `SingleSelect` | onboarding | Pills for short options, full-width rows for long ones (> 20 chars) — one radio group either way |
| `OnboardingProgress` | onboarding | Four pills, accent glow on completed |
| `VerdictPill`, `AuditCardRow`, `FeeWaiverBar`, `NeedsInfoPrompt` | wallet | Verdict is always a word (Keep / Close / Upgrade / Downgrade / Review / Needs info / Not scored), colour is secondary. A card the audit could not value shows a question or an explanation, never `Rs.0` |
| `AuditSummaryCard`, `ApplySuggestionRow`, `SpendSliders`, `WalletToolsCard` | wallet | Headline is the net annual figure on a `Glass` card; sliders grouped by Everyday / Recurring / Other |
| `UtilisationBar`, `OverallCard`, `CreditCardRow`, `CreditProfileForm` | credit-health | Bar with the 30% line marked (fill colour is secondary to the printed figure and the status pill). Headline on a tinted `Glass` card. A card with no limit gets an invitation, not a row of dashes; its three-field form opens in place |
| `BucketCard`, `CardMapRow` | wallet | Categorisation: one raised card per spend bucket with its cards as ruled rows (main card tagged), or one card per held card |
| `ChatTurn`, `Composer`, `PromptStarters` | chat | Blue user bubble (sharp bottom-right) / white assistant bubble behind a lit sparkle badge (sharp top-left) / floating glass composer with solid send lens |

---

## 5. Screen recipes

- **List of things** — `SectionLabel` (name + count) above a column of `Surface`s, 12pt apart; or a
  single `Surface padded={false}` with `Rule inset` between rows when the rows are one object
  (search results, settings).
- **Form** — one raised `Surface` holding the fields (they recess), the primary button last. On the
  bare canvas (sign-in) fields stay white and raised.
- **Result / verdict** — a `glassTinted` `Surface shadow="lg"` for the answer, then a raised
  `Surface padded={false}` for the ranking with proportional bars.
- **Empty state** — raised `Surface`: a tilted `CardArt` sample, a `heading`, one muted paragraph,
  one `PrimaryButton`.
- **Header action** — one `IconButton` in `ScreenHeader trailing`; back is an `IconButton` above the
  header (`AuthLayout showBack` does this).
- **Destructive** — inline, two-step, next to the thing it deletes. Red only on the confirm.

---

## 6. Accessibility

- Contrast: see §2.1. `textFaint` is for non-text only.
- Targets ≥ 44pt: round buttons are 44, fields 60, buttons 56, chips 40 + 4pt hit slop.
- `useReduceMotion`: springs → short fades, no translation or scale.
- `useReduceTransparency`: every glass surface and the card-art band go opaque / high-fill.
- Every `IconButton` takes an `accessibilityLabel`; selection is announced as `selected` / `checked`;
  option sets use `radiogroup` / `radio`; banners are `alert` live regions.
- Selection and status never rely on colour alone (check glyph, heavier label, lens shape).
- The tab labels are always visible; the font scales with the OS setting.

---

## 7. Rules

**Do**
- Read tokens from `useTheme()`; pick a `textStyles.*` set; pick weight by family.
- Use `Surface` for grouping and `inset` / `tinted` inside it.
- Keep one `PrimaryButton` per screen.
- Put glow and shadow on the outer view, clipping on the inner.
- Check contrast and add the ratio to §2.1 when adding a colour.
- Keep `// #genai` on generated code.

**Don't**
- Don't stack raised cards in raised cards, or wrap every row in its own glass pane.
- Don't use an illustration accent (lime, coral, violet, sun…) on text, buttons or state.
- Don't use `textFaint` for anything the user has to read.
- Don't hard-code a hex, a font name, a radius or a shadow in a component.
- Don't animate ambient light, and don't add decorative gradients on text.
- Don't `fontWeight` — it does nothing on iOS static fonts.
- Don't blur on Android; let `Glass` degrade.

---

## 8. Extending and verifying

**Adding a component:** put it in the right `components/*` folder, read only `theme.*`, take
`style` / `contentStyle`, forward accessibility props, honour both reduce-* hooks, document it in §4.

**Adding a token:** add it to *both* `lightColors`/`darkColors` (or both material sets) so the themes
never diverge, add its contrast row to §2.1, and update this file.

**Verifying a change** (from `card-buddy-app/`):

```bash
npx eslint src app          # 0 errors expected (gluestack output carries known warnings)
npx jest                    # includes card-tone helper tests
npx expo export --platform web
npx expo start --go --ios   # Expo Go; the dev-client check needs a native build
```

Check **light and dark**, a **small phone width (≈ 320)**, and **Reduce Transparency / Reduce Motion**.

**Known limits**
- Glass uses `expo-blur` for one look on iOS, web and (without blur) Android. iOS 26's native
  `GlassEffectView` (`expo-glass-effect`) would give true refraction on newer devices; it is a
  possible later upgrade behind `Glass`'s API, not a change to callers.
- `AvatarPicker`, `VerdictSummary` and `HomeScreen` are unrouted leftovers; they compile against the
  new tokens but were not redesigned.
- Fonts load at start (`useAppReady`); a font failure falls back to the system face rather than
  blocking launch.
