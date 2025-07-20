export type ProductDetail = {
  label: string;
  value: null | string;
};

export type ProductItem = {
  id: string;
  docId: string;
  model: string;
  receivedQty: number;
  totalQty: number;
  details: ProductDetail[];
  image: string;
};
