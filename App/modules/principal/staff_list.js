window.render_staff_list = async function(user) {
    const mainContent = document.getElementById('main-content');
    // Ab userBranchId ka use restriction ke liye nahi, sirf UI highlighting ke liye hoga
    const userBranchId = App?.state?.user?.branch || ""; 

    // 1. Initial UI Structure (Added Branch Filter)
    mainContent.innerHTML = `
        <div class="min-h-screen bg-[#FDFDFD] pb-32 pt-6 px-6">
            <div class="mb-6 mt-2">
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-5 h-5 text-slate-400"></i>
                    </div>
                    <input type="text" id="staff-global-input" placeholder=" Search Name, ID or Phone..." 
                        class="w-full bg-slate-100 border-none rounded-[22px] py-4 pl-12 pr-24 text-slate-900 placeholder:text-slate-400 font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-sm">
                    <button onclick="handleGlobalStaffSearch()" class="absolute right-2 top-2 bg-slate-900 text-white px-5 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md">
                        Find
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-8">
                <div class="bg-white border border-slate-100 shadow-sm p-3 rounded-[24px] relative">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2">Branch</label>
                    <div class="relative">
                        <select id="filter-staff-branch" onchange="applyLocalFilter()" 
                            class="w-full bg-transparent font-bold text-slate-800 text-[11px] outline-none appearance-none cursor-pointer pr-6 z-10 relative">
                            <option value="">All Branches</option>
                        </select>
                        <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                    </div>
                </div>
                <div class="bg-white border border-slate-100 shadow-sm p-3 rounded-[24px] relative">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2">Designation</label>
                    <div class="relative">
                        <select id="filter-staff-designation" onchange="applyLocalFilter()" 
                            class="w-full bg-transparent font-bold text-slate-800 text-[11px] outline-none appearance-none cursor-pointer pr-6 z-10 relative">
                            <option value="">All Staff</option>
                        </select>
                        <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between px-2 mb-4">
                <h3 id="list-title" class="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">All Staff Directory</h3>
                <div id="staff-count" class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">0 Found</div>
            </div>

            <div id="staff-loader" class="py-20 text-center">
                <div class="inline-block w-8 h-8 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p class="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">Syncing Records...</p>
            </div>

            <div id="staff-results-list" class="space-y-5"></div>
        </div>
    `;

    let localStaffData = []; 
    let branchNamesMap = {};

    const initData = async () => {
        const container = document.getElementById('staff-results-list');
        const loader = document.getElementById('staff-loader');
        const desSelect = document.getElementById('filter-staff-designation');
        const brSelect = document.getElementById('filter-staff-branch');

        try {
            // Fetch Branches
            const configSnap = await db.ref('foundation').once('value');
            const config = configSnap.val() || {};
            const branches = config.branches || {};
            
            branchNamesMap["All"] = "Main Center";
            let branchOptions = '<option value="">All Branches</option><option value="All">Main Center</option>';

            Object.keys(branches).forEach(key => {
                branchNamesMap[key] = branches[key].name;
                branchOptions += `<option value="${key}">${branches[key].name}</option>`;
            });
            brSelect.innerHTML = branchOptions;

            // Fetch All Staff (Restriction Removed)
            const staffSnap = await db.ref('employees').once('value');
            const staffData = staffSnap.val() || {};
            localStaffData = Object.values(staffData);

            // Populate Designations
            const designations = [...new Set(localStaffData.map(e => e.designation).filter(Boolean))].sort();
            desSelect.innerHTML = '<option value="">All Designations</option>' + 
                designations.map(d => `<option value="${d}">${d}</option>`).join('');

            renderStaffCards(localStaffData);
        } catch (error) {
            console.error(error);
            container.innerHTML = `<p class="text-center text-red-500 font-bold text-xs py-10">Sync Error.</p>`;
        } finally {
            loader.classList.add('hidden');
        }
    };

    window.handleGlobalStaffSearch = async () => {
        const query = document.getElementById('staff-global-input').value.trim().toLowerCase();
        const loader = document.getElementById('staff-loader');
        const container = document.getElementById('staff-results-list');

        if (!query) {
            document.getElementById('list-title').innerText = "All Staff Directory";
            renderStaffCards(localStaffData);
            return;
        }

        container.innerHTML = '';
        loader.classList.remove('hidden');
        document.getElementById('list-title').innerText = "Search Results";

        try {
            const results = localStaffData.filter(s => 
                (s.name || "").toLowerCase().includes(query) ||
                (s.empId || "").toString().includes(query) ||
                (s.phone || "").toString().includes(query)
            );
            renderStaffCards(results);
        } catch (e) { console.error(e); }
        finally { loader.classList.add('hidden'); }
    };

    window.applyLocalFilter = () => {
        const selDes = document.getElementById('filter-staff-designation').value;
        const selBranch = document.getElementById('filter-staff-branch').value;
        
        let filtered = localStaffData;

        if (selDes !== "") {
            filtered = filtered.filter(e => e.designation === selDes);
        }
        if (selBranch !== "") {
            filtered = filtered.filter(e => e.branch === selBranch);
        }

        document.getElementById('list-title').innerText = (selDes || selBranch) ? "Filtered Staff" : "All Staff Directory";
        renderStaffCards(filtered);
    };

    const renderStaffCards = (list) => {
        const container = document.getElementById('staff-results-list');
        document.getElementById('staff-count').innerText = `${list.length} Found`;

        if (list.length === 0) {
            container.innerHTML = `<div class="text-center py-20 text-slate-300 font-bold text-[10px] uppercase">No Records Found</div>`;
            return;
        }

        container.innerHTML = list.map(s => {
            const bName = branchNamesMap[s.branch] || "Unknown Branch";
            const isMyBranch = s.branch === userBranchId;
            const statusColor = s.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600';

            return `
                <div class="bg-white border border-slate-100 rounded-[30px] p-5 shadow-sm active:scale-[0.98] transition-all">
                    <div class="flex items-start gap-4 mb-4 border-b border-slate-50 pb-4">
                        <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                            ${(s.name || 'S').charAt(0)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start">
                                <h4 class="font-black text-slate-800 text-sm truncate uppercase">${s.name || 'N/A'}</h4>
                                <div class="flex gap-1">
                                    <span class="text-[8px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md uppercase">ID: ${s.empId}</span>
                                    <span class="text-[8px] font-black ${statusColor} px-2 py-0.5 rounded-md uppercase">${s.status || 'Active'}</span>
                                </div>
                            </div>
                            <p class="text-[10px] font-bold text-slate-400 mt-0.5 tracking-tight">
                                ${s.designation} • ${s.gender} • Blood: ${s.bloodGroup || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Education</p>
                            <p class="text-[11px] font-bold text-slate-700 truncate">${s.higherQual || 'N/A'} ${s.profQual ? '('+s.profQual+')' : ''}</p>
                        </div>
                        <div>
                            <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Father/Spouse</p>
                            <p class="text-[11px] font-bold text-slate-700 truncate">${s.fatherSpouse || 'N/A'}</p>
                        </div>
                    </div>

                    <div class="bg-slate-50 rounded-2xl p-3 space-y-3">
                        <div class="flex justify-between items-center border-b border-slate-200/50 pb-2">
                            <div class="flex-1">
                                <p class="text-[8px] font-black text-slate-400 uppercase mb-0.5">Assigned Branch</p>
                                <p class="text-[10px] font-black ${isMyBranch ? 'text-indigo-600' : 'text-orange-600'} uppercase flex items-center gap-1">
                                    <i data-lucide="map-pin" class="w-3 h-3"></i> ${bName}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="text-[8px] font-black text-slate-400 uppercase mb-0.5">Contact</p>
                                <a href="tel:${s.phone}" class="text-[11px] font-black text-slate-900 flex items-center gap-1">
                                    <i data-lucide="phone" class="w-3 h-3 text-indigo-600"></i> ${s.phone}
                                </a>
                            </div>
                        </div>
                        <div>
                            <p class="text-[8px] font-black text-slate-400 uppercase mb-0.5 tracking-wider">Address</p>
                            <p class="text-[10px] font-medium text-slate-600 line-clamp-1 italic">"${s.address || 'Not Available'}"</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        if (window.lucide) lucide.createIcons();
    };

    initData();
    if (window.lucide) lucide.createIcons();
};