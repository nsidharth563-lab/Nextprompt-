import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, View, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export const C = {
  bg: "#07070C",
  card: "#12121B",
  cardHi: "#1A1A27",
  border: "#25253A",
  text: "#ECECF4",
  dim: "#8B8BA3",
  accent: "#D946EF",
  accent2: "#6366F1",
  success: "#34D399",
  warn: "#FBBF24",
  danger: "#F87171",
};

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function H({ children, size = 18 }: { children: React.ReactNode; size?: number }) {
  return <Text style={[s.h, { fontSize: size }]}>{children}</Text>;
}

export function P({ children, dim, small }: { children: React.ReactNode; dim?: boolean; small?: boolean }) {
  return <Text style={[s.p, dim && { color: C.dim }, small && { fontSize: 12, lineHeight: 17 }]}>{children}</Text>;
}

export function Chip({ label, color = C.accent }: { label: string; color?: string }) {
  return (
    <View style={[s.chip, { borderColor: color + "55", backgroundColor: color + "1A" }]}>
      <Text style={{ color, fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  icon,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress();
      }}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [{ opacity: disabled || loading ? 0.5 : pressed ? 0.85 : 1 }]}
    >
      <LinearGradient colors={[C.accent, C.accent2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btn}>
        {loading ? <ActivityIndicator color="white" /> : icon ? <Ionicons name={icon} size={18} color="white" /> : null}
        <Text style={s.btnText}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function GhostButton({
  title,
  onPress,
  icon,
  color = C.text,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.ghost, pressed && { backgroundColor: C.cardHi }]}>
      {icon && <Ionicons name={icon} size={16} color={color} />}
      <Text style={{ color, fontWeight: "600", fontSize: 14 }}>{title}</Text>
    </Pressable>
  );
}

export function PromptBox({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <View style={s.prompt}>
      <View style={s.promptHead}>
        <Text style={s.promptTitle} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Pressable hitSlop={10} accessibilityLabel="Share prompt" onPress={() => Share.share({ message: text }).catch(() => {})}>
            <Ionicons name="share-outline" size={18} color={C.dim} />
          </Pressable>
          <Pressable
            hitSlop={10}
            accessibilityLabel="Copy prompt"
            onPress={async () => {
              await Clipboard.setStringAsync(text);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            <Ionicons name={copied ? "checkmark-circle" : "copy-outline"} size={18} color={copied ? C.success : C.accent} />
          </Pressable>
        </View>
      </View>
      <Text selectable style={s.promptText}>
        {text}
      </Text>
    </View>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={s.error}>
      <Ionicons name="alert-circle" size={18} color={C.danger} />
      <Text style={{ color: C.danger, flex: 1 }}>{message}</Text>
    </View>
  );
}

export function Gap({ h = 12 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

export const s = StyleSheet.create({
  card: { backgroundColor: C.card, borderColor: C.border, borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 14, gap: 10 },
  h: { color: C.text, fontWeight: "700" },
  p: { color: C.text, fontSize: 14, lineHeight: 21 },
  chip: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  btn: { borderRadius: 14, paddingVertical: 15, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  btnText: { color: "white", fontWeight: "700", fontSize: 16 },
  ghost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  input: { borderColor: C.border, borderWidth: 1, borderRadius: 14, padding: 14, color: C.text, backgroundColor: "#0B0B12", fontSize: 15 },
  prompt: { borderColor: C.border, borderWidth: 1, borderRadius: 14, backgroundColor: "#0B0B12", overflow: "hidden" },
  promptHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  promptTitle: { color: C.dim, fontSize: 11, fontWeight: "700", letterSpacing: 1, flex: 1 },
  promptText: { color: C.text, padding: 12, fontFamily: "Courier", fontSize: 13, lineHeight: 19 },
  error: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.danger + "55",
    backgroundColor: C.danger + "14",
    borderRadius: 12,
    padding: 12,
  },
});
