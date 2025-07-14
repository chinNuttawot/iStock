import * as Font from "expo-font";
import { useEffect, useState } from "react";

export function useLoadFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          "Kanit-Regular": require("./assets/fonts/Kanit-Regular.ttf"),
          "Kanit-Bold": require("./assets/fonts/Kanit-Bold.ttf"),
        });
      } catch (error) {
        console.warn("Error loading fonts:", error);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return fontsLoaded;
}
