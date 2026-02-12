let editingItemIndex = null;

function visitorDeclarationApp() {

  let allData = [];
  let items = [];
  let isEdit = false;
  let editId = null;

  let currentPage = 1;
  const rowsPerPage = 10;

  const pageInfo = () => document.getElementById("pageInfo");
  const prevBtn = () => document.getElementById("prevBtn");
  const nextBtn = () => document.getElementById("nextBtn");

  /* ============ LOAD ============ */
  function loadData() {
    $.get("/get_visitor_declaration_data", res => {
      if (!res.success) return;
      allData = res.data;
      currentPage = 1;
      renderTable();
      $("#paginationBar").show();

    });
  }

  /* ============ RENDER MASTER ============ */
 function renderTable() {
  const tbody = document.querySelector("#masterTable tbody");
  tbody.innerHTML = "";

  const template = document.getElementById("visitorRowTemplate");

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = allData.slice(start, end);

  pageData.forEach(r => {

    const clone = template.content.cloneNode(true);
    const tr = clone.querySelector("tr");

    tr.querySelector(".location").textContent = r.s_location || "";
    tr.querySelector(".visitor-name").textContent = r.s_visitor_name || "";
    tr.querySelector(".pass-no").textContent = r.s_visitor_pass_no || "";
    tr.querySelector(".visit-datetime").textContent = r.dt_visit_datetime || "";

    $(tr).data("record", r);

    tbody.appendChild(clone);
  });

  updatePaginationButtons();
}


  function updatePaginationButtons() {
    const totalPages = Math.ceil(allData.length / rowsPerPage) || 1;

    pageInfo().innerText = `Page ${currentPage} of ${totalPages}`;
    prevBtn().disabled = currentPage === 1;
    nextBtn().disabled = currentPage === totalPages;
  }

  function nextPage() {
    if (currentPage < Math.ceil(allData.length / rowsPerPage)) {
      currentPage++;
      renderTable();
    }
  }

  function prevPage() {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  }

  /* ============ VIEW SWITCH ============ */
  window.openAddForm = () => {
    isEdit = false;
    editId = null;
    items = [];

    $("#paginationBar").hide();
    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();
    $("#s_location")
      .val(USER_LOCATION)
      .prop("readonly", true);
    document.getElementById("step1").scrollIntoView({ behavior: "smooth" });


  };


  window.backStep = () => { $("#step2").hide(); $("#step1").show(); };
  window.cancel = () => location.reload();

  /* ============ EDIT ============ */
  $("#masterTable").on("click", ".edit", function () {
    const r = $(this).closest("tr").data("record");

    isEdit = true;
    editId = r.n_sl_no;


    $("#paginationBar").hide();
    $("#listView").hide();
    $("#step1").show();
    $("#step2").show();

    $("#s_location")
      .val(USER_LOCATION)
      .prop("readonly", true);

    $("#s_visitor_name").val(r.s_visitor_name);
    $("#s_visitor_pass_no").val(r.s_visitor_pass_no);
    $("#s_whom_to_meet").val(r.s_whom_to_meet);
    $("#dt_visit_datetime").val(r.dt_visit_datetime.replace(" ", "T"));

    items = r.items || [];
    renderItems();
    document.getElementById("step1").scrollIntoView({ behavior: "smooth" });
  });

  /* ============ ITEMS ============ */
  window.addItem = () => {

    const itemObj = {
      s_item_code_description: $("#item_desc").val(),
      s_uom: $("#item_uom").val(),
      n_quantity: $("#item_qty").val()
    };

    if (editingItemIndex !== null) {
      // UPDATE existing item
      items[editingItemIndex] = itemObj;
      editingItemIndex = null;
    } else {
      // ADD new item
      items.push(itemObj);
    }

    renderItems();
    $("#item_desc,#item_uom,#item_qty").val("");
  };


  function renderItems() {
  const tbody = document.querySelector("#itemTable tbody");
  tbody.innerHTML = "";

  const template = document.getElementById("itemRowTemplate");

  items.forEach((i, idx) => {

    const clone = template.content.cloneNode(true);
    const tr = clone.querySelector("tr");

    tr.querySelector(".desc").textContent = i.s_item_code_description || "";
    tr.querySelector(".uom").textContent = i.s_uom || "";
    tr.querySelector(".qty").textContent = i.n_quantity || "";

    tr.querySelector(".edit").addEventListener("click", () => editItem(idx));
    tr.querySelector(".delete").addEventListener("click", () => removeItem(idx));

    tbody.appendChild(clone);
  });
}

  window.editItem = (index) => {
    const i = items[index];

    editingItemIndex = index;

    $("#item_desc").val(i.s_item_code_description);
    $("#item_uom").val(i.s_uom);
    $("#item_qty").val(i.n_quantity);

    // Optional UX improvement
    $("html, body").animate({
      scrollTop: $("#item_desc").offset().top - 100
    }, 300);
  };

  window.removeItem = i => {
    items.splice(i, 1);
    editingItemIndex = null;
    renderItems();
  };


  /* ============ SAVE ============ */
  window.saveData = () => {
    const payload = {
      master: {
        n_sl_no: editId,
        s_location: USER_LOCATION,
        s_visitor_name: $("#s_visitor_name").val(),
        s_visitor_pass_no: $("#s_visitor_pass_no").val(),
        s_whom_to_meet: $("#s_whom_to_meet").val(),
        dt_visit_datetime: $("#dt_visit_datetime").val()
      },
      items
    };

    const url = isEdit
      ? "/update_visitor_declaration_data"
      : "/save_visitor_declaration_data";

    if (!confirm(isEdit ? "Update record?" : "Save record?")) return;

    $.ajax({
      url,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: r => {
        alert(r.message);
        location.reload();
      }
    });
  };

  /* ============ DELETE ============ */
  $("#masterTable").on("click", ".delete", function () {
    const r = $(this).closest("tr").data("record");
    if (!confirm("Delete this record?")) return;

    $.ajax({
      url: "/delete_visitor_declaration_data",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ n_sl_no: r.n_sl_no }),
      success: r => {
        alert(r.message);
        loadData();
      }
    });
  });

  /* ============ Download============ */
  $("#masterTable").on("click", ".icon-btn.download", function () {
  const record = $(this).closest("tr").data("record");

  if (!record || !record.items || record.items.length === 0) {
    alert("No item details available for this visitor.");
    return;
  }

  downloadVisitorSlipExcel(record);
});

async function downloadVisitorSlipExcel(record) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Visitor Slip");

  let row = 3;

  // ===== TITLE =====
worksheet.mergeCells("A1:D1");
worksheet.getCell("A1").value = "Visitor Declaration Slip";
worksheet.getCell("A1").font = { bold: true, size: 14 };
worksheet.getCell("A1").alignment = {
  horizontal: "center",
  vertical: "middle"
};

worksheet.addRow([]); 


  /* ===== VISITOR DETAILS (ONCE) ===== */
 const masterFields = [
  ["Location", record.s_location ?? ""],
  ["Visitor Name", record.s_visitor_name ?? ""],
  ["Visitor Pass No", record.s_visitor_pass_no ?? ""],
  ["Whom To Meet", record.s_whom_to_meet ?? ""],
  ["Visit Date / Time", record.dt_visit_datetime ?? ""]
];

masterFields.forEach(([label, value]) => {
  worksheet.getCell(`A${row}`).value = label;
  worksheet.getCell(`A${row}`).font = { bold: true };
  worksheet.getCell(`B${row}`).value = value;
  row++;
});

row += 1; // ONE blank row only


  /* ===== ITEM TABLE HEADER ===== */
  worksheet.getRow(row).values = [
    "Sr No",
    "Item Description",
    "UOM",
    "Quantity"
  ];

  worksheet.getRow(row).eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center" };
  });

  row++;

  /* ===== ITEM DATA (REPEATING) ===== */
  let srNo = 1; 
  (record.items || []).forEach(i => {
    worksheet.getRow(row).values = [
      srNo++,
      i.s_item_code_description ?? "",
      i.s_uom ?? "",
      i.n_quantity ?? ""
    ];
    row++;
  });

  /* ===== AUTO COLUMN WIDTH ===== */
  worksheet.columns.forEach(col => {
    let max = 15;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > max) max = len;
    });
    col.width = max + 2;
  });

  /* ===== DOWNLOAD ===== */
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Visitor_Declaration_Slip.xlsx";
  link.click();
}

/* ================= BULK DOWNLOAD (LIST VIEW ONLY) ================= */
async function downloadTable() {
  if (!allData || allData.length === 0) {
    alert("No data available to download");
    return;
  }

  
  const workbook = new ExcelJS.Workbook();

  
  const worksheet = workbook.addWorksheet("Visitor Declaration Register");

  
  worksheet.mergeCells("A1:D1");
  worksheet.getCell("A1").value = "Visitor Declaration Register";
  worksheet.getCell("A1").font = { bold: true, size: 14 };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle"
  };

  
  worksheet.addRow([]);

  
  const headers = [
    "Location",
    "Visitor Name",
    "Pass No",
    "Date / Time"
  ];

  worksheet.addRow(headers);


  allData.forEach(r => {
    worksheet.addRow([
      r.s_location ?? "",
      r.s_visitor_name ?? "",
      r.s_visitor_pass_no ?? "",
      r.dt_visit_datetime ?? ""
    ]);
  });


  worksheet.getRow(3).eachCell(cell => {
    cell.font = { bold: true };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  worksheet.columns.forEach(col => {
    let max = 12;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > max) max = len;
    });
    col.width = max + 2;
  });


  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Visitor_Declaration_Register.xlsx";
  link.click();
}


  window.nextPage = nextPage;
  window.prevPage = prevPage;
  window.downloadTable = downloadTable;


  loadData();
}

visitorDeclarationApp();
