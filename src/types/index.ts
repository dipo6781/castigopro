export type ContactChannel = "whatsapp" | "phone" | "sms" | "email" | "visit" | "other";

export type ManagementResult =
  | "contactado"
  | "no_contesta"
  | "numero_equivocado"
  | "promesa_pago"
  | "pago_parcial"
  | "pago_total"
  | "acuerdo_quita"
  | "rechazo"
  | "escalado"
  | "otro";

export interface Debtor {
  id: string;
  name: string;
  document: string; // CI / RUT / DNI / etc.
  phone: string;
  email?: string;
  address?: string;
  originalAmount: number;
  currentBalance: number;
  writeOffDate: string; // ISO
  daysSinceWriteOff: number;
  product?: string;
  notes?: string;
  recoveryScore: number; // 0-100 calculated
  status: "pendiente" | "en_gestion" | "promesa" | "recuperado" | "incobrable";
  lastContactAt?: string;
  assignedTo?: string;
}

export interface Management {
  id: string;
  debtorId: string;
  date: string;
  channel: ContactChannel;
  result: ManagementResult;
  notes: string;
  promiseAmount?: number;
  promiseDate?: string;
  settlementOffer?: number; // proposed settlement amount
  createdBy: string;
}

export interface SettlementOffer {
  id: string;
  debtorId: string;
  originalBalance: number;
  offeredAmount: number;
  discountPercent: number;
  status: "proposed" | "accepted" | "rejected" | "paid";
  createdAt: string;
  acceptedAt?: string;
}

export interface AppStats {
  totalAccounts: number;
  totalBalance: number;
  recoveredToday: number;
  recoveredWeek: number;
  promisesActive: number;
  contactRate: number;
}
