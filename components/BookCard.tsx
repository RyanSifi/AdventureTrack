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

const PLACEHOLDER_COVER =
  "https://via.placeholder.com/80x120/1a1a2e/7c3aed?text=📖";

export function BookCard({ book }: Props) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle]}
      className="flex-row bg-zinc-900 rounded-2xl p-3 mb-3 shadow-sm"
      onPress={() => router.push(`/book/${book.id}`)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      {/* Cover */}
      <Image
        source={{ uri: book.cover ?? PLACEHOLDER_COVER }}
        className="w-16 h-24 rounded-lg bg-zinc-800"
        resizeMode="cover"
      />

      {/* Info */}
      <View className="flex-1 ml-3 justify-between py-0.5">
        <View>
          <Text
            className="text-white font-bold text-base leading-5"
            numberOfLines={2}
          >
            {book.title}
          </Text>
          <Text className="text-zinc-400 text-sm mt-0.5" numberOfLines={1}>
            {book.author}
          </Text>
          {book.genre ? (
            <Text className="text-violet-400 text-xs mt-0.5" numberOfLines={1}>
              {book.genre}
            </Text>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <StatusBadge status={book.status} small />
          {book.rating ? (
            <StarRating rating={book.rating} size={14} readonly />
          ) : null}
        </View>
      </View>
    </AnimatedTouchable>
  );
}
