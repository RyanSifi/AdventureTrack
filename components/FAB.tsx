import React from "react";
import { TouchableOpacity, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props {
  onPress: () => void;
}

export function FAB({ onPress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      style={[
        animatedStyle,
        {
          position: "absolute",
          bottom: 24,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "#7c3aed",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#7c3aed",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 8,
        },
      ]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      activeOpacity={1}
    >
      <Text className="text-white text-3xl leading-none" style={{ marginTop: -2 }}>+</Text>
    </AnimatedTouchable>
  );
}
