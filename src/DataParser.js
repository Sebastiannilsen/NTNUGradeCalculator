import { getDocument } from 'pdfjs-dist/webpack';

export function parseData(event) {
    // if no file is selected, send an alert
    if (document.getElementById('myFile').files.length === 0) {
        alert('Vennligst velg et fil');
        return;
    }
    event.preventDefault();

    return new Promise((resolve, reject) => {
        const file = document.getElementById('myFile').files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            const data = new Uint8Array(e.target.result);
            const pdf = await getDocument(data).promise;
            const page = await pdf.getPage(1);
            const textContent = await page.getTextContent();
            const text = textContent.items.map((item) => item.str).join(' ');

            const textArea = document.createElement('textarea');
            textArea.value = text;
            //console.log(text);

            // keep everything after " A B C D E "
            let finalResult = [];

            try {
                let grades = text.split(' A B C D E ')[1];

                // replace "Bestått" with "X"
                grades = grades.replace(/Bestått/g, 'X');

                // Split on capital single letter words and "Bestått" but don't remove them
                const result = grades.split(/ ([A-Z]) /).filter(Boolean);

                const combinedResult = [];
                for (let i = 0; i < result.length; i += 2) {
                    // remove "underfined" if some words contain "underfined"
                    if (result[i + 1] === undefined) {
                        result[i + 1] = '';
                    }

                    combinedResult.push(result[i] + result[i + 1]);
                }

                //remove last element
                combinedResult.pop();

                // print courses
                combinedResult.forEach((course) => {
                    // split on more than one space
                    const courseInfo = course.split(/  +/);

                    // if courseInfo[2] doesn't contain a number, then join it to the previous element
                    if (!courseInfo[2].match(/\d+/)) {
                        courseInfo[1] += ' - ' + courseInfo[2];
                        courseInfo.splice(2, 1);
                    }

                    // if third element contains " stp" then remove it
                    if (courseInfo[3].includes(' stp')) {
                        courseInfo[3] = courseInfo[3].replace(' stp', '');
                    }

                    courseInfo[0] = courseInfo[0].trim();

                    courseInfo[3] = courseInfo[3].replace(',', '.');

                    // if last element contains "X" then remove it from combinedResult
                    //if (courseInfo[courseInfo.length - 1] !== ("X")) {

                    if (isNaN(courseInfo[3])) {
                        courseInfo[3] = '0';
                    }

                    if (courseInfo[4] === 'X') {
                        courseInfo[4] = 'Bestått';
                    }

                    finalResult.push(courseInfo);
                    //}
                });

                resolve(finalResult);
            } catch (error) {
                reject('Vennligst velg et vitnemål fra vitnemalsportalen');
            }
        };
        reader.readAsArrayBuffer(file);
    });
}
