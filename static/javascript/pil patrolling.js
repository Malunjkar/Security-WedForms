function okNotOk() {
  return `
    <select>
      <option value="OK">OK</option>
      <option value="NOT OK">NOT OK</option>
    </select>
  `;
}

/* ================= ADD ROW ================= */
function addRow() {
  const tbody = document.querySelector("#patrolTable tbody");
  const row = tbody.insertRow(0);

  row.dataset.new = "true"; // ✅ MARK AS NEW

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

/* ================= SERIAL ================= */
function updateSerialNumbers() {
  document.querySelectorAll("#patrolTable tbody tr").forEach((row, i) => {
    row.querySelector(".sr-no").innerText = i + 1;
  });
}

/* ================= DELETE ================= */
function deleteRow(btn) {
  const row = btn.closest("tr");

  // If row is newly added (not saved yet)
  if (row.dataset.new === "true") {
    row.remove();
    updateSerialNumbers();
    return;
  }

  // Existing record → delete from DB
  const srNo = row.dataset.id;

  if (!confirm("Are you sure you want to delete this record?")) return;

  $.ajax({
    url: "/delete_patrolling_data",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({ n_sr_no: srNo }),
    success: function (result) {
      if (result.success) {
        alert("Record deleted successfully");
        row.remove();
        updateSerialNumbers();
      } else {
        alert("Delete failed: " + result.message);
      }
    },
    error: function () {
      alert("Server error while deleting");
    },
  });
}

/* ================= EDIT ================= */
function editRow(btn) {
  const row = btn.closest("tr");
  const cells = row.querySelectorAll("td");

  row.dataset.edited = "true"; // ✅ MARK AS EDITED

  // Location
  const loc = cells[1].innerText;
  cells[1].innerHTML = `
    <select>
      ${[
        "CS01",
        "CS02",
        "CS03",
        "CS04",
        "CS05",
        "CS06",
        "CS07",
        "CS08",
        "CS09",
        "CS10",
      ]
        .map((v) => `<option value="${v}">${v}</option>`)
        .join("")}
    </select>`;
  cells[1].querySelector("select").value = loc;

  // Date / Time
  cells[2].innerHTML = `<input type="date" value="${cells[2].innerText}">`;
  cells[3].innerHTML = `<input type="time" value="${cells[3].innerText}">`;
  cells[4].innerHTML = `<input type="time" value="${cells[4].innerText}">`;

  // OK / NOT OK
  for (let i = 5; i <= 13; i++) {
    const val = cells[i].innerText;
    cells[i].innerHTML = okNotOk();
    cells[i].querySelector("select").value = val;
  }

  cells[14].innerHTML = `<textarea>${cells[14].innerText}</textarea>`;
  cells[15].innerHTML = `<input type="text" value="${cells[15].innerText}">`;

  btn.innerText = "Editing";
  btn.disabled = true;
}

/* ================= SAVE ================= */
function saveTable() {
  const rows = document.querySelectorAll("#patrolTable tbody tr");
  let hasAction = false;

  rows.forEach((row) => {
    const c = row.querySelectorAll("td");

    /* ---------- INSERT ---------- */
    if (row.dataset.new === "true") {
      hasAction = true;

      $.ajax({
        url: "/save_patrolling_data",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          s_location_code: c[1].querySelector("select").value,
          d_patrol_date: c[2].querySelector("input").value,
          t_from_time: c[3].querySelector("input").value,
          t_to_time: c[4].querySelector("input").value,
          s_boundary_wall_condition: c[5].querySelector("select").value,
          s_patrolling_pathway_condition: c[6].querySelector("select").value,
          s_suspicious_movement: c[7].querySelector("select").value,
          s_wild_vegetation: c[8].querySelector("select").value,
          s_illumination_status: c[9].querySelector("select").value,
          s_workers_without_valid_permit: c[10].querySelector("select").value,
          s_unknown_person_without_authorization:
            c[11].querySelector("select").value,
          s_unattended_office_unlocked: c[12].querySelector("select").value,
          s_other_observations_status: c[13].querySelector("select").value,
          s_remarks: c[14].querySelector("textarea").value,
          s_patrolling_guard_name: c[15].querySelector("input").value,
        }),
        error: function () {
          alert("Error while saving data");
        },
      });
    }

    /* ---------- UPDATE ---------- */
    if (row.dataset.edited === "true" && !row.dataset.new) {
      hasAction = true;

      $.ajax({
        url: "/update_patrolling_data",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          n_sr_no: row.dataset.id,
          s_location_code: c[1].querySelector("select").value,
          d_patrol_date: c[2].querySelector("input").value,
          t_from_time: c[3].querySelector("input").value,
          t_to_time: c[4].querySelector("input").value,
          s_boundary_wall_condition: c[5].querySelector("select").value,
          s_patrolling_pathway_condition: c[6].querySelector("select").value,
          s_suspicious_movement: c[7].querySelector("select").value,
          s_wild_vegetation: c[8].querySelector("select").value,
          s_illumination_status: c[9].querySelector("select").value,
          s_workers_without_valid_permit: c[10].querySelector("select").value,
          s_unknown_person_without_authorization:
            c[11].querySelector("select").value,
          s_unattended_office_unlocked: c[12].querySelector("select").value,
          s_other_observations_status: c[13].querySelector("select").value,
          s_remarks: c[14].querySelector("textarea").value,
          s_patrolling_guard_name: c[15].querySelector("input").value,
        }),
        error: function () {
          alert("Error while updating data");
        },
      });
    }
  });

  if (!hasAction) {
    alert("Nothing to save or update");
    return;
  }

  alert("Save completed");
  loadPatrollingData();
}

/* ================= LOAD ================= */
document.addEventListener("DOMContentLoaded", loadPatrollingData);

function loadPatrollingData() {
  $.ajax({
    url: "/get_patrolling_data",
    type: "GET",
    success: function (result) {
      if (!result.success) {
        alert("Failed to load");
        return;
      }

      const tbody = document.querySelector("#patrolTable tbody");
      tbody.innerHTML = "";

      result.data.forEach((r, i) => {
        const tr = document.createElement("tr");
        tr.dataset.id = r.n_sr_no;

        tr.innerHTML = `
          <td class="sr-no">${i + 1}</td>
          <td>${r.s_location_code}</td>
          <td>${r.d_patrol_date}</td>
          <td>${r.t_from_time}</td>
          <td>${r.t_to_time}</td>
          <td>${r.s_boundary_wall_condition || ""}</td>
          <td>${r.s_patrolling_pathway_condition || ""}</td>
          <td>${r.s_suspicious_movement || ""}</td>
          <td>${r.s_wild_vegetation || ""}</td>
          <td>${r.s_illumination_status || ""}</td>
          <td>${r.s_workers_without_valid_permit || ""}</td>
          <td>${r.s_unknown_person_without_authorization || ""}</td>
          <td>${r.s_unattended_office_unlocked || ""}</td>
          <td>${r.s_other_observations_status || ""}</td>
          <td>${r.s_remarks || ""}</td>
          <td>${r.s_patrolling_guard_name}</td>
          <td>
            <button class="btn-edit" onclick="editRow(this)">Edit</button>
            <button class="btn-delete" onclick="deleteRow(this)">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    },
    error: function () {
      alert("Server error while loading data");
    },
  });
}
