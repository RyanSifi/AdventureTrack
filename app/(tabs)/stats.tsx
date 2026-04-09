import React, { useMemo } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBookStore } from "../../store/bookStore";
import { StarRating } from "../../components/StarRating";
import { EmptyState } from "../../components/EmptyState";
import { Book } from "../../types";

const MONTHS_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

function useStats(books: Book[]) {
  return useMemo(() => {
    const toRead = books.filter((b) => b.status === "to_read").length;
    const reading = books.filter((b) => b.status === "reading").length;
    const done = books.filter((b) => b.status === "done").length;

    const rated = books.filter((b) => b.rating !== undefined);
    const avgRating =
      rated.length > 0
        ? rated.reduce((acc, b) => acc + (b.rating ?? 0), 0) / rated.length
        : null;

    const lastDone = books
      .filter((b) => b.status === "done" && b.finishedAt)
      .sort(
        (a, b) =>
          new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime()
      )[0] ?? null;

    // Books read per month (last 6 months)
    const now = new Date();
    const monthCounts: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const count = books.filter((b) => {
        if (b.status !== "done" || !b.finishedAt) return false;
        const fin = new Date(b.finishedAt);
        return fin.getFullYear() === year && fin.getMonth() === month;
      }).length;
      monthCounts.push({ label: MONTHS_FR[month], count });
    }

    return { toRead, reading, done, avgRating, lastDone, monthCounts };
  }, [books]);
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View className="flex-1 bg-zinc-900 rounded-2xl p-4 items-center">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${color}`}
      >
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-zinc-400 text-xs text-center mt-0.5">{label}</Text>
    </View>
  );
}

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <View className="flex-row items-end justify-between h-28 mt-2">
      {data.map((item, idx) => {
        const heightPct = (item.count / max) * 100;
        return (
          <View key={idx} className="flex-1 items-center mx-0.5">
            <Text className="text-violet-400 text-xs font-bold mb-1">
              {item.count > 0 ? item.count : ""}
            </Text>
            <View className="w-full rounded-t-md bg-zinc-800 overflow-hidden justify-end" style={{ height: 80 }}>
              <View
                className="w-full bg-violet-600 rounded-t-md"
                style={{ height: `${Math.max(heightPct, item.count > 0 ? 8 : 0)}%` }}
              />
            </View>
            <Text className="text-zinc-500 text-xs mt-1">{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function StatsScreen() {
  const books = useBookStore((s) => s.books);
  const { toRead, reading, done, avgRating, lastDone, monthCounts } =
    useStats(books);

  if (books.length === 0) {
    return (
      <View className="flex-1 bg-zinc-950">
        <EmptyState
          icon="bar-chart-outline"
          title="Pas encore de statistiques"
          subtitle="Ajoutez des livres à votre bibliothèque pour voir vos statistiques de lecture."
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerClassName="px-4 py-4 pb-8"
      showsVerticalScrollIndicator={false}
    >
      {/* Status counts */}
      <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        Bibliothèque
      </Text>
      <View className="flex-row gap-3 mb-4">
        <StatCard
          icon="bookmark-outline"
          label="À lire"
          value={toRead}
          color="bg-zinc-600"
        />
        <StatCard
          icon="book-outline"
          label="En cours"
          value={reading}
          color="bg-indigo-600"
        />
        <StatCard
          icon="checkmark-circle-outline"
          label="Terminés"
          value={done}
          color="bg-violet-600"
        />
      </View>

      {/* Total + avg rating */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1 bg-zinc-900 rounded-2xl p-4">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Total
          </Text>
          <Text className="text-white text-3xl font-bold">{books.length}</Text>
          <Text className="text-zinc-500 text-xs mt-0.5">livres</Text>
        </View>
        <View className="flex-1 bg-zinc-900 rounded-2xl p-4">
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-1">
            Note moyenne
          </Text>
          {avgRating !== null ? (
            <>
              <Text className="text-white text-3xl font-bold">
                {avgRating.toFixed(1)}
              </Text>
              <StarRating rating={Math.round(avgRating)} size={14} readonly />
            </>
          ) : (
            <Text className="text-zinc-500 text-base mt-1">—</Text>
          )}
        </View>
      </View>

      {/* Last finished */}
      {lastDone && (
        <>
          <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
            Dernier livre terminé
          </Text>
          <View className="bg-zinc-900 rounded-2xl p-4 flex-row mb-6">
            {lastDone.cover ? (
              <Image
                source={{ uri: lastDone.cover }}
                className="w-14 h-20 rounded-lg bg-zinc-800"
                resizeMode="cover"
              />
            ) : (
              <View className="w-14 h-20 rounded-lg bg-zinc-800 items-center justify-center">
                <Ionicons name="book-outline" size={24} color="#52525b" />
              </View>
            )}
            <View className="flex-1 ml-3 justify-center">
              <Text className="text-white font-bold text-base" numberOfLines={2}>
                {lastDone.title}
              </Text>
              <Text className="text-zinc-400 text-sm mt-0.5">{lastDone.author}</Text>
              {lastDone.finishedAt && (
                <Text className="text-zinc-500 text-xs mt-1">
                  Terminé le{" "}
                  {new Date(lastDone.finishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              )}
              {lastDone.rating && (
                <View className="mt-1">
                  <StarRating rating={lastDone.rating} size={14} readonly />
                </View>
              )}
            </View>
          </View>
        </>
      )}

      {/* Monthly bar chart */}
      <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        Livres lus par mois (6 derniers mois)
      </Text>
      <View className="bg-zinc-900 rounded-2xl p-4 mb-4">
        <BarChart data={monthCounts} />
      </View>
    </ScrollView>
  );
}
