function casualLabourApp() {

  let labours = [];

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", loadMasterList);

  /* ================= LOAD LIST ================= */
  function loadMasterList() {
    fetch("/get_casual_labour_data")
      .then(r => r.json())
      .then(res => {
        const tbody = document.querySelector("#masterTable tbody");
        tbody.innerHTML = "";
        res.data.forEach(r => {
          tbody.innerHTML += `
            <tr>
              <td>${r.s_location}</td>
              <td>${r.s_contractor_name}</td>
              <td>${r.s_nature_of_work}</td>
              <td>${r.dt_work_datetime}</td>
              <td>
                <button class="danger" onclick="deleteRecord(${r.n_sl_no})">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>`;
        });
      });
  }

  /* ================= VIEW SWITCH ================= */
  window.openAddForm = () => {
    listView.style.display = "none";
    step1.style.display = "block";
  };

  window.nextStep = () => {
    step1.style.display = "none";
    step2.style.display = "block";
  };

  window.backStep = () => {
    step2.style.display = "none";
    step1.style.display = "block";
  };

  window.cancel = () => location.reload();

  /* ================= LABOUR ================= */
  window.addLabour = () => {
    labours.push({
      s_labour_name: labour_name.value,
      n_age: labour_age.value,
      s_sex: labour_sex.value,
      s_address: labour_address.value,
      s_temp_access_card_no: labour_card.value,
      s_mobile_no: labour_mobile.value,
      s_id_type: labour_id_type.value,
      s_govt_id_no: labour_id_no.value
    });
    renderLabours();
    clearLabour();
  };

  function renderLabours() {
    const tbody = document.querySelector("#labourTable tbody");
    tbody.innerHTML = "";
    labours.forEach((l, i) => {
      tbody.innerHTML += `
        <tr>
          <td>${l.s_labour_name}</td>
          <td>${l.n_age}</td>
          <td>${l.s_mobile_no}</td>
          <td>
            <button class="danger" onclick="removeLabour(${i})">X</button>
          </td>
        </tr>`;
    });
  }

  window.removeLabour = i => {
    labours.splice(i, 1);
    renderLabours();
  };

  function clearLabour() {
    labour_name.value = labour_age.value = labour_mobile.value = "";
    labour_sex.value = labour_address.value = labour_card.value = "";
    labour_id_type.value = labour_id_no.value = "";
  }

  /* ================= SAVE ================= */
  window.saveData = () => {
    const payload = {
      master: {
        s_location: s_location.value,
        s_contractor_name: s_contractor_name.value,
        s_nature_of_work: s_nature_of_work.value,
        s_place_of_work: s_place_of_work.value,
        dt_work_datetime: dt_work_datetime.value
      },
      labours
    };

    fetch("/save_casual_labour_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    .then(r => r.json())
    .then(res => {
      alert(res.message);
      location.reload();
    });
  };

  /* ================= DELETE ================= */
  window.deleteRecord = id => {
    if (!confirm("Delete this record?")) return;

    fetch("/delete_casual_labour_data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ n_sl_no: id })
    })
    .then(r => r.json())
    .then(res => {
      alert(res.message);
      loadMasterList();
    });
  };
}

casualLabourApp();
