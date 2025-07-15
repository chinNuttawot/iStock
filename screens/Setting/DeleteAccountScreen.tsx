import { Assets } from "@/assets/Assets";
import CustomButton from "@/components/CustomButton";
import Header from "@/components/Header";
import { theme } from "@/providers/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, ScrollView, Text, TextInput, View } from "react-native";
import { stylesDeleteAccountScreen } from "./Styles";

export default function DeleteAccountScreen({ onLogout }: any) {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleDelete = () => {
    if (password && password === confirmPassword) {
      console.log("Account Deleted");
      onLogout();
      // TODO: call API here
    } else {
      alert("Password does not match");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={stylesDeleteAccountScreen.container}>
        <Header color={theme.white} barStyle={"dark-content"} />
        <Image
          source={Assets.logoIStock}
          style={stylesDeleteAccountScreen.logo}
          resizeMode="contain"
        />
        <Text style={stylesDeleteAccountScreen.title}>Delete Account</Text>
        <View style={stylesDeleteAccountScreen.form}>
          <View style={stylesDeleteAccountScreen.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              placeholder="Password"
              style={stylesDeleteAccountScreen.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View style={stylesDeleteAccountScreen.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="gray" />
            <TextInput
              placeholder="Confirm Password"
              style={stylesDeleteAccountScreen.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>
        <View style={{ marginTop: 24 }}>
          <CustomButton label={"Delete Account"} onPress={handleDelete} />
        </View>
      </View>
    </ScrollView>
  );
}
