function vehicleChecklistApp() {

  let allData = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  const pageInfo = document.getElementById("pageInfo");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  let isEdit = false;
  let editId = null;
  window._editChecklist = null;

  const checklistItems = [
    { code: "DL", label: "Valid Driving License" },
    { code: "RC", label: "Valid Registration Book" },
    { code: "INS", label: "Valid Insurance Certificate" },
    { code: "FIT", label: "Valid Vehicle Fitness Certificate" },
    { code: "PUC", label: "Valid PUC Certificate" },
    { code: "SPK", label: "Spark Arrestor Fitted" },
    { code: "FIRE", label: "Fire Extinguisher" },
    { code: "SELF", label: "Self Start" },
    { code: "UNDER", label: "Driver & Undercarriage Checked" },
    { code: "PLATE", label: "Number Plate Painted" },
    { code: "TYRE", label: "Condition of Tyres" },
    { code: "EMG", label: "Emergency Info Panel" },
    { code: "SHOE", label: "Crew Wearing Shoes" },
    { code: "INFL", label: "Inflammable Items Present" },
    { code: "LOAD", label: "Extra Load" },
    { code: "DRUNK", label: "Crew Drunk" },
    { code: "CCE", label: "CCE Certificate" },
    { code: "BODY", label: "Body / Valves / Seals" },
    { code: "OTHER", label: "Any Other" }
  ];

  function showPagination() {
    $("#paginationBar").show();
  }

  function hidePagination() {
    $("#paginationBar").hide();
  }

  /* ============ LOAD LIST ============ */
  function loadData() {
    $.get("/get_vehicle_checklist_data", res => {
      if (!res.success) return;
      allData = res.data;
      renderPage();


      showPagination();
    });
  }


  function renderPage() {
    const tbody = $("#masterTable tbody").empty();

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    const pageData = allData.slice(start, end);

    pageData.forEach((r, index) => {
      const tr = $(`
      <tr>
        <td>${start + index + 1}</td>
        <td>${r.s_location_code || ""}</td>
        <td>${r.dt_entry_datetime || ""}</td>
        <td>${r.s_vehicle_no || ""}</td>
        <td>${r.s_vehicle_type || ""}</td>
        <td>${r.s_driver_name || ""}</td>
        <td>${r.s_contact_no || ""}</td>
        <td>${r.s_purpose_of_entry || ""}</td>
        <td>
  <button class="icon-btn edit" title="Edit">
    <i class="fa fa-pen"></i>
  </button>

  <button class="icon-btn delete" title="Delete">
    <i class="fa fa-trash"></i>
  </button>

  <button class="icon-btn download" title="Download Checklist">
    <i class="fa fa-download"></i>
  </button>
</td>

      </tr>
    `);

      tr.data("record", r);
      tbody.append(tr);
    });

    updatePaginationButtons();
  }


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

  // Contact number: only 10 digits
  $("#s_contact_no").on("input", function () {
    this.value = this.value.replace(/[^0-9]/g, "").slice(0, 10);
  });

  $("#masterTable").on("click", ".icon-btn.download", function () {
  const record = $(this).closest("tr").data("record");

  if (!record || !record.checklist || record.checklist.length === 0) {
    alert("No checklist data available for this vehicle.");
    return;
  }

  downloadChecklistExcel(record);
});


  /* ============ VIEW SWITCH ============ */
  window.openAddForm = () => {
    isEdit = false;
    editId = null;
    window._editChecklist = null;

    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();


    hidePagination();

    $("#s_location_code")
      .val(USER_LOCATION)
      .prop("readonly", true);
    renderChecklist();
  };

  window.nextStep = () => {

    $("#step2").show();

    hidePagination();

    if (isEdit && window._editChecklist) {
      renderChecklist(window._editChecklist);
    } else {
      renderChecklist();
    }

    /* ============ REMARK ENFORCEMENT ON NO ============ */
  $("#checkTable").on("change", "input[type=radio]", function () {
  const tr = $(this).closest("tr");
  const status = $(this).val();
  const remarkInput = tr.find(".remark");

  if (status === "N") {
    remarkInput
      .prop("required", true)
      .addClass("remark-required")
      .attr("placeholder", "Remark required for NO")
      .focus();
  } else {
    remarkInput
      .prop("required", false)
      .removeClass("remark-required")
      .val("")
      .attr("placeholder", "");
  }
});


  };

  window.backStep = () => {
    $("#step2").hide();
    $("#step1").show();

    hidePagination();
  };

  window.cancel = () => location.reload();

  /* ============ CHECKLIST (OLD LOGIC – UNCHANGED) ============ */
  function renderChecklist(existing = []) {
    const tbody = $("#checkTable tbody");
    tbody.empty();

    checklistItems.forEach(item => {
      tbody.append(`
        <tr data-code="${item.code}" data-label="${item.label}">
          <td>${item.label}</td>
          <td><input type="radio" name="${item.code}" value="Y"></td>
          <td><input type="radio" name="${item.code}" value="N"></td>
          <td>
  <input class="remark" placeholder="">

</td>

        </tr>
      `);
    });

    // Prefill for EDIT
    existing.forEach(c => {
      const tr = $(`#checkTable tr[data-code='${c.s_check_code}']`);
      tr.find(`input[value='${c.s_status}']`).prop("checked", true);
      tr.find(".remark").val(c.s_remark);
    });
  }

  /* ============ EDIT ============ */
  $("#masterTable").on("click", ".edit", function () {
    const r = $(this).closest("tr").data("record");

    isEdit = true;
    editId = r.n_vc_id;

    $("#paginationBar").hide();
    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();

    $("#s_location_code")
      .val(USER_LOCATION)
      .prop("readonly", true);

    $("#s_vehicle_no").val(r.s_vehicle_no);
    $("#s_vehicle_type").val(r.s_vehicle_type);
    $("#s_driver_name").val(r.s_driver_name);
    $("#s_contact_no").val(r.s_contact_no);
    $("#s_occupants_name").val(r.s_occupants_name);
    $("#dt_entry_datetime").val(
      r.dt_entry_datetime ? r.dt_entry_datetime.replace(" ", "T") : ""
    );
    $("#s_purpose_of_entry").val(r.s_purpose_of_entry);

    renderChecklist(r.checklist || []);
  });


  /* ============ SAVE / UPDATE ============ */
  window.saveData = () => {


    if (
      !$("#s_vehicle_no").val() ||
      !$("#s_vehicle_type").val() ||
      !$("#s_driver_name").val() ||
      !$("#s_contact_no").val() ||
      !$("#s_occupants_name").val() ||
      !$("#dt_entry_datetime").val() ||
      !$("#s_purpose_of_entry").val()
    ) {
      alert("Please fill all required fields");
      return;
    }

    if ($("#s_contact_no").val().length !== 10) {
      alert("Contact number must be exactly 10 digits");
      return;
    }


    if ($("#step2").is(":hidden") || $("#checkTable tbody tr").length === 0) {
      alert("Please complete checklist before saving.");
      return;
    }

    if (isEdit && !editId) {
      alert("Edit ID missing. Please reload.");
      return;
    }

    const rows = $("#checkTable tbody tr");
    const checklist = [];
    let valid = true;

    rows.each(function () {
      const tr = $(this);
      const status = tr.find("input[type=radio]:checked").val();
      const remarkInput = tr.find(".remark");
      const remark = remarkInput.val();

      if (!status) {
        valid = false;
      }

      if (status === "N" && !remark) {
        remarkInput
          .addClass("remark-required")
          .attr("placeholder", "Remark required for NO");
        valid = false;
      } else {
        remarkInput.removeClass("remark-required");
      }

      checklist.push({
        s_check_code: tr.data("code"),
        s_check_label: tr.data("label"),
        s_status: status,
        s_remark: remark
      });
    });


    if (!valid) {
      alert("Please complete checklist properly");
      return;
    }

    const payload = {
      master: {
        n_vc_id: editId,
        s_location_code: USER_LOCATION,
        s_vehicle_no: $("#s_vehicle_no").val(),
        s_vehicle_type: $("#s_vehicle_type").val(),
        s_driver_name: $("#s_driver_name").val(),
        s_contact_no: $("#s_contact_no").val(),
        s_occupants_name: $("#s_occupants_name").val(),
        dt_entry_datetime: $("#dt_entry_datetime").val(),
        s_purpose_of_entry: $("#s_purpose_of_entry").val()
      },
      checklist
    };

    const url = isEdit
      ? "/update_vehicle_checklist_data"
      : "/save_vehicle_checklist_full";

    if (!confirm(isEdit ? "Update vehicle checklist?" : "Save vehicle checklist?")) return;

    $.ajax({
      url,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: res => {
        alert(res.message);
        location.reload();
      },
      error: () => alert("Server error")
    });
  };

  /* ============ DELETE ============ */
  $("#masterTable").on("click", ".delete", function () {
    const r = $(this).closest("tr").data("record");
    if (!confirm("Delete this record?")) return;

    $.ajax({
      url: "/delete_vehicle_checklist_data",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_vc_id: r.n_vc_id }),
      success: r => {
        alert(r.message);
        loadData();
      }
    });
  });


  /* ================= DOWNLOAD CHECKLIST (ROW LEVEL) ================= */
/* ================= DOWNLOAD CHECKLIST (SINGLE RECORD – CLEAN FORMAT) ================= */
async function downloadChecklistExcel(record) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Vehicle Checklist");

  let rowIndex = 1;

  // ===== MASTER DETAILS (ONCE) =====
  worksheet.getCell(`A${rowIndex}`).value = "Vehicle No";
  worksheet.getCell(`B${rowIndex}`).value = record.s_vehicle_no ?? "";
  rowIndex++;

  worksheet.getCell(`A${rowIndex}`).value = "Vehicle Type";
  worksheet.getCell(`B${rowIndex}`).value = record.s_vehicle_type ?? "";
  rowIndex++;

  worksheet.getCell(`A${rowIndex}`).value = "Driver Name";
  worksheet.getCell(`B${rowIndex}`).value = record.s_driver_name ?? "";
  rowIndex++;

  worksheet.getCell(`A${rowIndex}`).value = "Contact No";
  worksheet.getCell(`B${rowIndex}`).value = record.s_contact_no ?? "";
  rowIndex++;

  worksheet.getCell(`A${rowIndex}`).value = "Entry Date / Time";
  worksheet.getCell(`B${rowIndex}`).value = record.dt_entry_datetime ?? "";
  rowIndex += 2; // blank line

  // ===== BOLD MASTER LABELS =====
  for (let i = 1; i <= 5; i++) {
    worksheet.getCell(`A${i}`).font = { bold: true };
  }

  // ===== CHECKLIST TABLE HEADER =====
  worksheet.getRow(rowIndex).values = [
    "Checklist Item",
    "Status",
    "Remark"
  ];

  worksheet.getRow(rowIndex).eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
  });

  rowIndex++;

  // ===== CHECKLIST DATA (REPEATING) =====
  record.checklist.forEach(c => {
    worksheet.getRow(rowIndex).values = [
      c.s_check_label ?? "",
      c.s_status === "Y" ? "Yes" : "No",
      c.s_remark ?? ""
    ];
    rowIndex++;
  });

  // ===== AUTO COLUMN WIDTH =====
  worksheet.columns.forEach(col => {
    let max = 15;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > max) max = len;
    });
    col.width = max + 2;
  });

  // ===== DOWNLOAD FILE =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const safeVehicleNo = (record.s_vehicle_no || "Vehicle")
    .replace(/[^a-zA-Z0-9]/g, "_");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Vehicle_${safeVehicleNo}_Checklist.xlsx`;
  link.click();
}

/* ================= DOWNLOAD ================= */

async function downloadTable() {
  if (!allData.length) {
    alert("No data available to download");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Vehicle Entry Register");

  // ===== HEADERS (EXACTLY LIKE UI TABLE) =====
  const headers = [
    "Sr No",
    "Location",
    "Date / Time",
    "Vehicle No",
    "Vehicle Type",
    "Driver Name",
    "Contact No",
    "Purpose of Entry"
  ];

  worksheet.addRow(headers);

  // ===== DATA (ALL RECORDS, MASTER ONLY) =====
  allData.forEach((r, index) => {
    worksheet.addRow([
      index + 1,
      r.s_location_code ?? "",
      r.dt_entry_datetime ?? "",
      r.s_vehicle_no ?? "",
      r.s_vehicle_type ?? "",
      r.s_driver_name ?? "",
      r.s_contact_no ?? "",
      r.s_purpose_of_entry ?? ""
    ]);
  });

  // ===== BOLD HEADER ROW =====
  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // ===== BOLD SR NO COLUMN =====
  worksheet.getColumn(1).eachCell((cell, rowNumber) => {
    if (rowNumber !== 1) {
      cell.font = { bold: true };
    }
  });

  // ===== AUTO COLUMN WIDTH =====
  worksheet.columns.forEach(column => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLength) maxLength = len;
    });
    column.width = maxLength + 2;
  });

  // ===== DOWNLOAD =====
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Vehicle_Entry_Register.xlsx";
  link.click();
}


  window.nextPage = nextPage;
  window.prevPage = prevPage;
window.downloadTable = downloadTable;


  loadData();
}

vehicleChecklistApp();
