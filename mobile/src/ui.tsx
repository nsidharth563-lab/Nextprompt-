import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export const C = {
  bg: "#07070c",
  card: "#12121b",
  border: "#25253a",
  text: "#e9e9f1",
  dim: "#8b8ba3",
  accent: "#d946ef",
  accent2: "#6366f1",
  danger: "#f87171",
};

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={s.card}>{children}</View>;
}

export function H({ children }: { children: React.ReactNode }) {
  return <Text style={s.h}>{children}</Text>;
}

export function P({ children, dim }: { children: React.ReactNode; dim?: boolean }) {
  return <Text style={[s.p, dim && { color: C.dim }]}>{children}</Text>;
}

export function Button({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[s.btn, disabled && { opacity: 0.5 }]}>
      <Text style={s.btnText}>{title}</Text>
    </Pressable>
  );
}

export function PromptBox({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <View style={s.prompt}>
      <View style={s.promptHead}>
        <Text style={s.promptTitle}>{title.toUpperCase()}</Text>
        <Pressable
          onPress={async () => {
            await Clipboard.setStringAsync(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          <Text style={{ color: C.accent, fontWeight: "600" }}>{copied ? "Copied ✓" : "Copy"}</Text>
        </Pressable>
      </View>
      <Text selectable style={s.promptText}>{text}</Text>
    </View>
  );
}

export function ErrorText({ message }: { message: string }) {
  return <Text style={{ color: C.danger, marginVertical: 8 }}>{message}</Text>;
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14, gap: 8 },
  h: { color: C.text, fontSize: 18, fontWeight: "700" },
  p: { color: C.text, fontSize: 14, lineHeight: 20 },
  btn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  input: { borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 12, color: C.text, backgroundColor: "#0b0b12" },
  prompt: { borderColor: C.border, borderWidth: 1, borderRadius: 12, backgroundColor: "#0b0b12", overflow: "hidden" },
  promptHead: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1, borderColor: C.border },
  promptTitle: { color: C.dim, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  promptText: { color: C.text, padding: 10, fontFamily: "Courier", fontSize: 13, lineHeight: 19 },
  pill: { alignSelf: "flex-start", backgroundColor: "#2a1636", color: C.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, fontSize: 12, overflow: "hidden" },
});
