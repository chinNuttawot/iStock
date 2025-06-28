import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const utf8Bytes = new TextEncoder().encode(password.toLowerCase());
    const base64Encoded = btoa(String.fromCharCode(...utf8Bytes));
    console.log("base64Encoded ====>", base64Encoded);
    if (
      username.toLowerCase() === "admin" &&
      password.toLowerCase() === "1234"
    ) {
      // await StorageUtility.set(authToken, "1");
      router.replace("/(tabs)");
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

      {/* ✅ ปุ่ม Login */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>

      {/* ✅ Register */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>{"Don't have an account?"}</Text>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => router.replace("/register")}
        >
          <Text style={styles.smallButtonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Forgot Password */}
      <TouchableOpacity
        style={styles.smallButtonFull}
        onPress={() => router.replace("/forgot")}
      >
        <Text style={styles.smallButtonText}>FORGOT PASSWORD?</Text>
      </TouchableOpacity>
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
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  registerContainer: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    color: "#666",
  },
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  smallButtonFull: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  smallButtonText: {
    // fontWeight: "bold",
    textAlign: "center",
  },
});
