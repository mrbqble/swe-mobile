export interface Product {
  id: number | string;
  name: string;
  description?: string;
  price: number; // integer in local currency units
  currency?: string;
  stock: number;
  imageUrl?: string;
  supplier?: string;
  supplierId?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
