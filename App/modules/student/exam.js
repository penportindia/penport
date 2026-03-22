function render_exam(user) {
    window.currentUser = user;
    const main = document.getElementById("main-content");
    main.innerHTML = `
    <div class="min-h-screen bg-[#F8FAFC] pb-24 px-6 pt-8 font-sans">
        <div id="exam-list" class="grid gap-6">
            <div class="flex flex-col items-center justify-center py-20">
                <div class="w-12 h-12 border-[5px] border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        </div>
    </div>`;
    loadExamTypes(user);
}

async function loadExamTypes(user) {
    const examBox = document.getElementById("exam-list");
    try {
        const sessionSnap = await db.ref("foundation/sessions").orderByChild("name").equalTo(user?.academic?.session).once("value");
        let sessionId = null;
        sessionSnap.forEach(s => { sessionId = s.key; });

        const examSnap = await db.ref("examTypes/" + sessionId).once("value");
        if (!examSnap.exists()) {
            examBox.innerHTML = `<div class="bg-white p-12 rounded-[40px] text-center text-slate-400 font-bold border-2 border-dashed border-slate-200">No Exams Scheduled</div>`;
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        let html = "";

        const formatDate = (dateStr) => {
            if (!dateStr) return 'TBA';
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        };

        examSnap.forEach(child => {
            const examId = child.key;
            const exam = child.val();
            const isResultAvailable = exam.resultPublishDate && today >= exam.resultPublishDate;

            html += `
            <div class="group relative bg-white rounded-[38px] p-1 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-500 hover:shadow-indigo-200/30 overflow-hidden">
    
                <div class="p-7">
                    <div class="flex flex-col gap-4">
                        
                        <div class="flex items-start justify-between gap-4">
                            <h3 class="text-2xl font-[900] text-slate-900 leading-[1.15] tracking-tight">
                                ${exam.title}
                            </h3>
                            <div class="flex-shrink-0">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-full ${isResultAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'} text-[9px] font-[900] uppercase tracking-[0.18em] border border-current/10 shadow-sm leading-none">
                                    ${isResultAvailable ? 'Declared' : 'Waiting'}
                                </span>
                            </div>
                        </div>

                        ${exam.description ? `
                            <p class="text-[14px] font-medium text-slate-500 leading-relaxed line-clamp-3">
                                ${exam.description}
                            </p>
                        ` : ''}

                        <div class="flex items-center justify-between py-4 px-5 bg-slate-50/80 backdrop-blur-sm rounded-[24px] border border-white">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Result Date</span>
                            <span class="text-[12px] font-black ${isResultAvailable ? 'text-indigo-600' : 'text-slate-500'} uppercase">
                                ${formatDate(exam.resultPublishDate) || 'Pending'}
                            </span>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4 mt-2">
                            <button onclick="viewSchedule('${examId}')" 
                                class="py-5 bg-white text-slate-700 rounded-[28px] text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all border-2 border-slate-100 shadow-sm flex items-center justify-center gap-2">
                                <svg class="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="2.5" stroke-linecap="round"/></svg>
                                Schedule
                            </button>
                            
                            ${isResultAvailable ? 
                                `<button onclick="viewMarks('${examId}')" 
                                    class="py-5 bg-slate-900 text-white rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-[0_15px_30px_-5px_rgba(15,23,42,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 border-b-4 border-slate-700">
                                    View Result
                                </button>` :
                                `<button class="py-5 bg-slate-100 text-slate-300 rounded-[28px] text-[11px] font-black uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2 border border-slate-200/50 opacity-60">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> 
                                    Locked
                                </button>`
                            }
                        </div>

                    </div>
                </div>
            </div>`;
        });
        examBox.innerHTML = html;
    } catch (e) { examBox.innerHTML = "Error loading data."; }
}

let touchStartX = 0;
document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
document.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 150) {
        const isDetailsPage = document.getElementById("sch-box") || document.getElementById("marks-res");
        if (isDetailsPage) render_exam(window.currentUser);
    }
});

async function viewSchedule(examId) {
    const user = window.currentUser;
    const main = document.getElementById("main-content");
    main.innerHTML = `<div class="p-6 bg-[#F8FAFC] min-h-screen">
        <div id="sch-box" class="space-y-4"></div>
    </div>`;
    
    const snap = await db.ref("exam_timetables").orderByChild("examId").equalTo(examId).once("value");
    let html = "";
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    snap.forEach(c => {
        const s = c.val();
        if(s.class === user.academic.class) {

            let totalMarks = 0;
            let hasMarks = false;

            if (s.components) {
                Object.values(s.components).forEach(comp => {
                    if (comp.fullMarks) {
                        totalMarks += parseFloat(comp.fullMarks);
                        hasMarks = true;
                    }
                });
            }

            const maxMarksText = hasMarks ? totalMarks + " MARKS" : "Graded";

            html += `
            <div class="bg-white p-7 rounded-[35px] border border-slate-50 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                <div>
                    <div class="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tighter mb-2">${formatDate(s.date)}</div>
                    <div class="text-xl font-black text-slate-800 uppercase tracking-tight">${s.subject}</div>
                    <div class="text-[11px] font-bold text-slate-400 mt-1">
                        SHIFT: ${s.shift} • ${maxMarksText}
                    </div>
                </div>
                <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
            </div>`;
        }
    });
    document.getElementById("sch-box").innerHTML = html;
}

async function viewMarks(examId) {
    const user = window.currentUser;
    const main = document.getElementById("main-content");
    main.innerHTML = `<div class="p-6 bg-[#F8FAFC] min-h-screen">
        <div id="marks-res" class="space-y-6">
            <div class="flex flex-col items-center py-20"><div class="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
        </div>
    </div>`;

    const sessionSnap = await db.ref("foundation/sessions").orderByChild("name").equalTo(user.academic.session).once("value");
    let sessionId = null; sessionSnap.forEach(s => sessionId = s.key);

    const [marksSnap, timetableSnap] = await Promise.all([
        db.ref(`marks/${sessionId}/${examId}/${user.academic.class}/${user.academic.section}/${user.profile.folio}`).once("value"),
        db.ref("exam_timetables").orderByChild("examId").equalTo(examId).once("value")
    ]);

    if (!marksSnap.exists()) {
        document.getElementById("marks-res").innerHTML = `<div class="text-center py-20 font-black text-slate-300 uppercase tracking-[0.2em]">Result Pending</div>`;
        return;
    }

    const marks = marksSnap.val();
    const timetables = [];
    timetableSnap.forEach(t => { if(t.val().class === user.academic.class) timetables.push(t.val()); });

    let totalObtained = 0, totalMax = 0, subjectCards = "";

    Object.keys(marks).forEach(subName => {
        let subObtained = 0, subMax = 0, isGrading = false;
        const subConfig = timetables.find(t => t.subject.toUpperCase() === subName.toUpperCase());

        const componentsHtml = Object.keys(marks[subName]).map(compKey => {
            const score = marks[subName][compKey];
            const compConfig = subConfig?.components[compKey];
            
            if (compConfig?.type === "grading") {
                isGrading = true;
                return `
                <div class="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                    <span class="text-[11px] font-black text-slate-400 uppercase tracking-widest">${compKey}</span>
                    <span class="text-lg font-black text-indigo-600">${score}</span>
                </div>`;
            } else {
                const obt = parseFloat(score) || 0;
                const max = compConfig?.fullMarks || 100;
                subObtained += obt; subMax += max;
                const perc = (obt / max) * 100;
                return `
                <div class="mb-5">
                    <div class="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                        <span class="text-slate-400">${compKey}</span>
                        <span class="text-slate-900">${obt} <span class="text-slate-300">/ ${max}</span></span>
                    </div>
                    <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden p-[2px]">
                        <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style="width: ${perc}%"></div>
                    </div>
                </div>`;
            }
        }).join('');

        totalObtained += subObtained; totalMax += subMax;

        subjectCards += `
        <div class="bg-white rounded-[45px] p-8 shadow-sm border border-slate-50">
            <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight mb-6 flex justify-between items-center">
                ${subName}
                ${!isGrading ? `<span class="text-[13px] bg-slate-900 text-white px-4 py-1.5 rounded-2xl">${subObtained}/${subMax}</span>` : ''}
            </h3>
            <div class="bg-slate-50/50 rounded-[30px] p-6">${componentsHtml}</div>
        </div>`;
    });

    const totalPerc = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "N/A";

    document.getElementById("marks-res").innerHTML = `
        <div class="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden mb-8">
            <div class="relative z-10 text-center">
                <div class="text-7xl font-black tracking-tighter mb-4 animate-pulse">${totalPerc === "N/A" ? "PASS" : totalPerc + '<span class="text-3xl font-light">%</span>'}</div>
                <div class="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full backdrop-blur-md">
                    <span class="text-sm font-bold opacity-80 uppercase tracking-widest">${totalObtained} / ${totalMax} Marks</span>
                </div>
            </div>
            <div class="absolute -top-20 -left-20 w-60 h-60 bg-indigo-600 rounded-full blur-[100px] opacity-40"></div>
        </div>
        <div class="space-y-6">${subjectCards}</div>
    `;
}