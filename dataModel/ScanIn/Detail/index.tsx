export type ProductDetail = {
  label: string;
  value: string;
};

export type ProductItem = {
  id: string;
  docNo: string;
  uuid: string;
  model: string;
  productCode: string;
  qtyReceived: number | null;
  qtyShipped: number | null;
  details: ProductDetail[];
  picURL?: string;
  isDelete: boolean;
  lineNo?: number;
};
