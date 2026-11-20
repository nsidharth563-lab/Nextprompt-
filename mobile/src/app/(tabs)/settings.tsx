import Ionicons from "@expo/vector-icons/Ionicons";
import * as Application from "expo-application";
import { useRouter } from "expo-router";
import * as StoreReview from "expo-store-review";
import * as WebBrowser from "expo-web-browser";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { C, Gap, P } from "@/components/ui";
import { APP_NAME, PRIVACY_URL, SUPPORT_EMAIL, TERMS_URL } from "@/lib/config";
import { clearHistory, setOnboarded } from "@/lib/storage";

type IconName = keyof typeof Ionicons.glyphMap;

function Row({ icon, label, onPress, danger }: { icon: IconName; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: pressed ? C.cardHi : C.card,
      })}
    >
      <Ionicons name={icon} size={20} color={danger ? C.danger : C.accent} />
      <Text style={{ color: danger ? C.danger : C.text, fontSize: 15, flex: 1 }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={C.dim} />
    </Pressable>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={{ color: C.dim, fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>{title}</Text>
      <View style={{ borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: C.border, gap: 1, backgroundColor: C.border }}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Group title="SUPPORT">
        <Row icon="star-outline" label={`Rate ${APP_NAME}`} onPress={() => StoreReview.requestReview().catch(() => {})} />
        <Row
          icon="mail-outline"
          label="Contact support"
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`${APP_NAME} support`)}`)}
        />
        <Row icon="help-circle-outline" label="How it works" onPress={() => router.push("/onboarding")} />
      </Group>
      <Group title="LEGAL">
        <Row icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)} />
        <Row icon="document-text-outline" label="Terms of Use" onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)} />
      </Group>
      <Group title="DATA">
        <Row
          icon="trash-outline"
          label="Clear history"
          danger
          onPress={() =>
            Alert.alert("Clear all history?", "This removes every saved result from this device.", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: () => clearHistory() },
            ])
          }
        />
        <Row icon="refresh-outline" label="Show welcome screens again" onPress={() => setOnboarded(false).then(() => router.push("/onboarding"))} />
      </Group>
      <Gap h={4} />
      <P dim small>
        {APP_NAME} {Application.nativeApplicationVersion ?? ""} ({Application.nativeBuildVersion ?? "dev"})
      </P>
      <P dim small>
        Results are AI-generated estimates. Photos and videos are sent to our server only to create your result and are not stored.
      </P>
    </ScrollView>
  );
}
