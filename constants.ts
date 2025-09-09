import { ReceiptData } from './types';

export const DEFAULT_RECEIPT_DATA: ReceiptData = {
  schoolName: 'Kalinga Institute of Industrial Technology',
  schoolAddress: 'KIIT Rd, Patia, Bhubaneswar, Odisha 751024, India',
  schoolContact: 'Phone: +91 80807 35735 | Email: info@kiit.ac.in',
  logoUrl: 'https://raw.githubusercontent.com/rathcponleu2-png/LogoKITT/refs/heads/main/imgi_1_small_Kalinga_Institute_of_Industrial_Technology_KIIT_University_17335b6db0_ce378cd5fb_c4bfd9e839_5ec82024ff.png',
  studentName: 'Aarav Sharma',
  studentClass: '10th',
  studentSection: 'A',
  studentRoll: '10245',
  parentName: 'Rajesh Sharma',
  receiptNumber: 'REC-2024-10245',
  paymentDate: '2024-07-15',
  academicYear: '2024-2025',
  paymentAmount: 12500,
  paymentMode: 'Cheque',
  paymentDetails: 'Cheque No: 654321, SBI Bank',
  accountantName: 'Principal Accountant',
  signatureUrl: '',
};

export const FIRST_NAMES = ["Aarav", "Vihaan", "Arjun", "Saanvi", "Ananya", "Aditya", "Sanya", "Reyansh", "Aaradhya", "Mohammed", "Sai", "Pari", "Ishaan", "Myra", "Avni", "Rudra", "Aryan", "Anika", "Dhruv", "Ishita", "Krishna", "Neha", "Rohan", "Tanvi", "Ved", "Zara", "Yash", "Sia"];
export const LAST_NAMES = ["Sharma", "Patel", "Kumar", "Singh", "Gupta", "Mehta", "Verma", "Joshi", "Malik", "Choudhury", "Reddy", "Rao", "Khan", "Ali", "Thakur", "Shah", "Jain", "Garg", "Agrawal", "Das"];
export const PARENT_TITLES = ["Mr.", "Mrs."];
export const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th"];
export const SECTIONS = ["A", "B", "C", "D", "E", "F"];
export const PAYMENT_MODES: { mode: ReceiptData['paymentMode']; details: string }[] = [
    { mode: "Cash", details: "Paid in cash at school office" },
    { mode: "Cheque", details: `Cheque No: ${Math.floor(100000 + Math.random() * 900000)}, SBI Bank` },
    { mode: "Online Transfer", details: `Ref: TXN${Math.floor(10000000 + Math.random() * 90000000)}` },
    { mode: "DD (Demand Draft)", details: `DD No: DD${Math.floor(10000 + Math.random() * 90000)}, HDFC Bank` },
    { mode: "UPI", details: `UPI Ref: UPI${Math.floor(100000000 + Math.random() * 900000000)}` }
];