import { theme } from "@/providers/Theme";
import { stylesDeleteAccountScreen } from "@/screens/Setting/Styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { SafeAreaView, StatusBar, TouchableOpacity, View } from "react-native";

const Header = (props: any) => {
  const navigation = useNavigation();
  return (
    <View style={{ backgroundColor: props.backgroundColor || theme.white }}>
      <SafeAreaView>
        <StatusBar
          barStyle={props.barStyle || "light-content"}
          backgroundColor={props.color || theme.mainApp}
        />
      </SafeAreaView>
      {!props?.hideGoback && (
        <TouchableOpacity
          style={[
            stylesDeleteAccountScreen.backButton,
            { width: 40, alignItems: "center" },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={30}
            color={props.colorIcon || theme.mainApp}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;
