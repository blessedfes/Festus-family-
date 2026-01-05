const DB_NAME = "FestusHospitalDB";
let db;
let currentDept = null;
let currentStaff = null;
let currentPatient = null;

const DEPARTMENTS = [
  "Nurse","Doctor","Laboratory","Radiology","Pharmacy","ICU",
  "Antenatal","Dermatology","Fitness Centre","Fitness Doctor",
  "Emergency","Cardiology","Neurology","Oncology","Orthopedics",
  "Pediatrics","Psychiatry","Endocrinology","Gastroenterology",
  "Pulmonology","Nephrology","Urology","ENT","Surgery",
  "Plastic Surgery","Physiotherapy","Nutrition"
];

document.addEventListener("DOMContentLoaded", () => {
  initDB();
  loadDepartments();
});

/* ---------------- DB ---------------- */

function initDB() {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = e => {
    db = e.target.result;
    db.createObjectStore("patients", { keyPath: "matric" });
    db.createObjectStore("records", { autoIncrement: true });
    db.createObjectStore("recommendations", { autoIncrement: true });
  };
  req.onsuccess = e => db = e.target.result;
}

/* ---------------- UTIL ---------------- */

function now() {
  return new Date().toLocaleString();
}

function generateMatric() {
  const d = new Date();
  return `${String(d.getFullYear()).slice(2)}/${d.getDate()}/${d.getMonth()+1}/${Math.floor(Math.random()*100)}`;
}

/* ---------------- REGISTRY ---------------- */

function registerPatient() {
  const name = regName.value.trim();
  const age = regAge.value.trim();
  const amt = regAmount.value.trim();

  if (!name || !age || amt !== "18500") {
    alert("Invalid input or payment");
    return;
  }

  const matric = generateMatric();
  const tx = db.transaction("patients","readwrite");
  tx.objectStore("patients").add({
    matric, name, age, registeredAt: now()
  });

  regResult.innerText = `Registered successfully. Matric: ${matric}`;
}

/* ---------------- LOGIN ---------------- */

function loadDepartments() {
  const sel = document.getElementById("department");
  DEPARTMENTS.forEach(d => {
    const o = document.createElement("option");
    o.value = d;
    o.innerText = d;
    sel.appendChild(o);
  });
}

function loginDepartment() {
  currentStaff = staffName.value.trim();
  currentDept = department.value;
  if (!currentStaff) return alert("Enter staff name");

  departmentView.classList.remove("hidden");
  deptTitle.innerText = `${currentDept} Station — ${currentStaff}`;
}

/* ---------------- PATIENT OPEN ---------------- */

function openPatient() {
  currentPatient = patientMatric.value.trim();
  if (!currentPatient) return alert("Enter matric");

  patientHeader.innerText = `Patient Matric: ${currentPatient}`;
  renderDepartment();
}

/* ---------------- DEPARTMENT RENDER ---------------- */

function renderDepartment() {
  const box = departmentContent;
  box.innerHTML = "";

  if (currentDept === "Nurse") renderNurse(box);
  if (currentDept === "Doctor") renderDoctor(box);
  if (currentDept === "Pharmacy") renderPharmacy(box);
  if (currentDept === "Laboratory" || currentDept === "Radiology")
    renderLab(box);
  else renderGeneric(box);
}

/* ---------------- NURSE ---------------- */

function renderNurse(box) {
  ["Temperature","Pulse","BP","SpO2"].forEach(v => {
    const div = document.createElement("div");
    div.className = "record";
    div.innerHTML = `
      <strong>${v}</strong>
      <input placeholder="Enter ${v}">
      <button>Save</button>
    `;
    div.querySelector("button").onclick = () =>
      saveRecord(v, div.querySelector("input").value);
    box.appendChild(div);
  });
}

/* ---------------- DOCTOR ---------------- */

function renderDoctor(box) {
  const pad = document.createElement("textarea");
  pad.style.width = "100%";
  pad.style.height = "120px";

  const btn = document.createElement("button");
  btn.innerText = "Save Doctor Note";
  btn.onclick = () => saveRecord("Doctor Note", pad.value);

  const sel = document.createElement("select");
  DEPARTMENTS.forEach(d => {
    const o = document.createElement("option");
    o.value = d; o.innerText = d;
    sel.appendChild(o);
  });

  const rec = document.createElement("input");
  rec.placeholder = "Recommendation";

  const send = document.createElement("button");
  send.innerText = "Send Recommendation";
  send.onclick = () => sendRecommendation(sel.value, rec.value);

  box.append(pad, btn, sel, rec, send);
}

/* ---------------- PHARMACY ---------------- */

function renderPharmacy(box) {
  loadRecommendations(box, true);
}

/* ---------------- LAB/RAD ---------------- */

function renderLab(box) {
  loadRecommendations(box, false);
}

/* ---------------- GENERIC ---------------- */

function renderGeneric(box) {
  const pad = document.createElement("textarea");
  pad.style.width = "100%";
  pad.style.height = "120px";

  const btn = document.createElement("button");
  btn.innerText = "Save Note";
  btn.onclick = () => saveRecord(currentDept + " Note", pad.value);

  box.append(pad, btn);
}

/* ---------------- RECORDS ---------------- */

function saveRecord(title, content) {
  const tx = db.transaction("records","readwrite");
  tx.objectStore("records").add({
    matric: currentPatient,
    dept: currentDept,
    title, content,
    time: now()
  });
  alert("Saved");
}

function sendRecommendation(to, content) {
  const tx = db.transaction("recommendations","readwrite");
  tx.objectStore("recommendations").add({
    matric: currentPatient,
    from: "Doctor",
    to, content,
    time: now(),
    status: "pending"
  });
  alert("Recommendation sent");
}

/* ---------------- LOGOUT ---------------- */

function logoutDept() {
  departmentView.classList.add("hidden");
  currentDept = currentStaff = currentPatient = null;
}
