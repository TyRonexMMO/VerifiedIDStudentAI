
export interface ReceiptData {
  schoolName: string;
  schoolAddress: string;
  schoolContact: string;
  logoUrl: string;
  studentName: string;
  studentClass: string;
  studentSection: string;
  studentRoll: string;
  parentName: string;
  receiptNumber: string;
  paymentDate: string;
  academicYear: string;
  paymentAmount: number;
  paymentMode: 'Cash' | 'Cheque' | 'Online Transfer' | 'DD (Demand Draft)' | 'UPI';
  paymentDetails: string;
  accountantName: string;
  signatureUrl: string;
}

export enum Tab {
    School = 'school',
    Student = 'student',
    Payment = 'payment',
    Signature = 'signature'
}

export interface StudentParentPair {
  studentName: string;
  parentName: string;
}
