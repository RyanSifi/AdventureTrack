import React from "react";
import { View, Text } from "react-native";
import { BookStatus, STATUS_LABELS } from "../types";

const config: Record<BookStatus, { bg: string; text: string; dot: string }> = {
  to_read:  { bg: "bg-zinc-800",   text: "text-zinc-300",   dot: "bg-zinc-400"   },
  reading:  { bg: "bg-indigo-950", text: "text-indigo-300",  dot: "bg-indigo-400" },
  done:     { bg: "bg-violet-950", text: "text-violet-300",  dot: "bg-violet-400" },
};

interface Props {
  status: BookStatus;
  small?: boolean;
}

export function StatusBadge({ status, small = false }: Props) {
  const c = config[status];
  return (
    <View className={`flex-row items-center rounded-full self-start ${c.bg} ${small ? "px-2 py-0.5 gap-1" : "px-2.5 py-1 gap-1.5"}`}>
      <View className={`rounded-full ${c.dot} ${small ? "w-1.5 h-1.5" : "w-2 h-2"}`} />
      <Text className={`font-semibold ${c.text} ${small ? "text-xs" : "text-sm"}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
