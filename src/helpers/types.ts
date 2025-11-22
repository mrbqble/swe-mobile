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

export interface Supplier {
  id: string | number;
  name: string;
  description?: string;
  city?: string;
  rating?: number;
}

export interface ChatMessage {
  id: string | number;
  threadId: string | number;
  from: string;
  text?: string;
  attachments?: Array<{ url: string; type?: string; previewUri?: string }>;
  ts: string;
  delivered?: boolean;
  read?: boolean;
  system?: boolean;
  severity?: 'info' | 'warning' | 'success' | 'error';
}

