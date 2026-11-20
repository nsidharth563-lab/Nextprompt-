import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MediaPromptResult, SiteAnalysisResult } from "./types";

export type HistoryItem =
  | { id: string; kind: "media"; createdAt: number; title: string; source: string; data: MediaPromptResult }
  | { id: string; kind: "site"; createdAt: number; title: string; source: string; data: SiteAnalysisResult };

type NewItem =
  | Omit<Extract<HistoryItem, { kind: "media" }>, "id" | "createdAt">
  | Omit<Extract<HistoryItem, { kind: "site" }>, "id" | "createdAt">;

const HISTORY_KEY = "np:history:v1";
const ONBOARDED_KEY = "np:onboarded:v1";
const SUCCESS_COUNT_KEY = "np:successCount:v1";
const MAX_ITEMS = 50;

// History is stored only on this device.
export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

export async function getHistoryItem(id: string): Promise<HistoryItem | undefined> {
  return (await getHistory()).find((h) => h.id === id);
}

export async function addHistory(item: NewItem): Promise<HistoryItem> {
  const full = { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now() } as HistoryItem;
  const list = [full, ...(await getHistory())].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return full;
}

export async function deleteHistory(id: string) {
  const list = (await getHistory()).filter((h) => h.id !== id);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export async function clearHistory() {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function isOnboarded() {
  return (await AsyncStorage.getItem(ONBOARDED_KEY)) === "1";
}

export async function setOnboarded(v: boolean) {
  if (v) await AsyncStorage.setItem(ONBOARDED_KEY, "1");
  else await AsyncStorage.removeItem(ONBOARDED_KEY);
}

/** Counts successful analyses; used to ask for a store review at a good moment. */
export async function bumpSuccessCount(): Promise<number> {
  const n = Number((await AsyncStorage.getItem(SUCCESS_COUNT_KEY)) ?? "0") + 1;
  await AsyncStorage.setItem(SUCCESS_COUNT_KEY, String(n));
  return n;
}
