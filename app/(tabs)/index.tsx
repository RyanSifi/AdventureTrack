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
import { Ionicons } from "@expo/vector-icons";
import { BookCard } from "../../components/BookCard";
import { EmptyState } from "../../components/EmptyState";
import { FAB } from "../../components/FAB";
import { useBookStore } from "../../store/bookStore";
import { BookStatus, STATUS_LABELS } from "../../types";

const FILTER_TABS: { label: string; value: BookStatus | "all" }[] = [
  { label: "Tous", value: "all" },
  { label: STATUS_LABELS.to_read, value: "to_read" },
  { label: STATUS_LABELS.reading, value: "reading" },
  { label: STATUS_LABELS.done, value: "done" },
];

export default function LibraryScreen() {
  const router = useRouter();
  const books = useBookStore((s) => s.books);
  const [activeFilter, setActiveFilter] = useState<BookStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = books;
    if (activeFilter !== "all") {
      list = list.filter((b) => b.status === activeFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }
    return list;
  }, [books, activeFilter, query]);

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Search bar */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center bg-zinc-800 rounded-xl px-3 h-11">
          <Ionicons name="search-outline" size={18} color="#71717a" />
          <TextInput
            className="flex-1 ml-2 text-white text-base"
            placeholder="Rechercher un livre…"
            placeholderTextColor="#71717a"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color="#71717a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2"
        contentContainerClassName="gap-2"
      >
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            onPress={() => setActiveFilter(tab.value)}
            className={`px-4 py-1.5 rounded-full border ${
              activeFilter === tab.value
                ? "bg-violet-600 border-violet-600"
                : "bg-transparent border-zinc-700"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeFilter === tab.value ? "text-white" : "text-zinc-400"
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      <Text className="text-zinc-500 text-xs px-4 mb-1">
        {filtered.length} livre{filtered.length !== 1 ? "s" : ""}
      </Text>

      {/* Book list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookCard book={item} />}
        contentContainerClassName="px-4 pb-24 flex-grow"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="book-outline"
            title={
              query
                ? "Aucun résultat"
                : activeFilter === "all"
                ? "Votre bibliothèque est vide"
                : `Aucun livre "${STATUS_LABELS[activeFilter as BookStatus]}"`
            }
            subtitle={
              query
                ? "Essayez un autre mot-clé."
                : "Ajoutez votre premier livre via l'onglet Recherche."
            }
          />
        }
      />

      {/* FAB */}
      <FAB onPress={() => router.push("/search")} />
    </View>
  );
}
