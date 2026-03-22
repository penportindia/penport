async function render_routine(user) {

    const mainContent = document.getElementById('main-content');
    if (!mainContent || !user?.academic) return;

    const branchName = user.academic.branch?.trim();
    const className = user.academic.class?.trim();
    const section = user.academic.section?.trim();

    if (!branchName || !className || !section) {
        mainContent.innerHTML = `
            <div class="p-20 text-center text-rose-400 font-bold text-xs">
                ACADEMIC DATA MISSING
            </div>`;
        return;
    }

    mainContent.innerHTML = `
        <div class="flex justify-center items-center min-h-[60vh]">
            <div class="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>`;

    try {

        // 1️⃣ Fetch all classes
        const classSnap = await db.ref('foundation/classes').once('value');
        const classes = classSnap.val();

        let classKey = null;

        Object.entries(classes).forEach(([key, value]) => {
            if (
                value.branch === branchName &&
                value.className === className &&
                value.sections.includes(section)
            ) {
                classKey = key;
            }
        });

        if (!classKey) {
            throw new Error("Class not found in foundation/classes");
        }

        // 2️⃣ Fetch schedule
        const scheduleSnap = await db.ref(`schedules/${classKey}/${section}/periods`).once('value');
        const periods = scheduleSnap.val() || [];

        // 3️⃣ Fetch subjects
        const subjectSnap = await db.ref(`foundation/subjects/${className}`).once('value');
        const subjectMap = subjectSnap.val() || {};

        // 4️⃣ Fetch employees
        const empSnap = await db.ref(`employees`).once('value');
        const employeeMap = empSnap.val() || {};

        renderUI(periods, subjectMap, employeeMap);

    } catch (err) {
        console.error(err);
        mainContent.innerHTML = `
            <div class="p-20 text-center text-rose-400 font-bold text-xs">
                ROUTINE NOT AVAILABLE
            </div>`;
    }

    function renderUI(periods, subjectMap, employeeMap) {

        const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        let selectedDay = new Date().toLocaleDateString('en-US',{ weekday:'long' });
        if (!days.includes(selectedDay)) selectedDay = "Monday";

        function draw() {

            let html = "";
            let counter = 0;

            periods.forEach(p => {

                const data = p[selectedDay];
                if (!data) return;

                const isEvent = p.type === "EVENT";

                if (!isEvent) counter++;

                const subjectTitle =
                    isEvent
                        ? data.eventName
                        : subjectMap?.[data.subjectId]?.name || "Subject";

                const teacherName =
                    employeeMap?.[data.teacherId]?.name || "";

                html += `
                <div class="relative pl-8 mb-5 group">
                    <div class="absolute left-0 top-0 bottom-0 w-[1.5px] bg-slate-100 ml-[11px] group-last:hidden"></div>
                    <div class="absolute left-0 top-2 w-6 h-6 rounded-full bg-white border-[3px] 
                        ${isEvent ? 'border-amber-400' : 'border-violet-500'} z-10"></div>

                    <div class="bg-white rounded-[24px] p-5 border shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)]">

                        ${!isEvent ? `
                        <p class="text-[9px] font-black text-violet-500 uppercase tracking-[0.15em] mb-0.5">
                            Period ${counter}
                        </p>` : ''}

                        <h4 class="text-lg font-bold text-slate-800">
                            ${subjectTitle}
                        </h4>

                        ${!isEvent ? `
                        <div class="flex items-center gap-2 mt-2">
                            <p class="text-xs text-slate-500 font-semibold">
                                ${teacherName}
                            </p>
                            ${data.bookTitle ? `
                                <span class="text-slate-300">•</span>
                                <p class="text-[10px] text-slate-400 font-medium uppercase">
                                    ${data.bookTitle}
                                </p>` : ''}
                        </div>` : ''}

                    </div>
                </div>`;
            });

            const tabs = days.map(day => `
                <button onclick="selectDay('${day}')"
                    class="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase
                    ${selectedDay === day
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-100'
                        : 'bg-white text-slate-400 border border-slate-50'}">
                    ${day.slice(0,3)}
                </button>
            `).join('');

            mainContent.innerHTML = `
                <div class="min-h-screen bg-[#FAFBFF] px-5 pt-8 pb-20">
                    <div class="grid grid-cols-3 gap-2 mb-8 bg-slate-200/40 p-1.5 rounded-[22px]">
                        ${tabs}
                    </div>
                    <div class="max-w-md mx-auto">
                        ${html || `<div class="py-20 text-center text-slate-300 font-bold text-xs uppercase">No Schedule</div>`}
                    </div>
                </div>`;
        }

        window.selectDay = function(day) {
            selectedDay = day;
            draw();
        };

        draw();
    }
}