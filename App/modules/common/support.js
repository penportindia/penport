function render_support(user) {
    const content = document.getElementById("main-content");
    if (!content) return;

    content.innerHTML = `
    <div class="px-6 py-10 space-y-8 pb-24 bg-[#F8FAFC] min-h-screen">
        
        <div class="relative overflow-hidden bg-white rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
            <div class="relative">
                <div class="flex items-center gap-3 mb-3">
                    <span class="px-3 py-1 bg-indigo-600 text-[10px] font-bold text-white uppercase tracking-[0.2em] rounded-full">Support</span>
                </div>
                <h2 class="text-2xl font-black text-slate-900 leading-tight">How can we <br><span class="text-indigo-600">help you today?</span></h2>
                <p class="mt-3 text-sm text-slate-500 font-medium leading-relaxed max-w-[240px]">
                    Our specialized teams are ready to assist you with any inquiries.
                </p>
            </div>
        </div>

        <div class="grid gap-5">
            
            <div class="group bg-white rounded-[35px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-xl active:scale-[0.98]">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <i data-lucide="graduation-cap" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-slate-800">Principal Office</h4>
                            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Academic Head</p>
                        </div>
                    </div>
                </div>
                <a href="tel:+917742986877" 
                   class="flex items-center justify-between w-full bg-slate-900 text-white p-2 pl-6 rounded-2xl font-bold transition-all group-hover:bg-indigo-600">
                    <span class="text-sm">Call Now</span>
                    <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <i data-lucide="phone" class="w-4 h-4 text-white"></i>
                    </div>
                </a>
            </div>

            <div class="group bg-white rounded-[35px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-xl active:scale-[0.98]">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                            <i data-lucide="wallet" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-slate-800">Accounts Dept.</h4>
                            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">Fee & Payments</p>
                        </div>
                    </div>
                </div>
                <a href="tel:+917764010210" 
                   class="flex items-center justify-between w-full bg-slate-900 text-white p-2 pl-6 rounded-2xl font-bold transition-all group-hover:bg-emerald-600">
                    <span class="text-sm">Contact Desk</span>
                    <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <i data-lucide="arrow-up-right" class="w-4 h-4 text-white"></i>
                    </div>
                </a>
            </div>

            <div class="group bg-white rounded-[35px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 transition-all hover:shadow-xl active:scale-[0.98]">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                            <i data-lucide="building-2" class="w-7 h-7"></i>
                        </div>
                        <div>
                            <h4 class="text-lg font-bold text-slate-800">Administration</h4>
                            <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">School Management</p>
                        </div>
                    </div>
                </div>
                <a href="tel:+919929451438" 
                   class="flex items-center justify-between w-full bg-slate-900 text-white p-2 pl-6 rounded-2xl font-bold transition-all group-hover:bg-blue-600">
                    <span class="text-sm">Speak to Admin</span>
                    <div class="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <i data-lucide="phone-call" class="w-4 h-4 text-white"></i>
                    </div>
                </a>
            </div>
        </div>

        <div class="relative bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[40px] p-8 shadow-2xl text-white overflow-hidden">
            <div class="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>

            <div class="flex items-end justify-between gap-4">
                <div class="flex-1 min-w-0">
                    <p class="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Active User</p>
                    <p class="text-lg font-bold truncate leading-none mb-2">${user?.name || "Premium User"}</p>
                    
                    <div class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                        <div class="w-1 h-1 bg-indigo-400 rounded-full"></div>
                        <span class="text-[10px] font-black uppercase tracking-wider text-indigo-300">
                            ${App.state.role || "Staff"}
                        </span>
                    </div>
                </div>

                <div class="w-[1px] h-12 bg-slate-700/40"></div>

                <div class="flex-1 text-right min-w-0">
                    <p class="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-wider">Branch</p>
                    <p class="text-lg font-bold truncate text-indigo-400 leading-none">${App.state.branchName || "Main"}</p>
                    <p class="text-[9px] text-slate-500 mt-2 font-medium italic">Verified Access</p>
                </div>
            </div>
        </div>

    </div>
    `;

    if (window.lucide) lucide.createIcons();
}