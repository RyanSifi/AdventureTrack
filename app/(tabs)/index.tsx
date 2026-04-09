import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { BookCard } from "../../components/BookCard";
import { EmptyState } from "../../components/EmptyState";
import { FAB } from "../../components/FAB";
import { useBookStore } from "../../store/bookStore";
import { BookStatus, STATUS_LABELS } from "../../types";

const FILTERS: { label: string; value: BookStatus | "all"; emoji: string }[] = [
  { label: "Tous",              value: "all",     emoji: "📚" },
  { label: STATUS_LABELS.to_read,  value: "to_read", emoji: "🔖" },
  { label: STATUS_LABELS.reading,  value: "reading", emoji: "📖" },
  { label: STATUS_LABELS.done,     value: "done",    emoji: "✅" },
];

export default function LibraryScreen() {
  const router = useRouter();
  const books = useBookStore((s) => s.books);
  const [activeFilter, setActiveFilter] = useState<BookStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = books;
    if (activeFilter !== "all") list = list.filter((b) => b.status === activeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return list;
  }, [books, activeFilter, query]);

  const counts = useMemo(() => ({
    all:     books.length,
    to_read: books.filter((b) => b.status === "to_read").length,
    reading: books.filter((b) => b.status === "reading").length,
    done:    books.filter((b) => b.status === "done").length,
  }), [books]);

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 border-b border-zinc-900">
        <Text className="text-white text-2xl font-bold mb-3">Ma bibliothèque</Text>
        {/* Search */}
        <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 h-10 border border-zinc-800">
          <Text className="text-zinc-500 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-white text-sm"
            placeholder="Titre, auteur…"
            placeholderTextColor="#52525b"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Text className="text-zinc-500 text-lg leading-none">×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.value;
          const count = counts[f.value];
          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              className={`flex-row items-center rounded-full px-3 py-1.5 border ${
                isActive
                  ? "bg-violet-600 border-violet-500"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <Text className="text-sm mr-1">{f.emoji}</Text>
              <Text className={`text-xs font-semibold ${isActive ? "text-white" : "text-zinc-400"}`}>
                {f.label}
              </Text>
              <View className={`ml-1.5 rounded-full px-1.5 py-0.5 ${isActive ? "bg-violet-500" : "bg-zinc-800"}`}>
                <Text className={`text-xs font-bold ${isActive ? "text-white" : "text-zinc-400"}`}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            emoji={query ? "🔍" : activeFilter === "all" ? "📚" : "🔖"}
            title={
              query
                ? "Aucun résultat"
                : activeFilter === "all"
                ? "Bibliothèque vide"
                : `Aucun livre « ${STATUS_LABELS[activeFilter as BookStatus]} »`
            }
            subtitle={
              query
                ? "Essayez un autre mot-clé."
                : "Appuyez sur + pour ajouter votre premier livre."
            }
          />
        }
      />

      <FAB onPress={() => router.push("/search")} />
    </View>
  );
}
