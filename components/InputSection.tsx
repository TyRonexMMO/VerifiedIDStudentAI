import React, { useState, ChangeEvent } from 'react';
import { ReceiptData, Tab } from '../types';
import { Icon } from './icons';

interface InputSectionProps {
    data: ReceiptData;
    setData: React.Dispatch<React.SetStateAction<ReceiptData>>;
    onGenerateStudent: () => void;
    onGeneratePayment: () => void;
    onGenerateAll: () => Promise<void>;
    onReset: () => void;
    onDownload: () => void;
    onGenerateSignature: () => void;
    isGeneratingSignature: boolean;
    onBulkDownload: () => void;
    isBulkDownloading: boolean;
    bulkDownloadProgress: { current: number; total: number; stage: string } | null;
    bulkNameList: string;
    setBulkNameList: React.Dispatch<React.SetStateAction<string>>;
    onGenerateNames: () => Promise<void>;
    isGeneratingNames: boolean;
    namesToGenerate: number;
    setNamesToGenerate: React.Dispatch<React.SetStateAction<number>>;
}

const TabButton: React.FC<{ activeTab: Tab; tab: Tab; label: string; onClick: (tab: Tab) => void }> = ({ activeTab, tab, label, onClick }) => (
    <button
        className={`py-2 px-4 rounded-t-lg transition-all duration-300 ease-in-out ${activeTab === tab ? 'bg-[#0047AB] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => onClick(tab)}
    >
        {label}
    </button>
);

const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
    <div className="relative flex items-center group">
        {children}
        <div className="absolute bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {text}
        </div>
    </div>
);

export const InputSection: React.FC<InputSectionProps> = ({ data, setData, onGenerateStudent, onGeneratePayment, onGenerateAll, onReset, onDownload, onGenerateSignature, isGeneratingSignature, onBulkDownload, isBulkDownloading, bulkDownloadProgress, bulkNameList, setBulkNameList, onGenerateNames, isGeneratingNames, namesToGenerate, setNamesToGenerate }) => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.School);
    const [fileName, setFileName] = useState('No file chosen');
    const [generateAllState, setGenerateAllState] = useState<'idle' | 'generating' | 'success'>('idle');
    const [isDownloading, setIsDownloading] = useState(false);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setData(prev => ({ ...prev, [id]: id === 'paymentAmount' ? parseFloat(value) || 0 : value }));
    };

    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (event) => {
                setData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateAllClick = async () => {
        setGenerateAllState('generating');
        await onGenerateAll();
        setGenerateAllState('success');
        setTimeout(() => setGenerateAllState('idle'), 2000);
    };

    const handleDownloadClick = async () => {
        setIsDownloading(true);
        await onDownload();
        setIsDownloading(false);
    };
    
    const nameCount = bulkNameList.trim() ? bulkNameList.trim().split('\n').filter(name => name.trim() !== '').length : 0;

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0f766e] mb-6 text-center rounded-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-3">One-Click Generation</h2>
                <button
                    onClick={handleGenerateAllClick}
                    disabled={generateAllState === 'generating'}
                    className="bg-gradient-to-r from-[#0047AB] to-[#FFD700] w-full text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center text-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {generateAllState === 'idle' && (
                        <> <Icon type="bolt" className="w-6 h-6 mr-3" /> Auto-Generate All Details</>
                    )}
                    {generateAllState === 'generating' && (
                        <> <span className="animate-spin mr-2"><Icon type="sync" className="w-5 h-5"/></span> Generating All Details...</>
                    )}
                    {generateAllState === 'success' && (
                        <> <Icon type="check" className="w-6 h-6 mr-3" /> All Details Generated!</>
                    )}
                </button>
                <p className="text-blue-100 mt-3 text-sm">Generates student, payment & signature info with one click</p>
            </div>
            
            <div className="flex border-b mb-4">
                <TabButton activeTab={activeTab} tab={Tab.School} label="School" onClick={setActiveTab} />
                <TabButton activeTab={activeTab} tab={Tab.Student} label="Student" onClick={setActiveTab} />
                <TabButton activeTab={activeTab} tab={Tab.Payment} label="Payment" onClick={setActiveTab} />
                <TabButton activeTab={activeTab} tab={Tab.Signature} label="Signature" onClick={setActiveTab} />
            </div>

            {activeTab === Tab.School && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Upload School Logo</label>
                        <div className="flex items-center space-x-4">
                             <label htmlFor="logoUrl" className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition flex items-center">
                                <Icon type="upload" className="w-5 h-5 mr-2" />Choose File
                            </label>
                            <input type="file" id="logoUrl" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            <span className="text-sm text-gray-500 truncate">{fileName}</span>
                        </div>
                        {data.logoUrl && <img src={data.logoUrl} className="mt-3 max-h-24 max-w-52 object-contain mx-auto" alt="Logo preview" />}
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">School Name</label>
                        <input type="text" id="schoolName" value={data.schoolName} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-gray-700 mb-2 font-medium">School Address</label>
                        <textarea id="schoolAddress" value={data.schoolAddress} onChange={handleInputChange} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Contact Information</label>
                        <input type="text" id="schoolContact" value={data.schoolContact} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            )}
            
             {activeTab === Tab.Student && (
                <div className="space-y-4">
                    <div className="bg-[#f0f9ff] border border-blue-200 rounded-lg p-4">
                         <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                            <Icon type="user-graduate" className="text-blue-600 mr-2 w-6 h-6" /> Student Information
                        </h3>
                        <button onClick={onGenerateStudent} className="w-full bg-gradient-to-r from-[#0047AB] to-[#0f766e] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-transform hover:scale-105">
                            <Icon type="wand" className="w-5 h-5 mr-2" /> Generate Student Details
                        </button>
                    </div>
                    <div className="bg-gradient-to-r from-[#f0fdfa] to-[#ccfbf1] p-4 rounded-lg border-l-4 border-[#0f766e]">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Student Details</h3>
                             <Tooltip text="All fields can be edited after generation">
                                <Icon type="info" className="text-gray-500 cursor-pointer" />
                            </Tooltip>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Student Name</label>
                        <input type="text" id="studentName" value={data.studentName} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 mb-1 font-medium">Class</label>
                            <input type="text" id="studentClass" value={data.studentClass} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-gray-700 mb-1 font-medium">Section</label>
                            <input type="text" id="studentSection" value={data.studentSection} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-gray-700 mb-1 font-medium">Roll Number</label>
                        <input type="text" id="studentRoll" value={data.studentRoll} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label className="block text-gray-700 mb-1 font-medium">Parent/Guardian Name</label>
                        <input type="text" id="parentName" value={data.parentName} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            )}

            {activeTab === Tab.Payment && (
                 <div className="space-y-4">
                    <div className="bg-[#f0f9ff] border border-blue-200 rounded-lg p-4">
                         <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                            <Icon type="rupee" className="text-green-600 mr-2 w-6 h-6" /> Payment Information
                        </h3>
                        <button onClick={onGeneratePayment} className="w-full bg-gradient-to-r from-[#0047AB] to-[#0f766e] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-transform hover:scale-105">
                            <Icon type="bolt" className="w-5 h-5 mr-2" /> Generate Payment Details
                        </button>
                    </div>
                    <div className="bg-gradient-to-r from-[#eff6ff] to-[#dbeafe] p-4 rounded-lg border-l-4 border-[#0047AB]">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Payment Details</h3>
                             <Tooltip text="Dates are restricted to the 2024-2025 period">
                                <Icon type="info" className="text-gray-500 cursor-pointer" />
                            </Tooltip>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Receipt Number</label>
                        <input type="text" id="receiptNumber" value={data.receiptNumber} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Date of Payment</label>
                        <input type="date" id="paymentDate" value={data.paymentDate} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Academic Year</label>
                        <input type="text" id="academicYear" value={data.academicYear} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Amount (₹)</label>
                        <input type="number" id="paymentAmount" value={data.paymentAmount} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Payment Mode</label>
                        <select id="paymentMode" value={data.paymentMode} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                             <option>Cash</option>
                             <option>Cheque</option>
                             <option>Online Transfer</option>
                             <option>DD (Demand Draft)</option>
                             <option>UPI</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-medium">Payment Details</label>
                        <input type="text" id="paymentDetails" value={data.paymentDetails} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            )}
            
            {activeTab === Tab.Signature && (
                <div className="space-y-4">
                    <div className="bg-[#f0f9ff] border border-blue-200 rounded-lg p-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                            <Icon type="wand" className="text-purple-600 mr-2 w-6 h-6" /> AI Signature Generation
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">Enter a full name to be rendered as a signature using AI.</p>
                        
                        <div>
                            <label className="block text-gray-700 mb-1 font-medium">Signatory Name</label>
                            <input 
                                type="text" 
                                id="accountantName" 
                                value={data.accountantName} 
                                onChange={handleInputChange} 
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                                placeholder="e.g., Dr. Priya Sharma"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter a name here, or let 'Auto-Generate All' create one for you.</p>
                        </div>
                        
                        <button 
                            onClick={onGenerateSignature} 
                            disabled={isGeneratingSignature}
                            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {isGeneratingSignature ? (
                                <>
                                    <span className="animate-spin mr-2"><Icon type="sync" className="w-5 h-5"/></span>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Icon type="wand" className="w-5 h-5 mr-2" />
                                    Generate AI Signature
                                </>
                            )}
                        </button>
                    </div>
                    {data.signatureUrl && (
                        <div className="mt-4 text-center">
                            <p className="font-medium text-gray-700">Generated Signature Preview:</p>
                            <div className="p-4 bg-gray-100 rounded-lg mt-2 inline-block">
                                <img src={data.signatureUrl} alt="Generated Signature" className="h-24 object-contain"/>
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="mt-6 border-t pt-6 space-y-4">
                 <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Bulk Generation</h3>
                    <p className="text-sm text-gray-600 mb-3">Generate a list of names with AI, or paste your own list below (one name per line).</p>
                    
                    <div className="flex items-center gap-3 mb-3">
                        <input 
                            type="number"
                            value={namesToGenerate}
                            onChange={(e) => setNamesToGenerate(Number(e.target.value))}
                            className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            min="1"
                            max="100"
                            disabled={isGeneratingNames || isBulkDownloading}
                            aria-label="Number of names to generate"
                        />
                        <button
                            onClick={onGenerateNames}
                            disabled={isGeneratingNames || isBulkDownloading}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center disabled:bg-indigo-400 disabled:cursor-wait"
                        >
                            {isGeneratingNames ? (
                                <><span className="animate-spin mr-2"><Icon type="sync" className="w-5 h-5"/></span> Generating Names...</>
                            ) : (
                                <><Icon type="wand" className="w-5 h-5 mr-2" /> Generate Names</>
                            )}
                        </button>
                    </div>

                    <textarea
                        value={bulkNameList}
                        onChange={(e) => setBulkNameList(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32 resize-y"
                        placeholder={'Aarav Sharma\nSaanvi Patel\nAditya Kumar\n... or generate names above!'}
                        disabled={isBulkDownloading}
                        aria-label="List of student names for bulk generation"
                    />
                    <button 
                        onClick={onBulkDownload} 
                        disabled={isBulkDownloading || isDownloading || nameCount === 0}
                        className="w-full mt-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center disabled:bg-teal-400 disabled:cursor-not-allowed"
                    >
                         {isBulkDownloading ? (
                            <><span className="animate-spin mr-2"><Icon type="sync" className="w-5 h-5"/></span> Generating...</>
                         ) : (
                            <><Icon type="download" className="w-5 h-5 mr-2" /> Download {nameCount > 0 ? `${nameCount} ` : ''}Receipts (ZIP)</>
                         )}
                    </button>
                     {isBulkDownloading && bulkDownloadProgress && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">{bulkDownloadProgress.stage}: {bulkDownloadProgress.current} / {bulkDownloadProgress.total}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${(bulkDownloadProgress.current / bulkDownloadProgress.total) * 100}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
                 <div className="flex flex-col space-y-3">
                    <button onClick={handleDownloadClick} disabled={isDownloading || isBulkDownloading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center action-btn hover:-translate-y-0.5 hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isDownloading ? (
                            <> <span className="animate-spin mr-2"><Icon type="sync" className="w-5 h-5"/></span> Generating PNG...</>
                        ) : (
                            <> <Icon type="download" className="w-5 h-5 mr-2" /> Download as PNG</>
                        )}
                    </button>
                    <button onClick={onReset} className="border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-3 px-6 rounded-lg transition flex items-center justify-center action-btn hover:-translate-y-0.5 hover:shadow-md">
                        <Icon type="sync" className="w-5 h-5 mr-2" /> Reset to Default
                    </button>
                </div>
            </div>
        </div>
    );
};