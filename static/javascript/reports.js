document.getElementById("downloadBtn").addEventListener("click", () => {
  const table = document.getElementById("tableSelect").value;
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!table) return alert("Select table");
  if (!start || !end) return alert("Select date range");
  if (start > end) return alert("Invalid date range");

  fetch("/download_filtered_excel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, start, end })
  })
    .then(res => res.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}_${start}_to_${end}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(() => alert("Download failed"));
});
document.addEventListener("DOMContentLoaded", () => {
  fetch("/get_report_tables")
    .then(res => res.json())
    .then(tables => {
      const select = document.getElementById("tableSelect");

      tables.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.value;
        opt.textContent = t.label;
        select.appendChild(opt);
      });
    })
    .catch(err => {
      console.error(err);
      alert("Failed to load report tables");
    });
});
