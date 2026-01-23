// ==========================================================
// ENTERPRISE SCHOOL ERP - COORDINATOR DYNAMIC NOTICE BOARD
// Version: 8.7 | Role: Coordinator | Action: Delete Removed
// ==========================================================

const IMGBB_KEY = 'b33ef9ccbcde8a00fa17a8d1913fad7c';
let tempNoticeImages = [];
let foundationData = {}; 
let allNotices = []; 
let currentBranchName = ""; 

/**
 * MAIN RENDER FUNCTION
 */
window.render_notice = async function(user) {
    const mainContent = document.getElementById('main-content');
    
    // 1. Fetch Foundation Data
    const snap = await db.ref('foundation').once('value');
    foundationData = snap.val() || {};

    // 2. Extract Branch Name
    const userBranchId = App.state.user.branch; 
    const branchInfo = foundationData.branches ? foundationData.branches[userBranchId] : null;
    currentBranchName = branchInfo ? branchInfo.name : userBranchId; 

    const noticeStyles = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            
            :root {
                --primary: #4318FF;
                --primary-light: #F4F7FE;
                --important: #EE5D50;
                --success: #01B574;
                --bg: #F4F7FE;
                --text-main: #1B254B;
                --text-sec: #707EAE;
                --white: #FFFFFF;
                --border: #E9EDF7;
            }

            .erp-notice-panel { 
                background: var(--bg); min-height: 100vh; padding: 25px; 
                font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-main);
                animation: fadeIn 0.5s ease;
            }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            .header-module { 
                background: var(--white); border-radius: 20px; padding: 25px;
                margin-bottom: 25px; box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.03);
                border: 1px solid var(--white);
            }
            
            .header-top { 
                display: flex; justify-content: space-between; align-items: center; 
                margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 15px;
            }
            .header-top h1 { font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }

            .filter-row { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
            
            .filter-item {
                flex: 1; min-width: 180px; height: 48px;
                background: var(--primary-light); border: 1px solid var(--border);
                border-radius: 14px; display: flex; align-items: center; padding: 0 15px; gap: 10px;
            }
            .filter-item select, .filter-item input {
                border: none; background: transparent; width: 100%; font-weight: 700;
                font-size: 13px; color: var(--text-main); outline: none; cursor: pointer;
            }

            .btn-create {
                background: var(--primary); color: white; padding: 12px 24px; border-radius: 14px;
                font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px;
                transition: 0.3s; box-shadow: 0 6px 18px rgba(67, 24, 255, 0.25); font-size: 14px;
            }

            .notice-stream { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 950px; margin: 0 auto; }
            
            .notice-card { 
                background: var(--white); border-radius: 28px; padding: 30px; border: 1px solid var(--border);
                position: relative; transition: 0.4s; box-shadow: 0 4px 12px rgba(0,0,0,0.02);
            }
            .notice-card.is-pinned { 
                border: 2px solid var(--primary); background: linear-gradient(135deg, #fff 90%, #f6f4ff 100%);
            }

            .pin-badge {
                position: absolute; top: 20px; right: 25px; background: var(--primary);
                color: white; padding: 5px 14px; border-radius: 20px;
                font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 5px;
            }

            .tag-row { display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; }
            .tag { padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .tag-gen { background: var(--primary-light); color: var(--primary); }
            .tag-imp { background: #FFEEF0; color: var(--important); }
            .tag-branch { background: #E6FAF5; color: var(--success); }

            .notice-title { font-size: 22px; font-weight: 800; margin-bottom: 10px; color: var(--text-main); }
            .notice-content { font-size: 15px; color: var(--text-sec); line-height: 1.7; margin-bottom: 20px; white-space: pre-line; }

            .img-container { display: flex; gap: 12px; overflow-x: auto; margin-bottom: 20px; padding-bottom: 10px; }
            .img-container img { width: 180px; height: 120px; object-fit: cover; border-radius: 18px; border: 1px solid var(--border); }

            .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 20px; }
            .sender-info { display: flex; align-items: center; gap: 12px; }
            .avatar-small { 
                width: 44px; height: 44px; background: var(--primary); color: white; 
                border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800;
            }
            
            .sender-det b { font-size: 14px; display: block; }
            .sender-det span { font-size: 12px; color: var(--text-sec); }
            .desig-label { background: var(--primary-light); color: var(--primary); font-size: 10px; padding: 2px 8px; border-radius: 6px; margin-right: 5px; }

            .swal-v3-container { text-align: left; }
            .field-label { font-size: 12px; font-weight: 800; color: var(--text-sec); text-transform: uppercase; margin: 15px 0 8px 0; display: block; }
            .input-v3 { width: 100%; padding: 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--primary-light); font-weight: 600; font-size: 14px; outline: none; }
            .locked-field { background: #f0f2f9 !important; cursor: not-allowed; color: #94a3b8; }
            
            .upload-wrapper { position: relative; width: 85px; height: 85px; border-radius: 15px; overflow: hidden; border: 1px solid var(--border); }
            .upload-wrapper img { width: 100%; height: 100%; object-fit: cover; }
            .upload-delete { position: absolute; top: 2px; right: 2px; background: var(--important); color: white; border-radius: 5px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 12px; }
            .hidden { display: none !important; }
        </style>
    `;

    mainContent.innerHTML = noticeStyles + `
        <div class="erp-notice-panel">
            <div class="header-module">
                <div class="header-top">
                    <div>
                        <h1>Notice Board</h1>
                    </div>
                    <button onclick="openNoticeModal()" class="btn-create">
                        <i data-lucide="plus-circle" style="width:20px"></i> Create Notice
                    </button>
                </div>
                
                <div class="filter-row">
                    <div class="filter-item">
                        <i data-lucide="calendar" style="width:18px; color:var(--primary)"></i>
                        <input type="date" id="dateFilter" onchange="applyFilters()">
                    </div>

                    <div class="filter-item locked-field">
                        <i data-lucide="map-pin" style="width:18px; color:var(--primary)"></i>
                        <select disabled>
                            <option>${currentBranchName}</option>
                        </select>
                    </div>
                </div>
            </div>

            <div id="notice-feed" class="notice-stream"></div>
        </div>
    `;

    initNoticeListener();
    lucide.createIcons();
};

/**
 * FETCH & FILTER
 */
function initNoticeListener() {
    db.ref('notices').on('value', snap => {
        allNotices = [];
        snap.forEach(child => {
            const val = child.val();
            if(val.branch === 'ALL' || val.branch === currentBranchName) {
                allNotices.push({ id: child.key, ...val });
            }
        });
        applyFilters();
    });
}

window.applyFilters = function() {
    const dateVal = document.getElementById('dateFilter').value;
    
    let filtered = allNotices.filter(n => {
        let matchesDate = true;
        if(dateVal) {
            const nDate = new Date(n.timestamp).toISOString().split('T')[0];
            matchesDate = (nDate === dateVal);
        }
        return matchesDate;
    });

    filtered.sort((a, b) => (b.pinned - a.pinned) || (b.timestamp - a.timestamp));
    renderFeed(filtered);
};

function renderFeed(data) {
    const feed = document.getElementById('notice-feed');
    if(!data.length) {
        feed.innerHTML = `<div style="text-align:center; padding:50px; background:white; border-radius:20px;">No broadcast found for ${currentBranchName}</div>`;
        return;
    }

    feed.innerHTML = data.map(n => {
        return `
            <div class="notice-card ${n.pinned ? 'is-pinned' : ''}">
                ${n.pinned ? `<div class="pin-badge"><i data-lucide="pin" style="width:12px"></i> PINNED</div>` : ''}
                
                <div class="tag-row">
                    <span class="tag ${n.priority === 'IMPORTANT' ? 'tag-imp' : 'tag-gen'}">${n.priority}</span>
                    <span class="tag tag-branch">${n.branch === 'ALL' ? 'GLOBAL' : n.branch} ${n.class !== 'ALL' ? '• '+n.class : ''}</span>
                </div>

                <h2 class="notice-title">${n.title}</h2>
                <p class="notice-content">${n.msg}</p>

                ${n.images ? `
                    <div class="img-container">
                        ${n.images.map(img => `<img src="${img}" onclick="window.open('${img}')">`).join('')}
                    </div>
                ` : ''}

                <div class="card-footer">
                    <div class="sender-info">
                        <div class="avatar-small">${n.sender.charAt(0)}</div>
                        <div class="sender-det">
                            <b><span class="desig-label">${n.designation || 'Staff'}</span> ${n.sender}</b>
                            <span>${n.fullTime}</span>
                        </div>
                    </div>
                    </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

/**
 * MODAL SYSTEM
 */
window.openNoticeModal = async function() {
    tempNoticeImages = [];
    const branchClasses = Object.values(foundationData.classes || {}).filter(c => c.branch === currentBranchName);

    const { value: form } = await Swal.fire({
        title: 'New Broadcast',
        width: '650px',
        confirmButtonText: 'Publish Now',
        confirmButtonColor: '#4318FF',
        showCancelButton: true,
        html: `
            <div class="swal-v3-container">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px">
                    <div>
                        <label class="field-label">Origin Branch</label>
                        <input type="text" class="input-v3 locked-field" value="${currentBranchName}" readonly>
                    </div>
                    <div>
                        <label class="field-label">Target Audience</label>
                        <select id="sw-target" class="input-v3">
                            <option value="BOTH">Students & Staff</option>
                            <option value="STUDENT">Students Only</option>
                            <option value="STAFF">Staff Only</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px">
                    <div>
                        <label class="field-label">Priority</label>
                        <select id="sw-priority" class="input-v3">
                            <option value="GENERAL">General</option>
                            <option value="IMPORTANT">Important</option>
                        </select>
                    </div>
                    <div>
                        <label class="field-label">Target Class</label>
                        <select id="sw-class" class="input-v3" onchange="loadSectionsV7(this.value)">
                            <option value="ALL">All Classes</option>
                            ${branchClasses.map(c => `<option value="${c.className}">${c.className}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div id="section-row" class="hidden">
                    <label class="field-label">Select Section</label>
                    <select id="sw-section" class="input-v3"></select>
                </div>

                <label class="field-label">Headline</label>
                <input type="text" id="sw-title" class="input-v3" placeholder="Title of the notice">

                <label class="field-label">Content</label>
                <textarea id="sw-msg" class="input-v3" style="height:100px" placeholder="Type message..."></textarea>

                <label class="field-label">Attachments</label>
                <div style="border: 2px dashed #E9EDF7; padding:20px; border-radius:15px; text-align:center">
                    <input type="file" id="sw-files" class="hidden" multiple onchange="handleUploadV7(this)">
                    <button onclick="document.getElementById('sw-files').click()" style="background:var(--primary-light); color:var(--primary); border:none; padding:8px 15px; border-radius:10px; font-weight:700; cursor:pointer">
                        <i data-lucide="image" style="width:16px; vertical-align:middle"></i> Add Images
                    </button>
                    <div id="sw-preview" style="display:flex; gap:10px; margin-top:15px; flex-wrap:wrap; justify-content:center"></div>
                </div>
            </div>
        `,
        preConfirm: () => {
            const title = document.getElementById('sw-title').value;
            const msg = document.getElementById('sw-msg').value;
            if(!title || !msg) return Swal.showValidationMessage('Title and Message required');
            return {
                title, msg,
                branch: currentBranchName,
                class: document.getElementById('sw-class').value,
                section: document.getElementById('sw-section')?.value || 'ALL',
                target: document.getElementById('sw-target').value,
                priority: document.getElementById('sw-priority').value,
                images: tempNoticeImages,
                pinned: false,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('en-GB'),
                fullTime: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
                sender: App.state.user.name,
                designation: "Coordinator"
            };
        }
    });

    if(form) {
        await db.ref('notices').push(form);
        Swal.fire({ icon: 'success', title: 'Broadcasted!', timer: 1500, showConfirmButton: false });
    }
};

window.loadSectionsV7 = function(className) {
    const row = document.getElementById('section-row');
    const sel = document.getElementById('sw-section');
    if(className === 'ALL') return row.classList.add('hidden');
    
    row.classList.remove('hidden');
    const classData = Object.values(foundationData.classes).find(c => c.className === className && c.branch === currentBranchName);
    if(classData) {
        sel.innerHTML = `<option value="ALL">All Sections</option>` + 
                        classData.sections.split(',').map(s => `<option value="${s.trim()}">${s.trim()}</option>`).join('');
    }
};

window.handleUploadV7 = function(input) {
    const preview = document.getElementById('sw-preview');
    Array.from(input.files).forEach(file => {
        const id = 'img_' + Math.random().toString(36).substr(2, 5);
        const div = document.createElement('div');
        div.className = "upload-wrapper"; div.id = id;
        div.innerHTML = `<div style="padding:20px; font-size:10px">Uploading...</div>`;
        preview.appendChild(div);

        const fd = new FormData(); fd.append('image', file);
        fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, { method: 'POST', body: fd })
            .then(r => r.json()).then(res => {
                if(res.success) {
                    tempNoticeImages.push(res.data.url);
                    div.innerHTML = `<img src="${res.data.url}"><div class="upload-delete" onclick="this.parentElement.remove()">×</div>`;
                }
            });
    });
};