function pipelineMitraApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  /* ================= HELPERS ================= */

  function cloneTemplate(id) {
    const tpl = document.getElementById(id);
    if (!tpl) {
      console.error("Template not found:", id);
      return null;
    }
    return tpl.content.cloneNode(true);
  }

  function updateSerialNumbers() {
  const rows = document.querySelectorAll("#mitraTable tbody tr");
  rows.forEach((row, i) => {
    const cell = row.querySelector(".sr-no");
    if (cell) cell.innerText = i + 1;
  });
}


  /* ================= LOAD ================= */

  function loadData() {
    $.get("/get_pipeline_mitra_data", res => {
      console.log("PIPELINE MITRA API:", res);

      if (!res.success || !Array.isArray(res.data)) return;

      
      allData = res.data.sort((a, b) => b.n_sr_no - a.n_sr_no);

      currentPage = 1;
      renderPage();
    });
  }

  /* ================= RENDER ================= */

  function renderPage() {
    const tbody = document.querySelector("#mitraTable tbody");
    tbody.innerHTML = "";

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const pageData = allData.slice(start, end);
    console.log("Rendering rows:", pageData);

    pageData.forEach(r => {
      const fragment = cloneTemplate("mitraViewRowTemplate");
      if (!fragment) return;

      const row = fragment.querySelector("tr");
      if (!row) return;

      row.dataset.id = r.n_sr_no;

      
      row.querySelector(".loc").innerText = r.s_location_code || "";
      row.querySelector(".date").innerText = r.d_entry_date || "";
      row.querySelector(".chainage").innerText = r.s_chainage_no || "";
      row.querySelector(".name").innerText = r.s_pm_name || "";
      row.querySelector(".village").innerText = r.s_pm_village_name || "";
      row.querySelector(".mobile").innerText = r.s_pm_mobile_no || "";
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

  /* ================= ADD ================= */

  function addRow() {
    const tbody = document.querySelector("#mitraTable tbody");
    const fragment = cloneTemplate("mitraAddRowTemplate");
    const row = fragment.querySelector("tr");

    row.dataset.new = "true";
    row.dataset.edited = "true";
    row.querySelector(".loc").innerText = USER_LOCATION;

    tbody.prepend(row);
    updateSerialNumbers();
  }

  /* ================= EDIT ================= */

  function editRow(btn) {
    const row = btn.closest("tr");
    row.dataset.edited = "true";

    row.querySelector(".loc").innerText = USER_LOCATION;

    const d = row.children[2].innerText;
    row.children[2].innerHTML = `<input type="date" value="${d}">`;

    [3, 4, 5, 6, 7].forEach(i => {
      const val = row.children[i].innerText;
      row.children[i].innerHTML = `<input type="text" value="${val}">`;
    });

    btn.disabled = true;
  }

  /* ================= SAVE ================= */

  function saveTable() {
  const rows = document.querySelectorAll("#mitraTable tbody tr");

  let hasNew = false;
  let hasEdit = false;

  rows.forEach(row => {
    if (row.dataset.new) hasNew = true;
    if (row.dataset.edited && !row.dataset.new) hasEdit = true;
  });

  
  if (!hasNew && !hasEdit) {
    alert("Nothing to save");
    return;
  }

  
  let confirmMsg = "Do you want to save changes?";
  if (hasNew && !hasEdit) confirmMsg = "Do you want to add this record?";
  if (!hasNew && hasEdit) confirmMsg = "Do you want to update this record?";
  if (hasNew && hasEdit) confirmMsg = "Do you want to add and update records?";

  
  if (!confirm(confirmMsg)) return;

  //Proceed with save
  rows.forEach(row => {
    const td = row.children;

    const payload = {
      s_location_code: USER_LOCATION,
      d_entry_date: td[2].querySelector("input")?.value,
      s_chainage_no: td[3].querySelector("input")?.value,
      s_pm_name: td[4].querySelector("input")?.value,
      s_pm_village_name: td[5].querySelector("input")?.value,
      s_pm_mobile_no: td[6].querySelector("input")?.value,
      s_remarks: td[7].querySelector("input")?.value
    };

    // INSERT
   if (row.dataset.new) {
  $.ajax({
    url: "/save_pipeline_mitra_data",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  });
}

    
    
// UPDATE
if (row.dataset.edited && !row.dataset.new) {
  payload.n_sr_no = row.dataset.id;
  $.ajax({
    url: "/update_pipeline_mitra_data",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  });
}
  });

  // Final success popup
  if (hasNew && hasEdit) {
    alert("Records added and updated successfully");
  } else if (hasNew) {
    alert("Record added successfully");
  } else {
    alert("Record updated successfully");
  }

  loadData();
}


  /* ================= DELETE ================= */

 function deleteRow(btn) {
  const row = btn.closest("tr");

  // New row → frontend only
  if (row.dataset.new) {
    if (!confirm("Are you sure you want to delete this row?")) return;
    row.remove();
    updateSerialNumbers();
    return;
  }

  // Existing row → DB delete
  if (!confirm("Are you sure you want to delete this record?")) return;

  $.ajax({
    url: "/delete_pipeline_mitra_data",   
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      n_sr_no: row.dataset.id             
    }),
    success: res => {
      if (res.success) {
        row.remove();
        updateSerialNumbers();
        alert("Deleted successfully");
      } else {
        alert(res.message || "Delete failed");
      }
    },
    error: err => {
      console.error("Delete error:", err);
      alert("Delete failed at server");
    }
  });
}


/* ================= DOWNLOAD ================= */
async function downloadTable() {
  if (!allData.length) {
    alert("No data available to download");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pipeline Mitra Register");

  /* ===== TITLE ===== */
  worksheet.mergeCells(1, 1, 1, 8);
  worksheet.getCell("A1").value = "Pipeline Mitra Register";
  worksheet.getCell("A1").font = { bold: true, size: 16 };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle"
  };
  worksheet.getRow(1).height = 30;

  /* ===== 1 BLANK ROW ===== */
  worksheet.addRow([]);

  /* ===== HEADERS ===== */
  const headers = [
    "Sr No",
    "Location",
    "Date",
    "Chainage No",
    "Pipeline Mitra Name",
    "Village Name",
    "Mobile No",
    "Remarks"
  ];

  const headerRowIndex = worksheet.lastRow.number + 1;
  worksheet.addRow(headers);

  worksheet.getRow(headerRowIndex).eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center"
    };
  });
  worksheet.getRow(headerRowIndex).height = 35;

  /* ===== DATA ===== */
  let srNo = 1;
  allData.forEach(r => {
    worksheet.addRow([
      srNo++,
      r.s_location_code ?? "",
      r.d_entry_date ?? "",
      r.s_chainage_no ?? "",
      r.s_pm_name ?? "",
      r.s_pm_village_name ?? "",
      r.s_pm_mobile_no ?? "",
      r.s_remarks ?? ""
    ]);
  });

  /* ===== COLUMN WIDTH ===== */
  worksheet.columns.forEach(column => {
    let maxLength = 12;
    column.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLength) maxLength = len;
    });
    column.width = Math.min(maxLength + 2, 20);
  });

  /* ===== DOWNLOAD ===== */
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Pipeline_Mitra_Register.xlsx";
  link.click();
}


  /* ================= EXPOSE ================= */

  window.addRow = addRow;
  window.saveTable = saveTable;
  window.editRow = editRow;
  window.deleteRow = deleteRow;
  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.downloadTable = downloadTable;


  loadData();
}

pipelineMitraApp();
