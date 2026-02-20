async function render_routine(user) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent || !user) return;

    const branchKey = user.academic?.branchKey || "-OiGxIN-0k1Cm0ILYEA0"; 
    const section = user.academic?.section || "E"; 
    const studentClass = user.academic?.class || "V";

    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[60vh]">
            <div class="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>`;

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let selectedDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (selectedDay === "Sunday") selectedDay = "Monday";

    let rawPeriods = [];
    let employeeData = {};
    let subjectMap = {};

    function renderUI() {
        let periodsHTML = '';
        const activePeriods = rawPeriods.filter(p => p[selectedDay]);
        let periodCounter = 0;

        if (activePeriods.length > 0) {
            activePeriods.forEach((p) => {
                const dayDetails = p[selectedDay];
                const isEvent = p.type === "EVENT" || !dayDetails.subjectId;
                const eventName = (dayDetails.eventName || "").toLowerCase();
                const isAssembly = eventName.includes("assembly");
                
                let subjectTitle = isEvent ? (dayDetails.eventName || "Break") : (subjectMap[dayDetails.subjectId || p.subjectId]?.name || "Subject");
                const teacherObj = employeeData[dayDetails.teacherId];
                const teacherName = teacherObj ? teacherObj.name : (isEvent ? "" : "No Teacher");

                if (!isEvent) periodCounter++;

                let cardClass = "bg-white border-slate-50 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)]";
                let dotClass = "border-violet-500";
                
                if (isAssembly) {
                    cardClass = "bg-amber-50 border-amber-100";
                    dotClass = "border-amber-400";
                } else if (isEvent) {
                    cardClass = "bg-slate-50 border-transparent";
                    dotClass = "border-slate-300";
                }

                periodsHTML += `
                    <div class="relative pl-8 mb-5 group">
                        <div class="absolute left-0 top-0 bottom-0 w-[1.5px] bg-slate-100 ml-[11px] group-last:hidden"></div>
                        <div class="absolute left-0 top-2 w-6 h-6 rounded-full bg-white border-[3px] ${dotClass} z-10"></div>
                        
                        <div class="${cardClass} rounded-[24px] p-5 border active:scale-[0.98] transition-all">
                            <div class="flex justify-between items-start">
                                <div>
                                    ${!isEvent ? `<p class="text-[9px] font-black text-violet-500 uppercase tracking-[0.15em] mb-0.5">Period ${periodCounter}</p>` : ''}
                                    <h4 class="text-lg font-bold ${isEvent && !isAssembly ? 'text-slate-500' : 'text-slate-800'} leading-tight">${subjectTitle}</h4>
                                </div>
                            </div>
                            
                            ${!isEvent ? `
                                <div class="flex items-center gap-2 mt-2">
                                    <p class="text-xs text-slate-500 font-semibold">${teacherName}</p>
                                    ${dayDetails.bookTitle ? `<span class="text-slate-300">•</span><p class="text-[10px] text-slate-400 font-medium uppercase tracking-tight">${dayDetails.bookTitle}</p>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        } else {
            periodsHTML = `<div class="py-20 text-center text-slate-300 font-bold uppercase text-xs tracking-[0.2em]">No Schedule</div>`;
        }

        const dayTabs = days.map(day => `
            <button onclick="selectDay('${day}')"
                class="flex-1 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-200
                ${selectedDay === day ? 'bg-violet-600 text-white shadow-lg shadow-violet-100' : 'bg-white text-slate-400 border border-slate-50'}">
                ${day.slice(0, 3)}
            </button>
        `).join('');

        mainContent.innerHTML = `
            <div class="min-h-screen bg-[#FAFBFF] px-5 pt-8 pb-20">
                <div class="grid grid-cols-3 gap-2 mb-8 bg-slate-200/40 p-1.5 rounded-[22px]">
                    ${dayTabs}
                </div>
                <div class="max-w-md mx-auto">
                    ${periodsHTML}
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    window.selectDay = (day) => {
        selectedDay = day;
        renderUI();
    };

    try {
        const [snapSchedules, snapEmployees, snapSubjects] = await Promise.all([
            db.ref(`schedules/${branchKey}/${section}/periods`).once('value'),
            db.ref(`employees`).once('value'),
            db.ref(`foundation/subjects/${studentClass}`).once('value')
        ]);

        rawPeriods = snapSchedules.val() || [];
        employeeData = snapEmployees.val() || {};
        subjectMap = snapSubjects.val() || {};
        renderUI();
    } catch (error) {
        mainContent.innerHTML = `<div class="p-20 text-center text-rose-400 font-bold text-xs">CONNECTION ERROR</div>`;
    }
}