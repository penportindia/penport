async function render_routine(user) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent || !user) return;

    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center h-screen space-y-4 bg-slate-50">
            <div class="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-slate-500 font-bold tracking-tight">Syncing Schedule...</p>
        </div>`;

    try {
        const [schedulesSnap, foundationSnap, employeeSnap] = await Promise.all([
            db.ref(`schedules`).once('value'),
            db.ref(`foundation`).once('value'),
            db.ref(`employees`).once('value')
        ]);

        const schedules = schedulesSnap.val() || {};
        const foundation = foundationSnap.val() || {};
        const employees = employeeSnap.val() || {};
        const branches = foundation.branches || {};
        const activeBranchName = branches[user.branch]?.name || user.branch;

        mainContent.innerHTML = `
            <div class="min-h-screen bg-[#FAFBFF] pb-20">
                <div class="sticky top-0 bg-[#FAFBFF]/95 backdrop-blur-sm z-50 border-b border-slate-200/50 shadow-sm">
                    
                    <div class="h-4"></div>

                    <div class="px-5 mb-4">
                        <div class="grid grid-cols-3 md:grid-cols-6 gap-2 bg-slate-200/50 p-1.5 rounded-[22px]">
                            ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                const isToday = new Date().toLocaleDateString('en-US', {weekday: 'long'}) === day;
                                return `
                                <button 
                                    onclick="setDay('${day}')" 
                                    data-day="${day}" 
                                    class="day-pill py-2.5 rounded-[18px] text-[11px] font-bold transition-all duration-300
                                    ${isToday 
                                        ? 'bg-white text-indigo-600 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700'}">
                                    ${day.substring(0, 3)}<span class="hidden md:inline">${day.substring(3)}</span>
                                </button>`;
                            }).join('')}
                        </div>
                    </div>

                    <div class="px-5 pb-4">
                        <div class="flex bg-slate-200/40 p-1 rounded-2xl w-full">
                            <button onclick="switchView('section')" id="tab-section" 
                                class="flex-1 py-2.5 rounded-xl font-bold text-[11px] transition-all bg-white shadow-sm text-indigo-600 uppercase">
                                Classes
                            </button>
                            <button onclick="switchView('teacher')" id="tab-teacher" 
                                class="flex-1 py-2.5 rounded-xl font-bold text-[11px] transition-all text-slate-500 uppercase">
                                Teachers
                            </button>
                        </div>
                    </div>

                    <div id="teacher-search-container" class="px-5 pb-4 hidden">
                        <div class="relative">
                            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
                            <input type="text" id="routine-search" oninput="window.updateAnalysis()" 
                                placeholder="Search teacher name..." 
                                class="w-full bg-slate-200/30 border-none rounded-xl py-3.5 pl-10 pr-4 text-[12px] font-bold focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none">
                        </div>
                    </div>
                </div>

                <div id="analyzer-output" class="px-5 py-6 space-y-4">
                    </div>
            </div>
        `;

        window.isCurrentPeriod = (timeStr) => {
            if (!timeStr || !timeStr.includes('-')) return false;
            try {
                const now = new Date();
                const [startStr, endStr] = timeStr.split('-').map(s => s.trim());
                const parseTime = (str) => {
                    const [time, modifier] = str.split(' ');
                    let [hours, minutes] = time.split(':');
                    if (hours === '12' && modifier === 'AM') hours = '00';
                    if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
                    const d = new Date();
                    d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    return d;
                };
                return now >= parseTime(startStr) && now <= parseTime(endStr);
            } catch (e) { return false; }
        };

        window.setDay = (day) => {
            document.querySelectorAll('.day-pill').forEach(btn => {
                btn.className = 'day-pill shrink-0 px-6 py-2.5 rounded-2xl text-[12px] font-black transition-all border bg-slate-50 border-transparent text-slate-400';
            });
            const activeBtn = document.querySelector(`[data-day="${day}"]`);
            activeBtn.className = 'day-pill shrink-0 px-6 py-2.5 rounded-2xl text-[12px] font-black transition-all border bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100';
            window.selectedDay = day;
            window.updateAnalysis();
        };

        window.updateAnalysis = () => {
            const view = window.currentView || 'section';
            const day = window.selectedDay || new Date().toLocaleDateString('en-US', {weekday: 'long'});
            const searchTerm = document.getElementById('routine-search')?.value.toLowerCase() || '';
            const output = document.getElementById('analyzer-output');
            const searchBox = document.getElementById('teacher-search-container');
            if (view === 'teacher') searchBox.classList.remove('hidden');
            else searchBox.classList.add('hidden');

            if (view === 'section') {
                renderSectionView(schedules, foundation, employees, day, activeBranchName, output);
            } else {
                renderTeacherView(schedules, foundation, employees, day, activeBranchName, searchTerm, output);
            }
        };

        window.switchView = (v) => {
            window.currentView = v;
            document.getElementById('tab-section').className = v === 'section' ? 'flex-1 py-2 rounded-xl font-bold text-[11px] transition-all bg-white shadow-sm text-indigo-600' : 'flex-1 py-2 rounded-xl font-bold text-[11px] transition-all text-slate-500';
            document.getElementById('tab-teacher').className = v === 'teacher' ? 'flex-1 py-2 rounded-xl font-bold text-[11px] transition-all bg-white shadow-sm text-indigo-600' : 'flex-1 py-2 rounded-xl font-bold text-[11px] transition-all text-slate-500';
            document.getElementById('routine-search').value = ''; 
            window.updateAnalysis();
        };

        window.updateAnalysis();
        setInterval(() => window.updateAnalysis(), 60000);

    } catch (e) {
        mainContent.innerHTML = `<div class="p-10 text-center text-red-500 font-bold">${e.message}</div>`;
    }
}

function renderSectionView(schedules, foundation, employees, day, activeBranchName, container) {
    let html = '';
    const classes = foundation.classes || {};
    const subjects = foundation.subjects || {};

    Object.keys(schedules).forEach(classId => {
        const classInfo = classes[classId];
        if (!classInfo || classInfo.branch !== activeBranchName) return;

        Object.keys(schedules[classId]).forEach(secName => {
            const periods = schedules[classId][secName].periods || [];
            let periodCounter = 1;
            let hasData = false;
            
            let sectionHtml = `
                <div class="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-4">
                    <div class="flex items-center justify-between mb-4 border-l-4 border-indigo-500 pl-3">
                        <h3 class="font-black text-slate-800 text-[13px] uppercase">${classInfo.className} - ${secName}</h3>
                    </div>
                    <div class="space-y-4">`;

            periods.forEach((p) => {
                const dayData = p[day];
                if (!dayData || dayData.eventName || dayData.type === 'event') return;

                hasData = true;
                const isActive = window.isCurrentPeriod(p.pName);
                const subName = dayData.subjectId ? (subjects[classInfo.className]?.[dayData.subjectId]?.name || 'Subject') : 'Subject';
                const bookName = dayData.bookTitle || 'No Book';
                const teacher = employees[dayData.teacherId]?.name || 'Not Assigned';

                sectionHtml += `
                    <div class="flex items-center justify-between p-3 rounded-2xl transition-all ${isActive ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-transparent'}">
                        <div class="flex items-center gap-4">
                            <span class="text-[10px] font-black ${isActive ? 'text-indigo-600' : 'text-slate-300'}">P${periodCounter++}</span>
                            <div class="flex flex-col">
                                <span class="font-bold text-[14px] ${isActive ? 'text-indigo-900' : 'text-slate-700'}">${subName}</span>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="text-[10px] text-indigo-500 font-bold decoration-indigo-100 underline-offset-2">${bookName}</span>
                                    <span class="text-slate-300 text-[8px]">•</span>
                                    <span class="text-[10px] ${isActive ? 'text-indigo-400' : 'text-slate-400'} font-medium">${teacher}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                             <span class="block text-[9px] font-black ${isActive ? 'text-indigo-600' : 'text-slate-400'}">${p.pName || ''}</span>
                             ${isActive ? '<span class="text-[7px] font-black text-indigo-500 animate-pulse uppercase mt-1 block">Live Now</span>' : ''}
                        </div>
                    </div>`;
            });

            sectionHtml += `</div></div>`;
            if (hasData) html += sectionHtml;
        });
    });
    container.innerHTML = html || `<div class="text-center py-20 text-slate-400 text-xs font-bold">No Schedule Found</div>`;
}

function renderTeacherView(schedules, foundation, employees, day, activeBranchName, searchTerm, container) {
    const teacherMap = {};
    const classes = foundation.classes || {};
    const subjects = foundation.subjects || {};

    Object.keys(schedules).forEach(classId => {
        const classInfo = classes[classId];
        if (!classInfo || classInfo.branch !== activeBranchName) return;

        Object.keys(schedules[classId]).forEach(secName => {
            (schedules[classId][secName].periods || []).forEach((p) => {
                const dayData = p[day];
                if (dayData && dayData.teacherId && !dayData.eventName && dayData.type !== 'event') {
                    const tid = dayData.teacherId;
                    const teacherName = (employees[tid]?.name || 'Unknown');
                    if (searchTerm && !teacherName.toLowerCase().includes(searchTerm)) return;

                    if (!teacherMap[tid]) teacherMap[tid] = [];
                    teacherMap[tid].push({
                        className: classInfo.className,
                        section: secName,
                        subject: dayData.subjectId ? (subjects[classInfo.className]?.[dayData.subjectId]?.name || 'N/A') : 'N/A',
                        book: dayData.bookTitle || 'No Book',
                        time: p.pName
                    });
                }
            });
        });
    });

    let html = '';
    const sortedTeachers = Object.keys(teacherMap);
    
    sortedTeachers.forEach(tid => {
        const teacherInfo = employees[tid];
        html += `
            <div class="bg-slate-900 rounded-[2.5rem] p-6 shadow-xl mb-4 border border-white/5">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-indigo-500/30">
                        ${teacherInfo?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                        <h3 class="font-bold text-white text-[14px]">${teacherInfo?.name || 'Unknown'}</h3>
                        <p class="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">${teacherInfo?.designation || 'Staff'}</p>
                    </div>
                </div>
                <div class="space-y-3">`;

        teacherMap[tid].forEach(lesson => {
            const isActive = window.isCurrentPeriod(lesson.time);
            html += `
                <div class="p-4 rounded-2xl border transition-all ${isActive ? 'bg-indigo-600/20 border-indigo-500 shadow-lg' : 'bg-white/5 border-white/5'} flex justify-between items-center">
                    <div class="flex flex-col">
                        <span class="font-bold text-white text-[13px]">${lesson.subject}</span>
                        <div class="flex items-center gap-2 mt-1">
                             <p class="text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-400'}">Cls ${lesson.className}-${lesson.section}</p>
                             <span class="text-indigo-400 text-[10px] font-bold">(${lesson.book})</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] font-black ${isActive ? 'text-white' : 'text-slate-500'}">${lesson.time}</span>
                        ${isActive ? '<span class="block text-[7px] font-black text-indigo-400 animate-pulse mt-1 uppercase">Ongoing</span>' : ''}
                    </div>
                </div>`;
        });
        html += `</div></div>`;
    });
    container.innerHTML = html || `<div class="text-center py-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No matching teachers</div>`;
}