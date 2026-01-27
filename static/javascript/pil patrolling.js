function patrollingApp() {

  /* ================= HELPERS ================= */
  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#patrolTable tbody tr");
    const total = rows.length;

    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i;
    });
  }


  /* ================= ADD ROW ================= */
  function addRow() {
    const tbody = document.querySelector("#patrolTable tbody");
    const tpl = cloneTemplate("addRowTemplate");
    const row = tpl.querySelector("tr");

    row.querySelector(".location")
      .appendChild(cloneTemplate("locationTemplate"));

    row.querySelectorAll(".ok").forEach(td => {
      td.appendChild(cloneTemplate("okNotOkTemplate"));
    });

    tbody.prepend(row);
    updateSerialNumbers();
  }

  /* ================= DELETE ================= */
  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (row.dataset.new === "true") {
      row.remove();
      updateSerialNumbers();
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;

    $.ajax({
      url: "/delete_patrolling_data",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: row.dataset.id }),
      success: res => {
        if (res.success) {
          row.remove();
          updateSerialNumbers();
        } else {
          alert(res.message);
        }
      },
      error: () => alert("Delete failed")
    });
  }

  /* ================= EDIT ================= */
  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";

    const loc = row.querySelector(".loc").innerText;
    const locTd = row.children[1];
    locTd.innerHTML = "";
    const locSelect = cloneTemplate("locationTemplate");
    locSelect.querySelector("select").value = loc;
    locTd.appendChild(locSelect);

    ["date", "from", "to"].forEach((cls, i) => {
      const td = row.children[2 + i];
      const val = row.querySelector("." + cls).innerText;
      td.innerHTML = "";
      const input = document.createElement("input");
      input.type = cls === "date" ? "date" : "time";
      input.value = val;
      td.appendChild(input);
    });

    for (let i = 5; i <= 13; i++) {
      const val = row.children[i].innerText;
      row.children[i].innerHTML = "";
      const sel = cloneTemplate("okNotOkTemplate");
      sel.querySelector("select").value = val;
      row.children[i].appendChild(sel);
    }

    const rVal = row.querySelector(".remarks").innerText;
    row.children[14].innerHTML = "";
    const ta = document.createElement("textarea");
    ta.value = rVal;
    row.children[14].appendChild(ta);

    const gVal = row.querySelector(".guard").innerText;
    row.children[15].innerHTML = "";
    const gi = document.createElement("input");
    gi.value = gVal;
    row.children[15].appendChild(gi);

    btn.disabled = true;
    btn.innerText = "Editing";
  }

  /* ================= SAVE ================= */
  function saveTable() {
    const rows = document.querySelectorAll("#patrolTable tbody tr");
    let hasAction = false;

    rows.forEach(row => {
      const td = row.children;

      const payload = {
        s_location_code: td[1].querySelector("select")?.value,
        d_patrol_date: td[2].querySelector("input")?.value,
        t_from_time: td[3].querySelector("input")?.value,
        t_to_time: td[4].querySelector("input")?.value,
        s_boundary_wall_condition: td[5].querySelector("select")?.value,
        s_patrolling_pathway_condition: td[6].querySelector("select")?.value,
        s_suspicious_movement: td[7].querySelector("select")?.value,
        s_wild_vegetation: td[8].querySelector("select")?.value,
        s_illumination_status: td[9].querySelector("select")?.value,
        s_workers_without_valid_permit: td[10].querySelector("select")?.value,
        s_unknown_person_without_authorization: td[11].querySelector("select")?.value,
        s_unattended_office_unlocked: td[12].querySelector("select")?.value,
        s_other_observations_status: td[13].querySelector("select")?.value,
        s_remarks: td[14].querySelector("textarea")?.value,
        s_patrolling_guard_name: td[15].querySelector("input")?.value
      };

      if (row.dataset.new === "true") {
        hasAction = true;
        $.post({
          url: "/save_patrolling_data",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }

      if (row.dataset.edited === "true" && !row.dataset.new) {
        hasAction = true;
        payload.n_sr_no = row.dataset.id;
        $.post({
          url: "/update_patrolling_data",
          contentType: "application/json",
          data: JSON.stringify(payload)
        });
      }
    });

    if (!hasAction) {
      alert("Nothing to save");
      return;
    }

    alert("Saved successfully");
    loadPatrollingData();
  }

  /* ================= LOAD ================= */
  function loadPatrollingData() {
  $.get("/get_patrolling_data", res => {
    if (!res.success) return alert("Load failed");

    const tbody = document.querySelector("#patrolTable tbody");
    tbody.innerHTML = "";

    res.data.forEach(r => {
      const tpl = cloneTemplate("viewRowTemplate");
      const row = tpl.querySelector("tr");

      row.dataset.id = r.n_sr_no;

      row.querySelector(".loc").innerText = r.s_location_code;
      row.querySelector(".date").innerText = r.d_patrol_date;
      row.querySelector(".from").innerText = r.t_from_time;
      row.querySelector(".to").innerText = r.t_to_time;

      [
        r.s_boundary_wall_condition,
        r.s_patrolling_pathway_condition,
        r.s_suspicious_movement,
        r.s_wild_vegetation,
        r.s_illumination_status,
        r.s_workers_without_valid_permit,
        r.s_unknown_person_without_authorization,
        r.s_unattended_office_unlocked,
        r.s_other_observations_status
      ].forEach((v, idx) => {
        row.children[5 + idx].innerText = v || "";
      });

      row.querySelector(".remarks").innerText = r.s_remarks || "";
      row.querySelector(".guard").innerText = r.s_patrolling_guard_name;

      tbody.appendChild(row);
    });

    updateSerialNumbers();
  });
}

 /* ================= EXPOSE TO HTML ================= */
  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;

  document.addEventListener("DOMContentLoaded", loadPatrollingData);


}
/* ================= START APP ================= */
patrollingApp();
