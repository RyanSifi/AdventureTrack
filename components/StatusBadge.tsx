import React from "react";
import { View, Text } from "react-native";
import { BookStatus, STATUS_LABELS } from "../types";

const badgeClasses: Record<BookStatus, string> = {
  to_read: "bg-zinc-700",
  reading: "bg-indigo-700",
  done: "bg-violet-700",
};

const textClasses: Record<BookStatus, string> = {
  to_read: "text-zinc-200",
  reading: "text-indigo-100",
  done: "text-violet-100",
};

interface Props {
  status: BookStatus;
  small?: boolean;
}

export function StatusBadge({ status, small = false }: Props) {
  return (
    <View
      className={`rounded-full px-2 py-0.5 self-start ${badgeClasses[status]} ${small ? "px-1.5 py-0" : ""}`}
    >
      <Text
        className={`font-semibold ${small ? "text-xs" : "text-sm"} ${textClasses[status]}`}
      >
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}
