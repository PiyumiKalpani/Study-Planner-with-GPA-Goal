let subjects = [];

function addSubject() {
    const table = document.getElementById("subjectsTable");
    let row = table.insertRow();
    row.innerHTML = `
        <td><input type="text" placeholder="Subject"></td>
        <td><input type="number" placeholder="Credit"></td>
        <td><input type="number" min="1" max="5" placeholder="1-5"></td>
    `;
}

function calculate() {
    const table = document.getElementById("subjectsTable");
    const rows = table.rows;

    let labels = [];
    let priorities = [];
    subjects = [];

    let resultText = "";

    for (let i = 1; i < rows.length; i++) {
        const subject = rows[i].cells[0].children[0].value;
        const credit = parseFloat(rows[i].cells[1].children[0].value);
        const confidence = parseInt(rows[i].cells[2].children[0].value);

        if (!subject || isNaN(credit) || isNaN(confidence)) continue;

        const priority = credit * (6 - confidence);
        subjects.push({ subject, priority });

        labels.push(subject);
        priorities.push(priority);

        let level = "";
        if (priority > 15) level = "🔴 High Priority";
        else if (priority > 8) level = "🟡 Medium Priority";
        else level = "🟢 Low Priority";

        resultText += `${subject}: ${level} <br>`;
    }

    document.getElementById("result").innerHTML = `<b>Focus Plan:</b><br>${resultText}`;

    drawChart(labels, priorities);
    generateTimetable(subjects);

    localStorage.setItem("studySubjects", JSON.stringify(subjects));
}

function drawChart(labels, data) {
    const ctx = document.getElementById('chart').getContext('2d');

    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Subject Priority Level',
                data: data,
                backgroundColor: data.map(p => p > 15 ? '#ff4d4d' : p > 8 ? '#ffcc00' : '#4dff88')
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } }
        }
    });
}


function generateTimetable(subjects) {
    const timetable = document.getElementById("timetable");
    timetable.innerHTML = "";

    const days = ["Time", "Mon", "Tue", "Wed", "Thu", "Fri"];

    
    days.forEach(day => {
        const div = document.createElement("div");
        div.innerText = day;
        div.classList.add("timetable-header");
        timetable.appendChild(div);
    });

    
    const hours = [];
    for (let h = 8; h <= 18; h++) hours.push(h); 

    hours.forEach(hour => {
       
        const timeDiv = document.createElement("div");
        timeDiv.innerText = `${hour}:00`;
        timeDiv.classList.add("timetable-time");
        timetable.appendChild(timeDiv);

     
        for (let day = 0; day < 5; day++) {
            const cell = document.createElement("div");
            cell.classList.add("timetable-cell");

            if (subjects.length > 0) {
              
                const totalPriority = subjects.reduce((sum, s) => sum + s.priority, 0);
                let rand = Math.random() * totalPriority;
                let sum = 0;

                for (let s of subjects) {
                    sum += s.priority;
                    if (rand <= sum) {
                        cell.innerText = s.subject;

                       
                        if (s.priority > 15) cell.classList.add("high-priority");
                        else if (s.priority > 8) cell.classList.add("medium-priority");
                        else cell.classList.add("low-priority");
                        break;
                    }
                }
            }

            timetable.appendChild(cell);
        }
    });
}

window.onload = () => {
    const saved = localStorage.getItem("studySubjects");
    if (saved) {
        subjects = JSON.parse(saved);
        generateTimetable(subjects);
    }
};