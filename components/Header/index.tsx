import { theme } from "@/providers/Theme";
import React, { Fragment } from "react";
import { SafeAreaView, StatusBar } from "react-native";

const Header = (props: any) => {
  return (
    <Fragment>
      <SafeAreaView style={{ flex: 0 }}>
        <StatusBar barStyle="light-content" backgroundColor={theme.mainApp} />
      </SafeAreaView>
    </Fragment>
  );
};

export default Header;
