export function convertToWords(num: number): string {
    if (num === 0) return 'Zero Rupees Only';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertChunk = (n: number) => {
        if (n === 0) return '';
        let words = '';
        if (n >= 100) {
            words += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            words += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            words += teens[n - 10] + ' ';
            n = 0; // Handled by teens
        }
        if (n > 0) {
            words += ones[n] + ' ';
        }
        return words;
    };
    
    let words = '';
    const crore = Math.floor(num / 10000000);
    if (crore > 0) {
        words += convertChunk(crore) + 'Crore ';
    }
    num %= 10000000;

    const lakh = Math.floor(num / 100000);
    if (lakh > 0) {
        words += convertChunk(lakh) + 'Lakh ';
    }
    num %= 100000;

    const thousand = Math.floor(num / 1000);
    if (thousand > 0) {
        words += convertChunk(thousand) + 'Thousand ';
    }
    num %= 1000;

    if (num > 0) {
        words += convertChunk(num);
    }

    return words.trim().replace(/\s+/g, ' ') + ' Rupees Only';
}

export const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
