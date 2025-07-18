import { theme } from "@/providers/Theme";
import { styles } from "@/screens/ScanIn /Styles";
import { resetFilter } from "@/store/slices/filterSlice";
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
import { useDispatch, useSelector } from "react-redux";

const Header = (props: any) => {
  const { hideGoback = true, IconComponent, title } = props;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const filter = useSelector((state: any) => state.filter);
  const dispatch = useDispatch();
  const goBack = () => {
    if (filter?.isFilter) {
      dispatch(resetFilter());
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
          {!hideGoback && (
            <TouchableOpacity
              onPress={() => {
                goBack();
              }}
            >
              <Ionicons
                name="chevron-back"
                size={30}
                color={props.colorIcon || theme.mainApp}
              />
            </TouchableOpacity>
          )}
          {title && <Text style={styles.headerTitle}>{title}</Text>}
          {IconComponent ? IconComponent : <View  style={{width: 30}}/>}
        </View>
      </SafeAreaView>
    </Fragment>
  );
};

export default Header;
