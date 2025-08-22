export type ProductDetail = {
  label: string;
  value: string;
};

export type ProductItem = {
  id: string;
  docNo: string;
  model: string;
  receivedQty: number | null;
  totalQty: number | null;
  details: ProductDetail[];
  image: string;
  isDelete: boolean;
};
