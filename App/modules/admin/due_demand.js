(function () {
    const moduleContainer = document.getElementById('main-content');
    let RAW_DATA = [];
    let FOUNDATION = {};
    const MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const SESSION = "2025-26"; 

    const calculateDetailedFees = (student, selMonthName) => {
        const sessionStartYear = parseInt(SESSION.split('-')[0]);
        const sessionStartDate = new Date(sessionStartYear, 3, 1);
        const admDateRaw = student.admission?.admissionDate;
        const admissionDate = admDateRaw ? new Date(admDateRaw) : sessionStartDate;
        
        const isRTE = student.admission?.type === "RTE" || student.admission?.type === "FREE";
        const isNewAdmission = admissionDate >= sessionStartDate;
        
        const selMonthIdx = MONTHS.indexOf(selMonthName);
        const targetDate = new Date(sessionStartYear + (selMonthIdx > 8 ? 1 : 0), (selMonthIdx + 3) % 12, 1);

        let bStart = new Date(admissionDate.getFullYear(), admissionDate.getMonth(), 1);
        if (admissionDate.getDate() > 15) {
            bStart.setMonth(bStart.getMonth() + 1);
        }

        if (bStart < sessionStartDate) bStart = sessionStartDate;

        let billingMonths = 0;
        if (targetDate >= bStart) {
            billingMonths = (targetDate.getFullYear() - bStart.getFullYear()) * 12 + (targetDate.getMonth() - bStart.getMonth()) + 1;
        }

        const feeMaster = FOUNDATION.fee_master?.[SESSION] || {};
        const studentClass = student.academic?.class;
        let totalBilled = 0;

        if (!isRTE && studentClass) {
            Object.entries(feeMaster).forEach(([headKey, config]) => {
                const rate = parseFloat(config.amounts?.[studentClass] || 0);
                
                if (config.rotation === "Monthly") {
                    totalBilled += (rate * billingMonths);
                } else {
                    if (isNewAdmission) {
                        totalBilled += rate;
                    }
                }
            });
        }

        if (student.transport?.enabled && student.transport?.route) {
            const transportMaster = FOUNDATION.transport_master?.[SESSION]?.amounts || {};
            const routeObj = Object.entries(FOUNDATION.transport || {}).find(([_, v]) => v.groupName === student.transport.route);
            
            if (routeObj) {
                const tRate = parseFloat(transportMaster[routeObj[0]] || 0);
                totalBilled += (tRate * billingMonths);
            }
        }

        const openingBalance = parseFloat(student.ledger?.openingBalance || 0);
        totalBilled += openingBalance; 

        return totalBilled;
    };

    const render = async () => {
        moduleContainer.innerHTML = `
            <div class="bg-slate-50 min-h-screen pb-28 pt-4">
                <div class="px-4">
                    <div class="bg-indigo-900 rounded-[2rem] p-5 mb-4 shadow-xl shadow-indigo-100">
                        <p class="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-3 ml-2">Quick Folio Search</p>
                        <div class="relative">
                            <input type="number" id="globalFolioInput" placeholder="Enter Folio Number" 
                                class="w-full bg-white/10 border border-white/20 rounded-2xl px-5 py-4 text-white placeholder:text-indigo-300 outline-none focus:ring-2 focus:ring-white/50 font-bold text-sm transition-all">
                            <button id="btnGlobalSearch" class="absolute right-2 top-2 bottom-2 bg-white text-indigo-900 px-4 rounded-xl font-black text-[10px] active:scale-95 transition-all">
                                SEARCH
                            </button>
                        </div>
                    </div>

                    <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-5 mb-6">
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <select id="mobBranch" class="bg-slate-100 border-none rounded-xl px-4 py-3 text-[11px] font-bold outline-none">
                                <option value="">Select Branch</option>
                            </select>
                            <select id="mobClass" class="bg-slate-100 border-none rounded-xl px-4 py-3 text-[11px] font-bold outline-none">
                                <option value="">Select Class</option>
                            </select>
                            <select id="mobSection" class="bg-slate-100 border-none rounded-xl px-4 py-3 text-[11px] font-bold outline-none">
                                <option value="">Select Section</option>
                            </select>
                            <select id="mobMonth" class="bg-slate-100 border-none rounded-xl px-4 py-3 text-[11px] font-bold outline-none"></select>
                        </div>
                        <div class="flex gap-2">
                            <button id="btnLoad" class="flex-[2] bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-xs">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i> LOAD
                            </button>
                            <select id="mobStatus" class="flex-1 bg-slate-800 text-white border-none rounded-2xl px-2 py-3 text-[10px] font-bold outline-none text-center">
                                <option value="All">ALL</option>
                                <option value="DUE">DUE</option>
                                <option value="PAID">PAID</option>
                            </select>
                        </div>
                    </div>

                    <div id="searchWrapper" class="hidden mb-4">
                        <input type="text" id="mobInnerSearch" placeholder="Filter by name..." 
                            class="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm font-medium">
                    </div>

                    <div id="ledger-list" class="space-y-3">
                        <div class="text-center py-20">
                            <i data-lucide="search" class="w-12 h-12 text-slate-200 mx-auto mb-3"></i>
                            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Enter filters or Folio</p>
                        </div>
                    </div>
                </div>
            </div>`;

        await setupFoundation();
        if (window.lucide) lucide.createIcons();

        document.getElementById('btnLoad').addEventListener('click', () => fetchData(false));
        document.getElementById('btnGlobalSearch').addEventListener('click', () => fetchData(true));
        document.getElementById('mobStatus').addEventListener('change', applyFilters);
        document.getElementById('mobInnerSearch').addEventListener('input', applyFilters);
    };

    const setupFoundation = async () => {
        const fSnap = await db.ref('foundation').once('value');
        FOUNDATION = fSnap.val() || {};

        const branchSel = document.getElementById('mobBranch');
        const classSel = document.getElementById('mobClass');
        const secSel = document.getElementById('mobSection');
        const monthSel = document.getElementById('mobMonth');

        if (FOUNDATION.branches) {
            Object.values(FOUNDATION.branches).forEach(b => branchSel.add(new Option(b.name, b.name)));
        }

        branchSel.addEventListener('change', () => {
            classSel.innerHTML = '<option value="">Select Class</option>';
            if (FOUNDATION.classes) {
                const filtered = Object.values(FOUNDATION.classes).filter(c => c.branch === branchSel.value);
                const unique = [...new Set(filtered.map(c => c.className))];
                unique.forEach(c => classSel.add(new Option(c, c)));
            }
        });

        classSel.addEventListener('change', () => {
            secSel.innerHTML = '<option value="">Select Section</option>';
            const classData = Object.values(FOUNDATION.classes).find(c => c.branch === branchSel.value && c.className === classSel.value);
            if (classData && classData.sections) {
                classData.sections.split(',').forEach(s => secSel.add(new Option(s.trim(), s.trim())));
            }
        });

        MONTHS.forEach(m => monthSel.add(new Option(m, m)));
        monthSel.value = MONTHS[new Date().getMonth()];
    };

    const fetchData = async (isGlobal = false) => {
        const branch = document.getElementById('mobBranch').value;
        const className = document.getElementById('mobClass').value;
        const section = document.getElementById('mobSection').value;
        const selMonth = document.getElementById('mobMonth').value;
        const folioInput = document.getElementById('globalFolioInput');
        const globalFolio = folioInput.value.trim();

        if (!isGlobal && (!branch || !className || !section)) {
            alert("Select all filters");
            return;
        }
        if (isGlobal && !globalFolio) {
            alert("Enter Folio");
            return;
        }

        const btn = isGlobal ? document.getElementById('btnGlobalSearch') : document.getElementById('btnLoad');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerText = "WAIT...";

        try {
            let sRef = db.ref('student');
            let sSnap;
            
            if (isGlobal) {
                sSnap = await sRef.child(globalFolio).once('value');
            } else {
                sSnap = await sRef.orderByChild('academic/session').equalTo(SESSION).once('value');
            }

            const rSnap = await db.ref('fee_receipts').orderByChild('session').equalTo(SESSION).once('value');
            const receipts = Object.values(rSnap.val() || {});

            let studentList = [];
            if (isGlobal) {
                if (sSnap.exists()) {
                    studentList.push([globalFolio, sSnap.val()]);
                    folioInput.value = ''; 
                }
            } else {
                studentList = Object.entries(sSnap.val() || {}).filter(([_, s]) => 
                    s.academic?.branch === branch && s.academic?.class === className && s.academic?.section === section
                );
            }

            RAW_DATA = studentList.map(([folio, s]) => {
                const totalBilled = calculateDetailedFees(s, selMonth);

                const studentReceipts = receipts.filter(r => r.studentFolio === folio);
                const paidAmount = studentReceipts.reduce((sum, r) => sum + parseFloat(r.totalCollected || 0), 0);
                const discountAmount = studentReceipts.reduce((sum, r) => sum + parseFloat(r.discount || 0), 0);
                
                const finalDue = totalBilled - discountAmount - paidAmount;

                return {
                    folio,
                    name: s.profile?.studentName || "N/A",
                    father: s.parents?.father?.name || "N/A",
                    phone: s.contact?.phone1 || "",
                    class: s.academic?.class || "",
                    section: s.academic?.section || "",
                    finalDue: finalDue > 0 ? finalDue : 0
                };
            });

            document.getElementById('searchWrapper').classList.toggle('hidden', isGlobal);
            applyFilters();
        } catch (e) {
            console.error(e);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalHTML;
            if (window.lucide) lucide.createIcons();
        }
    };

    const applyFilters = () => {
        const selStatus = document.getElementById('mobStatus').value;
        const search = document.getElementById('mobInnerSearch').value.toLowerCase();
        const list = document.getElementById('ledger-list');

        let html = '';

        RAW_DATA.forEach(s => {
            const matchesSearch = s.name.toLowerCase().includes(search) || s.folio.includes(search);
            const matchesStatus = selStatus === "All" || (s.finalDue > 0 ? "DUE" : "PAID") === selStatus;

            if (matchesSearch && matchesStatus) {
                html += `
                    <div class="bg-white p-4 rounded-[1.5rem] border border-slate-100 flex items-center justify-between shadow-sm">
                        <div class="flex items-center gap-3">
                            <div class="w-11 h-11 ${s.finalDue > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'} rounded-2xl flex items-center justify-center font-black text-sm border border-current border-opacity-10">
                                ${s.name.charAt(0)}
                            </div>
                            <div>
                                <h4 class="text-[11px] font-black text-slate-800 uppercase tracking-tight">${s.name}</h4>
                                <p class="text-[9px] font-bold text-slate-400">Class: ${s.class}-${s.section} | F: ${s.father}</p>
                                <p class="text-[8px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">Folio: ${s.folio}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-[8px] font-black text-slate-300 uppercase mb-1">Due</p>
                            <span class="text-xs font-black ${s.finalDue > 0 ? 'text-rose-600' : 'text-emerald-600'}">
                                ${s.finalDue > 0 ? '₹' + s.finalDue.toLocaleString('en-IN') : 'PAID'}
                            </span>
                        </div>
                    </div>`;
            }
        });

        list.innerHTML = html || `<div class="py-20 text-center text-slate-400 font-bold text-[10px]">NOT FOUND</div>`;
        if (window.lucide) lucide.createIcons();
    };

    render();
})();