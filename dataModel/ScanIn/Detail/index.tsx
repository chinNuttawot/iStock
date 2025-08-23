export type ProductDetail = {
  label: string;
  value: string;
};

export type ProductItem = {
  id: string;
  docNo: string;
  model: string;
  qtyReceived: number | null;
  qtyShipped: number | null;
  details: ProductDetail[];
  image: string;
  isDelete: boolean;
};
