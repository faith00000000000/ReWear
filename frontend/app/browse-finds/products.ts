export type Status = "THRIFT" | "RENT" | "THRIFT + RENT";

export type Product = {
  id: number | string;
  name: string;
  brand: string;
  category?: string;
  price: string;
  oldPrice?: string;
  rentalPrice?: string;
  size: string;
  condition: string;
  color: string;
  material: string;
  status: Status;
  availability?: string;
  image: string;
  gallery?: string[];
  story?: string;
  measurements?: {
    chest?: string;
    sleeve?: string;
    length?: string;
    shoulder?: string;
  };
  care?: string[];
  rentDuration?: string;
};