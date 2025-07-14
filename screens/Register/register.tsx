import { theme } from "@/providers/Theme";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = () => {
    if (password !== confirm) {
      alert("Password doesn't match");
      return;
    }

    // 🔐 ตัวอย่าง: บันทึก user (mock)
    console.log("✅ Registered:", { username, password });

    alert("Register success!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

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
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        style={styles.input}
      />

      {/* ✅ ปุ่ม Register */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>REGISTER</Text>
      </TouchableOpacity>

      {/* ✅ ปุ่มกลับ Login */}
      <TouchableOpacity style={styles.smallButtonFull} onPress={() => {}}>
        <Text style={styles.smallButtonText}>BACK TO LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...theme.setFont,
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    ...theme.setFont,
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    ...theme.setFont,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  button: {
    ...theme.setFont,
    backgroundColor: theme.iosPrimary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  buttonText: {
    ...theme.setFont,
    color: theme.white,
    textAlign: "center",
  },
  smallButtonFull: {
    ...theme.setFont,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  smallButtonText: {
    ...theme.setFont,
    textAlign: "center",
  },
});
