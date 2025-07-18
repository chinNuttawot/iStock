export interface ModalComponentModel {
  isOpen: boolean;
  onChange?: any;
  onChangeCancel?: any;
  label?: string;
  labelCancel?: string;
  children?: any;
  option?: Modeloption;
  hideCustomButtons?: boolean;
  backgroundColor?: any;
}

export interface Modeloption {
  change?: any;
  changeCancel?: any;
}
