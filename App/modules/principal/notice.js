window.noticeCurrentUploadXHRs = window.noticeCurrentUploadXHRs || {};
window.noticeTempImages = window.noticeTempImages || [];
window.foundationData = window.foundationData || {};
window.allNotices = window.allNotices || [];
window.noticeListenerRefs = window.noticeListenerRefs || [];

window.render_notice = async function(user) {
    await ensureFoundationData();
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    mainContent.innerHTML = window.noticeStyles + window.noticeHTML;
    initNoticeListener();
};

async function ensureFoundationData() {
    if (Object.keys(foundationData).length === 0) {
        const snap = await db.ref('foundation').once('value');
        foundationData = snap.exists() ? snap.val() : {};
    }
}

window.noticeStyles = window.noticeStyles || `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        :root {
            --primary: #4318FF; --primary-light: #F4F7FE; --important: #EE5D50;
            --success: #01B574; --bg: #F4F7FE; --text-main: #1B254B;
            --text-sec: #707EAE; --white: #FFFFFF; --border: #E9EDF7;
            --shadow: 0px 10px 30px rgba(67, 24, 255, 0.08);
        }
        .erp-notice-panel { 
            background: var(--bg); min-height: 100vh; padding: 16px;
            padding-top: 40px;
            font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text-main);
            box-sizing: border-box;
        }
        .header-module { 
            background: var(--white); border-radius: 24px; padding: 16px; 
            margin-bottom: 16px; box-shadow: var(--shadow);
        }
        .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .header-top h1 { font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
        .search-box input { 
            width: 100%; padding: 14px 18px; border-radius: 16px; border: 1px solid var(--border); 
            background: var(--primary-light); font-weight: 600; outline: none; font-size: 14px;
            box-sizing: border-box;
        }
        .btn-create { 
            background: var(--primary); color: white; padding: 10px 18px; border-radius: 14px; 
            font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; 
            gap: 8px; font-size: 14px;
        }
        .notice-stream { display: flex; flex-direction: column; gap: 16px; }
        .notice-card { 
            background: var(--white); border-radius: 24px; padding: 20px; 
            border: 1px solid var(--border); position: relative;
            box-shadow: 0 2px 12px rgba(0,0,0,0.02);
        }
        .notice-card.is-pinned { border: 2px solid var(--primary); background: linear-gradient(to bottom right, #fff, #f9faff); }
        .pin-badge { 
            position: absolute; top: -10px; left: 20px; background: var(--primary); 
            color: white; padding: 4px 12px; border-radius: 10px; font-size: 10px; 
            font-weight: 800; box-shadow: 0 4px 8px rgba(67, 24, 255, 0.3);
        }
        .tag-row { display: flex; gap: 6px; margin-bottom: 12px; flex-wrap: wrap; }
        .tag { padding: 5px 10px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .tag-gen { background: var(--primary-light); color: var(--primary); }
        .tag-imp { background: #FFEEF0; color: var(--important); }
        .tag-branch { background: #E6FAF5; color: var(--success); }
        .tag-audience { background: #F4F7FE; color: #1B254B; border: 1px solid var(--border); }
        .notice-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; color: var(--text-main); line-height: 1.3; }
        .notice-content { 
            font-size: 14px; color: var(--text-sec); line-height: 1.6; margin-bottom: 16px; 
            white-space: pre-wrap; word-break: break-word;
        }
        .attachment-grid { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); 
            gap: 10px; margin-bottom: 16px; 
        }
        .download-item { 
            position: relative; aspect-ratio: 1/1; border-radius: 14px; overflow: hidden; 
            border: 1px solid var(--border); cursor: pointer; display: flex; 
            align-items: center; justify-content: center; background: #f8f9ff; 
        }
        .download-item img { width: 100%; height: 100%; object-fit: cover; }
        .card-footer { 
            display: flex; justify-content: space-between; align-items: center; padding-top: 14px; 
            border-top: 1px solid var(--border); 
        }
        .sender-info { display: flex; align-items: center; gap: 10px; }
        .avatar-small { 
            width: 38px; height: 38px; background: linear-gradient(135deg, var(--primary), #6e4dff); 
            color: white; border-radius: 12px; display: flex; align-items: center; 
            justify-content: center; font-weight: 800; font-size: 14px; 
        }
        .sender-det b { font-size: 13px; display: block; line-height: 1.2; color: var(--text-main); }
        .sender-det span { font-size: 11px; color: var(--text-sec); display: block; }
        .action-btns { display: flex; gap: 8px; }
        .btn-circle { 
            width: 36px; height: 36px; border-radius: 12px; border: none; 
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: 0.2s;
        }
        .btn-pin { background: var(--primary-light); color: var(--text-sec); }
        .btn-pin.active { background: var(--primary); color: white; }
        .btn-del { background: #FFEEF0; color: var(--important); }
        .btn-circle:active { transform: scale(0.9); }

        .notice-form-container { 
            background: var(--white); border-radius: 28px; padding: 20px; 
            margin-bottom: 20px; box-shadow: var(--shadow); display: none;
            border: 1px solid var(--border);
        }
        .notice-form-container.active { display: block; }
        .form-group { margin-bottom: 18px; }
        .label-text { font-size: 11px; font-weight: 800; color: var(--text-sec); margin-bottom: 8px; display: block; text-transform: uppercase; }
        .input-field { 
            width: 100%; padding: 14px; border-radius: 14px; border: 1px solid var(--border);
            background: var(--primary-light); font-size: 15px; font-weight: 600; color: var(--text-main);
            box-sizing: border-box; outline: none;
        }
        .row-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .upload-box { border: 2px dashed var(--border); background: var(--primary-light); padding: 20px; border-radius: 16px; text-align: center; }
        .upload-btn { background: var(--white); border: 1px solid var(--border); padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; color: var(--primary); }
        .form-actions { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-top: 24px; }
        .btn-publish { background: var(--primary); color: white; padding: 16px; border-radius: 16px; font-weight: 800; border: none; font-size: 15px; }
        .btn-cancel { background: #f1f3f7; color: var(--text-sec); padding: 16px; border-radius: 16px; font-weight: 700; border: none; }
    </style>`;

window.noticeHTML = window.noticeHTML || `
    <div class="erp-notice-panel">
        <div class="header-module">
            <div class="header-top">
                <h1>Notice Board</h1>
                <button onclick="toggleNoticeForm()" class="btn-create" id="create-notice-btn">
                    <i data-lucide="plus"></i> New
                </button>
            </div>
            <div class="search-box">
                <input type="text" id="noticeSearch" placeholder="Search notices..." oninput="applyFilters()">
            </div>
        </div>
        
        <div id="notice-form-section" class="notice-form-container">
            <div class="row-grid form-group">
                <div>
                    <label class="label-text">Branch</label>
                    <select id="sw-branch" class="input-field" onchange="syncFieldsV4()">
                        <option value="ALL">All Branches</option>
                    </select>
                </div>
                <div>
                    <label class="label-text">Audience</label>
                    <select id="sw-target" class="input-field" onchange="syncFieldsV4()">
                        <option value="ALL">Everyone</option>
                        <option value="STAFF">Staff</option>
                        <option value="STUDENTS">Students</option>
                    </select>
                </div>
            </div>
            <div id="v3-sub-filters" class="row-grid form-group" style="display:none;">
                <div>
                    <label class="label-text">Class</label>
                    <select id="sw-class" class="input-field" onchange="loadSectionsV4(this.value)"></select>
                </div>
                <div>
                    <label class="label-text">Section</label>
                    <select id="sw-section" class="input-field"></select>
                </div>
            </div>
            <div class="form-group">
                <label class="label-text">Priority</label>
                <select id="sw-priority" class="input-field">
                    <option value="GENERAL">General</option>
                    <option value="IMPORTANT">Important</option>
                </select>
            </div>
            <div class="form-group">
                <label class="label-text">Title</label>
                <input type="text" id="sw-title" class="input-field" placeholder="Notice Headline">
            </div>
            <div class="form-group">
                <label class="label-text">Message</label>
                <textarea id="sw-msg" class="input-field" style="height:150px; resize:none;" placeholder="Write message here..."></textarea>
            </div>
            <div class="form-group">
                <label class="label-text">Attachments</label>
                <div class="upload-box">
                    <input type="file" id="sw-files" multiple accept="image/*,application/pdf" style="display:none" onchange="handleImageUpload(this)">
                    <button type="button" onclick="document.getElementById('sw-files').click()" class="upload-btn">Add Files</button>
                    <div id="upload-status-box"></div>
                </div>
            </div>
            <div class="form-actions">
                <button onclick="cancelNoticeForm()" class="btn-cancel">Discard</button>
                <button onclick="publishNotice()" class="btn-publish">Post</button>
            </div>
        </div>
        
        <div id="notice-feed" class="notice-stream"></div>
    </div>`;


window.toggleNoticeForm = function() {
    const formSection = document.getElementById('notice-form-section');
    const createBtn = document.getElementById('create-notice-btn');
    const feed = document.getElementById('notice-feed');
    
    if (formSection.classList.contains('active')) {
        formSection.classList.remove('active');
        createBtn.innerHTML = '<i data-lucide="plus"></i> New';
        feed.style.display = 'flex';
    } else {
        formSection.classList.add('active');
        createBtn.innerHTML = '<i data-lucide="x"></i> Close';
        feed.style.display = 'none';
        window.noticeTempImages = [];
        window.noticeCurrentUploadXHRs = {};
        document.getElementById('upload-status-box').innerHTML = '';
        populateFormFields();
    }
    lucide.createIcons();
};

window.cancelNoticeForm = function() {
    toggleNoticeForm();
    resetFormFields();
};

window.populateFormFields = function() {
    const branchSel = document.getElementById('sw-branch');
    branchSel.innerHTML = '<option value="ALL">All</option>' + 
        Object.values(foundationData.branches || {}).map(b => `<option value="${b.name}">${b.name}</option>`).join('');
    
    syncFieldsV4();
};

window.resetFormFields = function() {
    document.getElementById('sw-title').value = '';
    document.getElementById('sw-msg').value = '';
    document.getElementById('sw-priority').value = 'GENERAL';
    document.getElementById('sw-branch').value = 'ALL';
    document.getElementById('sw-target').value = 'ALL';
    document.getElementById('sw-class').value = 'ALL';
    document.getElementById('sw-section').value = 'ALL';
    document.getElementById('upload-status-box').innerHTML = '';
    window.noticeTempImages = [];
    window.noticeCurrentUploadXHRs = {};
};

window.publishNotice = async function() {
    const data = {
        branch: document.getElementById('sw-branch').value,
        target: document.getElementById('sw-target').value,
        class: document.getElementById('sw-class')?.value || 'ALL',
        section: document.getElementById('sw-section')?.value || 'ALL',
        priority: document.getElementById('sw-priority').value,
        title: document.getElementById('sw-title').value,
        msg: document.getElementById('sw-msg').value,
        images: window.noticeTempImages,
        pinned: false,
        timestamp: Date.now(),
        fullTime: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
        sender: App?.state?.user?.name || "Admin",
        designation: App?.state?.user?.designation || "Admin"
    };
    
    if (!data.title?.trim() || !data.msg?.trim()) {
        Swal.fire('Error', 'Title and message are required!', 'error');
        return;
    }
    if (Object.keys(window.noticeCurrentUploadXHRs).length > 0) {
        Swal.fire('Wait', 'Please wait for uploads to complete!', 'warning');
        return;
    }
    
    await db.ref('notices').push(data);
    Swal.mixin({ toast: true, position: 'top', showConfirmButton: false, timer: 2000 }).fire({ 
        icon: 'success', title: 'Notice Published!' 
    });
    toggleNoticeForm();
    resetFormFields();
};

function initNoticeListener() {
    noticeListenerRefs.forEach(({ref, eventType, callback}) => ref.off(eventType, callback));
    noticeListenerRefs = [];

    const noticeRef = db.ref('notices');
    const query = noticeRef.orderByChild('timestamp').limitToLast(30);
    allNotices = [];

    const addedCallback = snap => {
        const notice = { id: snap.key, ...snap.val() };
        if (!allNotices.find(n => n.id === notice.id)) {
            allNotices.push(notice);
            applyFilters();
        }
    };
    query.on('child_added', addedCallback);
    noticeListenerRefs.push({ ref: query, eventType: 'child_added', callback: addedCallback });

    const removedCallback = snap => {
        allNotices = allNotices.filter(n => n.id !== snap.key);
        applyFilters();
    };
    noticeRef.on('child_removed', removedCallback);
    noticeListenerRefs.push({ ref: noticeRef, eventType: 'child_removed', callback: removedCallback });

    const changedCallback = snap => {
        const index = allNotices.findIndex(n => n.id === snap.key);
        if (index > -1) {
            allNotices[index] = { id: snap.key, ...snap.val() };
            applyFilters();
        }
    };
    noticeRef.on('child_changed', changedCallback);
    noticeListenerRefs.push({ ref: noticeRef, eventType: 'child_changed', callback: changedCallback });
}

window.applyFilters = function() {
    const searchTerm = (document.getElementById('noticeSearch')?.value || "").toLowerCase();
    let filtered = allNotices.filter(n => 
        (n.title?.toLowerCase().includes(searchTerm)) || 
        (n.msg?.toLowerCase().includes(searchTerm))
    );
    filtered.sort((a, b) => (b.pinned - a.pinned) || (b.timestamp - a.timestamp));
    renderFeed(filtered);
};

window.downloadFile = function(url, filename) {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
        window.location.href = url;
    } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

function renderFeed(data) {
    const feed = document.getElementById('notice-feed');
    if (!feed) return;
    if (!data.length) {
        feed.innerHTML = `<div style="text-align:center; padding:40px;">No records found</div>`;
        return;
    }
    feed.innerHTML = data.map(n => createNoticeCard(n)).join('');
    lucide.createIcons();
}

function createNoticeCard(n) {
    const attachmentsHTML = (n.images || []).map((url, index) => {
        const isPDF = url.toLowerCase().includes('.pdf');
        const fileName = `${(n.title || 'notice').replace(/\s+/g, '_')}_${index + 1}${isPDF ? '.pdf' : '.jpg'}`;
        return `
            <div class="download-item" onclick="downloadFile('${url}', '${fileName}')">
                ${isPDF ? `
                    <div class="pdf-box"><i data-lucide="file-text" style="width:30px; height:30px"></i><br>PDF</div>
                ` : `
                    <img src="${url}">
                `}
            </div>`;
    }).join('');

    let scopeLabel = n.branch;
    if (n.class && n.class !== 'ALL') scopeLabel += ` • ${n.class}`;
    if (n.section && n.section !== 'ALL') scopeLabel += ` (${n.section})`;

    return `
        <div class="notice-card ${n.pinned ? 'is-pinned' : ''}">
            ${n.pinned ? `<div class="pin-badge">PINNED</div>` : ''}
            <div class="tag-row">
                <span class="tag ${n.priority === 'IMPORTANT' ? 'tag-imp' : 'tag-gen'}">${n.priority}</span>
                <span class="tag tag-branch">${scopeLabel}</span>
                <span class="tag tag-audience">${n.target || 'ALL'}</span>
            </div>
            <h2 class="notice-title">${n.title}</h2>
            <p class="notice-content">${n.msg}</p>
            <div class="attachment-grid">${attachmentsHTML}</div>
            <div class="card-footer">
                <div class="sender-info">
                    <div class="avatar-small">${(n.sender || 'A').charAt(0)}</div>
                    <div class="sender-det">
                        <b>${n.sender || 'Admin'}</b>
                        <span style="font-weight:700; color:var(--primary)">${n.designation || 'Staff'}</span>
                        <span>${n.fullTime}</span>
                    </div>
                </div>
                <div class="action-btns">
                    <button onclick="togglePin('${n.id}', ${n.pinned})" class="btn-circle btn-pin ${n.pinned ? 'active' : ''}">
                        <i data-lucide="pin" style="width:16px"></i>
                    </button>
                    <button onclick="deleteNotice('${n.id}')" class="btn-circle btn-del">
                        <i data-lucide="trash-2" style="width:16px"></i>
                    </button>
                </div>
            </div>
        </div>`;
}

window.togglePin = (id, cur) => db.ref('notices').child(id).update({ pinned: !cur });
window.deleteNotice = (id) => Swal.fire({ title: 'Delete?', icon: 'warning', showCancelButton: true }).then(r => r.isConfirmed && db.ref('notices').child(id).remove());

window.syncFieldsV4 = function() {
    const target = document.getElementById('sw-target')?.value;
    const subFilters = document.getElementById('v3-sub-filters');
    if (target === 'STUDENTS') {
        subFilters.style.display = 'grid';
        loadClassesV4(document.getElementById('sw-branch')?.value);
    } else {
        subFilters.style.display = 'none';
    }
};

window.loadClassesV4 = function(branch) {
    let html = '<option value="ALL">All</option>';
    let uniqueClasses = new Set();
    
    Object.values(foundationData.classes || {}).forEach(c => { 
        if (branch === 'ALL' || c.branch === branch) {
            uniqueClasses.add(c.className);
        }
    });
    
    Array.from(uniqueClasses).sort().forEach(cls => {
        html += `<option value="${cls}">${cls}</option>`;
    });

    const clsSel = document.getElementById('sw-class');
    if (clsSel) {
        clsSel.innerHTML = html;
        loadSectionsV4('ALL');
    }
};

window.loadSectionsV4 = function(className) {
    const secSel = document.getElementById('sw-section');
    const branch = document.getElementById('sw-branch')?.value;
    if (!secSel) return;
    if (className === 'ALL') { 
        secSel.innerHTML = '<option value="ALL">All</option>'; 
        return; 
    }
    
    let html = '<option value="ALL">All</option>';
    let uniqueSections = new Set();

    Object.values(foundationData.classes || {}).forEach(c => {
        if (c.className === className && (branch === 'ALL' || c.branch === branch)) {
            c.sections.split(',').forEach(s => uniqueSections.add(s.trim()));
        }
    });

    Array.from(uniqueSections).sort().forEach(s => html += `<option value="${s}">${s}</option>`);
    secSel.innerHTML = html;
};

window.handleImageUpload = function(input) {
    const container = document.getElementById('upload-status-box');
    Array.from(input.files).forEach(file => {
        const upId = 'up-' + Math.random().toString(36).substr(2, 9);

        const now = new Date();
        const mmm = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][now.getMonth()];
        const yyyy = now.getFullYear();
        const rand4 = Math.floor(1000 + Math.random() * 9000);
        const newBaseName = `NOTE-${mmm}-${yyyy}-${rand4}`;

        const extension = file.name.includes('.') ? file.name.split('.').pop() : '';
        const finalFileName = extension ? `${newBaseName}.${extension}` : newBaseName;
        const renamedFile = new File([file], finalFileName, { type: file.type });

        const row = document.createElement('div');
        row.id = upId; 
        row.className = 'upload-status-item';
        row.innerHTML = `<div class="prog-container"><div class="prog-fill" id="fill-${upId}"></div></div><span id="status-${upId}" style="font-size:10px">0%</span>`;
        container.appendChild(row);

        const xhr = new XMLHttpRequest();
        window.noticeCurrentUploadXHRs[upId] = xhr;
        
        const fd = new FormData();
        fd.append('file', renamedFile);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, true);
        
        xhr.upload.onprogress = e => {
            const pc = Math.round((e.loaded / e.total) * 100);
            const fillEl = document.getElementById(`fill-${upId}`);
            const statusEl = document.getElementById(`status-${upId}`);
            if (fillEl) fillEl.style.width = pc + '%';
            if (statusEl) statusEl.textContent = pc + '%';
        };

        xhr.onload = () => {
            try {
                const res = JSON.parse(xhr.responseText);
                if (res.secure_url) {
                    window.noticeTempImages.push(res.secure_url);
                    const rowEl = document.getElementById(upId);
                    if (rowEl) {
                        rowEl.innerHTML = `<span style="color:var(--success); font-size:11px; font-weight:700">✓ ${finalFileName}</span><button onclick="removeImgV4('${upId}', '${res.secure_url}')" style="margin-left:auto; border:none; background:none; color:red; font-weight:800">×</button>`;
                    }
                }
            } catch (e) {}
            delete window.noticeCurrentUploadXHRs[upId];
        };
        xhr.send(fd);
    });
};

window.removeImgV4 = (divId, url) => {
    window.noticeTempImages = window.noticeTempImages.filter(i => i !== url);
    const el = document.getElementById(divId);
    if (el) el.remove();
};

function resetNoticeModule() {
    noticeListenerRefs.forEach(({ref, eventType, callback}) => ref.off(eventType, callback));
    window.noticeTempImages = [];
    window.allNotices = [];
    allNotices = [];
    Object.values(window.noticeCurrentUploadXHRs).forEach(xhr => xhr.abort());
    window.noticeCurrentUploadXHRs = {};
}