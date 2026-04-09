import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface Props {
  rating?: number;
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({ rating = 0, onChange, size = 24, readonly = false }: Props) {
  const fontSize = size;
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange?.(star)}
          disabled={readonly}
          activeOpacity={readonly ? 1 : 0.6}
          className="pr-0.5"
        >
          <Text style={{ fontSize, lineHeight: fontSize * 1.2 }}>
            {star <= rating ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
