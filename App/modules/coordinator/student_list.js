window.render_student_list = async function(user) {
    const mainContent = document.getElementById('main-content');
    const branchId = App.state.user.branch; 

    const configSnap = await db.ref('foundation').once('value');
    const config = configSnap.val() || {};
    const branchName = config.branches?.[branchId]?.name || "";
    const branchClassesConfig = Object.values(config.classes || {}).filter(c => c.branch === branchName);

    mainContent.innerHTML = `
        <div class="min-h-screen bg-[#FDFDFD] pb-32 pt-6 px-6">
            <div class="mb-8 mt-2">
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-5 h-5 text-slate-400"></i>
                    </div>
                    <input type="number" id="folio-input" placeholder="Search Folio Number..." 
                        class="w-full bg-slate-100 border-none rounded-[22px] py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 font-bold focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none">
                    <button onclick="handleFolioSearch()" class="absolute right-2 top-2 bg-slate-900 text-white px-5 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all">
                        Find
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="bg-white border border-slate-100 shadow-sm p-3 rounded-[24px] relative">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2">Class</label>
                    <div class="relative">
                        <select id="filter-class" onchange="updateSectionDropdown()" 
                            class="w-full bg-transparent font-bold text-slate-800 text-sm outline-none appearance-none cursor-pointer pr-8 z-10 relative">
                            <option value="">Select Class</option>
                            ${branchClassesConfig.map(c => `<option value="${c.className}">${c.className}</option>`).join('')}
                        </select>
                        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                    </div>
                </div>

                <div class="bg-white border border-slate-100 shadow-sm p-3 rounded-[24px] relative">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block ml-2">Section</label>
                    <div class="relative">
                        <select id="filter-section" onchange="fetchStudentsByQuery()" 
                            class="w-full bg-transparent font-bold text-slate-800 text-sm outline-none appearance-none cursor-pointer pr-8 z-10 relative">
                            <option value="">Select Section</option>
                        </select>
                        <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between px-2 mb-4">
                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Student List</h3>
                <div id="student-count" class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">0 Found</div>
            </div>

            <div id="loader" class="hidden py-20 text-center">
                <div class="inline-block w-6 h-6 border-[3px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>

            <div id="student-list-results" class="space-y-5"></div>
        </div>
    `;

    window.updateSectionDropdown = () => {
        const selClass = document.getElementById('filter-class').value;
        const secSelect = document.getElementById('filter-section');
        secSelect.innerHTML = '<option value="">Section</option>';
        const classInfo = branchClassesConfig.find(c => c.className === selClass);
        if(classInfo && classInfo.sections) {
            classInfo.sections.split(',').forEach(s => {
                secSelect.innerHTML += `<option value="${s.trim()}">${s.trim()}</option>`;
            });
        }
    };

    window.fetchStudentsByQuery = async () => {
        const selClass = document.getElementById('filter-class').value;
        const selSec = document.getElementById('filter-section').value;
        const container = document.getElementById('student-list-results');
        const loader = document.getElementById('loader');

        if(!selClass || !selSec) return;
        container.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            const snapshot = await db.ref('student')
                .orderByChild('academic/class')
                .equalTo(selClass)
                .once('value');

            const data = snapshot.val() || {};
            let filtered = Object.values(data).filter(s => 
                s.academic?.section === selSec && s.academic?.branch === branchName
            );

            filtered.sort((a, b) => {
                const rollA = parseInt(a.academic?.rollNumber) || 0;
                const rollB = parseInt(b.academic?.rollNumber) || 0;
                return rollA - rollB;
            });

            renderStudentCards(filtered);
        } catch (e) { console.error(e); }
        finally { loader.classList.add('hidden'); }
    };

    const renderStudentCards = (students) => {
        const container = document.getElementById('student-list-results');
        document.getElementById('student-count').innerText = `${students.length} Found`;

        container.innerHTML = students.map(s => `
            <div class="bg-white border border-slate-100 rounded-[30px] p-5 shadow-sm active:scale-[0.98] transition-all">
                <div class="flex items-start gap-4 mb-4 border-b border-slate-50 pb-4">
                    <div class="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg">
                        ${s.profile.studentName.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-start">
                            <h4 class="font-black text-slate-800 text-sm truncate uppercase">${s.profile.studentName}</h4>
                            <div class="flex gap-1">
                                <span class="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">R: ${s.academic.rollNumber || '0'}</span>
                                <span class="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">F: ${s.profile.folio}</span>
                            </div>
                        </div>
                        <p class="text-[10px] font-bold text-slate-400 mt-0.5 tracking-tight">
                            ${s.academic.class} - ${s.academic.section} • ${s.profile.dob || 'DOB N/A'}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Father Name</p>
                        <p class="text-[11px] font-bold text-slate-700">${s.parents.father.name}</p>
                    </div>
                    <div>
                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mother Name</p>
                        <p class="text-[11px] font-bold text-slate-700">${s.parents.mother.name}</p>
                    </div>
                </div>

                <div class="bg-slate-50 rounded-2xl p-3 flex justify-between items-center">
                    <div class="flex-1 pr-4 border-r border-slate-200">
                        <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Residential Address</p>
                        <p class="text-[10px] font-medium text-slate-600 line-clamp-1">${s.contact?.address || 'No Address'}</p>
                    </div>
                    <div class="pl-4 text-right">
                        <p class="text-[8px] font-black text-slate-400 uppercase mb-1">Primary Contact</p>
                        <a href="tel:${s.contact.phone1}" class="text-[11px] font-black text-indigo-600 flex items-center gap-1">
                            <i data-lucide="phone" class="w-3 h-3"></i> ${s.contact.phone1}
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
        if(window.lucide) lucide.createIcons();
    };

    window.handleFolioSearch = async () => {
        const folio = document.getElementById('folio-input').value;
        if(!folio) return;
        
        const snap = await db.ref(`student/${folio}`).once('value');
        const s = snap.val();

        if(s) {
            Swal.fire({
                showConfirmButton: false,
                showCloseButton: true,
                background: '#fff',
                customClass: { 
                    popup: 'rounded-[35px] p-8',
                    closeButton: 'top-4 right-4 text-slate-400 hover:text-red-500 transition-colors' 
                },
                html: `
                    <div class="text-left mt-2">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
                                ${s.profile.studentName.charAt(0)}
                            </div>
                            <div>
                                <h3 class="font-black text-slate-800 text-lg uppercase">${s.profile.studentName}</h3>
                                <div class="flex gap-2">
                                    <p class="text-xs font-bold text-slate-500 tracking-wider">Roll: ${s.academic.rollNumber || '0'}</p>
                                    <p class="text-xs font-bold text-indigo-500 tracking-wider">Folio: ${s.profile.folio}</p>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-2 mb-6">
                            <div class="bg-slate-100 px-3 py-2 rounded-xl text-center flex-1">
                                <p class="text-[7px] font-black text-slate-400 uppercase">Branch</p>
                                <p class="text-[10px] font-black text-slate-700">${s.academic.branch}</p>
                            </div>
                            <div class="bg-slate-100 px-3 py-2 rounded-xl text-center flex-1">
                                <p class="text-[7px] font-black text-slate-400 uppercase">Class</p>
                                <p class="text-[10px] font-black text-slate-700">${s.academic.class}</p>
                            </div>
                            <div class="bg-slate-100 px-3 py-2 rounded-xl text-center flex-1">
                                <p class="text-[7px] font-black text-slate-400 uppercase">Section</p>
                                <p class="text-[10px] font-black text-slate-700">${s.academic.section}</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div><p class="text-[8px] font-black text-slate-400 uppercase mb-0.5">Father</p><p class="text-xs font-bold text-slate-700">${s.parents.father.name}</p></div>
                                <div><p class="text-[8px] font-black text-slate-400 uppercase mb-0.5">Mother</p><p class="text-xs font-bold text-slate-700">${s.parents.mother.name}</p></div>
                            </div>
                            <div>
                                <p class="text-[8px] font-black text-slate-400 uppercase mb-0.5">Address</p>
                                <p class="text-xs font-medium text-slate-600 leading-relaxed">${s.contact?.address}</p>
                            </div>
                            <a href="tel:${s.contact.phone1}" class="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-4 active:scale-95 transition-all">
                                <i data-lucide="phone" class="w-4 h-4"></i> Call ${s.contact.phone1}
                            </a>
                        </div>
                    </div>
                `
            });
            if(window.lucide) lucide.createIcons();
        } else {
            Swal.fire({ 
                icon: 'error', 
                title: 'Invalid Folio', 
                text: 'No student found with this number.', 
                showCloseButton: true,
                customClass: { popup: 'rounded-[30px]' }
            });
        }
    };

    if(window.lucide) lucide.createIcons();
};