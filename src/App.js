import './App.css';
import { getDocument } from 'pdfjs-dist/webpack';


function App() {
    async function addFile(event) {
        event.preventDefault();

        const file = document.getElementById('myFile').files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            const data = new Uint8Array(e.target.result);
            const pdf = await getDocument(data).promise;
            const page = await pdf.getPage(1);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');

            const textArea = document.createElement('textarea');
            textArea.value = text;
            //console.log(text);

            // keep everything after " A B C D E "
            let grades = text.split(" A B C D E ")[1];

            // replace "Bestått" with "X"
            grades = grades.replace(/Bestått/g, "X");

            // Split on capital single letter words and "Bestått" but don't remove them
            const result = grades.split(/ ([A-Z]) /).filter(Boolean);

            const combinedResult = [];
            for (let i = 0; i < result.length; i += 2) {
                // remove "underfined" if some words contain "underfined"
                if (result[i + 1] === undefined) {
                    result[i + 1] = "";
                }

                combinedResult.push(result[i] + result[i + 1]);
            }

            //remove last element
            combinedResult.pop()

            let finalResult = [];

            // print courses
            combinedResult.forEach(course => {
                // split on more than one space
                const courseInfo = course.split(/  +/);

                // if courseInfo[2] doesn't contain a number, then join it to the previous element
                if (!courseInfo[2].match(/\d+/)) {
                    courseInfo[1] += " - " + courseInfo[2];
                    courseInfo.splice(2, 1);
                }

                // if third element contains " stp" then remove it
                if (courseInfo[3].includes(" stp")) {
                    courseInfo[3] = courseInfo[3].replace(" stp", "");
                }

                courseInfo[0] = courseInfo[0].trim();

                courseInfo[3] = courseInfo[3].replace(",", ".");

                // if last element contains "X" then remove it from combinedResult
                if (courseInfo[courseInfo.length - 1] !== ("X")) {
                    finalResult.push(courseInfo);
                }
            });

            // convert finalResult to a table and add it to the DOM
            const table = document.getElementById("table");
            table.innerHTML = `
                <tr>
                    <th>Course code</th>
                    <th>Course name</th>
                    <th>Term</th>
                    <th>Points</th>
                    <th>Grade</th>
                    <th>Normalized</th>
                </tr>
            `;
            finalResult.forEach(course => {
                table.innerHTML += `
                    <tr>
                        <td>${course[0]}</td>
                        <td>${course[1]}</td>
                        <td>${course[2]}</td>
                        <td>${parseFloat(course[3])}</td>
                        <td>${course[4]}</td>
                        <td>${characterToNumber(course[4]) * parseFloat(course[3])}</td>
                    </tr>
                `;
            }
            );
            //console.log(finalResult);
            //document.body.appendChild(table);

            let averageSpan = document.getElementById("average");
            let sum = 0;
            let points = 0;
            finalResult.forEach(course => {
                sum += characterToNumber(course[4]) * parseFloat(course[3]);
                points += parseFloat(course[3]);
            }
            );
            averageSpan.innerText = (sum / points).toFixed(2);
        };

        reader.readAsArrayBuffer(file);
    }


    return (
        <div className="App">
            <header className="App-header">
                <h1>Welcome to the NTNU grade point average calculator</h1>
                <p>Please upload your transcript of records from <a href="https://www.vitnemalsportalen.no" target={"_blank"}>here,</a> to get started.</p>
                <form onSubmit={addFile}>
                    <input type="file" id="myFile" name="filename" />
                    <input type="submit" value="Upload" />
                </form>
                <table id={"table"}></table>
                <p>Grade point average: <span id={"average"}>0</span></p>
            </header>
        </div>
    );
}

function characterToNumber(character) {
    if (character === "A") {
        return 5.0;
    }
    else if (character === "B") {
        return 4.0;
    }
    else if (character === "C") {
        return 3.0;
    }
    else if (character === "D") {
        return 2.0;
    }
    else if (character === "E") {
        return 1.0;
    }
    else {
        return 0;
    }
}

export default App;
