const role = localStorage.getItem("role");

document.getElementById("roleTitle").innerText =
    role.toUpperCase() + " DASHBOARD";

const menu = document.getElementById("menu");

const menus = {
    user: ["Apply", "My Applications"],
    inspector: ["Inspections", "Follow-ups"],
    admin: ["All Applications", "Approve", "NOC"]
};

menus[role].forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    li.onclick = () => loadContent(item);
    menu.appendChild(li);
});

// 🔥 IMPORTANT: Empty Data Structure (Backend Ready)
let applications = []; 
let inspections = [];
let followups = [];
let nocs = [];

// Load Content
function loadContent(type) {
    const content = document.getElementById("content");

    // APPLY FORM
    if (type === "Apply") {
        content.innerHTML = `
        <div class="card">
            <h2>Apply Application</h2>
            <input placeholder="Name"><br><br>
            <input placeholder="Phone"><br><br>
            <button onclick="submitApp()">Submit</button>
        </div>`;
    }

    // APPLICATION LIST
    if (type === "My Applications" || type === "All Applications") {

        if (applications.length === 0) {
            content.innerHTML = `
            <div class="card empty">
                <h3>No Applications Found</h3>
                <p>Data will appear here from backend</p>
            </div>`;
            return;
        }

        // future backend rendering
    }

    // INSPECTIONS
    if (type === "Inspections") {

        if (inspections.length === 0) {
            content.innerHTML = `
            <div class="card empty">
                <h3>No Inspections Scheduled</h3>
            </div>`;
            return;
        }
    }

    // FOLLOW UPS
    if (type === "Follow-ups") {

        if (followups.length === 0) {
            content.innerHTML = `
            <div class="card empty">
                <h3>No Follow-ups</h3>
            </div>`;
            return;
        }
    }

    // APPROVE
    if (type === "Approve") {

        if (applications.length === 0) {
            content.innerHTML = `
            <div class="card empty">
                <h3>No Applications to Approve</h3>
            </div>`;
            return;
        }
    }

    // NOC
    if (type === "NOC") {

        if (nocs.length === 0) {
            content.innerHTML = `
            <div class="card empty">
                <h3>No NOC Issued Yet</h3>
            </div>`;
            return;
        }
    }
}

// Submit (frontend only placeholder)
function submitApp() {
    alert("Will connect to backend later");
}