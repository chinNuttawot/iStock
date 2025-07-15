import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { JSX } from "react";

export type MenuItem = {
  id: string;
  label: string;
  icon: JSX.Element;
  textColor: string;
  showChevron: boolean;
  onPress?: () => void;
};

export const menuDataText = {
  Profile: "Profile",
  DeleteAccount: "Delete Account",
  Logout: "Logout",
};

const menuData: MenuItem[] = [
  {
    id: "1",
    label: "Profile",
    icon: <Ionicons name="person-outline" size={20} color="black" />,
    textColor: "black",
    showChevron: true,
  },
  {
    id: "2",
    label: "Delete Account",
    icon: <AntDesign name="delete" size={20} color="red" />,
    textColor: "red",
    showChevron: true,
  },
  {
    id: "3",
    label: "Logout",
    icon: <MaterialCommunityIcons name="logout" size={20} color="red" />,
    textColor: "red",
    showChevron: false,
  },
];

export type RootStackParamList = {
  Tabs: undefined;
  Login: undefined;
  Profile: undefined;
  DeleteAccount: undefined;
};

export { menuData };
