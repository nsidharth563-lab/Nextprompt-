import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";
import { C, P } from "@/components/ui";
import { deleteHistory, getHistory, type HistoryItem } from "@/lib/storage";

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setItems);
    }, []),
  );

  function confirmDelete(item: HistoryItem) {
    Alert.alert("Delete this result?", undefined, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteHistory(item.id);
          setItems(await getHistory());
        },
      },
    ]);
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
      ListEmptyComponent={
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 80 }}>
          <Ionicons name="time-outline" size={40} color={C.dim} />
          <P dim>Your results will be saved here, on this device.</P>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push({ pathname: "/result/[id]", params: { id: item.id } })}
          onLongPress={() => confirmDelete(item)}
          style={({ pressed }) => ({
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
            backgroundColor: pressed ? C.cardHi : C.card,
            borderColor: C.border,
            borderWidth: 1,
            borderRadius: 14,
            padding: 14,
          })}
        >
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C.accent + "22", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={item.kind === "media" ? "sparkles" : "search"} size={20} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.text, fontWeight: "600" }} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={{ color: C.dim, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {new Date(item.createdAt).toLocaleString()} · {item.source}
            </Text>
          </View>
          <Pressable hitSlop={10} onPress={() => confirmDelete(item)} accessibilityLabel="Delete result">
            <Ionicons name="trash-outline" size={18} color={C.dim} />
          </Pressable>
        </Pressable>
      )}
    />
  );
}
