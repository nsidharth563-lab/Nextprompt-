// The deployed NextPrompt web app. Its /api routes power this app and it hosts the legal pages.
// Set EXPO_PUBLIC_API_URL per build profile in eas.json (or in .env for local dev).
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "");
export const PRIVACY_URL = `${API_URL}/privacy`;
export const TERMS_URL = `${API_URL}/terms`;
export const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL ?? "support@nextprompt.app";
export const APP_NAME = "NextPrompt";
