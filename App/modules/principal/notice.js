// ==========================================================
// ENTERPRISE SCHOOL ERP - DYNAMIC BROADCAST SYSTEM (FINAL)
// ==========================================================

const IMGBB_KEY = 'b33ef9ccbcde8a00fa17a8d1913fad7c';
let tempNoticeImages = [];
let foundationData = {}; 
let allNotices = []; 

window.render_notice = async function(user) {
    const mainContent = document.getElementById('main-content');
    
    // Load foundation data for branches/classes
    const snap = await db.ref('foundation').once('value');
    foundationData = snap.val() || {};

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
            }
            
            .header-module { 
                background: var(--white); border-radius: 20px; padding: 20px;
                margin-bottom: 25px; box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.03);
            }
            
            .header-top { 
                display: flex; justify-content: space-between; align-items: center; 
                margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 15px;
            }
            .header-top h1 { font-size: 24px; font-weight: 800; margin: 0; color: var(--text-main); }

            .filter-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
            
            .search-box { flex: 2; min-width: 200px; }
            .search-box input {
                width: 100%; padding: 12px 15px; border-radius: 12px;
                border: 1px solid var(--border); background: var(--primary-light); 
                font-weight: 600; font-size: 14px; transition: 0.3s;
            }
            .search-box input:focus { border-color: var(--primary); background: #fff; outline: none; }

            .filter-item {
                flex: 1; min-width: 160px; height: 45px;
                background: var(--primary-light); border: 1px solid var(--border);
                border-radius: 12px; display: flex; align-items: center; padding: 0 12px; gap: 8px;
            }
            .filter-item select, .filter-item input {
                border: none; background: transparent; width: 100%; font-weight: 700;
                font-size: 13px; color: var(--text-main); outline: none; cursor: pointer;
            }

            .btn-create {
                background: var(--primary); color: white; padding: 10px 20px; border-radius: 12px;
                font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px;
                transition: 0.3s; box-shadow: 0 4px 14px rgba(67, 24, 255, 0.25); font-size: 14px;
            }

            .notice-stream { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 900px; margin: 0 auto; }
            
            .notice-card { 
                background: var(--white); border-radius: 24px; padding: 25px; border: 1px solid var(--border);
                position: relative; transition: 0.3s ease;
            }
            .notice-card.is-pinned { 
                border: 2px solid var(--primary); background: linear-gradient(135deg, #fff 80%, #f6f4ff 100%);
            }

            .pin-badge {
                position: absolute; top: 15px; right: 20px; background: var(--primary);
                color: white; padding: 4px 12px; border-radius: 20px;
                font-size: 10px; font-weight: 800; display: flex; align-items: center; gap: 4px;
            }

            .tag-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
            .tag { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
            .tag-gen { background: var(--primary-light); color: var(--primary); }
            .tag-imp { background: #FFEEF0; color: var(--important); }
            .tag-branch { background: #E6FAF5; color: var(--success); }
            .tag-staff { background: #E9E3FF; color: #5E35B1; }

            .notice-title { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: var(--text-main); }
            .notice-content { font-size: 14px; color: var(--text-sec); line-height: 1.6; margin-bottom: 18px; }

            .img-container { display: flex; gap: 10px; overflow-x: auto; margin-bottom: 15px; padding-bottom: 5px; }
            .img-container img { width: 140px; height: 90px; object-fit: cover; border-radius: 12px; cursor: zoom-in; }

            .card-footer { 
                display: flex; justify-content: space-between; align-items: center;
                padding-top: 15px; border-top: 1px solid var(--border);
            }
            .sender-info { display: flex; align-items: center; gap: 10px; }
            .avatar-small { width: 35px; height: 35px; background: var(--primary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; }
            
            .sender-det b { font-size: 13px; display: block; }
            .sender-det span { font-size: 11px; color: var(--text-sec); }
            .sender-det .desig-label { color: var(--primary); font-size: 10px; margin-right: 4px; border: 1px solid var(--primary); padding: 1px 4px; border-radius: 4px; }

            .action-btns { display: flex; gap: 8px; }
            .btn-circle { width: 38px; height: 38px; border-radius: 10px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
            .btn-pin { background: var(--primary-light); color: var(--text-sec); }
            .btn-pin.active { background: var(--primary); color: white; }
            .btn-del { background: #FFEEF0; color: var(--important); }

            /* Image Upload with Progress & Delete */
            .upload-wrapper { position: relative; width: 65px; height: 65px; background: #f0f0f0; border-radius: 10px; margin-top: 5px; }
            .upload-wrapper img { width: 100%; height: 100%; object-fit: cover; border-radius: 10px; }
            .upload-delete { position: absolute; top: -6px; right: -6px; background: var(--important); color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10; }
            .upload-progress-container { position: absolute; bottom: 0; left: 0; width: 100%; height: 5px; background: rgba(0,0,0,0.1); border-radius: 0 0 10px 10px; overflow: hidden; }
            .upload-progress-bar { height: 100%; background: var(--success); width: 0%; transition: 0.2s; }

            .swal-v3-container { text-align: left; padding: 10px; }
            .field-label { font-size: 11px; font-weight: 800; color: var(--text-sec); text-transform: uppercase; margin: 12px 0 6px 0; }
            .input-v3 { width: 100%; padding: 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--primary-light); font-weight: 600; font-size: 13px; outline: none; }
        </style>
    `;

    mainContent.innerHTML = noticeStyles + `
        <div class="erp-notice-panel">
            <div class="header-module">
                <div class="header-top">
                    <h1>Notice Board</h1>
                    <button onclick="openNoticeModal()" class="btn-create">
                        <i data-lucide="plus" style="width:18px"></i> Create Notice
                    </button>
                </div>
                
                <div class="filter-row">
                    <div class="search-box">
                        <input type="text" id="noticeSearch" placeholder="Search headline, sender or message..." oninput="applyFilters()">
                    </div>
                    
                    <div class="filter-item">
                        <i data-lucide="calendar" style="width:16px; color:var(--primary)"></i>
                        <input type="date" id="dateFilter" onchange="applyFilters()">
                    </div>

                    <div class="filter-item">
                        <i data-lucide="layers" style="width:16px; color:var(--primary)"></i>
                        <select id="branchFilter" onchange="applyFilters()">
                            <option value="ALL">All Branches</option>
                            ${Object.values(foundationData.branches || {}).map(b => `<option value="${b.name}">${b.name}</option>`).join('')}
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

function initNoticeListener() {
    db.ref('notices').on('value', snap => {
        allNotices = [];
        snap.forEach(child => {
            allNotices.push({ id: child.key, ...child.val() });
        });
        applyFilters();
    });
}

window.applyFilters = function() {
    const searchTerm = document.getElementById('noticeSearch').value.toLowerCase();
    const dateVal = document.getElementById('dateFilter').value;
    const branchVal = document.getElementById('branchFilter').value;
    
    let filtered = allNotices.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchTerm) || n.msg.toLowerCase().includes(searchTerm) || n.sender.toLowerCase().includes(searchTerm);
        const matchesBranch = branchVal === 'ALL' || n.branch === branchVal || n.branch === 'ALL';
        let matchesDate = true;
        if(dateVal) {
            const noticeDate = new Date(n.timestamp).toISOString().split('T')[0];
            matchesDate = (noticeDate === dateVal);
        }
        return matchesSearch && matchesBranch && matchesDate;
    });

    // Pinned sorting (pinned first, then date)
    filtered.sort((a, b) => (b.pinned - a.pinned) || (b.timestamp - a.timestamp));
    renderFeed(filtered);
};

function renderFeed(data) {
    const feed = document.getElementById('notice-feed');
    if(data.length === 0) {
        feed.innerHTML = `<div style="background:white; padding:40px; border-radius:20px; text-align:center; border: 2px dashed var(--border)"><p style="color:var(--text-sec); font-weight:700">No notices found.</p></div>`;
        return;
    }

    feed.innerHTML = data.map(n => {
        const initial = n.sender ? n.sender.charAt(0) : 'P';
        
        // Final Dynamic Pin Rule: Only Global (ALL) or Branch-wide (ALL Classes) can be pinned
        const canPin = (n.branch === 'ALL' || (n.branch !== 'ALL' && n.class === 'ALL'));

        // Dynamic Label Rendering
        let scopeLabel = n.branch === 'ALL' ? 'GLOBAL' : n.branch;
        if (n.class !== 'ALL' && n.class) scopeLabel += ` • Class ${n.class}`;
        if (n.section !== 'ALL' && n.section) scopeLabel += ` (${n.section})`;

        return `
            <div class="notice-card ${n.pinned ? 'is-pinned' : ''}">
                ${n.pinned ? `<div class="pin-badge"><i data-lucide="pin" style="width:12px"></i> PINNED</div>` : ''}
                
                <div class="tag-row">
                    <span class="tag ${n.priority === 'IMPORTANT' ? 'tag-imp' : 'tag-gen'}">${n.priority}</span>
                    <span class="tag tag-branch">${scopeLabel}</span>
                    ${n.target === 'STAFF' ? `<span class="tag tag-staff">STAFF ONLY</span>` : ''}
                    ${n.target === 'BOTH' ? `<span class="tag tag-staff">STAFF & STUDENT</span>` : ''}
                </div>

                <h2 class="notice-title">${n.title}</h2>
                <p class="notice-content">${n.msg}</p>

                ${n.images?.length ? `
                    <div class="img-container">
                        ${n.images.map(img => `<img src="${img}" onclick="previewImg('${img}')">`).join('')}
                    </div>
                ` : ''}

                <div class="card-footer">
                    <div class="sender-info">
                        <div class="avatar-small">${initial}</div>
                        <div class="sender-det">
                            <b><span class="desig-label">${n.designation || 'Principal'}</span> ${n.sender}</b>
                            <span>${n.fullTime || n.date}</span>
                        </div>
                    </div>
                    
                    <div class="action-btns">
                        ${canPin ? `
                            <button onclick="togglePin('${n.id}', ${n.pinned})" class="btn-circle btn-pin ${n.pinned ? 'active' : ''}" title="Pin to top">
                                <i data-lucide="pin" style="width:18px"></i>
                            </button>
                        ` : ''}
                        <button onclick="deleteNotice('${n.id}')" class="btn-circle btn-del" title="Delete Notice">
                            <i data-lucide="trash-2" style="width:18px"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

window.togglePin = (id, cur) => db.ref('notices').child(id).update({ pinned: !cur });
window.deleteNotice = (id) => Swal.fire({ title: 'Delete Notice?', text: 'This notice will be permanently removed.', icon: 'warning', showCancelButton:true, confirmButtonColor: '#EE5D50' }).then(r => r.isConfirmed && db.ref('notices').child(id).remove());
window.previewImg = (u) => Swal.fire({ imageUrl: u, showConfirmButton: false });

window.openNoticeModal = async function() {
    tempNoticeImages = [];
    let branchOptions = `<option value="ALL">Global (All Branches)</option>`;
    Object.values(foundationData.branches || {}).forEach(b => {
        branchOptions += `<option value="${b.name}">${b.name}</option>`;
    });

    const { value: form } = await Swal.fire({
        title: 'New Broadcast',
        width: '600px',
        confirmButtonText: 'Publish Now',
        confirmButtonColor: '#4318FF',
        customClass: { popup: 'rounded-[25px]', confirmButton: 'rounded-xl px-8 py-3' },
        html: `
            <div class="swal-v3-container">
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px">
                    <div>
                        <label class="field-label">Target Audience</label>
                        <select id="sw-target" class="input-v3" onchange="syncFieldsV4()">
                            <option value="STUDENT">Students Only</option>
                            <option value="STAFF">Employees Only</option>
                            <option value="BOTH">All (Staff & Students)</option>
                        </select>
                    </div>
                    <div>
                        <label class="field-label">Target Branch</label>
                        <select id="sw-branch" class="input-v3" onchange="syncFieldsV4()">${branchOptions}</select>
                    </div>
                </div>

                <div id="v3-sub-filters" style="display:none; grid-template-columns: 1fr 1fr; gap:15px">
                    <div>
                        <label class="field-label">Class</label>
                        <select id="sw-class" class="input-v3" onchange="loadSectionsV4(this.value)"></select>
                    </div>
                    <div>
                        <label class="field-label">Section</label>
                        <select id="sw-section" class="input-v3"></select>
                    </div>
                </div>

                <div style="margin-top:10px">
                    <label class="field-label">Priority</label>
                    <select id="sw-priority" class="input-v3">
                        <option value="GENERAL">General</option>
                        <option value="IMPORTANT">Important</option>
                    </select>
                </div>

                <label class="field-label">Notice Headline</label>
                <input type="text" id="sw-title" class="input-v3" placeholder="E.g. Summer Vacation Start">

                <label class="field-label">Message Details</label>
                <textarea id="sw-msg" class="input-v3" style="height:110px" placeholder="Write full notice here..."></textarea>

                <label class="field-label">Attachments</label>
                <div style="border: 2px dashed var(--border); border-radius:15px; padding:15px; text-align:center; background: #fff">
                    <input type="file" id="sw-files" class="hidden" multiple onchange="handleUploadV4(this)">
                    <button onclick="document.getElementById('sw-files').click()" style="background:var(--primary-light); color:var(--primary); border:none; padding:8px 15px; border-radius:8px; font-weight:700; cursor:pointer">
                        Add Photos
                    </button>
                    <div id="sw-preview" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:12px"></div>
                </div>
            </div>
        `,
        preConfirm: () => {
            const data = {
                target: document.getElementById('sw-target').value,
                branch: document.getElementById('sw-branch').value,
                class: document.getElementById('sw-class')?.value || 'ALL',
                section: document.getElementById('sw-section')?.value || 'ALL',
                priority: document.getElementById('sw-priority').value,
                title: document.getElementById('sw-title').value,
                msg: document.getElementById('sw-msg').value,
                images: tempNoticeImages,
                pinned: false,
                timestamp: Date.now(),
                date: new Date().toLocaleDateString('en-GB'),
                fullTime: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
                sender: App.state.user.name || "Principal",
                designation: "Principal" 
            };
            if(!data.title || !data.msg) return Swal.showValidationMessage('Headline and Message are required');
            return data;
        }
    });

    if(form) {
        await db.ref('notices').push(form);
        Swal.fire({ icon: 'success', title: 'Notice Published', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }
};

window.syncFieldsV4 = function() {
    const target = document.getElementById('sw-target').value;
    const branch = document.getElementById('sw-branch').value;
    const subFilters = document.getElementById('v3-sub-filters');

    // Logic: No sub-filters for Staff or Global Branch
    if(target === 'STAFF' || branch === 'ALL') {
        subFilters.style.display = 'none';
    } else {
        subFilters.style.display = 'grid';
        loadClassesV4(branch);
    }
};

window.loadClassesV4 = function(branch) {
    let html = '<option value="ALL">All Classes (Global in Branch)</option>';
    Object.values(foundationData.classes || {}).forEach(c => {
        if(c.branch === branch) html += `<option value="${c.className}">${c.className}</option>`;
    });
    const clsSel = document.getElementById('sw-class');
    if(clsSel) {
        clsSel.innerHTML = html;
        loadSectionsV4('ALL');
    }
};

window.loadSectionsV4 = function(className) {
    const secSel = document.getElementById('sw-section');
    if(!secSel) return;
    const branch = document.getElementById('sw-branch').value;
    if(className === 'ALL') { 
        secSel.innerHTML = '<option value="ALL">All Sections (Global in Class)</option>'; 
        return; 
    }
    let html = '<option value="ALL">All Sections (Global in Class)</option>';
    Object.values(foundationData.classes || {}).forEach(c => {
        if(c.className === className && c.branch === branch) {
            c.sections.split(',').forEach(s => html += `<option value="${s.trim()}">${s.trim()}</option>`);
        }
    });
    secSel.innerHTML = html;
};

window.handleUploadV4 = function(input) {
    const preview = document.getElementById('sw-preview');
    Array.from(input.files).forEach(file => {
        const id = 'up_' + Math.random().toString(36).substr(2, 5);
        const div = document.createElement('div');
        div.className = "upload-wrapper";
        div.id = id;
        div.innerHTML = `<div class="upload-progress-container"><div class="upload-progress-bar" id="bar_${id}"></div></div>`;
        preview.appendChild(div);

        const fd = new FormData(); fd.append('image', file);
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, true);
        
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const pct = (e.loaded / e.total) * 100;
                const bar = document.getElementById(`bar_${id}`);
                if(bar) bar.style.width = pct + '%';
            }
        };

        xhr.onload = function() {
            const res = JSON.parse(this.responseText);
            if(res.success) {
                const imgUrl = res.data.url;
                tempNoticeImages.push(imgUrl);
                div.innerHTML = `
                    <img src="${imgUrl}">
                    <div class="upload-delete" onclick="removeImgV4('${id}', '${imgUrl}')">×</div>
                `;
            } else { div.remove(); }
        };
        xhr.send(fd);
    });
};

window.removeImgV4 = (divId, url) => {
    tempNoticeImages = tempNoticeImages.filter(i => i !== url);
    const el = document.getElementById(divId);
    if(el) el.remove();
};