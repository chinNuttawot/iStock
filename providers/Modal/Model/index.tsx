import { ReactElement } from "react";

export interface ModalComponentModel {
  isOpen: boolean;
  onChange?: any;
  onBackdropPress?: any;
  onChangeCancel?: any;
  label?: string;
  labelCancel?: string;
  option?: Modeloption;
  hideCustomButtons?: boolean;
  backgroundColor?: any;
  children?: ReactElement<{ changeButton?: React.ReactNode }>;
}

export interface Modeloption {
  change?: any;
  changeCancel?: any;
}
