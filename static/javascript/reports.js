function reportDownloadApp() {

  /* ================= DOWNLOAD EXCEL ================= */
  function downloadReport() {

    const table = $("#tableSelect").val();
    const start = $("#startDate").val();
    const end = $("#endDate").val();

    if (!table) {
      alert("Select table");
      return;
    }

    if (!start || !end) {
      alert("Select date range");
      return;
    }

    if (start > end) {
      alert("Invalid date range");
      return;
    }

    $.ajax({
      url: "/download_filtered_excel",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ table, start, end }),
      xhrFields: {
        responseType: "blob"   // IMPORTANT for file download
      },
      success: function (blob, status, xhr) {

        const contentType = xhr.getResponseHeader("Content-Type") || "";

        if (!contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )) {
          alert("Invalid file received.");
          return;
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${table}_${start}_to_${end}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      },
      error: function (xhr) {
        console.error(xhr.responseText);
        alert("Download failed or server error.");
      }
    });
  }

  /* ================= LOAD TABLE DROPDOWN ================= */
  function loadReportTables() {

    $.ajax({
      url: "/get_report_tables",
      method: "GET",
      success: function (tables) {

        const select = $("#tableSelect");
        select.empty();
        select.append(`<option value="">Select Report</option>`);

        tables.forEach(t => {
          select.append(
            `<option value="${t.value}">${t.label}</option>`
          );
        });
      },
      error: function () {
        alert("Failed to load report tables");
      }
    });
  }

  /* ================= EVENT BINDING ================= */
  $("#downloadBtn").on("click", downloadReport);

  /* ================= INIT ================= */
  loadReportTables();
}

reportDownloadApp();
