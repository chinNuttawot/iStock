export type ProductDetail = {
  label: string;
  value: null | string;
};

export type ProductItem = {
  id: string;
  docId: string;
  model: string;
  receivedQty: null | number;
  totalQty: null | number;
  details: ProductDetail[];
  image: string;
  isDelete: boolean;
};
