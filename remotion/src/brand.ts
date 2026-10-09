import brandJson from "../assets/brand/brand.json";

export const colors = brandJson.colors;
export const fonts = {
  display: `'${brandJson.fonts.display}', sans-serif`,
  body: `'${brandJson.fonts.body}', sans-serif`,
  accent: `'${brandJson.fonts.accent}', '${brandJson.fonts.display}', sans-serif`,
  displayFamily: brandJson.fonts.display,
};
export const fontFiles = brandJson.fontFiles;

// Brand radii and spacing steps (tokens.json)
export const radius = { sm: 10, md: 20, lg: 30, xl: 40, full: 9999 };
export const space = [5, 10, 12, 15, 16, 20, 30, 40] as const;
