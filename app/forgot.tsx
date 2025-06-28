import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleReset = () => {
    if (!email.includes("@")) {
      alert("Please enter a valid email");
      return;
    }

    // 🔐 mock ส่ง email reset password
    console.log("📧 Sending reset email to:", email);
    alert("Password reset link has been sent to your email");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* ✅ ปุ่มส่งลิงก์ */}
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>SEND RESET LINK</Text>
      </TouchableOpacity>

      {/* ✅ ปุ่มกลับ Login */}
      <TouchableOpacity
        style={styles.smallButtonFull}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.smallButtonText}>BACK TO LOGIN</Text>
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
  smallButtonFull: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  smallButtonText: {
    textAlign: "center",
  },
});
