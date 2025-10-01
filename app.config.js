const IS_DEV_CLIENT = process.env.EXPO_USE_DEV_CLIENT === "true";

export default () => {
  const config = {
    name: "iStock",
    slug: "iStock",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon-3.png",
    scheme: "istock",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.echonovatech.istock",
      supportsTablet: true,
      buildNumber: "1",
      infoPlist: {
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: false,
          NSExceptionDomains: {
            "istockapp.myvnc.com": {
              NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true,
            },
          },
        },
      },
    },
    android: {
      package: "com.echonovatech.istock",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    plugins: [
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-font",
      "expo-secure-store",
      "expo-web-browser", // 👈 เพิ่มตรงนี้
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: "4c6eab79-01f2-484c-91dc-0283442e9f6a",
      },
      USE_DEV_CLIENT: IS_DEV_CLIENT,
    },
  };
  if (IS_DEV_CLIENT) {
    config.ios.newArchEnabled = true;
    config.android.newArchEnabled = true;
  }
  return config;
};
