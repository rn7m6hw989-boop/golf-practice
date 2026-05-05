// ============================================================================
// THEME — "Practice green at dusk." Dark theme with a vivid mint as the
// primary accent. All surface and text colors are explicit (not CSS variables)
// so the app renders consistently regardless of host light/dark mode.
// ============================================================================

export const T = {
  // Surfaces
  bg: "#0F1410", // page background — warm near-black
  surface: "#181E1A", // cards, banners
  surfaceRaised: "#1F2620", // slightly raised — used sparingly
  border: "#2A332D", // subtle dividers
  borderStrong: "#3A4640", // visible outlines

  // Text
  text: "#E8EBE6", // primary text — warm off-white
  textDim: "#A1A8A3", // secondary text
  textFaint: "#6F756F", // tertiary text, captions

  // Brand / accent — vivid mint
  green: "#4ADE80",
  greenSoft: "#1F2E25", // tinted card surface
  greenDeep: "#A6F0BC", // text-on-greenSoft (light shade for readability)
  greenInk: "#0F1410", // dark text on green button (uses bg color)

  // Outcome / state
  win: "#4ADE80",
  winSoft: "#1F2E25",
  loss: "#F87171",
  lossSoft: "#2D1A1A",
  lossDeep: "#FCA5A5", // light red text on lossSoft surfaces
  warn: "#FBBF24",
  warnSoft: "#2A2113",
  warnDeep: "#FCD34D",
  neutralSoft: "#1F2620", // for two-putt-long button
};

// ============================================================================
// TONE STYLES — for outcome buttons and result chips
// ============================================================================

export function getToneStyles(tone) {
  switch (tone) {
    case "win":
      return {
        bg: T.winSoft,
        bgActive: T.win,
        border: T.win,
        text: T.greenDeep,
        textActive: T.greenInk,
      };
    case "warn":
      return {
        bg: T.warnSoft,
        bgActive: T.warn,
        border: T.warn,
        text: T.warnDeep,
        textActive: T.greenInk,
      };
    case "loss":
      return {
        bg: T.lossSoft,
        bgActive: T.loss,
        border: T.loss,
        text: T.lossDeep,
        textActive: T.greenInk,
      };
    default:
      return {
        bg: T.neutralSoft,
        bgActive: T.borderStrong,
        border: T.borderStrong,
        text: T.text,
        textActive: T.text,
      };
  }
}
