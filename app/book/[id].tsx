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
import { Ionicons } from "@expo/vector-icons";
import { useBookStore } from "../../store/bookStore";
import { StarRating } from "../../components/StarRating";
import { StatusBadge } from "../../components/StatusBadge";
import { BookStatus, STATUS_LABELS } from "../../types";

const STATUS_OPTIONS: BookStatus[] = ["to_read", "reading", "done"];

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const getBook = useBookStore((s) => s.getBook);
  const updateBook = useBookStore((s) => s.updateBook);
  const removeBook = useBookStore((s) => s.removeBook);

  const book = getBook(id);

  const [note, setNote] = useState(book?.note ?? "");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (book) setNote(book.note ?? "");
  }, [book]);

  if (!book) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <Text className="text-white text-lg">Livre introuvable.</Text>
      </View>
    );
  }

  const handleStatusChange = (status: BookStatus) => {
    const updates: Partial<typeof book> = { status };
    if (status === "reading" && !book.startedAt) {
      updates.startedAt = new Date().toISOString();
    }
    if (status === "done" && !book.finishedAt) {
      updates.finishedAt = new Date().toISOString();
    }
    updateBook(id, updates);
  };

  const handleRating = (rating: number) => {
    updateBook(id, { rating });
  };

  const handleSaveNote = () => {
    updateBook(id, { note });
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer le livre",
      `Voulez-vous vraiment supprimer "${book.title}" de votre bibliothèque ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            removeBook(id);
            router.back();
          },
        },
      ]
    );
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-zinc-950"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen
        options={{
          title: book.title,
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} className="pr-1">
              <Ionicons name="trash-outline" size={22} color="#f87171" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 pb-12"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View className="items-center mb-6">
          {book.cover ? (
            <Image
              source={{ uri: book.cover }}
              className="w-32 h-48 rounded-2xl bg-zinc-800 shadow-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="w-32 h-48 rounded-2xl bg-zinc-800 items-center justify-center shadow-lg">
              <Ionicons name="book-outline" size={48} color="#7c3aed" />
            </View>
          )}

          <Text className="text-white text-xl font-bold text-center mt-4 px-4">
            {book.title}
          </Text>
          <Text className="text-zinc-400 text-base text-center mt-1">
            {book.author}
          </Text>

          <View className="flex-row gap-2 mt-3 flex-wrap justify-center">
            <StatusBadge status={book.status} />
            {book.genre ? (
              <View className="bg-zinc-800 rounded-full px-2 py-0.5 self-start">
                <Text className="text-zinc-300 text-sm">{book.genre}</Text>
              </View>
            ) : null}
            {book.pageCount ? (
              <View className="bg-zinc-800 rounded-full px-2 py-0.5 self-start">
                <Text className="text-zinc-300 text-sm">{book.pageCount} pages</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Status */}
        <Section title="Statut de lecture">
          <View className="flex-row gap-2">
            {STATUS_OPTIONS.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => handleStatusChange(status)}
                className={`flex-1 py-2.5 rounded-xl border items-center ${
                  book.status === status
                    ? "bg-violet-600 border-violet-500"
                    : "bg-zinc-800 border-zinc-700"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    book.status === status ? "text-white" : "text-zinc-400"
                  }`}
                >
                  {STATUS_LABELS[status]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {/* Rating */}
        <Section title="Ma note">
          <View className="flex-row items-center justify-between">
            <StarRating
              rating={book.rating}
              onChange={handleRating}
              size={32}
            />
            {book.rating ? (
              <TouchableOpacity onPress={() => updateBook(id, { rating: undefined })}>
                <Text className="text-zinc-500 text-sm">Effacer</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Section>

        {/* Dates */}
        <Section title="Dates">
          <View className="gap-2">
            <DateRow
              icon="play-circle-outline"
              label="Commencé le"
              value={formatDate(book.startedAt)}
              onClear={
                book.startedAt
                  ? () => updateBook(id, { startedAt: undefined })
                  : undefined
              }
              onSet={
                !book.startedAt
                  ? () =>
                      updateBook(id, { startedAt: new Date().toISOString() })
                  : undefined
              }
            />
            <DateRow
              icon="checkmark-circle-outline"
              label="Terminé le"
              value={formatDate(book.finishedAt)}
              onClear={
                book.finishedAt
                  ? () => updateBook(id, { finishedAt: undefined })
                  : undefined
              }
              onSet={
                !book.finishedAt
                  ? () =>
                      updateBook(id, { finishedAt: new Date().toISOString() })
                  : undefined
              }
            />
          </View>
        </Section>

        {/* Notes */}
        <Section title="Commentaire personnel">
          {editing ? (
            <View>
              <TextInput
                className="bg-zinc-800 rounded-xl p-3 text-white text-sm min-h-28 text-top"
                multiline
                value={note}
                onChangeText={setNote}
                placeholder="Écrivez vos impressions, citations…"
                placeholderTextColor="#52525b"
                autoFocus
              />
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 items-center"
                  onPress={() => {
                    setNote(book.note ?? "");
                    setEditing(false);
                  }}
                >
                  <Text className="text-zinc-400 font-semibold text-sm">
                    Annuler
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 items-center"
                  onPress={handleSaveNote}
                >
                  <Text className="text-white font-bold text-sm">
                    Enregistrer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-zinc-800 rounded-xl p-3 min-h-16"
              onPress={() => setEditing(true)}
              activeOpacity={0.75}
            >
              {book.note ? (
                <Text className="text-zinc-300 text-sm leading-5">{book.note}</Text>
              ) : (
                <Text className="text-zinc-500 text-sm italic">
                  Appuyez pour ajouter un commentaire…
                </Text>
              )}
            </TouchableOpacity>
          )}
        </Section>

        {/* Delete */}
        <TouchableOpacity
          className="mt-4 py-3.5 rounded-xl border border-red-900 items-center"
          onPress={handleDelete}
        >
          <Text className="text-red-400 font-semibold">
            Supprimer ce livre
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-5">
      <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}

function DateRow({
  icon,
  label,
  value,
  onClear,
  onSet,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onClear?: () => void;
  onSet?: () => void;
}) {
  return (
    <View className="flex-row items-center bg-zinc-900 rounded-xl px-3 py-2.5">
      <Ionicons name={icon} size={18} color="#7c3aed" />
      <Text className="text-zinc-400 text-sm ml-2 flex-1">{label}</Text>
      <Text className="text-white text-sm font-medium">{value}</Text>
      {onClear && (
        <TouchableOpacity onPress={onClear} className="ml-2">
          <Ionicons name="close-circle-outline" size={16} color="#52525b" />
        </TouchableOpacity>
      )}
      {onSet && (
        <TouchableOpacity onPress={onSet} className="ml-2">
          <Text className="text-violet-400 text-xs font-semibold">
            Aujourd'hui
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
