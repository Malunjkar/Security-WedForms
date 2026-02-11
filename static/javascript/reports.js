document.getElementById("downloadBtn").addEventListener("click", async () => {
  const table = document.getElementById("tableSelect").value;
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;

  if (!table) return alert("Select table");
  if (!start || !end) return alert("Select date range");
  if (start > end) return alert("Invalid date range");

  try {
    const response = await fetch("/download_filtered_excel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, start, end })
    });

 
    if (!response.ok) {
      const text = await response.text(); 
      console.error(text);
      alert("Server error. Download aborted.");
      return;
    }

    const contentType = response.headers.get("Content-Type") || "";

    if (!contentType.includes(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )) {
      const text = await response.text();
      console.error(text);
      alert("Invalid file received. Not an Excel file.");
      return;
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${table}_${start}_to_${end}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("Download failed");
  }
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
