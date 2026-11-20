import { Alert } from "react-native";
import { postJson } from "@/lib/api";
import { GhostButton, C } from "./ui";

const REASONS = ["Offensive or harmful", "Inaccurate", "Copies someone else's work", "Other"] as const;

/**
 * In-app reporting of AI-generated output (required by Google Play's AI-generated content policy,
 * and good practice for App Store review).
 */
export function ReportButton({ kind, source, resultSummary }: { kind: "media" | "site"; source: string; resultSummary: string }) {
  function send(reason: string) {
    postJson("/api/report", { kind, source, reason, summary: resultSummary.slice(0, 500) })
      .then(() => Alert.alert("Thanks for reporting", "Our team will review this result."))
      .catch(() => Alert.alert("Couldn't send report", "Please try again later."));
  }
  return (
    <GhostButton
      title="Report this result"
      icon="flag-outline"
      color={C.dim}
      onPress={() =>
        Alert.alert("Report AI result", "What's wrong with this result?", [
          ...REASONS.map((r) => ({ text: r, onPress: () => send(r) })),
          { text: "Cancel", style: "cancel" as const },
        ])
      }
    />
  );
}
