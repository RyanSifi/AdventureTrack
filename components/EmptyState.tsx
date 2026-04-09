import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({
  icon = "book-outline",
  title,
  subtitle,
}: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="w-24 h-24 rounded-full bg-zinc-800 items-center justify-center mb-6">
        <Ionicons name={icon} size={48} color="#7c3aed" />
      </View>
      <Text className="text-white text-xl font-bold text-center mb-2">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-zinc-400 text-base text-center leading-6">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
