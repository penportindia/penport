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
            <div class="group bg-white rounded-[45px] p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.05)] border border-white hover:border-indigo-100 transition-all duration-500 hover:shadow-indigo-100/50">
                <div class="flex items-start justify-between mb-8">
                    <div class="flex items-center gap-5">
                        <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[24px] flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                        </div>
                        <div>
                            <h3 class="text-2xl font-black text-slate-800 leading-tight">${exam.title}</h3>
                            ${exam.description ? `<p class="text-sm font-bold text-slate-500 mt-1 mb-2">${exam.description}</p>` : ''}
                            <div class="flex items-center gap-2 mt-1">
                                <span class="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                <p class="text-[12px] font-bold text-slate-400 uppercase tracking-widest">${formatDate(exam.examDate) || 'TBA'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-3">
                    <div class="flex items-center justify-between px-2 mb-2">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Result Date</span>
                        <span class="text-[11px] font-black ${isResultAvailable ? 'text-emerald-600' : 'text-orange-500'} uppercase">${formatDate(exam.resultPublishDate) || 'N/A'}</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="viewSchedule('${examId}')" class="py-5 bg-slate-50 text-slate-700 rounded-[28px] text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">Schedule</button>
                        
                        ${isResultAvailable ? 
                            `<button onclick="viewMarks('${examId}')" class="py-5 bg-indigo-600 text-white rounded-[28px] text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-200 active:scale-95 transition-all">View Result</button>` :
                            `<button class="py-5 bg-slate-100 text-slate-300 rounded-[28px] text-xs font-black uppercase tracking-widest cursor-not-allowed flex items-center justify-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Locked
                            </button>`
                        }
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