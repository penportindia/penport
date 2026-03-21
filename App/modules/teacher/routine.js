async function render_routine(user) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent || !user) return;

    const teacherId = user.empId;
    if (!teacherId) {
        mainContent.innerHTML = `<div class="flex items-center justify-center h-64 text-slate-400">ID Missing</div>`;
        return;
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    let selectedDay = days.includes(today) ? today : "Monday";

    let subjectMap = {};
    let classMap = {};
    let scheduleData = {};
    let currentClassId = null;

    async function loadSubjects() {
        const snap = await db.ref('foundation/subjects').once('value');
        const data = snap.val() || {};
        const map = {};
        Object.keys(data).forEach(classKey => {
            const subjects = data[classKey] || {};
            Object.keys(subjects).forEach(subjectId => {
                map[subjectId] = subjects[subjectId].name || "Subject";
            });
        });
        subjectMap = map;
    }

    async function loadClasses() {
        const snap = await db.ref('foundation/classes').once('value');
        const data = snap.val() || {};
        const map = {};
        Object.keys(data).forEach(classId => {
            map[classId] = data[classId].className || "Class";
        });
        classMap = map;
    }

    function buildTeacherRoutine() {
        if (!currentClassId || !scheduleData) return [];

        const routine = [];

        Object.keys(scheduleData).forEach(section => {
            const sectionObj = scheduleData[section];
            if (!sectionObj || !Array.isArray(sectionObj.periods)) return;

            sectionObj.periods.forEach(period => {
                if (!period || period.type !== "ACADEMIC") return;

                const dayInfo = period[selectedDay];
                if (!dayInfo) return;

                if (String(dayInfo.teacherId) === String(teacherId)) {
                    routine.push({
                        time: period.pName || "Time",
                        className: classMap[currentClassId] || "Class",
                        section: section,
                        subject: subjectMap[dayInfo.subjectId] || "Subject",
                        book: dayInfo.bookTitle || "Standard Book"
                    });
                }
            });
        });

        return routine.sort((a, b) =>
            new Date("1970/01/01 " + a.time) - new Date("1970/01/01 " + b.time)
        );
    }

    function renderUI() {
        const routine = buildTeacherRoutine();

        const dayTabs = days.map(day => `
            <button onclick="selectDay('${day}')" 
                class="py-3 rounded-2xl text-[13px] font-black transition-all duration-200 border-2
                ${selectedDay === day 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                    : 'bg-white border-slate-100 text-slate-500 active:bg-slate-50'}">
                ${day.slice(0, 3)}
            </button>
        `).join('');

        const cardsHTML = routine.length === 0 
            ? `<div class="text-center py-20 text-slate-400 font-medium italic">No classes assigned for ${selectedDay}</div>`
            : routine.map(item => `
                <div class="bg-white rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 relative mb-5">
                    <div class="flex flex-col gap-4">
                        <div class="flex justify-between items-start">
                            <div class="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-xs font-black shadow-sm border border-amber-200/50">
                                <i data-lucide="clock" class="w-3 h-3 inline-block mr-1 -mt-0.5"></i>
                                ${item.time}
                            </div>
                            <span class="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-tight">
                                ${item.className} - ${item.section}
                            </span>
                        </div>
                        
                        <div>
                            <h4 class="text-2xl font-black text-slate-800 tracking-tight leading-tight uppercase">
                                ${item.subject}
                            </h4>
                            <div class="flex items-center gap-2 mt-2 text-slate-500">
                                <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                    <i data-lucide="book" class="w-4 h-4 text-indigo-500"></i>
                                </div>
                                <span class="text-sm font-semibold">${item.book}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

        mainContent.innerHTML = `
            <div class="min-h-screen bg-[#FAFBFF] px-5 pt-8 pb-20">
                <div class="grid grid-cols-3 gap-2 mb-8 bg-slate-200/40 p-1.5 rounded-[22px]">
                    ${dayTabs}
                </div>
                <div class="space-y-5">
                    ${cardsHTML}
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    }

    window.selectDay = (day) => {
        selectedDay = day;
        renderUI();
    };

    try {
        await loadSubjects();
        await loadClasses();

        const snap = await db.ref('schedules').once('value');
        const schedules = snap.val() || {};
        const classIds = Object.keys(schedules);

        if (!classIds.length) {
            mainContent.innerHTML = `<div class="p-10 text-center text-slate-400">No schedules found.</div>`;
            return;
        }

        currentClassId = classIds[0];
        scheduleData = schedules[currentClassId] || {};
        renderUI();

    } catch (e) {
        mainContent.innerHTML = `<div class="p-10 text-center text-red-500 font-bold">Error Loading Data</div>`;
    }
}