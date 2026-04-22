        /* =========================================
           JS: utils.js (Helpers)
           ========================================= */
        const Utils = {
            generateId: () => Math.random().toString(36).substr(2, 9),
            
            showToast: (message, type = 'info') => {
                const container = document.getElementById('toast-container');
                const toast = document.createElement('div');
                toast.className = 'toast';
                let icon = type === 'success' ? '<i class="fa-solid fa-check-circle" style="color:#4caf50"></i>' : 
                           type === 'error' ? '<i class="fa-solid fa-exclamation-circle" style="color:#f44336"></i>' : 
                           '<i class="fa-solid fa-info-circle"></i>';
                toast.innerHTML = `${icon} <span>${message}</span>`;
                container.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            },

            formatDate: (dateString) => {
                const options = { year: 'numeric', month: 'short', day: 'numeric' };
                return new Date(dateString).toLocaleDateString(undefined, options);
            },

            openModal: (modalId) => {
                document.getElementById(modalId).classList.add('active');
            },

            closeModal: (modalId) => {
                document.getElementById(modalId).classList.remove('active');
            }
        };

        /* =========================================
           JS: auth.js (Authentication & Roles)
           ========================================= */
        const Auth = {
            currentUser: null,

            login: (role) => {
                // Simulate Login
                if (role === 'user') {
                    Auth.currentUser = { name: 'Rahul Sharma', role: 'user', id: 'USR001' };
                } else if (role === 'inspector') {
                    Auth.currentUser = { name: 'Officer R. Singh', role: 'inspector', id: 'INS001' };
                } else if (role === 'admin') {
                    Auth.currentUser = { name: 'Chief Fire Officer', role: 'admin', id: 'ADM001' };
                }

                Utils.showToast(`Welcome back, ${Auth.currentUser.name}`, 'success');
                App.initDashboard();
            },

            logout: () => {
                Auth.currentUser = null;
                document.getElementById('dashboard-app').style.display = 'none';
                App.showLanding();
                Utils.showToast('Logged out successfully');
            }
        };

        /* =========================================
           JS: main.js (Data & Logic)
           ========================================= */
        
        // Initial Dummy Data
        const DataManager = {
            getApplications: () => {
                const data = localStorage.getItem('fireNocData');
                return data ? JSON.parse(data) : initialData;
            },

            saveApplication: (newApp) => {
                const apps = DataManager.getApplications();
                apps.unshift(newApp); // Add to top
                localStorage.setItem('fireNocData', JSON.stringify(apps));
                return apps;
            },

            updateApplication: (updatedApp) => {
                let apps = DataManager.getApplications();
                apps = apps.map(app => app.id === updatedApp.id ? updatedApp : app);
                localStorage.setItem('fireNocData', JSON.stringify(apps));
                return apps;
            }
        };

        /* =========================================
           JS: dashboard.js (Render Logic)
           ========================================= */
        const Dashboard = {
            renderMenu: () => {
                const menu = document.getElementById('sidebar-menu');
                const role = Auth.currentUser.role;
                let html = '';

                if (role === 'user') {
                    html = `
                        <li><a href="#" class="active" onclick="User.renderHome()"><i class="fa-solid fa-home"></i> Dashboard</a></li>
                        <li><a href="#" onclick="User.renderMyApplications()"><i class="fa-solid fa-file-alt"></i> My Applications</a></li>
                    `;
                } else if (role === 'inspector') {
                    html = `
                        <li><a href="#" class="active" onclick="Inspector.renderHome()"><i class="fa-solid fa-clipboard-list"></i> Tasks</a></li>
                        <li><a href="#" onclick="Inspector.renderHistory()"><i class="fa-solid fa-history"></i> History</a></li>
                    `;
                } else if (role === 'admin') {
                    html = `
                        <li><a href="#" class="active" onclick="Admin.renderHome()"><i class="fa-solid fa-chart-pie"></i> Overview</a></li>
                        <li><a href="#" onclick="Admin.renderAllApps()"><i class="fa-solid fa-database"></i> All Applications</a></li>
                        <li><a href="#" onclick="Admin.renderNocIssuance()"><i class="fa-solid fa-stamp"></i> NOC Issuance</a></li>
                    `;
                }
                menu.innerHTML = html;
            },

            renderHeader: () => {
                document.getElementById('user-name-display').innerText = Auth.currentUser.name;
                document.getElementById('user-avatar-display').innerText = Auth.currentUser.name.charAt(0);
            }
        };

        /* =========================================
           JS: User Functions
           ========================================= */
        const User = {
            renderHome: () => {
                Dashboard.renderHeader();
                document.getElementById('page-title').innerText = 'User Dashboard';
                
                const apps = DataManager.getApplications().filter(a => a.userId === Auth.currentUser.id);
                const pending = apps.filter(a => a.status === 'Pending' || a.status === 'Follow-up Required').length;
                const approved = apps.filter(a => a.status === 'Approved').length;

                const content = document.getElementById('dynamic-content');
                content.innerHTML = `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>${apps.length}</h3>
                                <p>Total Applications</p>
                            </div>
                            <i class="fa-solid fa-folder stat-icon"></i>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>${pending}</h3>
                                <p>Action Required</p>
                            </div>
                            <i class="fa-solid fa-exclamation-triangle stat-icon" style="color: orange;"></i>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <h3>${approved}</h3>
                                <p>NOC Issued</p>
                            </div>
                            <i class="fa-solid fa-check-circle stat-icon" style="color: green;"></i>
                        </div>
                    </div>

                    <div class="card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h3>Quick Action</h3>
                            <button class="btn btn-primary" onclick="Utils.openModal('modal-new-app')"><i class="fa-solid fa-plus"></i> Apply for NOC</button>
                        </div>
                        <p>Apply for a new Fire NOC for your residential, commercial, or industrial property.</p>
                    </div>

                    <div class="card">
                        <h3>Recent Status</h3>
                        ${User.getTableHtml(apps.slice(0, 5))}
                    </div>
                `;
            },

            renderMyApplications: () => {
                Dashboard.renderHeader();
                document.getElementById('page-title').innerText = 'My Applications';
                const apps = DataManager.getApplications().filter(a => a.userId === Auth.currentUser.id);
                
                document.getElementById('dynamic-content').innerHTML = `
                    <div class="card">
                        <h3>All Applications</h3>
                        ${User.getTableHtml(apps)}
                    </div>
                `;
            },

            getTableHtml: (apps) => {
                if(apps.length === 0) return '<p style="text-align:center; color:#888; margin-top:20px;">No applications found.</p>';
                
                const rows = apps.map(app => `
                    <tr>
                        <td>${app.id}</td>
                        <td>${app.buildingName}</td>
                        <td>${Utils.formatDate(app.date)}</td>
                        <td><span class="badge ${User.getBadgeClass(app.status)}">${app.status}</span></td>
                    </tr>
                `).join('');

                return `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>App ID</th>
                                    <th>Building Name</th>
                                    <th>Submission Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `;
            },

            getBadgeClass: (status) => {
                if(status === 'Pending') return 'badge-pending';
                if(status === 'Under Inspection') return 'badge-inspection';
                if(status === 'Follow-up Required') return 'badge-followup';
                if(status === 'Approved') return 'badge-approved';
                return 'badge-rejected';
            },

            submitApplication: (e) => {
                e.preventDefault();
                const form = e.target;
                const newApp = {
                    id: 'APP' + Math.floor(Math.random() * 10000),
                    userId: Auth.currentUser.id,
                    buildingName: form.buildingName.value,
                    propertyType: form.propertyType.value,
                    address: form.address.value,
                    date: new Date().toISOString(),
                    status: 'Pending',
                    remarks: '',
                    followUpReason: ''
                };
                
                DataManager.saveApplication(newApp);
                Utils.showToast('Application Submitted Successfully', 'success');
                Utils.closeModal('modal-new-app');
                form.reset();
                User.renderHome();
            }
        };

        /* =========================================
           JS: Inspection Logic
           ========================================= */
        const Inspector = {
            renderHome: () => {
                Dashboard.renderHeader();
                document.getElementById('page-title').innerText = 'Inspection Tasks';
                
                const apps = DataManager.getApplications();
                // Filter for tasks: Pending or Follow-up
                const tasks = apps.filter(a => a.status === 'Pending' || a.status === 'Follow-up Required' || a.status === 'Under Inspection');

                document.getElementById('dynamic-content').innerHTML = `
                    <div class="card">
                        <h3>Pending Inspections & Follow-ups</h3>
                        ${Inspector.getTableHtml(tasks)}
                    </div>
                `;
            },

            renderHistory: () => {
                Dashboard.renderHeader();
                document.getElementById('page-title').innerText = 'Inspection History';
                const apps = DataManager.getApplications().filter(a => a.status === 'Approved');
                
                document.getElementById('dynamic-content').innerHTML = `
                    <div class="card">
                        <h3>Closed Inspections</h3>
                        ${Inspector.getTableHtml(apps, true)}
                    </div>
                `;
            },

            getTableHtml: (apps, isHistory = false) => {
                if(apps.length === 0) return '<p style="text-align:center; color:#888; margin-top:20px;">No tasks assigned.</p>';
                
                const rows = apps.map(app => `
                    <tr>
                        <td>${app.id}</td>
                        <td>${app.buildingName}<br><small style="color:#888">${app.address}</small></td>
                        <td>${app.status}</td>
                        <td>
                            ${!isHistory ? `<button class="btn btn-primary btn-sm" onclick="Inspector.openInspectModal('${app.id}')">
                                ${app.status === 'Follow-up Required' ? 'Verify Follow-up' : 'Inspect'}
                            </button>` : `<span class="badge badge-approved">Completed</span>`}
                        </td>
                    </tr>
                `).join('');

                return `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Property</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `;
            },

            openInspectModal: (id) => {
                document.getElementById('inspect-appId').value = id;
                Utils.openModal('modal-inspection');
            },

            toggleFollowUp: (select) => {
                const group = document.getElementById('followup-reason-group');
                if(select.value === 'Follow-up Required') {
                    group.style.display = 'block';
                } else {
                    group.style.display = 'none';
                }
            },

            submitReport: (e) => {
                e.preventDefault();
                const form = e.target;
                const id = form.appId.value;
                const apps = DataManager.getApplications();
                const appIndex = apps.findIndex(a => a.id === id);

                if(appIndex > -1) {
                    const newStatus = form.status.value;
                    apps[appIndex].status = newStatus === 'Follow-up Required' ? 'Follow-up Required' : 'Under Admin Review';
                    apps[appIndex].remarks = form.remarks.value;
                    if(newStatus === 'Follow-up Required') {
                        apps[appIndex].followUpReason = form.followupReason.value;
                    } else {
                        apps[appIndex].followUpReason = '';
                    }

                    DataManager.updateApplication(apps[appIndex]);
                    Utils.showToast('Inspection Report Submitted', 'success');
                    Utils.closeModal('modal-inspection');
                    Inspector.renderHome();
                }
            }
        };

        /* =========================================
           JS: NOC / Admin Logic
           ========================================= */
        const Admin = {
            renderHome: () => {
                Dashboard.renderHeader();
                document.getElementById('page-title').innerText = 'Admin Overview';
                
                const apps = DataManager.getApplications();
                const pending = apps.filter(a => a.status === 'Under Admin Review').length;
                const issued = apps.filter(a => a.status === 'Approved').length;
                const total = apps.length;

                document.getElementById('dynamic-content').innerHTML = `
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-info"><h3>${total}</h3><p>Total Applications</p></div>
                            <i class="fa-solid fa-file-contract stat-icon"></i>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info"><h3>${pending}</h3><p>Pending Final Approval</p></div>
                            <i class="fa-solid fa-hourglass-half stat-icon"></i>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info"><h3>${issued}</h3><p>NOCs Issued</p></div>
                            <i class="fa-solid fa-certificate stat-icon"></i>
                        </div>
                    </div>
                    <div class="card">
                        <h3>System Statistics</h3>
                        <p style="margin-top:10px;">The FireNOCTracker system is functioning normally. Real-time data synchronization active.</p>
                    </div>
                `;
            },

            renderAllApps: () => {
                Dashboard.renderHeader();
                document.getElementById('page-title').innerText = 'All Applications Database';
                const apps = DataManager.getApplications();
                
                document.getElementById('dynamic-content').innerHTML = `
                    <div class="card">
                        <h3>Master List</h3>
                        ${Admin.getTableHtml(apps)}
                    </div>
                `;
            },

            renderNocIssuance: () => {
                Dashboard.renderHeader();
                document.getElementById('page-title').innerText = 'NOC Issuance';
                // Filter apps ready for NOC (Under Admin Review)
                const apps = DataManager.getApplications().filter(a => a.status === 'Under Admin Review');
                
                document.getElementById('dynamic-content').innerHTML = `
                    <div class="card">
                        <h3>Ready for Issuance</h3>
                        ${Admin.getTableHtml(apps, true)}
                    </div>
                `;
            },

            getTableHtml: (apps, actions = false) => {
                if(apps.length === 0) return '<p style="text-align:center; color:#888; margin-top:20px;">No records found.</p>';
                
                const rows = apps.map(app => `
                    <tr>
                        <td>${app.id}</td>
                        <td>${app.buildingName}</td>
                        <td>${app.remarks || '-'}</td>
                        <td><span class="badge ${User.getBadgeClass(app.status)}">${app.status}</span></td>
                        ${actions ? `
                        <td>
                            <button class="btn btn-success btn-sm" style="background:${varCss('success')}; color:#fff;" onclick="Admin.issueNOC('${app.id}')">
                                Issue NOC
                            </button>
                        </td>` : '<td></td>'}
                    </tr>
                `).join('');

                return `
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Property</th>
                                    <th>Inspector Remarks</th>
                                    <th>Status</th>
                                    ${actions ? '<th>Action</th>' : ''}
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                `;
            },

            issueNOC: (id) => {
                const apps = DataManager.getApplications();
                const app = apps.find(a => a.id === id);
                if(app) {
                    app.status = 'Approved';
                    DataManager.updateApplication(app);
                    Utils.showToast(`NOC Issued for ${app.buildingName}`, 'success');
                    Admin.renderNocIssuance();
                }
            }
        };

        function varCss(name) {
            return getComputedStyle(document.documentElement).getPropertyValue('--'+name).trim();
        }

        /* =========================================
           JS: app.js (Initialization & Routing)
           ========================================= */
        const App = {
            init: () => {
                // Check local storage
                if(!localStorage.getItem('fireNocData')) {
                    localStorage.setItem('fireNocData', JSON.stringify(initialData));
                }
                
                // Event Listeners
                document.getElementById('form-new-app').addEventListener('submit', User.submitApplication);
                document.getElementById('form-inspection').addEventListener('submit', Inspector.submitReport);
                
                // Start at Landing Page
                App.showLanding();
            },

            showLanding: () => {
                document.getElementById('landing-page').style.display = 'flex';
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('dashboard-app').style.display = 'none';
            },

            showLogin: () => {
                document.getElementById('landing-page').style.display = 'none';
                document.getElementById('login-page').style.display = 'flex';
                document.getElementById('dashboard-app').style.display = 'none';
            },

            initDashboard: () => {
                document.getElementById('login-page').style.display = 'none';
                const dashboard = document.getElementById('dashboard-app');
                dashboard.style.display = 'block';
                
                Dashboard.renderMenu();
                
                // Route to home based on role
                if(Auth.currentUser.role === 'user') User.renderHome();
                else if(Auth.currentUser.role === 'inspector') Inspector.renderHome();
                else if(Auth.currentUser.role === 'admin') Admin.renderHome();
            }
        };

        // Start App
        document.addEventListener('DOMContentLoaded', App.init);

    