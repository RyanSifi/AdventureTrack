import React from "react";
import { View, Text } from "react-native";

interface Props {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji = "📚", title, subtitle }: Props) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-20">
      <View className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center mb-5">
        <Text className="text-4xl">{emoji}</Text>
      </View>
      <Text className="text-white text-lg font-bold text-center mb-2">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-zinc-500 text-sm text-center leading-5">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
