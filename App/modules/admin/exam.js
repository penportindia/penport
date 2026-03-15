let currentFilters = {
    session: "-OiGsnCP2n1mX4k2IOL0",
    examId: "",
    branch: "",
    class: "",
    section: ""
};

async function render_exam() {
    const content = document.getElementById("main-content");
    const sessionsSnap = await db.ref("foundation/sessions").once("value");
    let sessionOptions = "";
    sessionsSnap.forEach(s => {
        const sel = s.key === currentFilters.session ? "selected" : "";
        sessionOptions += `<option value="${s.key}" ${sel}>${s.val().name}</option>`;
    });

    content.innerHTML = `
    <div class="p-4 max-w-md mx-auto space-y-4">
        <style>
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }
            .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        </style>

        <div class="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 space-y-4">
            <div class="space-y-4">
                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-2">Session</label>
                    <select id="f-session" onchange="currentFilters.session = this.value; handleFilterChange('session');" 
                        class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none">
                        ${sessionOptions}
                    </select>
                </div>

                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-2">Exam Type</label>
                    <select id="f-exam" onchange="currentFilters.examId = this.value; handleFilterChange('exam');" 
                        class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 appearance-none">
                        <option value="">Select Exam</option>
                    </select>
                </div>

                <div>
                    <label class="text-[10px] font-bold uppercase text-slate-400 ml-2">Branch</label>
                    <select id="f-branch" onchange="currentFilters.branch=this.value; handleFilterChange('branch');"
                        class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 appearance-none">
                        <option value="">Select Branch</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-2">Class</label>
                        <select id="f-class" onchange="currentFilters.class = this.value; handleFilterChange('class');" 
                            class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 appearance-none">
                            <option value="">Class</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[10px] font-bold uppercase text-slate-400 ml-2">Section</label>
                        <select id="f-section" onchange="currentFilters.section = this.value; refreshSubjectList();" 
                            class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 appearance-none">
                            <option value="">Sec</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div id="subject-grid" class="space-y-3 animate-fade-in"></div>
        <div id="marks-entry-container" class="hidden animate-fade-in"></div>
    </div>
    `;

    await loadExamTypes();
    await loadBranches();
}

async function handleFilterChange(type) {
    if(type === 'session') await loadExamTypes();
    if(type === 'branch' || type === 'exam') await loadClasses();
    if(type === 'class') await loadSections();
    document.getElementById("subject-grid").innerHTML = "";
}

async function loadExamTypes() {
    const snap = await db.ref(`examTypes/${currentFilters.session}`).once("value");
    const el = document.getElementById("f-exam");
    let html = `<option value="">Select Exam</option>`;
    snap.forEach(child => {
        html += `<option value="${child.key}">${child.val().title}</option>`;
    });
    el.innerHTML = html;
}

async function loadBranches() {
    const snap = await db.ref("foundation/branches").once("value");
    const el = document.getElementById("f-branch");
    let html = `<option value="">Select Branch</option>`;
    snap.forEach(b => {
        const val = b.val().name;
        html += `<option value="${val}">${val}</option>`;
    });
    el.innerHTML = html;
}

async function loadClasses() {
    if(!currentFilters.branch) return;
    const snap = await db.ref("foundation/classes").once("value");
    const el = document.getElementById("f-class");
    let html = `<option value="">Class</option>`;
    snap.forEach(c => {
        if(c.val().branch === currentFilters.branch) {
            html += `<option value="${c.val().className}">${c.val().className}</option>`;
        }
    });
    el.innerHTML = html;
}

async function loadSections() {
    if(!currentFilters.class || !currentFilters.branch) return;
    const snap = await db.ref("foundation/classes").once("value");
    const el = document.getElementById("f-section");
    let sections = [];
    snap.forEach(c => {
        if(c.val().branch === currentFilters.branch && c.val().className === currentFilters.class) {
            sections = c.val().sections.split(",").map(s => s.trim());
        }
    });
    el.innerHTML = `<option value="">Sec</option>` + sections.map(s => `<option value="${s}">${s}</option>`).join("");
}

async function refreshSubjectList() {
    const grid = document.getElementById("subject-grid");
    const marksContainer = document.getElementById("marks-entry-container");
    
    marksContainer.classList.add("hidden");
    grid.classList.remove("hidden");

    if(!currentFilters.section || !currentFilters.examId) {
        grid.innerHTML = `<p class="text-center text-slate-400 py-10">Select all filters to see schedule.</p>`;
        return;
    }

    grid.innerHTML = `<div class="p-10 text-center text-slate-400">Searching schedule...</div>`;

    const snap = await db.ref("exam_timetables").once("value");
    let html = "";
    snap.forEach(child => {
        const e = child.val();
        if(e.class === currentFilters.class && 
           e.sessionId === currentFilters.session && 
           e.examId === currentFilters.examId && 
           e.section.includes(currentFilters.section)) {
            
            html += `
            <div onclick="openMarksEntry('${child.key}')" 
                class="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm flex justify-between items-center active:scale-95 cursor-pointer hover:border-indigo-200 transition-all">
                <div>
                    <h4 class="font-black text-slate-800 text-lg">${e.subject}</h4>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">${e.date} | Shift ${e.shift}</p>
                </div>
                <div class="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </div>
            </div>`;
        }
    });
    grid.innerHTML = html || `<p class="text-center text-slate-400 py-10">No subjects scheduled for this selection.</p>`;
}

async function openMarksEntry(scheduleId) {
    const grid = document.getElementById("subject-grid");
    const container = document.getElementById("marks-entry-container");
    
    grid.classList.add("hidden");
    container.classList.remove("hidden");
    container.innerHTML = `<div class="flex items-center gap-2 p-10 justify-center text-slate-400 font-bold text-xs uppercase tracking-widest"><span class="relative flex h-2 w-2"><span class="animate-ping absolute h-full w-full rounded-full bg-blue-500 opacity-75"></span><span class="relative h-2 w-2 rounded-full bg-blue-500"></span></span> Loading...</div>`;
    const scheduleSnap = await db.ref(`exam_timetables/${scheduleId}`).once("value");
    const schedule = scheduleSnap.val();
    const currentSec = currentFilters.section;
    const [studentSnap, marksSnap] = await Promise.all([
        db.ref("student").once("value"),
        db.ref(`marks/${schedule.sessionId}/${schedule.examId}/${schedule.class}/${currentSec}`).once("value")
    ]);

    const existingMarks = marksSnap.val() || {};
    let studentList = [];

    studentSnap.forEach(child => {
        const s = child.val();
        if (s.academic.class === schedule.class && 
            s.academic.section === currentSec && 
            s.academic.branch === currentFilters.branch) {
            studentList.push({ id: child.key, ...s });
        }
    });

    studentList.sort((a, b) => parseInt(a.academic.rollNo) - parseInt(b.academic.rollNo));

    let studentHtml = `
    <div class="max-w-6xl mx-auto p-2">
        <div class="flex items-center gap-5 mb-8">
            <button onclick="document.getElementById('marks-entry-container').classList.add('hidden'); document.getElementById('subject-grid').classList.remove('hidden');" 
                class="h-12 w-12 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50">
                <i class="fa-solid fa-arrow-left"></i>
            </button>
            <div>
                <h3 class="font-black text-3xl text-slate-800">${schedule.subject}</h3>
                <p class="text-xs font-black text-indigo-500 uppercase tracking-widest">${schedule.examName || 'Marks Entry'} • SEC ${currentSec}</p>
            </div>
        </div>

        <div class="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-100">
                            <th class="p-6 text-left text-[10px] font-black text-slate-400 uppercase">Student Details</th>
                            ${Object.keys(schedule.components).map(comp => `
                                <th class="p-6 text-center text-[10px] font-black text-slate-400 uppercase">${comp}</th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
    `;

    studentList.forEach(s => {
        const id = s.id;
        const saved = (existingMarks[id] && existingMarks[id][schedule.subject]) ? existingMarks[id][schedule.subject] : {};

        studentHtml += `
            <tr class="hover:bg-slate-50/50 transition-colors">
                <td class="p-5">
                    <div class="flex items-center gap-4">
                        <div class="flex flex-col items-center">
                            <div class="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-600 border border-slate-200 text-sm">
                                ${s.academic.rollNo}
                            </div>
                            <span class="text-[9px] font-black text-slate-400 mt-1 uppercase">F-${s.profile.folio}</span>
                        </div>
                        <div>
                            <p class="font-bold text-slate-800 text-lg leading-tight">${s.profile.studentName}</p>
                        </div>
                    </div>
                </td>
        `;

        for (let comp in schedule.components) {
            const c = schedule.components[comp];
            const val = saved[comp] || "";
            
            if (c.type === "number") {
                studentHtml += `
                    <td class="p-4">
                        <input type="number" value="${val}" id="mark-${id}-${comp}" placeholder="00"
                            class="w-24 mx-auto block bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-center font-black text-slate-800 focus:bg-white focus:border-indigo-500 outline-none text-xl transition-all">
                    </td>`;
            } else {
                studentHtml += `
                    <td class="p-4">
                        <select id="mark-${id}-${comp}" 
                            class="w-32 mx-auto block bg-slate-50 border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer">
                            <option value="">-</option>
                            ${c.grades.map(g => `<option value="${g}" ${val === g ? 'selected' : ''}>${g}</option>`).join("")}
                        </select>
                    </td>`;
            }
        }
        studentHtml += `</tr>`;
    });

    studentHtml += `
                    </tbody>
                </table>
            </div>
            <div class="p-8 bg-slate-50/50">
                <button onclick="saveExamMarks('${scheduleId}')" 
                    class="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[2rem] font-black text-xl shadow-xl active:scale-[0.98] transition-all">
                    SAVE
                </button>
            </div>
        </div>
    </div>`;

    container.innerHTML = studentHtml;
}

async function saveExamMarks(scheduleId) {
    Swal.fire({ 
        title: 'Saving Marks', 
        html: 'Updating database...',
        allowOutsideClick: false, 
        didOpen: () => { Swal.showLoading(); } 
    });

    try {
        const scheduleSnap = await db.ref(`exam_timetables/${scheduleId}`).once("value");
        const schedule = scheduleSnap.val();
        const sec = currentFilters.section;
        const studentSnap = await db.ref("student").once("value");

        let updates = {};
        studentSnap.forEach(child => {
            const s = child.val();
            if (s.academic.class === schedule.class && 
                s.academic.section === sec && 
                s.academic.branch === currentFilters.branch) {

                const id = child.key;
                for (let comp in schedule.components) {
                    const input = document.getElementById(`mark-${id}-${comp}`);
                    if (input) {
                        updates[`marks/${schedule.sessionId}/${schedule.examId}/${schedule.class}/${sec}/${id}/${schedule.subject}/${comp}`] = input.value;
                    }
                }
            }
        });

        await db.ref().update(updates);
        Swal.fire({ icon: 'success', title: 'Marks Updated Successfully', timer: 1500, showConfirmButton: false });
    } catch (error) {
        console.error(error);
        Swal.fire({ icon: 'error', title: 'Failed to Save', text: error.message });
    }
}