import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReceiptData, StudentParentPair } from './types';
import { DEFAULT_RECEIPT_DATA, FIRST_NAMES, LAST_NAMES, PARENT_TITLES, CLASSES, SECTIONS, PAYMENT_MODES } from './constants';
import { InputSection } from './components/InputSection';
import { ReceiptPreview } from './components/ReceiptPreview';
import { generateSignatureImage, generatePrincipalName, generateIndianNames } from './services/geminiService';
import { Icon } from './components/icons';
import { LoginPage } from './components/LoginPage';
import { telegramService, TelegramUser } from './services/telegramService';
import { TelegramAdminPanel } from './components/TelegramAdminPanel';

const SETTINGS_STORAGE_KEY = 'kiitReceiptGeneratorSettings';

interface SavedSettings {
  schoolName: string;
  schoolAddress: string;
  schoolContact: string;
  logoUrl: string;
  accountantName: string;
}

// This component renders a receipt off-screen for canvas conversion during bulk download.
const BulkRenderer: React.FC<{
    data: ReceiptData;
    onRendered: (blob: Blob | null) => void;
}> = ({ data, onRendered }) => {
    const bulkReceiptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bulkReceiptRef.current) {
            // A timeout ensures all assets (like images) and styles are fully loaded and painted.
            const timer = setTimeout(async () => {
                try {
                    const canvas = await (window as any).html2canvas(bulkReceiptRef.current, {
                        logging: false,
                        useCORS: true,
                        backgroundColor: null,
                        scale: 3, // Generate high-resolution image
                    });
                    canvas.toBlob((blob: Blob | null) => {
                        onRendered(blob);
                    }, 'image/png');
                } catch (error) {
                    console.error("Error generating canvas for bulk download:", error);
                    onRendered(null);
                }
            }, 500); // 500ms delay for rendering stability.
            return () => clearTimeout(timer);
        }
    }, [data, onRendered]);

    return (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '896px' }}>
            <ReceiptPreview data={data} receiptRef={bulkReceiptRef} />
        </div>
    );
};


const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [data, setData] = useState<ReceiptData>(DEFAULT_RECEIPT_DATA);
    const [isGeneratingSignature, setIsGeneratingSignature] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);
    
    // State for bulk download process
    const [bulkNameList, setBulkNameList] = useState('');
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);
    const [bulkDownloadProgress, setBulkDownloadProgress] = useState<{ current: number; total: number; stage: string } | null>(null);
    const [dataToRenderOffscreen, setDataToRenderOffscreen] = useState<{ data: ReceiptData; onRendered: (blob: Blob | null) => void; } | null>(null);
    
    // State for AI name generation
    const [namesToGenerate, setNamesToGenerate] = useState(10);
    const [isGeneratingNames, setIsGeneratingNames] = useState(false);
    const [generatedNamePairs, setGeneratedNamePairs] = useState<Record<string, string>>({});

    // State for auto-save feature
    const [showSaveToast, setShowSaveToast] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Load settings from local storage on initial render
    useEffect(() => {
        try {
            const savedSettingsJSON = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettingsJSON) {
                const savedSettings: SavedSettings = JSON.parse(savedSettingsJSON);
                setData(prev => ({ ...prev, ...savedSettings }));
            }
        } catch (error) {
            console.error("Could not load settings from local storage", error);
        } finally {
            setIsDataLoaded(true); // Signal that loading is complete
        }
    }, []);

    // Debounced effect to save settings to local storage when they change
    useEffect(() => {
        if (!isDataLoaded) {
            return; // Don't save until initial data has been loaded
        }
        
        const debounceTimer = setTimeout(() => {
            const settingsToSave: SavedSettings = {
                schoolName: data.schoolName,
                schoolAddress: data.schoolAddress,
                schoolContact: data.schoolContact,
                logoUrl: data.logoUrl,
                accountantName: data.accountantName,
            };
            try {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave));
                setShowSaveToast(true);
            } catch (error) {
                console.error("Could not save settings to local storage", error);
            }
        }, 500); // Debounce for 500ms

        return () => clearTimeout(debounceTimer);
    }, [data.schoolName, data.schoolAddress, data.schoolContact, data.logoUrl, data.accountantName, isDataLoaded]);

    // Effect to hide the save toast after a delay
    useEffect(() => {
        if (showSaveToast) {
            const toastTimer = setTimeout(() => {
                setShowSaveToast(false);
            }, 2000);
            return () => clearTimeout(toastTimer);
        }
    }, [showSaveToast]);

    const handleReset = useCallback(() => {
        setData(DEFAULT_RECEIPT_DATA);
        try {
            localStorage.removeItem(SETTINGS_STORAGE_KEY);
        } catch (error) {
            console.error("Could not clear settings from local storage", error);
        }
    }, []);

    const generateStudentData = (): Partial<ReceiptData> => {
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const studentClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
        const studentSection = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
        const studentRoll = Math.floor(10000 + Math.random() * 90000).toString();
        const parentTitle = PARENT_TITLES[Math.floor(Math.random() * PARENT_TITLES.length)];

        return {
            studentName: `${firstName} ${lastName}`,
            studentClass,
            studentSection,
            studentRoll,
            parentName: `${parentTitle} ${lastName}`,
        };
    };

    const generatePaymentData = (): Partial<ReceiptData> => {
        const start = new Date(2024, 0, 1);
        const end = new Date(2025, 11, 31);
        const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const year = randomDate.getFullYear();
        const month = String(randomDate.getMonth() + 1).padStart(2, '0');
        const day = String(randomDate.getDate()).padStart(2, '0');

        const amount = Math.round((Math.random() * 30000 + 5000) / 100) * 100;
        const randomPayment = PAYMENT_MODES[Math.floor(Math.random() * PAYMENT_MODES.length)];
        
        return {
            paymentDate: `${year}-${month}-${day}`,
            academicYear: `${year}-${year + 1}`,
            paymentAmount: amount,
            paymentMode: randomPayment.mode,
            paymentDetails: randomPayment.details,
            receiptNumber: `REC-${year}-${Math.floor(1000 + Math.random() * 9000)}`
        };
    };

    const handleGenerateStudent = useCallback(() => {
        setData(prev => ({ ...prev, ...generateStudentData() }));
    }, []);

    const handleGeneratePayment = useCallback(() => {
        setData(prev => ({ ...prev, ...generatePaymentData() }));
    }, []);
    
    const generateFullReceiptData = async (): Promise<ReceiptData> => {
        const studentData = generateStudentData();
        const paymentData = generatePaymentData();

        let nameForSignature = data.accountantName;
        // If the user hasn't set a custom name (or cleared it), generate one.
        if (!nameForSignature || nameForSignature === DEFAULT_RECEIPT_DATA.accountantName) {
            const principalName = await generatePrincipalName();
            nameForSignature = principalName || 'Principal Accountant'; // Fallback
        }
        
        const signatureUrl = await generateSignatureImage(nameForSignature, 3);

        return {
            ...data, // Keep non-generated data like school info
            ...studentData,
            ...paymentData,
            accountantName: nameForSignature,
            signatureUrl: signatureUrl || '',
        };
    };

    const handleGenerateSignature = useCallback(async () => {
        if (!data.accountantName) {
            alert("Please enter a name for the signature.");
            return;
        }
        setIsGeneratingSignature(true);
        const signatureUrl = await generateSignatureImage(data.accountantName, 3);
        if (signatureUrl) {
            setData(prev => ({ ...prev, signatureUrl }));
        }
        setIsGeneratingSignature(false);
    }, [data.accountantName]);

    const handleGenerateAll = useCallback(async () => {
        const newData = await generateFullReceiptData();
        setData(newData);
    }, [data]);
    
    const handleDownload = useCallback(async () => {
        if (!receiptRef.current) return;
        
        const canvas = await (window as any).html2canvas(receiptRef.current, {
            logging: false,
            useCORS: true,
            backgroundColor: null,
            scale: 3, // Generate high-resolution image
        });

        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `kiit-tuition-receipt-${data.receiptNumber || 'receipt'}.png`;
        link.click();
    }, [data.receiptNumber]);

    const generateStudentDataForName = (fullName: string): Partial<ReceiptData> => {
        const trimmedFullName = fullName.trim();
        const aiParentName = generatedNamePairs[trimmedFullName];

        const nameParts = trimmedFullName.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const studentClass = CLASSES[Math.floor(Math.random() * CLASSES.length)];
        const studentSection = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
        const studentRoll = Math.floor(10000 + Math.random() * 90000).toString();
        const parentTitle = PARENT_TITLES[Math.floor(Math.random() * PARENT_TITLES.length)];
    
        return {
            studentName: trimmedFullName,
            studentClass,
            studentSection,
            studentRoll,
            parentName: aiParentName || `${parentTitle} ${lastName}`,
        };
    };

    const handleGenerateNames = useCallback(async () => {
        setIsGeneratingNames(true);
        const namePairs = await generateIndianNames(namesToGenerate);
        if (namePairs) {
            const studentNames = namePairs.map(pair => pair.studentName);
            const pairsMap = namePairs.reduce((acc, pair) => {
                acc[pair.studentName] = pair.parentName;
                return acc;
            }, {} as Record<string, string>);

            setGeneratedNamePairs(pairsMap);
            setBulkNameList(studentNames.join('\n'));
        }
        setIsGeneratingNames(false);
    }, [namesToGenerate]);

    const handleBulkDownload = async () => {
        const names = bulkNameList.trim().split('\n').filter(name => name.trim() !== '');
        const count = names.length;
        if (count <= 0 || isBulkDownloading) return;

        setIsBulkDownloading(true);
        const zip = new (window as any).JSZip();
        
        // --- Optimization: Generate one signature for the whole batch ---
        setBulkDownloadProgress({ current: 0, total: count, stage: 'Generating signature' });
        let sharedSignatureUrl = '';
        let sharedAccountantName = 'Principal Accountant'; // Fallback
        try {
            const principalName = await generatePrincipalName();
            if (principalName) {
                sharedAccountantName = principalName;
                const signatureUrl = await generateSignatureImage(principalName, 3);
                if (signatureUrl) sharedSignatureUrl = signatureUrl;
            }
        } catch (e) {
            console.error("Failed to generate shared signature, will generate per receipt (slower).", e);
        }

        const allData: ReceiptData[] = [];
        setBulkDownloadProgress({ current: 0, total: count, stage: 'Generating data' });
        for (let i = 0; i < count; i++) {
            try {
                const studentName = names[i];
                const studentData = generateStudentDataForName(studentName);
                const paymentData = generatePaymentData();
                
                const newData: ReceiptData = {
                    ...DEFAULT_RECEIPT_DATA, // Start with defaults
                    schoolName: data.schoolName, // Carry over current school data
                    schoolAddress: data.schoolAddress,
                    schoolContact: data.schoolContact,
                    logoUrl: data.logoUrl,
                    ...studentData,
                    ...paymentData,
                    accountantName: sharedAccountantName,
                    signatureUrl: sharedSignatureUrl,
                };
                allData.push(newData);
                setBulkDownloadProgress({ current: i + 1, total: count, stage: 'Generating data' });
            } catch (e) {
                console.error(`Failed to generate data for receipt ${i + 1} (${names[i]}), skipping.`, e);
            }
        }
        
        // Create a numbered list of student names
        const studentListText = allData
            .map((receipt, index) => `${index + 1}. ${receipt.studentName}`)
            .join('\n');
        
        zip.file('student_list.txt', studentListText);
        
        setBulkDownloadProgress({ current: 0, total: count, stage: 'Generating images' });
        for (let i = 0; i < allData.length; i++) {
            const receiptData = allData[i];
            const blob = await new Promise<Blob | null>(resolve => {
                setDataToRenderOffscreen({ data: receiptData, onRendered: resolve });
            });

            if (blob) {
                const fileName = `tuition_receipt_${receiptData.studentName.replace(/\s+/g, '_')}_${receiptData.receiptNumber}.png`;
                zip.file(fileName, blob);
            }
            setBulkDownloadProgress({ current: i + 1, total: allData.length, stage: 'Generating images' });
        }
        
        setDataToRenderOffscreen(null); // Clear the renderer
        setBulkDownloadProgress({ current: count, total: count, stage: 'Zipping files' });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `kiit-receipts-bulk-${new Date().getTime()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        setIsBulkDownloading(false);
        setBulkDownloadProgress(null);
    };

    const IndianFlag: React.FC = () => (
      <div className="h-5 w-[30px] bg-gradient-to-b from-[#FF9933] from-33% via-white via-33% via-66% to-[#138808] to-66% relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#000080] text-[8px] leading-none">
              &#10042;
          </div>
      </div>
    );

    const handleLoginSuccess = (user?: TelegramUser) => {
        if (user) {
            setCurrentUser(user);
            console.log(`User ${telegramService.getUserDisplayName(user)} logged in successfully`);
        }
        setIsAuthenticated(true);
    };
    
    const handleLogout = () => {
        telegramService.logout();
        setCurrentUser(null);
        setIsAuthenticated(false);
    };
    
    // Check for existing authentication on app load
    useEffect(() => {
        const checkAuth = async () => {
            await telegramService.initialize();
            
            if (telegramService.isAuthenticated()) {
                const userData = telegramService.getStoredUserData();
                if (userData) {
                    setCurrentUser(userData);
                    setIsAuthenticated(true);
                }
            }
        };
        
        checkAuth();
    }, []);
    
    const SaveToast: React.FC = () => (
        <div className={`fixed bottom-5 right-5 z-50 bg-gray-900 text-white py-2 px-5 rounded-full shadow-lg transition-all duration-300 ease-in-out transform ${showSaveToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="flex items-center">
                <Icon type="check" className="w-5 h-5 mr-2 text-green-400" />
                <span>Settings saved</span>
            </div>
        </div>
    );

    const UserInfo: React.FC = () => {
        if (!currentUser) return null;
        
        return (
            <div className="fixed top-4 right-4 z-40 bg-white rounded-lg shadow-lg p-3 border">
                <div className="flex items-center space-x-3">
                    {currentUser.photo_url && (
                        <img 
                            src={currentUser.photo_url} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {telegramService.getUserDisplayName(currentUser)}
                        </p>
                        <p className="text-xs text-gray-500">
                            Logged in via Telegram
                        </p>
                    </div>
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => setShowAdminPanel(true)}
                            className="text-gray-400 hover:text-blue-600 transition p-1"
                            title="Admin Panel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-600 transition p-1"
                            title="Logout"
                        >
                            <Icon type="close" className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {!isAuthenticated && <LoginPage onLoginSuccess={handleLoginSuccess} />}
            <TelegramAdminPanel 
                isVisible={showAdminPanel} 
                onClose={() => setShowAdminPanel(false)} 
            />
            <div className={`transition-all duration-500 ${!isAuthenticated ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SaveToast />
                    <UserInfo />
                    {dataToRenderOffscreen && <BulkRenderer data={dataToRenderOffscreen.data} onRendered={dataToRenderOffscreen.onRendered} />}

                    <header className="text-center py-8">
                        <div className="flex items-center justify-center mb-4 gap-3">
                            <IndianFlag />
                            <h1 className="text-4xl font-bold text-gray-800">
                                <span className="kiit-logo-gradient">KIIT</span> Tuition Receipt Generator
                            </h1>
                            <IndianFlag />
                        </div>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Create professional tuition fee receipts for Kalinga Institute of Industrial Technology
                        </p>
                    </header>

                    <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1">
                            <InputSection
                                data={data}
                                setData={setData}
                                onGenerateStudent={handleGenerateStudent}
                                onGeneratePayment={handleGeneratePayment}
                                onGenerateAll={handleGenerateAll}
                                onReset={handleReset}
                                onDownload={handleDownload}
                                onGenerateSignature={handleGenerateSignature}
                                isGeneratingSignature={isGeneratingSignature}
                                onBulkDownload={handleBulkDownload}
                                isBulkDownloading={isBulkDownloading}
                                bulkDownloadProgress={bulkDownloadProgress}
                                bulkNameList={bulkNameList}
                                setBulkNameList={setBulkNameList}
                                onGenerateNames={handleGenerateNames}
                                isGeneratingNames={isGeneratingNames}
                                namesToGenerate={namesToGenerate}
                                setNamesToGenerate={setNamesToGenerate}
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <div className="max-w-[896px] mx-auto">
                                <ReceiptPreview data={data} receiptRef={receiptRef} />
                            </div>
                        </div>
                    </main>

                    <footer className="mt-12 text-center py-6 text-gray-600 text-sm">
                        <p>© {new Date().getFullYear()} Kalinga Institute of Industrial Technology | Tuition Receipt Generator</p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default App;
