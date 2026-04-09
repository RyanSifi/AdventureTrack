import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useBookStore } from "../../store/bookStore";
import { StarRating } from "../../components/StarRating";
import { StatusBadge } from "../../components/StatusBadge";
import { BookStatus, STATUS_LABELS } from "../../types";

const STATUS_OPTIONS: { value: BookStatus; emoji: string }[] = [
  { value: "to_read",  emoji: "🔖" },
  { value: "reading",  emoji: "📖" },
  { value: "done",     emoji: "✅" },
];

export default function BookDetailScreen() {
  const { id }    = useLocalSearchParams<{ id: string }>();
  const router    = useRouter();
  const getBook   = useBookStore((s) => s.getBook);
  const updateBook = useBookStore((s) => s.updateBook);
  const removeBook = useBookStore((s) => s.removeBook);

  const book = getBook(id);
  const [note,    setNote]    = useState(book?.note ?? "");
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (book) setNote(book.note ?? ""); }, [book]);

  if (!book) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <Text className="text-zinc-400 text-base">Livre introuvable.</Text>
      </View>
    );
  }

  const handleStatusChange = (status: BookStatus) => {
    const updates: Partial<typeof book> = { status };
    if (status === "reading" && !book.startedAt)  updates.startedAt  = new Date().toISOString();
    if (status === "done"    && !book.finishedAt) updates.finishedAt = new Date().toISOString();
    updateBook(id, updates);
  };

  const handleDelete = () =>
    Alert.alert(
      "Supprimer",
      `Retirer "${book.title}" de votre bibliothèque ?`,
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => { removeBook(id); router.back(); } },
      ]
    );

  const fmt = (iso?: string) => iso
    ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: "",
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete}>
              <Text className="text-red-400 font-semibold text-sm">Supprimer</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View className="items-center px-6 pt-6 pb-5 border-b border-zinc-900">
          {book.cover ? (
            <Image
              source={{ uri: book.cover }}
              style={{ width: 120, height: 176, borderRadius: 16 }}
              className="bg-zinc-800"
              resizeMode="cover"
            />
          ) : (
            <View
              className="bg-zinc-800 rounded-2xl items-center justify-center"
              style={{ width: 120, height: 176 }}
            >
              <Text className="text-6xl">📖</Text>
            </View>
          )}

          <Text className="text-white text-xl font-bold text-center mt-4 px-2 leading-7">
            {book.title}
          </Text>
          <Text className="text-zinc-400 text-sm text-center mt-1">{book.author}</Text>

          <View className="flex-row mt-3" style={{ gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            <StatusBadge status={book.status} />
            {book.genre ? (
              <View className="bg-zinc-800 rounded-full px-2.5 py-1">
                <Text className="text-zinc-300 text-sm">{book.genre}</Text>
              </View>
            ) : null}
            {book.pageCount ? (
              <View className="bg-zinc-800 rounded-full px-2.5 py-1">
                <Text className="text-zinc-400 text-sm">{book.pageCount} p.</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="px-4 pt-5">
          {/* Status */}
          <SectionLabel title="Statut" />
          <View className="flex-row mb-5" style={{ gap: 8 }}>
            {STATUS_OPTIONS.map(({ value, emoji }) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleStatusChange(value)}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  book.status === value
                    ? "bg-violet-600 border-violet-500"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <Text className="text-base mb-0.5">{emoji}</Text>
                <Text className={`text-xs font-semibold ${book.status === value ? "text-white" : "text-zinc-500"}`}>
                  {STATUS_LABELS[value]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <SectionLabel title="Ma note" />
          <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex-row items-center justify-between mb-5">
            <StarRating rating={book.rating} onChange={(r) => updateBook(id, { rating: r })} size={30} />
            {book.rating ? (
              <TouchableOpacity onPress={() => updateBook(id, { rating: undefined })}>
                <Text className="text-zinc-600 text-xs">Effacer</Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-zinc-700 text-xs italic">Non noté</Text>
            )}
          </View>

          {/* Dates */}
          <SectionLabel title="Dates" />
          <View className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden mb-5">
            <DateRow
              emoji="▶"
              label="Commencé le"
              value={fmt(book.startedAt)}
              actionLabel={!book.startedAt ? "Aujourd'hui" : undefined}
              onAction={!book.startedAt ? () => updateBook(id, { startedAt: new Date().toISOString() }) : undefined}
              onClear={book.startedAt ? () => updateBook(id, { startedAt: undefined }) : undefined}
              isLast={false}
            />
            <DateRow
              emoji="✓"
              label="Terminé le"
              value={fmt(book.finishedAt)}
              actionLabel={!book.finishedAt ? "Aujourd'hui" : undefined}
              onAction={!book.finishedAt ? () => updateBook(id, { finishedAt: new Date().toISOString() }) : undefined}
              onClear={book.finishedAt ? () => updateBook(id, { finishedAt: undefined }) : undefined}
              isLast
            />
          </View>

          {/* Notes */}
          <SectionLabel title="Commentaire" />
          {editing ? (
            <View className="mb-5">
              <TextInput
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 text-white text-sm"
                style={{ minHeight: 120, textAlignVertical: "top" }}
                multiline
                value={note}
                onChangeText={setNote}
                placeholder="Vos impressions, citations favorites…"
                placeholderTextColor="#3f3f46"
                autoFocus
              />
              <View className="flex-row mt-2" style={{ gap: 8 }}>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 items-center"
                  onPress={() => { setNote(book.note ?? ""); setEditing(false); }}
                >
                  <Text className="text-zinc-400 font-semibold text-sm">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl bg-violet-600 items-center"
                  onPress={() => { updateBook(id, { note }); setEditing(false); }}
                >
                  <Text className="text-white font-bold text-sm">Enregistrer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 mb-5"
              onPress={() => setEditing(true)}
              activeOpacity={0.7}
              style={{ minHeight: 80 }}
            >
              {book.note ? (
                <Text className="text-zinc-300 text-sm leading-6">{book.note}</Text>
              ) : (
                <Text className="text-zinc-700 text-sm italic">Appuyez pour ajouter un commentaire…</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Delete */}
          <TouchableOpacity
            className="py-3.5 rounded-xl border border-red-900/60 items-center"
            onPress={handleDelete}
          >
            <Text className="text-red-500 font-semibold text-sm">🗑 Supprimer ce livre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-2">
      {title}
    </Text>
  );
}

function DateRow({
  emoji, label, value, actionLabel, onAction, onClear, isLast,
}: {
  emoji: string;
  label: string;
  value: string;
  actionLabel?: string;
  onAction?: () => void;
  onClear?: () => void;
  isLast: boolean;
}) {
  return (
    <View className={`flex-row items-center px-4 py-3 ${!isLast ? "border-b border-zinc-800" : ""}`}>
      <Text className="text-violet-500 text-xs w-5">{emoji}</Text>
      <Text className="text-zinc-400 text-sm flex-1 ml-1">{label}</Text>
      <Text className="text-white text-sm font-medium mr-2">{value}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} className="bg-violet-950 rounded-lg px-2 py-1">
          <Text className="text-violet-400 text-xs font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      )}
      {onClear && (
        <TouchableOpacity onPress={onClear} className="ml-1">
          <Text className="text-zinc-600 text-lg leading-none">×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
