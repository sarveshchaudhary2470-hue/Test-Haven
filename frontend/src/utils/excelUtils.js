import * as XLSX from 'xlsx';

// Define the required columns and correct answer mapping
const REQUIRED_COLUMNS = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Marks'];
const ANSWER_MAPPING = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3
};

/**
 * Generates and downloads a sample Excel template for bulk question upload
 */
export const downloadTemplate = () => {
    // Sample data to guide the user
    const sampleData = [
        {
            'Question': 'What is the capital of India?',
            'Option A': 'Mumbai',
            'Option B': 'New Delhi',
            'Option C': 'Kolkata',
            'Option D': 'Chennai',
            'Correct Answer': 'B',
            'Marks': 4
        },
        {
            'Question': 'Which planet is known as the Red Planet?',
            'Option A': 'Venus',
            'Option B': 'Jupiter',
            'Option C': 'Mars',
            'Option D': 'Saturn',
            'Correct Answer': 'C',
            'Marks': 4
        }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions Template");

    // Set column widths for better readability
    const wscols = [
        { wch: 50 }, // Question
        { wch: 20 }, // Opt A
        { wch: 20 }, // Opt B
        { wch: 20 }, // Opt C
        { wch: 20 }, // Opt D
        { wch: 15 }, // Answer
        { wch: 10 }  // Marks
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, "EduXpress_Question_Template.xlsx");
};

/**
 * Parses an uploaded Excel file and extracts questions
 * @param {File} file - The uploaded file object
 * @returns {Promise<Array>} - Resolves with array of parsed questions
 */
export const parseQuestionsFromExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    reject(new Error("File is empty or contains no data rows"));
                    return;
                }

                // Validate headers (check first row keys)
                const headers = Object.keys(jsonData[0]);
                const missingColumns = REQUIRED_COLUMNS.filter(col => col !== 'Marks' && !headers.includes(col)); // Marks is optional

                if (missingColumns.length > 0) {
                    reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
                    return;
                }

                // Map data to application format
                const parsedQuestions = jsonData.map((row, index) => {
                    // Validate basic fields
                    if (!row['Question'] || !row['Option A'] || !row['Option B']) {
                        throw new Error(`Row ${index + 2}: Missing Question or Options`);
                    }

                    const correctAnsRaw = row['Correct Answer']?.toString().toUpperCase().trim();
                    const correctAnsIndex = ANSWER_MAPPING[correctAnsRaw];

                    if (correctAnsIndex === undefined) {
                        throw new Error(`Row ${index + 2}: Invalid Correct Answer '${row['Correct Answer']}'. Use A, B, C, or D`);
                    }

                    return {
                        question: row['Question'],
                        options: [
                            row['Option A'],
                            row['Option B'],
                            row['Option C'] || '', // Handle missing C/D if wanted, but generally we need 4
                            row['Option D'] || ''
                        ],
                        correctAnswer: correctAnsIndex,
                        marks: parseInt(row['Marks']) || 4 // Default marks if missing
                    };
                });

                resolve(parsedQuestions);

            } catch (error) {
                console.error("Excel Parsing Error:", error);
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
