import { theme } from "@/providers/Theme";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const utf8Bytes = new TextEncoder().encode(password.toLowerCase());
    const base64Encoded = btoa(String.fromCharCode(...utf8Bytes));

    console.log("🔐 Encoded password:", base64Encoded);

    if (
      username.toLowerCase() === "admin" &&
      password.toLowerCase() === "1234"
    ) {
      onLoginSuccess(); // ✅ เรียกให้ไปหน้า Home
    } else {
      Alert.alert("เข้าสู่ระบบล้มเหลว", "Username หรือ Password ไม่ถูกต้อง");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>เข้าสู่ระบบ</Text>

      <TextInput
        placeholder="ชื่อผู้ใช้"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="รหัสผ่าน"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>ลืมรหัสผ่าน?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link}>
        <Text style={styles.linkText}>สมัครสมาชิก</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.setFont,
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    ...theme.setFont,
    fontSize: 26,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    ...theme.setFont,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: theme.white,
    fontSize: 16,
  },
  button: {
    ...theme.setFont,
    backgroundColor: theme.mainApp,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    ...theme.setFont,
    color: theme.white,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  link: {
    ...theme.setFont,
    marginTop: 18,
  },
  linkText: {
    ...theme.setFont,
    color: theme.mainApp,
    textAlign: "center",
    fontSize: 14,
  },
});
