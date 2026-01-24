function okNotOk() {
    return `
        <select>
            <option value="OK">OK</option>
            <option value="NOT OK">NOT OK</option>
        </select>
    `;
}

function addRow() {
    const tbody = document.getElementById("patrolTable").querySelector("tbody");
    const row = tbody.insertRow(0);

    row.innerHTML = `
        <td class="sr-no"></td>
        <td>
            <select>
                <option value="">Select Location</option>
                <option value="CS01">CS01</option>
                <option value="CS02">CS02</option>
                <option value="CS03">CS03</option>
                <option value="CS04">CS04</option>
                <option value="CS05">CS05</option>
                <option value="CS06">CS06</option>
                <option value="CS07">CS07</option>
                <option value="CS08">CS08</option>
                <option value="CS09">CS09</option>
                <option value="CS10">CS10</option>
            </select>
        </td>
        <td><input type="date"></td>
        <td><input type="time"></td>
        <td><input type="time"></td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td>${okNotOk()}</td>
        <td><textarea></textarea></td>
        <td><input type="text"></td>
        <td>
            <button class="btn-edit" onclick="editRow(this)">Edit</button>
            <button class="btn-delete" onclick="deleteRow(this)">Delete</button>
        </td>
    `;

    updateSerialNumbers();
}

function updateSerialNumbers() {
    const rows = document.querySelectorAll("#patrolTable tbody tr");
    rows.forEach((row, index) => {
        row.querySelector(".sr-no").innerText = index + 1;
    });
}

function deleteRow(btn) {
    btn.closest("tr").remove();
    updateSerialNumbers();
}

function editRow(btn) {
    alert("Edit enabled – you can modify the row directly.");
}

function saveTable() {
    const rows = document.querySelectorAll("#patrolTable tbody tr");

    if (rows.length === 0) {
        alert("No data to save!");
        return;
    }

    const payload = [];

    rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");

        payload.push({
            n_sr_no: index + 1,
            s_location_code: cells[1].querySelector("select").value,
            d_patrol_date: cells[2].querySelector("input").value,
            t_from_time: cells[3].querySelector("input").value,
            t_to_time: cells[4].querySelector("input").value,
            s_boundary_wall_condition: cells[5].querySelector("select").value,
            s_patrolling_pathway_condition: cells[6].querySelector("select").value,
            s_suspicious_movement: cells[7].querySelector("select").value,
            s_wild_vegetation: cells[8].querySelector("select").value,
            s_illumination_status: cells[9].querySelector("select").value,
            s_workers_without_valid_permit: cells[10].querySelector("select").value,
            s_unknown_person_without_authorization: cells[11].querySelector("select").value,
            s_unattended_office_unlocked: cells[12].querySelector("select").value,
            s_other_observations_status: cells[13].querySelector("select").value,
            s_remarks: cells[14].querySelector("textarea").value,
            s_patrolling_guard_name: cells[15].querySelector("input").value
        });
    });

    fetch("/save_patrolling_data", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload[0])
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Data saved successfully");
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Server error while saving data");
    });
}


function downloadCSV() {
    let csv = [];
    const rows = document.querySelectorAll("table tr");

    rows.forEach(row => {
        let cols = row.querySelectorAll("th, td");
        let rowData = [];
        cols.forEach(col => {
            let input = col.querySelector("input, select, textarea");
            rowData.push(input ? input.value : col.innerText);
        });
        csv.push(rowData.join(","));
    });

    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patrolling_observation_register.csv";
    a.click();
    window.URL.revokeObjectURL(url);
}
