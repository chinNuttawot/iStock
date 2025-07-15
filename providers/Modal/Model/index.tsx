export interface ModalComponentModel {
  isOpen: boolean;
  onChange?: any;
  onChangeCancel?: any;
  label?: string;
  labelCancel?: string;
  children?: any;
  option?: Modeloption;
}

export interface Modeloption {
  change?: any;
  changeCancel?: any;
}
