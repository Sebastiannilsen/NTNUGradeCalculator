import { getDocument } from 'pdfjs-dist/webpack';

export async function parseData(event) {
    event.preventDefault();

    const fileInput = document.getElementById('myFile');
    if (fileInput.files.length === 0) {
        alert('Vennligst velg en fil');
        return;
    }

    const file = fileInput.files[0];
    const data = await readFile(file);
    const text = await extractText(data);
    const finalResult = processText(text);

    // remove last element in the array
    finalResult.pop();

    return finalResult;
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(new Uint8Array(e.target.result));
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

function extractText(data) {
    return new Promise(async (resolve, reject) => {
        try {
            const pdf = await getDocument(data).promise;
            const page = await pdf.getPage(1);
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item) => item.str).join(' ');
            resolve(text);
        } catch (error) {
            reject('Vennligst velg et vitnemål fra vitnemalsportalen');
        }
    });
}

function processText(text) {
    const grades = extractGrades(text);
    const processedGrades = replaceBestatt(grades);
    const combinedResult = combineGrades(processedGrades);
    const finalResult = formatCourses(combinedResult);
    return finalResult;
}

function extractGrades(text) {
    const marker = ' A B C D E ';
    const startIndex = text.indexOf(marker) + marker.length;
    const grades = text.substr(startIndex);
    return grades;
}

function replaceBestatt(grades) {
    return grades.replace(/Bestått/g, 'X');
}

function combineGrades(grades) {
    const result = grades.split(/ ([A-Z]) /).filter(Boolean);
    const combinedResult = [];
    for (let i = 0; i < result.length; i += 2) {
        const currentGrade = result[i] + result[i + 1];
        combinedResult.push(currentGrade);
    }
    return combinedResult;
}

function formatCourses(combinedResult) {
    const finalResult = [];
    combinedResult.forEach((course) => {
        const courseInfo = course.split(/  +/);
        if (!courseInfo[2].match(/\d+/)) {
            courseInfo[1] += ' - ' + courseInfo[2];
            courseInfo.splice(2, 1);
        }
        if (courseInfo[3].includes(' stp')) {
            courseInfo[3] = courseInfo[3].replace(' stp', '');
        }
        courseInfo[0] = courseInfo[0].trim();
        courseInfo[3] = courseInfo[3].replace(',', '.');
        if (isNaN(courseInfo[3])) {
            courseInfo[3] = '0';
        }
        if (courseInfo[4] === 'X') {
            courseInfo[4] = 'Bestått';
        }
        finalResult.push(courseInfo);
    });
    return finalResult;
}
