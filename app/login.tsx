import { authToken } from "@/providers/keyStorageUtilliy";
import { StorageUtility } from "@/providers/storageUtility";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // ✨ ตัวอย่าง login logic
    if (
      username.toLowerCase() === "admin" &&
      password.toLowerCase() === "1234"
    ) {
       StorageUtility.set(authToken, "1")
      router.replace("/(tabs)"); // ไปหน้าแรกของแอป (เช่น home tab)
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />

      {/* ✅ ปุ่มไปหน้า Register */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>{"Don't have an account?"}</Text>
        <Button
          title="Register"
          onPress={() => router.replace("/register")}
          color="#888"
        />
      </View>
      {/* ✅ ปุ่มไปหน้า Forgot */}
      <View style={{ marginTop: 12 }}>
        <Button
          title="Forgot Password?"
          onPress={() => router.replace("/forgot")}
          color="#888"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  registerContainer: {
    marginTop: 24,
    flexDirection: "row", // 👈 แนวนอน
    alignItems: "center",
    justifyContent: "center", // 🧍‍♂️ อยู่ตรงกลางแนวนอน
  },
  registerText: {
    marginRight: 8, // ✅ ระยะห่างจากปุ่ม
    color: "#666",
  },
});
