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
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGoogleBooks } from "../../hooks/useGoogleBooks";
import { useBookStore } from "../../store/bookStore";
import { GoogleBookVolume, BookStatus, STATUS_LABELS } from "../../types";
import { StatusBadge } from "../../components/StatusBadge";
import { EmptyState } from "../../components/EmptyState";

const STATUS_OPTIONS: BookStatus[] = ["to_read", "reading", "done"];

export default function SearchScreen() {
  const { results, loading, error, search, clear } = useGoogleBooks();
  const addBook = useBookStore((s) => s.addBook);
  const books = useBookStore((s) => s.books);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GoogleBookVolume | null>(null);
  const [chosenStatus, setChosenStatus] = useState<BookStatus>("to_read");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (text.trim().length > 1) {
          search(text);
        } else {
          clear();
        }
      }, 500);
    },
    [search, clear]
  );

  const isAlreadyAdded = (googleId: string) =>
    books.some((b) => b.id === googleId);

  const handleAdd = () => {
    if (!selected) return;
    const { id, volumeInfo } = selected;

    if (isAlreadyAdded(id)) {
      Alert.alert("Déjà ajouté", "Ce livre est déjà dans votre bibliothèque.");
      return;
    }

    addBook({
      id,
      title: volumeInfo.title,
      author: volumeInfo.authors?.join(", ") ?? "Auteur inconnu",
      cover: volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://"),
      status: chosenStatus,
      pageCount: volumeInfo.pageCount,
      genre: volumeInfo.categories?.[0],
      startedAt: chosenStatus === "reading" ? new Date().toISOString() : undefined,
      finishedAt: chosenStatus === "done" ? new Date().toISOString() : undefined,
    });

    setSelected(null);
    Alert.alert("Ajouté !", `"${volumeInfo.title}" a été ajouté à votre bibliothèque.`);
  };

  const renderItem = ({ item }: { item: GoogleBookVolume }) => {
    const added = isAlreadyAdded(item.id);
    const cover = item.volumeInfo.imageLinks?.thumbnail?.replace("http://", "https://");

    return (
      <TouchableOpacity
        className={`flex-row bg-zinc-900 rounded-2xl p-3 mb-3 ${added ? "opacity-50" : ""}`}
        onPress={() => {
          if (!added) {
            setSelected(item);
            setChosenStatus("to_read");
          }
        }}
        activeOpacity={added ? 1 : 0.75}
      >
        {cover ? (
          <Image
            source={{ uri: cover }}
            className="w-14 h-20 rounded-lg bg-zinc-800"
            resizeMode="cover"
          />
        ) : (
          <View className="w-14 h-20 rounded-lg bg-zinc-800 items-center justify-center">
            <Ionicons name="book-outline" size={24} color="#52525b" />
          </View>
        )}

        <View className="flex-1 ml-3 justify-center">
          <Text className="text-white font-bold text-sm leading-5" numberOfLines={2}>
            {item.volumeInfo.title}
          </Text>
          <Text className="text-zinc-400 text-xs mt-0.5" numberOfLines={1}>
            {item.volumeInfo.authors?.join(", ") ?? "Auteur inconnu"}
          </Text>
          {item.volumeInfo.pageCount ? (
            <Text className="text-zinc-500 text-xs mt-1">
              {item.volumeInfo.pageCount} pages
            </Text>
          ) : null}
          {added && (
            <Text className="text-violet-400 text-xs mt-1 font-semibold">
              Déjà dans votre bibliothèque
            </Text>
          )}
        </View>

        {!added && (
          <View className="justify-center pl-2">
            <Ionicons name="add-circle-outline" size={24} color="#7c3aed" />
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
      {/* Search bar */}
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-center bg-zinc-800 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={18} color="#71717a" />
          <TextInput
            className="flex-1 ml-2 text-white text-base"
            placeholder="Titre, auteur, ISBN…"
            placeholderTextColor="#71717a"
            value={query}
            onChangeText={handleQueryChange}
            returnKeyType="search"
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color="#7c3aed" />}
          {!loading && query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                clear();
              }}
            >
              <Ionicons name="close-circle" size={18} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error */}
      {error && (
        <View className="mx-4 mb-3 bg-red-900/40 rounded-xl p-3">
          <Text className="text-red-300 text-sm">{error}</Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerClassName="px-4 pb-8 flex-grow"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="search-outline"
              title={
                query.length > 1
                  ? "Aucun résultat"
                  : "Cherchez un livre"
              }
              subtitle={
                query.length > 1
                  ? "Essayez avec un autre terme."
                  : "Tapez le titre ou l'auteur d'un livre pour le trouver et l'ajouter à votre bibliothèque."
              }
            />
          ) : null
        }
      />

      {/* Add Modal */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/60 justify-end"
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="bg-zinc-900 rounded-t-3xl px-6 pt-4 pb-10"
          >
            {/* Handle */}
            <View className="w-12 h-1 bg-zinc-700 rounded-full self-center mb-5" />

            {selected && (
              <>
                {/* Book preview */}
                <View className="flex-row mb-5">
                  {selected.volumeInfo.imageLinks?.thumbnail ? (
                    <Image
                      source={{
                        uri: selected.volumeInfo.imageLinks.thumbnail.replace(
                          "http://",
                          "https://"
                        ),
                      }}
                      className="w-16 h-24 rounded-lg bg-zinc-800"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-16 h-24 rounded-lg bg-zinc-800 items-center justify-center">
                      <Ionicons name="book-outline" size={28} color="#52525b" />
                    </View>
                  )}
                  <View className="flex-1 ml-3 justify-center">
                    <Text className="text-white font-bold text-base leading-5" numberOfLines={3}>
                      {selected.volumeInfo.title}
                    </Text>
                    <Text className="text-zinc-400 text-sm mt-1">
                      {selected.volumeInfo.authors?.join(", ") ?? "Auteur inconnu"}
                    </Text>
                  </View>
                </View>

                {/* Status picker */}
                <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
                  Statut de lecture
                </Text>
                <View className="flex-row gap-3 mb-6">
                  {STATUS_OPTIONS.map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setChosenStatus(status)}
                      className={`flex-1 py-2.5 rounded-xl border items-center ${
                        chosenStatus === status
                          ? "bg-violet-600 border-violet-500"
                          : "bg-zinc-800 border-zinc-700"
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          chosenStatus === status ? "text-white" : "text-zinc-400"
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Add button */}
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
