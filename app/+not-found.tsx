import { Link, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: "Page introuvable" }} />
      <View className="flex-1 bg-zinc-950 items-center justify-center p-6">
        <Text className="text-white text-4xl font-bold mb-2">404</Text>
        <Text className="text-zinc-400 text-lg text-center mb-8">
          Cette page n'existe pas.
        </Text>
        <Link href="/" className="text-violet-400 text-base font-semibold">
          Retour à l'accueil
        </Link>
      </View>
    </>
  );
}
