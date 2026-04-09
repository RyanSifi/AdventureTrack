import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Book } from "../types";
import { StatusBadge } from "./StatusBadge";
import { StarRating } from "./StarRating";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  book: Book;
}

const STATUS_ACCENT: Record<string, string> = {
  to_read: "bg-zinc-500",
  reading: "bg-indigo-500",
  done: "bg-violet-500",
};

export function BookCard({ book }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[animatedStyle]}
      className="flex-row bg-zinc-900 rounded-2xl mb-3 overflow-hidden border border-zinc-800"
      onPress={() => router.push(`/book/${book.id}`)}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 20 }); }}
      activeOpacity={1}
    >
      {/* Status accent bar */}
      <View className={`w-1 ${STATUS_ACCENT[book.status]}`} />

      {/* Cover */}
      <View className="py-3 pl-3">
        {book.cover ? (
          <Image
            source={{ uri: book.cover }}
            className="w-14 h-20 rounded-xl bg-zinc-800"
            resizeMode="cover"
          />
        ) : (
          <View className="w-14 h-20 rounded-xl bg-zinc-800 items-center justify-center">
            <Text className="text-2xl">📖</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 px-3 py-3 justify-between">
        <View>
          <Text className="text-white font-bold text-sm leading-5" numberOfLines={2}>
            {book.title}
          </Text>
          <Text className="text-zinc-500 text-xs mt-0.5" numberOfLines={1}>
            {book.author}
          </Text>
          {book.genre ? (
            <Text className="text-violet-400 text-xs mt-1" numberOfLines={1}>
              {book.genre}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <StatusBadge status={book.status} small />
          {book.rating ? (
            <StarRating rating={book.rating} size={12} readonly />
          ) : null}
        </View>
      </View>

      {/* Chevron */}
      <View className="justify-center pr-3">
        <Text className="text-zinc-700 text-lg">›</Text>
      </View>
    </AnimatedTouchable>
  );
}
