(async () => {
    const mainContent = document.getElementById('main-content');
    const { user } = App.state;
    
    const sessionKey = user?.academic?.sessionKey || "-OiGsnCP2n1mX4k2IOL0";

    let fullData = null;
    let availableClasses = [];
    let selectedClass = null; 
    let activeExam = null;
    let activeMonth = null;
    let activeSubject = null;

    const renderUI = () => {
        let html = `
            <div class="min-h-screen bg-slate-50/50 pt-6 px-4 pb-24 animate-in fade-in duration-700">
                <div class="max-w-md mx-auto space-y-5">
                    
                    <div class="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm mb-6">
                        <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">Select Class</label>
                        <div class="relative">
                            <select onchange="window.changeClass(this.value)" 
                                class="w-full bg-slate-50 border-none text-slate-900 text-sm font-bold rounded-2xl focus:ring-2 focus:ring-indigo-500 block p-4 appearance-none cursor-pointer">
                                <option value="" ${!selectedClass ? 'selected' : ''}>Choose a class...</option>
                                ${availableClasses.map(cls => `
                                    <option value="${cls}" ${selectedClass === cls ? 'selected' : ''}>Class ${cls}</option>
                                `).join('')}
                            </select>
                            <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
                            </div>
                        </div>
                    </div>`;

        if (!selectedClass) {
            html += `
                <div class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                    <div class="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center mb-4">
                        <i data-lucide="layout-grid" class="w-8 h-8 text-indigo-500"></i>
                    </div>
                    <h3 class="text-slate-900 font-bold">Select Class</h3>
                    <p class="text-slate-400 text-xs mt-1">Please select a class to view its detailed syllabus.</p>
                </div>`;
        } else {
            const examsWithClass = Object.entries(fullData || {});

            if (examsWithClass.length === 0) {
                html += `
                    <div class="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-[32px] border border-slate-100 shadow-sm">
                        <i data-lucide="book-x" class="w-8 h-8 text-rose-500 mb-4"></i>
                        <h3 class="text-slate-900 font-bold text-lg">No Syllabus</h3>
                        <p class="text-slate-500 text-sm mt-1">No data available for Class ${selectedClass}.</p>
                    </div>`;
            } else {
                examsWithClass.forEach(([examKey, classSyllabus]) => {
                    const examName = Object.values(classSyllabus)[0]?.exam || "Examination";
                    const isExamOpen = activeExam === examKey;

                    html += `
                        <div class="w-full">
                            <button onclick="window.toggleExam('${examKey}')" 
                                class="w-full flex items-center justify-between p-5 rounded-[28px] transition-all duration-500 ${isExamOpen ? 'bg-indigo-600 text-white shadow-xl scale-[1.01]' : 'bg-white border border-slate-100 text-slate-800 shadow-sm'}">
                                <div class="flex items-center gap-4">
                                    <div class="w-11 h-11 rounded-2xl flex items-center justify-center ${isExamOpen ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}">
                                        <i data-lucide="award" class="w-5 h-5"></i>
                                    </div>
                                    <span class="font-bold text-base text-left">${examName}</span>
                                </div>
                                <i data-lucide="chevron-right" class="w-5 h-5 transition-transform duration-300 ${isExamOpen ? 'rotate-90' : ''}"></i>
                            </button>`;

                    if (isExamOpen) {
                        const monthsInExam = [...new Set(Object.values(classSyllabus).flatMap(item => item.months || []))];
                        html += `<div class="mt-3 space-y-3 px-1 animate-in slide-in-from-top-3 duration-300">`;
                        
                        monthsInExam.forEach(month => {
                            const isMonthOpen = activeMonth === month;
                            html += `
                                <div class="w-full">
                                    <button onclick="window.toggleMonth('${month}')" 
                                        class="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${isMonthOpen ? 'bg-slate-800 text-white' : 'bg-slate-100/80 text-slate-600'}">
                                        <span class="text-xs font-bold uppercase tracking-widest ml-2">${month}</span>
                                        <i data-lucide="${isMonthOpen ? 'minus' : 'plus'}" class="w-4 h-4"></i>
                                    </button>`;

                            if (isMonthOpen) {
                                const subjectsInMonth = Object.entries(classSyllabus).filter(([_, item]) => item.months?.includes(month));
                                const groupedBySubject = subjectsInMonth.reduce((acc, [id, item]) => {
                                    const subName = item.subject.toUpperCase();
                                    if (!acc[subName]) acc[subName] = { name: subName, chapters: [] };
                                    acc[subName].chapters.push({ ...item, id });
                                    return acc;
                                }, {});

                                html += `<div class="mt-3 grid grid-cols-1 gap-3 animate-in zoom-in-95 duration-300">`;
                                Object.values(groupedBySubject).forEach(subGroup => {
                                    const isSubOpen = activeSubject === subGroup.name;
                                    html += `
                                        <div class="w-full">
                                            <button onclick="window.toggleSubject('${subGroup.name}')" 
                                                class="w-full p-5 rounded-[24px] text-left transition-all duration-300 ${isSubOpen ? 'bg-white ring-2 ring-indigo-500/20 shadow-lg' : 'bg-white border border-slate-100'}">
                                                <div class="flex justify-between items-center">
                                                    <div class="flex items-center gap-3">
                                                        <div class="w-2 h-2 rounded-full ${isSubOpen ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}"></div>
                                                        <span class="text-sm font-bold text-slate-800 uppercase">${subGroup.name}</span>
                                                    </div>
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">${subGroup.chapters.length} Ch.</span>
                                                        <i data-lucide="book-open" class="w-4 h-4 ${isSubOpen ? 'text-indigo-500' : 'text-slate-300'}"></i>
                                                    </div>
                                                </div>

                                                ${isSubOpen ? `
                                                <div class="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                                    ${subGroup.chapters.map(ch => `
                                                        <div class="pt-4 border-t border-slate-50">
                                                            <div class="flex justify-between items-start mb-2 gap-2">
                                                                <h4 class="text-sm font-bold text-slate-900 flex-1">${ch.chapter}</h4>
                                                                <span class="shrink-0 bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-1 rounded-lg">Pg. ${ch.page || '0'}</span>
                                                            </div>
                                                            <p class="text-xs text-slate-500 leading-relaxed mb-3">${ch.description}</p>
                                                            <div class="flex items-center gap-2 text-slate-400">
                                                                <i data-lucide="library" class="w-3 h-3"></i>
                                                                <span class="text-[10px] font-bold uppercase tracking-tight">${ch.book}</span>
                                                            </div>
                                                        </div>
                                                    `).join('')}
                                                </div>` : ''}
                                            </button>
                                        </div>`;
                                });
                                html += `</div>`;
                            }
                            html += `</div>`;
                        });
                        html += `</div>`;
                    }
                    html += `</div>`;
                });
            }
        }

        html += `</div></div>`;
        mainContent.innerHTML = html;
        if (window.lucide) lucide.createIcons();
    };

    const fetchClasses = async () => {
        const snap = await db.ref(`syllabus_v2/${sessionKey}`).once('value');
        const data = snap.val() || {};
        const classSet = new Set();
        Object.values(data).forEach(examObj => {
            Object.keys(examObj).forEach(cls => classSet.add(cls));
        });
        availableClasses = Array.from(classSet).sort();
        renderUI();
    };

    const fetchClassData = async (cls) => {
        const snap = await db.ref(`syllabus_v2/${sessionKey}`).once('value');
        const data = snap.val() || {};
        const filtered = {};
        Object.entries(data).forEach(([examKey, examObj]) => {
            if (examObj[cls]) filtered[examKey] = examObj[cls];
        });
        fullData = filtered;
        renderUI();
    };

    window.changeClass = (cls) => {
        selectedClass = cls;
        activeExam = null;
        activeMonth = null;
        activeSubject = null;
        fetchClassData(cls);
    };

    window.toggleExam = (id) => { activeExam = (activeExam === id) ? null : id; renderUI(); };
    window.toggleMonth = (m) => { activeMonth = (activeMonth === m) ? null : m; renderUI(); };
    window.toggleSubject = (name) => { activeSubject = (activeSubject === name) ? null : name; renderUI(); };

    fetchClasses();
})();