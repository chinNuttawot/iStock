import { theme } from "@/providers/Theme";
import { styles } from "@/screens/ScanIn /Styles";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { Fragment } from "react";
import {
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Header = (props: any) => {
  const { hideGoback = true, IconComponent = [], title, onGoBack } = props;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const listBtGoBack = [
    <TouchableOpacity
      key={"bt=1"}
      onPress={() => {
        goBack();
      }}
    >
      <Ionicons
        name="chevron-back"
        size={30}
        color={props.colorIcon || theme.mainApp}
      />
    </TouchableOpacity>,
  ];

  if (IconComponent.length >= 1) {
    IconComponent.slice(0, IconComponent.length - 1).forEach(() => {
      listBtGoBack.push(<View style={{ width: 60 }} />);
    });
  }

  const goBack = () => {
    if (onGoBack) {
      onGoBack();
      return;
    }
    navigation.goBack();
  };
  return (
    <Fragment>
      <SafeAreaView
        style={{
          backgroundColor: props.backgroundColor || theme.mainApp,
          paddingTop: insets.top,
        }}
      >
        <StatusBar
          barStyle={props.barStyle || "light-content"}
          backgroundColor={props.color || theme.mainApp}
        />

        <View
          style={[
            styles.headerBar,
            { backgroundColor: props.color || theme.mainApp },
          ]}
        >
          {!hideGoback &&
            listBtGoBack.map((v: any, k: number) => <View key={k}>{v}</View>)}
          {title && <Text style={[styles.headerTitle]}>{title}</Text>}
          {IconComponent.length > 0 ? (
            IconComponent.map((v: any, k: number) => (
              <View
                style={{ paddingLeft: IconComponent.length === 1 ? 0 : 16 }}
                key={k}
              >
                {v}
              </View>
            ))
          ) : (
            <View style={{ width: 30 }} />
          )}
        </View>
      </SafeAreaView>
    </Fragment>
  );
};

export default Header;
