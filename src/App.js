import './App.css';
import {parseData} from "./DataParser";


function App() {

    function calculateGrade(event) {
        try {
            parseData(event)
                .then((result) => {
                    // Use the finalResult here
                    setData(result);
                })
                .catch((error) => {
                    // Handle the error
                    alert(error)
                });
        } catch (e) {
            // do nothing
        }
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Velkommen til karaktersnitt kalkulator for NTNU studenter</h1>
                <p>Last opp ditt vitnemål hentet fra <a href="https://www.vitnemalsportalen.no" target={"_blank"}>vitnemalsportalen</a> for å regne ut.</p>
                <form onSubmit={calculateGrade}>
                    <input type="file" id="myFile" name="filename" />
                    <input type="submit" value="Upload" />
                </form>
                <div className={"flex"}>
                    <p>Karaktersnitt: <span id={"average"}>0</span></p>
                    <p>Totalt studiepoeng <span id={"totalPoints"}>0stp</span></p>
                </div>
                <table id={"table"}></table>
            </header>
        </div>
    );
}

function setData(data) {
    // convert finalResult to a table and add it to the DOM
    const table = document.getElementById("table");
    table.innerHTML = `
            <tr>
                <th>Emnekode</th>
                <th></th>
                <th>Termin</th>
                <th>Vekt</th>
                <th>Karakter</th>
                <th>Normalisert</th>
            </tr>
        `;
    data.forEach(course => {
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
    data.forEach(course => {
            if (course[4] !== "Bestått") {
                sum += characterToNumber(course[4]) * parseFloat(course[3]);
                points += parseFloat(course[3]);
            }
        }
    );
    averageSpan.innerText = (sum / points).toFixed(2);

    let totalPointsSpan = document.getElementById("totalPoints");
    totalPointsSpan.innerText = points.toFixed(2) + "stp";
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
