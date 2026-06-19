export interface PrintJob {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileDataUrl?: string; // For images / text preview
  totalPages: number;
  copies: number;
  colorMode: 'bw' | 'color';
  paperSize: 'A3' | 'A4' | 'A5' | 'A6' | 'Thermal';
  pricePerPage: number;
  totalPrice: number;
  status: 'pending_payment' | 'paying' | 'paid' | 'printing' | 'completed' | 'failed';
}

export interface PaymentDetails {
  phoneNumber: string;
  operator: 'mpesa' | 'emola';
  transactionId: string;
  timestamp: string;
  amount: number;
}

export interface ReceiptInfo {
  printJob: PrintJob;
  payment: PaymentDetails;
  companyName: string;
  nuit: string;
  address: string;
  contact: string;
}

export interface PrinterConfig {
  vendorId?: number;
  productId?: number;
  isConnected: boolean;
  deviceName?: string;
}
