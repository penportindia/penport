window.render_about = function (user) {
    const container = document.getElementById('main-content');
    if (!container) return;

    const html = `
    <div class="px-5 py-6 pt-10 pb-32 animate-in fade-in duration-700">
        <div class="bg-gradient-to-br from-indigo-700 to-violet-800 rounded-[40px] p-8 text-center shadow-2xl mb-8 relative overflow-hidden text-white border-b-8 border-indigo-900/30">
            <div class="absolute inset-0 opacity-10 pointer-events-none">
                <svg width="100%" height="100%"><pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="white"/></pattern><rect width="100%" height="100%" fill="url(#pattern)"/></svg>
            </div>
            <div class="relative z-10">
                <div class="w-24 h-24 bg-white rounded-[30px] flex items-center justify-center mx-auto mb-5 border-2 border-white p-2 shadow-2xl">
                    <img src="https://i.ibb.co/9kGbqWb7/Logo.png" alt="Logo" class="w-full h-full object-contain">
                </div>
                <h1 class="text-3xl font-black leading-tight tracking-normal uppercase">The Wings</h1>
                <p class="text-indigo-200 text-[11px] font-black tracking-[0.3em] uppercase mt-1">Aim For Excellence</p>
                <div class="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl text-[9px] font-bold border border-white/10 tracking-widest">
                    <i data-lucide="map-pin" class="w-3 h-3 text-indigo-400"></i>
                    Lok Nagar, Jehanabad, Bihar
                </div>
            </div>
        </div>

        <div class="flex bg-slate-200/60 backdrop-blur-lg p-1.5 rounded-[24px] mb-8 sticky sticky top-0 z-30 border border-white shadow-lg overflow-x-auto no-scrollbar">
            <button onclick="switchAboutTab('school')" id="tab-school-btn" class="flex-1 whitespace-nowrap px-6 py-4 text-[11px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 bg-white shadow-md text-indigo-700">School</button>
            <button onclick="switchAboutTab('app')" id="tab-app-btn" class="flex-1 whitespace-nowrap px-6 py-4 text-[11px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 text-slate-500">App</button>
            <button onclick="switchAboutTab('policy')" id="tab-policy-btn" class="flex-1 whitespace-nowrap px-6 py-4 text-[11px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 text-slate-500">Privacy</button>
            <button onclick="switchAboutTab('dev')" id="tab-dev-btn" class="flex-1 whitespace-nowrap px-6 py-4 text-[11px] font-black uppercase tracking-widest rounded-[20px] transition-all duration-300 text-slate-500">Developer</button>
        </div>

        <div id="about-school-content" class="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            <div class="bg-white p-7 rounded-[35px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="w-12 h-1 bg-indigo-600 rounded-full mb-4"></div>
                <h3 class="text-slate-900 font-black text-xl mb-3 tracking-tight">Affiliation & Standards</h3>
                <p class="text-slate-600 leading-relaxed font-bold text-[13px]">The Wings Foundation Academy is a premier co-educational institution. We follow a comprehensive curriculum aligned with CBSE Standards (Class Nursery to XII), focusing on holistic development through modern pedagogical techniques.</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Established</p>
                    <p class="text-base font-black text-indigo-700 mt-2">2018</p>
                </div>
                <div class="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Medium</p>
                    <p class="text-base font-black text-indigo-700 mt-2">English</p>
                </div>
                <div class="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Type</p>
                    <p class="text-base font-black text-indigo-700 mt-2">Co-Ed</p>
                </div>
                <div class="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Curriculum</p>
                    <p class="text-base font-black text-indigo-700 mt-2">CBSE</p>
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span class="flex-none w-8 h-[3px] bg-indigo-600 rounded-full"></span> 
                    Leadership Board
                </h3>
                <div class="bg-slate-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden border-b-4 border-indigo-500">
                    <div class="flex items-center gap-6 relative z-10">
                        <div class="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl flex items-center justify-center shadow-xl border border-white/20">
                            <i data-lucide="shield-check" class="w-10 h-10 text-white"></i>
                        </div>
                        <div>
                            <p class="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Founder & Chairman</p>
                            <h4 class="text-2xl font-black text-white leading-tight">Santosh Kumar Sharma</h4>
                            <div class="mt-2 inline-block px-3 py-1 bg-white/10 rounded-lg border border-white/5 text-[9px] font-black text-indigo-200 tracking-tighter">Ex-Airforce Officer</div>
                        </div>
                    </div>
                </div>

                <div class="bg-indigo-50 p-7 rounded-[35px] border-2 border-white shadow-md relative">
                    <i data-lucide="quote" class="w-10 h-10 text-indigo-200/50 absolute -right-5 top-2"></i>
                    <p class="text-[14px] text-indigo-950 font-bold leading-relaxed relative z-10">"We aim to cultivate not just academically proficient students, but compassionate, creative, and critical thinkers ready to navigate the challenges of the 21st century. Our application signifies our commitment to bridging technology with tradition."</p>
                    <div class="flex items-center gap-4 mt-6 pt-5 border-t border-indigo-200/50 relative z-10">
                        <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-indigo-700 shadow-sm border border-indigo-100">PR</div>
                        <div>
                            <p class="text-sm font-black text-indigo-950 leading-none">Sonu Kumar Singh</p>
                            <p class="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Principal</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span class="flex-none w-8 h-[3px] bg-rose-500 rounded-full"></span> 
                    Our Branches
                </h3>
                <div class="grid gap-3">
                    ${renderDetailedBranch(1, "The Wings Foundation Academy", "Lok Nagar, Mallahchak, Jehanabad, Bihar (Main Office)")}
                    ${renderDetailedBranch(2, "The Wings Step By Step School", "Aerodram Road, Jehanabad, Bihar")}
                    ${renderDetailedBranch(3, "The Wings Step Academy", "Near Ghoda Hospital, Shakti Nagar, Jehanabad, Bihar")}
                    ${renderDetailedBranch(4, "The Wings Junior", "Bund Bihar Colony, Court Area, Jehanabad, Bihar")}
                    ${renderDetailedBranch(5, "The Wings Foundation Academy", "Wings Enclave, Liliya Bigha Road, Kazisarai, Jehanabad")}
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span class="flex-none w-8 h-[3px] bg-indigo-500 rounded-full"></span> 
                    Campus & Facilities
                </h3>
                <div class="grid grid-cols-2 gap-3">
                    ${renderFacility('MapPin', 'Prime Campus', 'Serene environment')}
                    ${renderFacility('FlaskConical', 'Sci-Tech Labs', 'Physics, Chemistry, Bio & Maths')}
                    ${renderFacility('MonitorDot', 'Computer Lab', 'Modern infrastructure')}
                    ${renderFacility('Library', 'Smart Library', 'Vast collection')}
                    ${renderFacility('SquarePlay', 'Sports Complex', 'Indoor/Outdoor')}
                    ${renderFacility('Bus', 'Safe Transport', 'GPS enabled fleet')}
                </div>
            </div>

            <div class="space-y-4">
                <h3 class="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span class="flex-none w-8 h-[3px] bg-amber-500 rounded-full"></span> 
                    Curriculum Focus
                </h3>
                <div class="bg-white p-5 rounded-[35px] border border-slate-100 shadow-sm space-y-2">
                    ${renderCurriculumItem('Sparkles', 'Foundational', 'Play-based learning for Nursery-KG')}
                    ${renderCurriculumItem('Target', 'Primary & Secondary', 'Core subjects with NEP alignment')}
                    ${renderCurriculumItem('BrainCircuit', 'Competitive Edge', 'Foundation courses for NTSE/Olympiads')}
                    ${renderCurriculumItem('Palette', 'Co-Curricular', 'Art, Music, Dance, Karate')}
                </div>
            </div>

            <div class="bg-slate-900 rounded-[40px] p-8 text-white text-center shadow-2xl border-t-4 border-indigo-600">
                <i data-lucide="headset" class="w-10 h-10 text-indigo-400 mx-auto mb-4"></i>
                <h4 class="text-sm font-black leading-none mb-1 uppercase tracking-widest">Administrative Office</h4>
                <p class="text-[11px] text-slate-400 mb-6 font-bold uppercase">Mon - Sat | 09:00 AM - 04:30 PM</p>
                <div class="grid grid-cols-2 gap-4">
                    <a href="tel:7742986877" class="flex items-center justify-center gap-3 bg-indigo-600 p-4 rounded-2xl active:scale-95 transition-transform shadow-lg shadow-indigo-600/30"><i data-lucide="phone" class="w-4 h-4 text-white"></i><span class="text-[10px] font-black uppercase tracking-widest">Enquiry</span></a>
                    <a href="mailto:thewingsfoundationacademy@gmail.com" class="flex items-center justify-center gap-3 bg-white/10 p-4 rounded-2xl active:scale-95 transition-transform border border-white/5"><i data-lucide="mail" class="w-4 h-4 text-white"></i><span class="text-[10px] font-black uppercase tracking-widest">Email</span></a>
                </div>
            </div>
        </div>

        <div id="about-app-content" class="space-y-6 animate-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto p-4">
    
            <header class="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 right-0 p-4 opacity-10">
                    <i data-lucide="shield-check" class="w-20 h-20 text-indigo-600"></i>
                </div>
                <h4 class="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">The Wings</h4>
                <p class="text-[14px] text-slate-600 leading-relaxed font-medium">
                    Custom-built Enterprise Android Application powered by <strong>Native SDK v3</strong> and <strong>Firebase</strong> for high-speed synchronization.
                </p>
            </header>

            <div class="grid gap-4">
                
                <article class="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="bg-indigo-600 p-2 rounded-xl text-white"><i data-lucide="graduation-cap" class="w-5 h-5"></i></div>
                        <h5 class="font-black text-indigo-900 uppercase text-xs tracking-widest">For Students</h5>
                    </div>
                    <ul class="grid grid-cols-1 gap-2 text-[13px] text-slate-700 font-bold">
                        <li class="flex items-center gap-2"><i data-lucide="circle-check" class="w-4 h-4 text-indigo-500"></i> Attendance & Routine</li>
                        <li class="flex items-center gap-2"><i data-lucide="circle-check" class="w-4 h-4 text-indigo-500"></i> Homework & Syllabus</li>
                        <li class="flex items-center gap-2"><i data-lucide="circle-check" class="w-4 h-4 text-indigo-500"></i> Exam Schedules & Fees</li>
                    </ul>
                </article>

                <article class="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="bg-emerald-600 p-2 rounded-xl text-white"><i data-lucide="user-cog" class="w-5 h-5"></i></div>
                        <h5 class="font-black text-emerald-900 uppercase text-xs tracking-widest">For Teachers & Staff</h5>
                    </div>
                    <ul class="grid grid-cols-1 gap-2 text-[13px] text-slate-700 font-bold">
                        <li class="flex items-center gap-2"><i data-lucide="circle-check" class="w-4 h-4 text-emerald-500"></i> Mark Attendance</li>
                        <li class="flex items-center gap-2"><i data-lucide="circle-check" class="w-4 h-4 text-emerald-500"></i> Upload Study Materials</li>
                        <li class="flex items-center gap-2"><i data-lucide="circle-check" class="w-4 h-4 text-emerald-500"></i> Payroll & Task Management</li>
                    </ul>
                </article>

                <article class="bg-slate-900 p-6 rounded-[32px] text-white">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="bg-white/20 p-2 rounded-xl text-white"><i data-lucide="layout-dashboard" class="w-5 h-5"></i></div>
                        <h5 class="font-black uppercase text-xs tracking-widest text-indigo-300">Administration</h5>
                    </div>
                    <p class="text-[12px] font-medium opacity-90 leading-snug">
                        Centralized management for students, staff, payroll, and secure cloud data handling.
                    </p>
                </article>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm text-center">
                    <i data-lucide="bell-ring" class="w-5 h-5 mx-auto text-orange-500 mb-2"></i>
                    <h6 class="text-[11px] font-black text-slate-800 uppercase leading-none">Smart Alerts</h6>
                </div>
                <div class="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm text-center">
                    <i data-lucide="file-down" class="w-5 h-5 mx-auto text-blue-500 mb-2"></i>
                    <h6 class="text-[11px] font-black text-slate-800 uppercase leading-none">Media Support</h6>
                </div>
            </div>

            <section class="bg-rose-50 border border-rose-100 rounded-[35px] p-6">
                <div class="flex items-start gap-4">
                    <i data-lucide="lock" class="w-5 h-5 text-rose-600 mt-1"></i>
                    <div>
                        <h5 class="text-xs font-black uppercase text-rose-900 mb-1 tracking-tighter underline decoration-rose-300">Important Notice</h5>
                        <p class="text-[11px] text-rose-700 font-bold leading-tight">
                            Authorized access only for The Wings Foundation Academy members. Login credentials provided by school admin.
                        </p>
                    </div>
                </div>
            </section>

            <footer class="bg-indigo-900 rounded-[35px] p-8 text-white text-center">
                <p class="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-indigo-400">Need Assistance?</p>
                <div class="flex flex-col items-center gap-3">
                    <a href="tel:7742986877" class="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/20 transition-all">
                        <i data-lucide="phone" class="w-4 h-4 text-emerald-400"></i>
                        <span class="text-sm font-bold tracking-tight">7742986877</span>
                    </a>
                </div>
            </footer>
        </div>

        <div id="about-policy-content" class="hidden space-y-6 animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto p-4">
    
            <div class="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="flex items-center gap-4 mb-4">
                    <div class="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
                        <i data-lucide="shield-check" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h4 class="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Privacy Policy</h4>
                        <p class="text-[10px] font-black text-indigo-600 mt-1 uppercase tracking-widest">March 2026</p>
                    </div>
                </div>
                <p class="text-[13px] text-slate-600 font-bold leading-relaxed">
                    The Wings is developed for <strong>The Wings Foundation Academy</strong> by <strong>Penport India</strong>. We are committed to ensuring your data remains private and secure.
                </p>
            </div>

            <div class="space-y-4">
                
                <div class="bg-white p-6 rounded-[35px] border border-slate-50 shadow-sm">
                    <h5 class="text-[11px] font-black text-indigo-600 uppercase mb-4 flex items-center gap-2">
                        <i data-lucide="database" class="w-4 h-4"></i> 1. Information & Usage
                    </h5>
                    <div class="space-y-3 text-[12px] text-slate-700 font-bold leading-snug">
                        <p>• Personal: Name, Mobile, Academic Info (Class/Section).</p>
                        <p>• Academic: Attendance, Homework, Notices, & School Data.</p>
                        <p>• Purpose: To manage records, send alerts, and improve app services.</p>
                    </div>
                </div>

                <div class="bg-slate-900 p-6 rounded-[35px] text-white relative overflow-hidden">
                    <h5 class="text-[11px] font-black text-indigo-300 uppercase mb-3 flex items-center gap-2">
                        <i data-lucide="lock" class="w-4 h-4"></i> 2. Security & Storage
                    </h5>
                    <p class="text-[12px] font-medium opacity-90 mb-4">
                        Data is encrypted and stored using <strong>Firebase Realtime Database</strong>. We implement industry-standard AES-256 protocols to prevent unauthorized access.
                    </p>
                    <div class="flex gap-2">
                        <span class="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">Secure SSL</span>
                        <span class="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase">Cloud Caching</span>
                    </div>
                </div>

                <div class="bg-indigo-50 p-6 rounded-[35px] border border-indigo-100">
                    <h5 class="text-[11px] font-black text-indigo-900 uppercase mb-4 flex items-center gap-2">
                        <i data-lucide="key" class="w-4 h-4"></i> 3. Permissions Required
                    </h5>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                            <i data-lucide="wifi" class="w-3 h-3 text-indigo-600"></i> Internet
                        </div>
                        <div class="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                            <i data-lucide="bell" class="w-3 h-3 text-indigo-600"></i> Notifications
                        </div>
                        <div class="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                            <i data-lucide="folder-open" class="w-3 h-3 text-indigo-600"></i> Storage
                        </div>
                        <div class="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                            <i data-lucide="camera" class="w-3 h-3 text-indigo-600"></i> Camera
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-[35px] border border-slate-100">
                    <div class="space-y-4">
                        <div>
                            <h6 class="text-[10px] font-black text-slate-400 uppercase mb-1">Children’s Privacy</h6>
                            <p class="text-[12px] text-slate-700 font-bold">Designed for school use under institutional supervision.</p>
                        </div>
                        <hr class="border-slate-100">
                        <div>
                            <h6 class="text-[10px] font-black text-slate-400 uppercase mb-1">User Access</h6>
                            <p class="text-[12px] text-slate-700 font-bold">Accessible only to authorized academy users.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-emerald-600 p-8 rounded-[40px] text-white text-center shadow-lg shadow-emerald-100">
                <p class="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-80">Questions or Support?</p>
                <h5 class="text-lg font-black mb-1">Penport India</h5>
                <a href="tel:7004848750" class="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-2xl text-sm font-black border border-white/30 hover:bg-white/30 transition-all">
                    <i data-lucide="phone-call" class="w-4 h-4"></i> +91 7004848750
                </a>
                <p class="text-[10px] mt-4 opacity-70 font-bold tracking-tight">Policy may be updated via app notifications.</p>
            </div>
        </div>

        <div id="about-dev-content" class="hidden space-y-6 animate-in slide-in-from-left-8 duration-500 max-w-2xl mx-auto p-4">
    
            <div class="bg-white p-10 rounded-[50px] border border-slate-100 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
                <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

                <div class="relative mb-6">
                    <div class="w-28 h-28 bg-slate-950 rounded-[40px] flex items-center justify-center shadow-2xl rotate-3 overflow-hidden">
                        <img src="https://i.ibb.co/ym5yxYwM/Penport-logo-001.png" 
                            alt="Logo" 
                            class="w-full h-full object-contain p-2" />
                    </div>
                    <div class="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-2xl border-4 border-white shadow-lg">
                        <i data-lucide="verified" class="w-5 h-5 text-white"></i>
                    </div>
                </div>

                <h4 class="text-2xl font-black text-slate-900 tracking-tighter leading-none">Penport India</h4>
                <p class="text-indigo-600 text-[10px] font-black tracking-[0.4em] uppercase mt-3">Next-Gen Architecture</p>
                
                <div class="mt-8 pt-8 border-t border-slate-50 w-full">
                    <p class="text-[7px] text-slate-400 font-black uppercase tracking-widest mb-1">Founder Developer</p>
                    <h5 class="text-xl font-black text-slate-800 tracking-tight">Raushan Kr Singh</h5>
                    <p class="text-slate-500 text-[13px] font-bold leading-relaxed mt-4 max-w-[300px] mx-auto">
                        Architecting secure, user-centric, and highly efficient digital ecosystems for the modern era of education.
                    </p>
                </div>

                <div class="mt-8 flex gap-4">
                    <a href="tel:7004848750" class="group w-14 h-14 bg-indigo-50 hover:bg-indigo-600 rounded-[24px] transition-all duration-300 flex items-center justify-center border border-indigo-100">
                        <i data-lucide="phone" class="w-6 h-6 text-indigo-600 group-hover:text-white"></i>
                    </a>
                    <a href="mailto:penportindia@gmail.com" class="group w-14 h-14 bg-slate-50 hover:bg-slate-950 rounded-[24px] transition-all duration-300 flex items-center justify-center border border-slate-100">
                        <i data-lucide="mail" class="w-6 h-6 text-slate-600 group-hover:text-white"></i>
                    </a>
                    <a href="https://penportindia.github.io/penport/" class="group w-14 h-14 bg-emerald-50 hover:bg-emerald-600 rounded-[24px] transition-all duration-300 flex items-center justify-center border border-emerald-100">
                        <i data-lucide="globe" class="w-6 h-6 text-emerald-600 group-hover:text-white"></i>
                    </a>
                </div>
            </div>

            <div class="bg-white rounded-[40px] p-4 shadow-sm border border-slate-100 space-y-2">
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-[30px] border border-slate-100/50">
                    <div class="flex items-center gap-4">
                        <div class="bg-white p-2 rounded-xl shadow-sm text-indigo-600"><i data-lucide="shield-check" class="w-5 h-5"></i></div>
                        <span class="text-[12px] font-black text-slate-700">Enterprise Edition</span>
                    </div>
                    <span class="text-[10px] font-black text-emerald-600 uppercase bg-emerald-100 px-3 py-1 rounded-full">Active</span>
                </div>
                
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-[30px] border border-slate-100/50">
                    <div class="flex items-center gap-4">
                        <div class="bg-white p-2 rounded-xl shadow-sm text-indigo-600"><i data-lucide="Zap" class="w-5 h-5"></i></div>
                        <span class="text-[12px] font-black text-slate-700">Response Priority</span>
                    </div>
                    <span class="text-[10px] font-black text-slate-500 uppercase">&lt; 4 Hours</span>
                </div>
            </div>

            <div class="bg-slate-950 rounded-[45px] p-10 text-white text-center relative overflow-hidden shadow-2xl">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                
                <p class="text-[10px] text-slate-400 mb-6 font-black tracking-[0.2em] uppercase">Built with Core Excellence</p>
                
                <div class="flex flex-wrap justify-center gap-3 mb-8">
                    <span class="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold">Android SDK</span>
                    <span class="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold">Firebase</span>
                    <span class="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold">Cloudinary</span>
                    <span class="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[11px] font-bold">Tailwind v4</span>
                </div>

                <div class="pt-6 border-t border-white/5">
                    <p class="text-[11px] text-indigo-400 font-black tracking-[0.5em] uppercase">Penport India © 2026</p>
                </div>
            </div>
        </div>
    </div>
    `;

    container.innerHTML = html;
    switchAboutTab('school');
    if (window.lucide) lucide.createIcons();
};

window.switchAboutTab = function(tab) {
    const sections = ['school', 'app', 'policy', 'dev'];
    sections.forEach(id => {
        const content = document.getElementById(`about-${id}-content`);
        const btn = document.getElementById(`tab-${id}-btn`);
        if (content && btn) {
            if (id === tab) {
                content.classList.remove('hidden');
                btn.classList.add('bg-white', 'shadow-md', 'text-indigo-700');
                btn.classList.remove('text-slate-500');
            } else {
                content.classList.add('hidden');
                btn.classList.remove('bg-white', 'shadow-md', 'text-indigo-700');
                btn.classList.add('text-slate-500');
            }
        }
    });
    if (window.lucide) lucide.createIcons();
};

function renderItem(icon, label, value) {
    return `
    <div class="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl">
        <div class="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0"><i data-lucide="${icon}" class="w-5 h-5 text-indigo-500"></i></div>
        <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">${label}</p>
            <p class="text-sm font-black text-slate-700">${value}</p>
        </div>
    </div>`;
}

function renderDetailedBranch(id, name, address) {
    return `
    <div class="bg-white p-5 rounded-[28px] border border-slate-100 flex gap-5 items-start shadow-sm active:bg-slate-50">
        <div class="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-xs font-black text-white shadow-lg flex-shrink-0">${id}</div>
        <div>
            <h5 class="text-[14px] font-black text-slate-950 leading-tight tracking-tight">${name}</h5>
            <p class="text-[11px] text-slate-500 font-bold mt-2 leading-snug tracking-tighter">${address}</p>
        </div>
    </div>`;
}

function renderFacility(icon, label, desc) {
    return `
    <div class="bg-white p-4 rounded-2xl border border-slate-100 flex items-start gap-3 shadow-sm">
        <i data-lucide="${icon}" class="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5"></i>
        <div>
            <p class="text-[11px] font-black text-slate-800 leading-tight tracking-tighter">${label}</p>
            <p class="text-[10px] text-slate-500 font-bold mt-1 tracking-tighter leading-tight">${desc}</p>
        </div>
    </div>`;
}

function renderCurriculumItem(icon, label, desc) {
    return `
    <div class="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-xl">
        <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-inner"><i data-lucide="${icon}" class="w-5 h-5"></i></div>
        <div>
            <p class="text-[12px] font-black text-slate-800 tracking-tighter">${label}</p>
            <p class="text-[10px] text-slate-500 font-bold leading-relaxed mt-1 tracking-tighter">${desc}</p>
        </div>
    </div>`;
}