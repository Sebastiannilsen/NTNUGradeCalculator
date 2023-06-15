import './App.css';
import { parseData } from "./DataParser";
import { useState } from "react";

function App() {
    const [data, setData] = useState([]);

    function setInitialTotalValues(result) {
        const totalPointsElement = document.getElementById("totalPoints");
        const averageElement = document.getElementById("average");

        let totalCredits = 0;
        let totalValidCredits = 0;
        let totalNormalized = 0;
        for (let i = 0; i < result.length; i++) {
            if (characterToNumber(result[i][4]) === 0) {
                totalCredits += parseFloat(result[i][3]);
            } else {
                totalValidCredits += parseFloat(result[i][3]);
                totalNormalized += parseFloat(result[i][3]) * characterToNumber(result[i][4]);
                totalCredits += parseFloat(result[i][3]);
            }
        }
        totalPointsElement.innerText = totalCredits + "stp";
        averageElement.innerText = (totalNormalized / totalValidCredits).toFixed(2);
    }

    function calculateGrade(event) {
        event.preventDefault();
        try {
            parseData(event)
                .then((result) => {
                    setData(result);
                    setInitialTotalValues(result);
                })
                .catch((error) => {
                    alert(error);
                });
        } catch (e) {
            // do nothing
        }
    }

    function calculateNormalized(courseId) {
        const creditSelect = document.getElementById(`credits-${courseId}`);
        const gradeSelect = document.getElementById(`grade-${courseId}`);
        const normalizedCell = document.getElementById(`normalized-${courseId}`);

        const credits = parseFloat(creditSelect.value);
        const grade = gradeSelect.value;
        const normalized = characterToNumber(grade) * credits;
        normalizedCell.textContent = normalized;

        updateTotalValues();
    }

    function updateTotalValues() {
        const totalPoints = document.getElementById("totalPoints");
        const average = document.getElementById("average");
        const table = document.getElementById("table");
        const rows = table.rows;
        let totalNormalized = 0;
        let totalCredits = 0;
        let validCredits = 0;
        for (let i = 1; i < rows.length; i++) {
            let credit = 0;
            let normGrade = 0;

            const row = rows[i];
            const normalizedCell = row.cells[5];
            const creditsCell = row.getElementsByTagName("select")[0];
            normGrade = parseFloat(normalizedCell.textContent);
            credit = parseFloat(creditsCell.value);
            if (normGrade === 0 || credit === 0) {
                totalCredits += credit;
            } else {
                validCredits += credit;
                totalNormalized += normGrade;
                totalCredits += credit;
            }
        }
        //console.log(totalNormalized);
        //console.log(totalCredits);
        const averageGrade = totalNormalized / validCredits;
        totalPoints.textContent = totalCredits + "stp";
        average.textContent = averageGrade.toFixed(2);
    }


    function characterToNumber(character) {
        switch (character) {
            case "A":
                return 5.0;
            case "B":
                return 4.0;
            case "C":
                return 3.0;
            case "D":
                return 2.0;
            case "E":
                return 1.0;
            default:
                return 0;
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Velkommen til karaktersnitt kalkulator for NTNU studenter</h1>
                <p>
                    Last opp ditt vitnemål hentet fra{" "}
                    <a href="https://www.vitnemalsportalen.no" target={"_blank"}>
                        vitnemalsportalen
                    </a>{" "}
                    for å regne ut.
                </p>
                <form onSubmit={calculateGrade}>
                    <input type="file" id="myFile" name="filename" />
                    <input type="submit" value="Upload" />
                </form>
                <div className={"flex"}>
                    <p>
                        Karaktersnitt: <span id={"average"}>0</span>
                    </p>
                    <p>
                        Totalt studiepoeng <span id={"totalPoints"}>0stp</span>
                    </p>
                </div>
                <table id={"table"}>
                    <tr>
                        <th>Emnekode</th>
                        <th></th>
                        <th>Termin</th>
                        <th>Vekt</th>
                        <th>Karakter</th>
                        <th>Normalisert</th>
                    </tr>
                    {data.map((course) => (
                        <tr key={course[0]}>
                            <td>{course[0]}</td>
                            <td>{course[1]}</td>
                            <td>{course[2]}</td>
                            <td>
                                <select
                                    name="credits"
                                    id={`credits-${course[0]}`}
                                    onChange={() => calculateNormalized(course[0])}
                                >
                                    <option value="0" selected={course[3] === "0"}>
                                        0
                                    </option>
                                    <option value="7.5" selected={course[3] === "7.5"}>
                                        7.5
                                    </option>
                                    <option value="10" selected={course[3] === "10"}>
                                        10
                                    </option>
                                    <option value="15" selected={course[3] === "15"}>
                                        15
                                    </option>
                                    <option value="20" selected={course[3] === "20"}>
                                        20
                                    </option>
                                    <option value="30" selected={course[3] === "30"}>
                                        30
                                    </option>
                                </select>
                            </td>
                            <td>
                                <select
                                    name="grade"
                                    id={`grade-${course[0]}`}
                                    onChange={() => calculateNormalized(course[0])}
                                >
                                    <option value="A" selected={course[4] === "A"}>
                                        A
                                    </option>
                                    <option value="B" selected={course[4] === "B"}>
                                        B
                                    </option>
                                    <option value="C" selected={course[4] === "C"}>
                                        C
                                    </option>
                                    <option value="D" selected={course[4] === "D"}>
                                        D
                                    </option>
                                    <option value="E" selected={course[4] === "E"}>
                                        E
                                    </option>
                                    <option value="F" selected={course[4] === "F"}>
                                        F
                                    </option>
                                    <option value="Bestått" selected={course[4] === "Bestått"}>
                                        Bestått
                                    </option>
                                    <option
                                        value="Ikke bestått"
                                        selected={course[4] === "Ikke bestått"}
                                    >
                                        Ikke bestått
                                    </option>
                                </select>
                            </td>
                            <td id={`normalized-${course[0]}`}>
                                {characterToNumber(course[4]) * parseFloat(course[3])}
                            </td>
                        </tr>
                    ))}
                </table>
            </header>
        </div>
    );
}

export default App;
