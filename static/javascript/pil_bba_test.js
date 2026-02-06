function bbaTestApp() {
  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  /* ================= IMAGE PREVIEW ================= */
  function previewFile(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      input.dataset.base64 = e.target.result;
      input.dataset.type = file.type;
      input.dataset.name = file.name;

      let previewDiv = input.closest("td").querySelector(".img-preview");

      if (!previewDiv) {
        previewDiv = document.createElement("div");
        previewDiv.className = "img-preview";
        input.closest("td").appendChild(previewDiv);
      }

      previewDiv.innerHTML = `
      <button type="button" onclick="openFromInput(this)">
        View Document
      </button>
    `;
    };

    reader.readAsDataURL(file);
  }

  function showFile(base64, type, name) {
    const modal = document.getElementById("filePreviewModal");
    const frame = document.getElementById("fileFrame");

    if (!base64) {
      alert("No file available");
      return;
    }

    frame.src = base64;
    modal.classList.remove("hidden");
  }

  function closePreview() {
    const modal = document.getElementById("filePreviewModal");
    const frame = document.getElementById("fileFrame");

    frame.src = "";
    modal.classList.add("hidden");
  }

  /* ================= HELPERS ================= */
  function cloneTemplate(id) {
    return document.getElementById(id).content.cloneNode(true);
  }

  function updateSerialNumbers() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");
    const total = rows.length;
    rows.forEach((row, i) => {
      row.querySelector(".sr-no").innerText = total - i;
    });
  }

  function openFromInput(btn) {
    const input = btn.closest("td").querySelector("input[type='file']");

    if (!input || !input.dataset.base64) {
      alert("No file attached");
      return;
    }

    showFile(
      input.dataset.base64,
      input.dataset.type || "application/octet-stream",
      input.dataset.name || "Attachment",
    );
  }

  /* ================= ADD ROW ================= */
  function addRow() {
    const tbody = document.querySelector("#bbaTable tbody");
    const tpl = cloneTemplate("bbaAddRowTemplate");
    const row = tpl.querySelector("tr");

    row.dataset.new = "true";
    row.querySelector(".loc").innerText = USER_LOCATION;

    tbody.prepend(row);
    updateSerialNumbers();
  }

  /* ================= DELETE ================= */
  function deleteRow(btn) {
    const row = btn.closest("tr");

    if (row.dataset.new === "true") {
      if (!confirm("Are you sure you want to delete this row?")) return;
      row.remove();
      updateSerialNumbers();
      return;
    }

    if (!confirm("Are you sure you want to delete this record?")) return;

    $.ajax({
      url: "/delete_bba_test_data",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sr_no: row.dataset.id }),
      success: (res) => {
        if (res.success) {
          row.remove();
          updateSerialNumbers();
          alert("Deleted successfully");
        } else {
          alert(res.message || "Delete failed");
        }
      },
      error: () => {
        alert("Delete failed at server");
      },
    });
  }

  /* ================= EDIT ================= */
  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";
    row.querySelector(".loc").innerText = USER_LOCATION;

    ["date", "time"].forEach((cls, i) => {
      const td = row.children[2 + i];
      const val = row.querySelector("." + cls).innerText;
      td.innerHTML = "";
      const input = document.createElement("input");
      input.type = cls === "date" ? "date" : "time";
      input.value = val;
      td.appendChild(input);
    });

    [4, 5, 8, 10, 11].forEach((idx) => {
      const val = row.children[idx].innerText;
      row.children[idx].innerHTML = "";
      const input = document.createElement("input");
      input.value = val;
      row.children[idx].appendChild(input);
    });

    [6, 7].forEach((idx) => {
      const val = row.children[idx].innerText;
      row.children[idx].innerHTML = "";

      const select = document.createElement("select");
      const options =
        idx === 6
          ? ["Employee", "Contractor", "Others"]
          : ["Negative", "Positive"];

      options.forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.text = v;
        if (v === val) o.selected = true;
        select.appendChild(o);
      });

      row.children[idx].appendChild(select);
    });

    const existingBase64 = row.dataset.attachment || null;
    const existingType = row.dataset.fileType || "application/pdf";
    const existingName = row.dataset.fileName || "Attachment";

    row.children[9].innerHTML = "";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.onchange = function () {
      previewFile(this);
    };

    const previewDiv = document.createElement("div");
    previewDiv.className = "img-preview";

    if (existingBase64) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerText = "View Document";
      btn.onclick = () => showFile(existingBase64, existingType, existingName);
      previewDiv.appendChild(btn);
    }

    row.children[9].appendChild(fileInput);
    row.children[9].appendChild(previewDiv);

    btn.disabled = true;
    btn.innerText = "Editing";
  }

  /* ================= SAVE ================= */
  function saveTable() {
    const rows = document.querySelectorAll("#bbaTable tbody tr");

    let hasNew = false;
    let hasEdit = false;

    rows.forEach((row) => {
      if (row.dataset.new === "true") hasNew = true;
      if (row.dataset.edited === "true" && !row.dataset.new) hasEdit = true;
    });

    if (!hasNew && !hasEdit) {
      alert("Nothing to save");
      return;
    }

    let confirmMsg = "Do you want to save changes?";
    if (hasNew && !hasEdit) confirmMsg = "Do you want to add this record?";
    if (!hasNew && hasEdit) confirmMsg = "Do you want to update this record?";
    if (hasNew && hasEdit)
      confirmMsg = "Do you want to add and update records?";

    if (!confirm(confirmMsg)) return;

    rows.forEach((row) => {
      const td = row.children;

      const payload = {
        s_location_code: USER_LOCATION,
        d_test_date: td[2].querySelector("input")?.value,
        t_test_time: td[3].querySelector("input")?.value,
        s_test_record_no: td[4].querySelector("input")?.value,
        s_individual_name: td[5].querySelector("input")?.value,
        s_person_type: td[6].querySelector("select")?.value,
        s_test_result: td[7].querySelector("select")?.value,
        n_bac_count: td[8].querySelector("input")?.value,
        img_attachment:
          td[9].querySelector("input")?.dataset.base64 ||
          row.dataset.attachment ||
          null,
        s_security_personnel_name: td[10].querySelector("input")?.value,
        s_remarks: td[11].querySelector("input")?.value,
      };

      // INSERT
      if (row.dataset.new === "true") {
        $.ajax({
          url: "/save_bba_test_data",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
        });
      }

      // UPDATE
      if (row.dataset.edited === "true" && !row.dataset.new) {
        payload.n_sr_no = row.dataset.id;
        $.ajax({
          url: "/update_bba_test_data",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
        });
      }
    });

    if (hasNew && hasEdit) {
      alert("Records added and updated successfully");
    } else if (hasNew) {
      alert("Record added successfully");
    } else {
      alert("Record updated successfully");
    }

    loadBbaData();
  }

  /* ================= LOAD ================= */
  function loadBbaData() {
    $.get("/get_bba_test_data", (res) => {
      if (!res.success) return alert("Load failed");
      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);
      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER ================= */
  function renderPage() {
    const tbody = document.querySelector("#bbaTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    allData.slice(start, end).forEach((r) => {
      const tpl = cloneTemplate("bbaViewRowTemplate");
      const row = tpl.querySelector("tr");

      row.dataset.id = r.n_sr_no;
      row.dataset.attachment = r.img_attachment || null;
      row.dataset.fileType = r.s_file_type || "application/pdf";
      row.dataset.fileName = "Attachment";

      row.querySelector(".loc").innerText = r.s_location_code;
      row.querySelector(".date").innerText = r.d_test_date;
      row.querySelector(".time").innerText = r.t_test_time;
      row.querySelector(".record").innerText = r.s_test_record_no;
      row.querySelector(".name").innerText = r.s_individual_name;
      row.querySelector(".type").innerText = r.s_person_type;
      row.querySelector(".result").innerText = r.s_test_result;
      row.querySelector(".bac").innerText = r.n_bac_count;

      if (r.img_attachment) {
        row.children[9].innerHTML = `
          <button onclick="showFile(
  '${r.img_attachment}',
  '${r.s_file_type || "application/pdf"}',
  'Attachment'
)">View Document</button>

        `;
      }

      row.querySelector(".security").innerText = r.s_security_personnel_name;
      row.querySelector(".remarks").innerText = r.s_remarks || "";

      tbody.appendChild(row);
    });

    updateSerialNumbers();
    updatePaginationButtons();
  }

  /* ================= PAGINATION ================= */
  function updatePaginationButtons() {
    const totalPages = Math.ceil(allData.length / rowsPerPage) || 1;

    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  }

  function nextPage() {
    if (currentPage < Math.ceil(allData.length / rowsPerPage)) {
      currentPage++;
      renderPage();
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  }

  /* ================= EXPOSE ================= */
  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.previewFile = previewFile;
  window.showFile = showFile;

  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.closePreview = closePreview;

  document.addEventListener("DOMContentLoaded", loadBbaData);
}

bbaTestApp();
