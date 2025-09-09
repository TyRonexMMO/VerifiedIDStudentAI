

import React, { LegacyRef } from 'react';
import { ReceiptData } from '../types';
import { convertToWords, formatDate } from '../utils/formatters';
import { Icon } from './icons';

interface ReceiptPreviewProps {
    data: ReceiptData;
    receiptRef: LegacyRef<HTMLDivElement>;
}

const IndianFlag: React.FC = () => (
    <div className="h-5 w-[30px] bg-gradient-to-b from-[#FF9933] from-33% via-white via-33% via-66% to-[#138808] to-66% relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#000080] text-[8px] leading-none">
            &#10042;
        </div>
    </div>
);

const PaymentModeIcon: React.FC<{ mode: ReceiptData['paymentMode'] }> = ({ mode }) => {
    let iconType: React.ComponentProps<typeof Icon>['type'] | null = null;
    switch (mode) {
        case 'Cash':
            iconType = 'cash';
            break;
        case 'Cheque':
            iconType = 'document-text';
            break;
        case 'Online Transfer':
            iconType = 'credit-card';
            break;
        case 'DD (Demand Draft)':
            iconType = 'office-building';
            break;
        case 'UPI':
            iconType = 'device-mobile';
            break;
    }
    if (!iconType) return null;
    return <Icon type={iconType} className="w-5 h-5 mr-2 text-gray-500" />;
};


export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ data, receiptRef }) => {
    const amountInWords = convertToWords(data.paymentAmount);
    const formattedDate = formatDate(data.paymentDate);
    const formattedAmount = data.paymentAmount.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    });

    return (
        <div ref={receiptRef} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-[#0047AB] to-[#1e3a8a] py-6 px-4 text-center">
                <div className="flex justify-center items-center mb-3 gap-2">
                    <IndianFlag />
                    <h2 className="text-lg font-semibold tracking-wide text-amber-300">KIIT OFFICIAL TUITION RECEIPT</h2>
                    <IndianFlag />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-wide">KALINGA INSTITUTE OF INDUSTRIAL TECHNOLOGY</h1>
            </div>

            <div className="p-8 bg-white">
                <div className="border border-gray-300 rounded-lg p-6 relative text-gray-900">
                    <div className="absolute opacity-15 font-playfair font-black text-red-700 text-[13rem] -rotate-12 tracking-widest top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
                        PAID
                    </div>
                    
                    <div className="flex flex-col items-center mb-6 text-center">
                        {data.logoUrl && <img src={data.logoUrl} className="max-h-24 max-w-52 object-contain mb-3" alt="School Logo" />}
                        <h2 className="text-xl font-bold text-gray-900">{data.schoolName}</h2>
                        <p className="text-gray-700 text-sm">{data.schoolAddress}</p>
                        <p className="text-gray-700 text-sm">{data.schoolContact}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                        <div>
                            <p><span className="font-bold text-gray-700">Receipt No:</span> {data.receiptNumber}</p>
                            <p><span className="font-bold text-gray-700">Date:</span> {formattedDate}</p>
                        </div>
                        <div className="text-right">
                            <p><span className="font-bold text-gray-700">Academic Year:</span> {data.academicYear}</p>
                        </div>
                    </div>

                    <div className="mb-8 space-y-2 text-sm">
                        <div className="flex">
                            <p className="font-bold text-gray-700 w-48 shrink-0">Received with thanks from:</p>
                            <p>{data.parentName}</p>
                        </div>
                        <div className="flex">
                            <p className="font-bold text-gray-700 w-48 shrink-0">Student Name:</p>
                            <p>{data.studentName}</p>
                        </div>
                         <p>
                            <span className="font-bold text-gray-700">Class:</span>&nbsp;{data.studentClass},&nbsp;
                            <span className="font-bold text-gray-700">Section:</span>&nbsp;{data.studentSection},&nbsp;
                            <span className="font-bold text-gray-700">Roll No:</span>&nbsp;{data.studentRoll}
                         </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200 text-center">
                         <p className="font-bold text-green-800 mb-2">TUITION FEE PAYMENT RECEIVED</p>
                         <p className="text-sm"><span className="font-bold text-gray-700">Amount in Words:</span> {amountInWords}</p>
                         <p className="text-lg"><span className="font-bold text-gray-700">Amount in Numbers:</span> ₹{formattedAmount}</p>
                    </div>

                     <div className="mb-6 text-sm space-y-2">
                        <div className="flex items-center">
                            <p className="font-bold text-gray-700 w-48 shrink-0 flex items-center">
                                <PaymentModeIcon mode={data.paymentMode} />
                                Payment Mode:
                            </p>
                            <p>{data.paymentMode}</p>
                        </div>
                        <div className="flex">
                            <p className="font-bold text-gray-700 w-48 shrink-0">Payment Details:</p>
                            <p>{data.paymentDetails}</p>
                        </div>
                     </div>
                     
                     <div className="mt-12 text-xs text-gray-500 text-center">
                         <p className="italic">This is a computer generated receipt and does not require a physical signature.</p>
                         <p className="mt-1">For any queries, please contact the KIIT administration office.</p>
                     </div>
                     
                     <div className="flex justify-between items-end mt-12 pt-4">
                         <div>
                            <p className="font-semibold text-sm">KIIT Stamp</p>
                            <div className="mt-1 border-2 border-dashed border-gray-400 w-32 h-16 rounded flex items-center justify-center">
                                <Icon type="stamp" className="text-gray-400 w-8 h-8"/>
                            </div>
                         </div>
                         <div className="text-center w-1/2">
                            <div className="min-h-[96px] flex items-end justify-center">
                                {data.signatureUrl && (
                                    <img src={data.signatureUrl} alt="Signature" className="h-14 object-contain transform -rotate-2 opacity-80" />
                                )}
                            </div>
                            <div className="border-b border-gray-600 w-full mx-auto mt-1"></div>
                            <p className="text-xs text-gray-600 mt-2">Authorized Signatory</p>
                            <p className="font-bold text-sm mt-1">{data.accountantName}</p>
                         </div>
                     </div>
                </div>
            </div>

            <div className="bg-gray-800 text-white py-3 px-6 text-center text-xs">
                <p>This receipt is valid only with official KIIT stamp and signature</p>
            </div>
        </div>
    );
};