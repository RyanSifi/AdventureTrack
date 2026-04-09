import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useGoogleBooks } from "../../hooks/useGoogleBooks";
import { useBookStore } from "../../store/bookStore";
import { GoogleBookVolume, BookStatus, STATUS_LABELS } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

const STATUS_OPTIONS: { value: BookStatus; emoji: string }[] = [
  { value: "to_read",  emoji: "🔖" },
  { value: "reading",  emoji: "📖" },
  { value: "done",     emoji: "✅" },
];

export default function SearchScreen() {
  const { results, loading, error, search, clear } = useGoogleBooks();
  const addBook = useBookStore((s) => s.addBook);
  const books   = useBookStore((s) => s.books);

  const [query,         setQuery]         = useState("");
  const [selected,      setSelected]      = useState<GoogleBookVolume | null>(null);
  const [chosenStatus,  setChosenStatus]  = useState<BookStatus>("to_read");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      text.trim().length > 1 ? search(text) : clear();
    }, 500);
  }, [search, clear]);

  const isAdded = (id: string) => books.some((b) => b.id === id);

  const handleAdd = () => {
    if (!selected) return;
    const { id, volumeInfo } = selected;
    addBook({
      id,
      title:     volumeInfo.title,
      author:    volumeInfo.authors?.join(", ") ?? "Auteur inconnu",
      cover:     volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://"),
      status:    chosenStatus,
      pageCount: volumeInfo.pageCount,
      genre:     volumeInfo.categories?.[0],
      startedAt:  chosenStatus === "reading" ? new Date().toISOString() : undefined,
      finishedAt: chosenStatus === "done"    ? new Date().toISOString() : undefined,
    });
    setSelected(null);
    Alert.alert("Ajouté ✓", `"${volumeInfo.title}" est dans votre bibliothèque.`);
  };

  const renderItem = ({ item }: { item: GoogleBookVolume }) => {
    const added = isAdded(item.id);
    const cover = item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://");
    return (
      <TouchableOpacity
        className={`flex-row bg-zinc-900 rounded-2xl p-3 mb-2.5 border border-zinc-800 ${added ? "opacity-40" : ""}`}
        onPress={() => { if (!added) { setSelected(item); setChosenStatus("to_read"); } }}
        activeOpacity={added ? 1 : 0.75}
      >
        {cover ? (
          <Image source={{ uri: cover }} className="w-12 h-18 rounded-lg bg-zinc-800" resizeMode="cover"
            style={{ width: 48, height: 70 }} />
        ) : (
          <View className="rounded-lg bg-zinc-800 items-center justify-center" style={{ width: 48, height: 70 }}>
            <Text className="text-2xl">📖</Text>
          </View>
        )}

        <View className="flex-1 ml-3 justify-center">
          <Text className="text-white font-semibold text-sm leading-5" numberOfLines={2}>
            {item.volumeInfo.title}
          </Text>
          <Text className="text-zinc-500 text-xs mt-0.5" numberOfLines={1}>
            {item.volumeInfo.authors?.join(", ") ?? "Auteur inconnu"}
          </Text>
          {item.volumeInfo.pageCount ? (
            <Text className="text-zinc-600 text-xs mt-1">{item.volumeInfo.pageCount} pages</Text>
          ) : null}
          {added && <Text className="text-violet-400 text-xs mt-1 font-semibold">Déjà ajouté</Text>}
        </View>

        {!added && (
          <View className="justify-center pl-2">
            <View className="w-8 h-8 rounded-full bg-violet-600 items-center justify-center">
              <Text className="text-white text-xl leading-none" style={{ marginTop: -1 }}>+</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View className="px-4 pt-4 pb-3 border-b border-zinc-900">
        <Text className="text-white text-2xl font-bold mb-3">Ajouter un livre</Text>
        <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 h-10 border border-zinc-800">
          <Text className="text-zinc-500 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-white text-sm"
            placeholder="Titre, auteur, ISBN…"
            placeholderTextColor="#52525b"
            value={query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
            autoFocus
          />
          {loading
            ? <ActivityIndicator size="small" color="#7c3aed" />
            : query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(""); clear(); }}>
                <Text className="text-zinc-500 text-lg leading-none">×</Text>
              </TouchableOpacity>
            )
          }
        </View>
      </View>

      {error ? (
        <View className="mx-4 mt-3 bg-red-950 border border-red-900 rounded-xl p-3">
          <Text className="text-red-300 text-sm">{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              emoji={query.length > 1 ? "😶" : "🔍"}
              title={query.length > 1 ? "Aucun résultat" : "Recherchez un livre"}
              subtitle={
                query.length > 1
                  ? "Essayez un autre titre ou auteur."
                  : "Tapez le titre ou le nom de l'auteur pour trouver un livre."
              }
            />
          ) : null
        }
      />

      {/* Bottom sheet modal */}
      <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity
          className="flex-1 bg-black/70 justify-end"
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <TouchableOpacity activeOpacity={1} className="bg-zinc-900 rounded-t-3xl px-5 pt-3 pb-10">
            {/* Drag handle */}
            <View className="w-10 h-1 bg-zinc-700 rounded-full self-center mb-5" />

            {selected && (
              <>
                {/* Book info */}
                <View className="flex-row mb-6 pb-5 border-b border-zinc-800">
                  {selected.volumeInfo.imageLinks?.thumbnail ? (
                    <Image
                      source={{ uri: selected.volumeInfo.imageLinks.thumbnail.replace("http://", "https://") }}
                      style={{ width: 56, height: 80, borderRadius: 10 }}
                      className="bg-zinc-800"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="rounded-xl bg-zinc-800 items-center justify-center" style={{ width: 56, height: 80 }}>
                      <Text className="text-3xl">📖</Text>
                    </View>
                  )}
                  <View className="flex-1 ml-3 justify-center">
                    <Text className="text-white font-bold text-base leading-5" numberOfLines={3}>
                      {selected.volumeInfo.title}
                    </Text>
                    <Text className="text-zinc-400 text-sm mt-1">
                      {selected.volumeInfo.authors?.join(", ") ?? "Auteur inconnu"}
                    </Text>
                    {selected.volumeInfo.pageCount ? (
                      <Text className="text-zinc-600 text-xs mt-1">{selected.volumeInfo.pageCount} pages</Text>
                    ) : null}
                  </View>
                </View>

                {/* Status */}
                <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
                  Statut de lecture
                </Text>
                <View className="flex-row mb-6" style={{ gap: 8 }}>
                  {STATUS_OPTIONS.map(({ value, emoji }) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setChosenStatus(value)}
                      className={`flex-1 py-3 rounded-xl border items-center ${
                        chosenStatus === value
                          ? "bg-violet-600 border-violet-500"
                          : "bg-zinc-800 border-zinc-700"
                      }`}
                    >
                      <Text className="text-base mb-0.5">{emoji}</Text>
                      <Text className={`text-xs font-semibold ${chosenStatus === value ? "text-white" : "text-zinc-400"}`}>
                        {STATUS_LABELS[value]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  className="bg-violet-600 rounded-xl py-3.5 items-center"
                  onPress={handleAdd}
                >
                  <Text className="text-white font-bold text-base">
                    Ajouter à ma bibliothèque
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}
