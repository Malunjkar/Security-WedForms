function vehicleChecklistApp() {

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

  window.openAddForm = () => {
    $("#listView").hide();
    $("#step1").show();
  };

  window.nextStep = () => {
    $("#step1").hide();
    $("#step2").show();
    renderChecklist();
  };

  window.backStep = () => {
    $("#step2").hide();
    $("#step1").show();
  };

  window.cancel = () => location.reload();

  function renderChecklist() {
    const tbody = $("#checkTable tbody");
    tbody.empty();

    checklistItems.forEach(item => {
      tbody.append(`
        <tr data-code="${item.code}" data-label="${item.label}">
          <td>${item.label}</td>
          <td><input type="radio" name="${item.code}" value="Y"></td>
          <td><input type="radio" name="${item.code}" value="N"></td>
          <td><input class="remark"></td>
        </tr>
      `);
    });
  }

  window.saveData = () => {
    const rows = $("#checkTable tbody tr");
    const checklist = [];
    let valid = true;

    rows.each(function () {
      const code = $(this).data("code");
      const label = $(this).data("label");
      const status = $(this).find("input[type=radio]:checked").val();
      const remark = $(this).find(".remark").val();

      if (!status) valid = false;
      if (status === "N" && !remark) valid = false;

      checklist.push({
        s_check_code: code,
        s_check_label: label,
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
        s_location_code: $("#s_location_code").val(),
        s_vehicle_no: $("#s_vehicle_no").val(),
        s_vehicle_type: $("#s_vehicle_type").val(),
        s_driver_name: $("#s_driver_name").val(),
        s_contact_no: $("#s_contact_no").val(),
         s_occupants_name: $("#s_occupants_name").val(), // 🔥 ADDED
        dt_entry_datetime: $("#dt_entry_datetime").val(),
        s_purpose_of_entry: $("#s_purpose_of_entry").val()
      },
      checklist
    };

    if (!confirm("Save vehicle checklist?")) return;

    $.ajax({
      url: "/save_vehicle_checklist_full",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      success: res => {
        if (res.success) {
          alert(res.message);
          location.reload();
        } else {
          alert(res.message || "Save failed");
        }
      },
      error: xhr => {
        console.error(xhr.responseText);
        alert("Server error while saving");
      }
    });
  };
}

vehicleChecklistApp();
