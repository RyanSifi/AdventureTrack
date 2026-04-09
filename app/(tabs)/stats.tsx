import React, { useMemo } from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { useBookStore } from "../../store/bookStore";
import { StarRating } from "../../components/StarRating";
import { EmptyState } from "../../components/EmptyState";
import { Book } from "../../types";

const MONTHS_FR = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

function useStats(books: Book[]) {
  return useMemo(() => {
    const toRead   = books.filter((b) => b.status === "to_read").length;
    const reading  = books.filter((b) => b.status === "reading").length;
    const done     = books.filter((b) => b.status === "done").length;

    const rated    = books.filter((b) => b.rating !== undefined);
    const avgRating = rated.length
      ? rated.reduce((acc, b) => acc + (b.rating ?? 0), 0) / rated.length
      : null;

    const lastDone = books
      .filter((b) => b.status === "done" && b.finishedAt)
      .sort((a, b) => new Date(b.finishedAt!).getTime() - new Date(a.finishedAt!).getTime())[0] ?? null;

    const now = new Date();
    const monthCounts = Array.from({ length: 6 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const year  = d.getFullYear();
      const month = d.getMonth();
      return {
        label: MONTHS_FR[month],
        count: books.filter((b) => {
          if (b.status !== "done" || !b.finishedAt) return false;
          const fin = new Date(b.finishedAt);
          return fin.getFullYear() === year && fin.getMonth() === month;
        }).length,
      };
    });

    return { toRead, reading, done, avgRating, lastDone, monthCounts };
  }, [books]);
}

function MiniStatCard({ emoji, label, value, accent }: {
  emoji: string; label: string; value: number; accent: string;
}) {
  return (
    <View className={`flex-1 rounded-2xl p-4 border ${accent}`}>
      <Text className="text-2xl mb-1">{emoji}</Text>
      <Text className="text-white text-2xl font-bold">{value}</Text>
      <Text className="text-zinc-500 text-xs mt-0.5">{label}</Text>
    </View>
  );
}

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <View className="flex-row items-end" style={{ height: 100, gap: 6 }}>
      {data.map((item, idx) => {
        const pct = item.count / max;
        const barH = Math.max(pct * 72, item.count > 0 ? 6 : 2);
        return (
          <View key={idx} className="flex-1 items-center">
            {item.count > 0 && (
              <Text className="text-violet-400 text-xs font-bold mb-1">{item.count}</Text>
            )}
            <View className="w-full rounded-t-lg overflow-hidden bg-zinc-800" style={{ height: 72 }}>
              <View
                className={item.count > 0 ? "w-full bg-violet-600 rounded-t-lg" : ""}
                style={{ height: barH, marginTop: 72 - barH }}
              />
            </View>
            <Text className="text-zinc-600 text-xs mt-1.5">{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function StatsScreen() {
  const books = useBookStore((s) => s.books);
  const { toRead, reading, done, avgRating, lastDone, monthCounts } = useStats(books);

  if (books.length === 0) {
    return (
      <View className="flex-1 bg-zinc-950">
        <EmptyState
          emoji="📊"
          title="Pas encore de stats"
          subtitle="Ajoutez des livres à votre bibliothèque pour voir vos statistiques."
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text className="text-white text-2xl font-bold mb-5">Statistiques</Text>

      {/* Status row */}
      <View className="flex-row mb-3" style={{ gap: 10 }}>
        <MiniStatCard emoji="🔖" label="À lire"   value={toRead}  accent="bg-zinc-900 border-zinc-800" />
        <MiniStatCard emoji="📖" label="En cours" value={reading} accent="bg-indigo-950 border-indigo-900" />
        <MiniStatCard emoji="✅" label="Terminés" value={done}    accent="bg-violet-950 border-violet-900" />
      </View>

      {/* Total + avg */}
      <View className="flex-row mb-5" style={{ gap: 10 }}>
        <View className="flex-1 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Total</Text>
          <Text className="text-white text-3xl font-bold">{books.length}</Text>
          <Text className="text-zinc-600 text-xs mt-0.5">livres enregistrés</Text>
        </View>
        <View className="flex-1 bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-1">Note moy.</Text>
          {avgRating !== null ? (
            <>
              <Text className="text-white text-3xl font-bold">{avgRating.toFixed(1)}</Text>
              <StarRating rating={Math.round(avgRating)} size={14} readonly />
            </>
          ) : (
            <Text className="text-zinc-600 text-xl mt-1">—</Text>
          )}
        </View>
      </View>

      {/* Last finished */}
      {lastDone && (
        <View className="mb-5">
          <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Dernier livre terminé
          </Text>
          <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex-row">
            {lastDone.cover ? (
              <Image
                source={{ uri: lastDone.cover }}
                style={{ width: 52, height: 76, borderRadius: 10 }}
                className="bg-zinc-800"
                resizeMode="cover"
              />
            ) : (
              <View className="rounded-xl bg-zinc-800 items-center justify-center" style={{ width: 52, height: 76 }}>
                <Text className="text-2xl">📖</Text>
              </View>
            )}
            <View className="flex-1 ml-3 justify-center">
              <Text className="text-white font-bold text-sm leading-5" numberOfLines={2}>{lastDone.title}</Text>
              <Text className="text-zinc-500 text-xs mt-0.5">{lastDone.author}</Text>
              {lastDone.finishedAt && (
                <Text className="text-zinc-600 text-xs mt-1.5">
                  {new Date(lastDone.finishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </Text>
              )}
              {lastDone.rating ? (
                <View className="mt-1.5">
                  <StarRating rating={lastDone.rating} size={14} readonly />
                </View>
              ) : null}
            </View>
          </View>
        </View>
      )}

      {/* Monthly chart */}
      <View className="mb-2">
        <Text className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-3">
          Livres terminés par mois
        </Text>
        <View className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <BarChart data={monthCounts} />
        </View>
      </View>
    </ScrollView>
  );
}
