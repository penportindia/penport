window.render_fees = async function(user) {
    const mainContent = document.getElementById('main-content');
    const folio = user?.profile?.folio || "";
    const currentSession = user?.academic?.session || "2025-26";
    const studentClass = user?.academic?.class || "";
    const studentType = user?.admission?.type || "";
    const admissionDateRaw = user?.admission?.admissionDate;
    const admissionDate = admissionDateRaw ? new Date(admissionDateRaw) : new Date();
    const sessionStartYear = parseInt(currentSession.split('-')[0]); 

    const sessionMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIdx = today.getMonth(); 
    
    const admissionYear = admissionDate.getFullYear();
    const admissionMonthIdx = admissionDate.getMonth();
    const admissionDay = admissionDate.getDate();

    const sessionStartMonthIdx = 3;

    let effectiveAdmissionMonthIdx = admissionMonthIdx;

    let effectiveAdmissionYear = admissionYear;

    if (admissionDay > 15) {
        effectiveAdmissionMonthIdx += 1;
    }

    if (effectiveAdmissionMonthIdx > 11) {
        effectiveAdmissionMonthIdx = 0;
        effectiveAdmissionYear += 1;
    }

    let billingMonthsCount = 0;

    const sessionStartDate = new Date(sessionStartYear, 3, 1);
    const sessionEndDate = new Date(sessionStartYear + 1, 2, 31);

    let billingStartDate = new Date(
        effectiveAdmissionYear,
        effectiveAdmissionMonthIdx,
        1
    );

    if (billingStartDate < sessionStartDate) {
        billingStartDate = sessionStartDate;
    }

    let billingEndDate = today > sessionEndDate ? sessionEndDate : today;

    if (billingStartDate <= billingEndDate) {
        billingMonthsCount =
            (billingEndDate.getFullYear() - billingStartDate.getFullYear()) * 12 +
            (billingEndDate.getMonth() - billingStartDate.getMonth()) +
            1;
    }

    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center p-20 space-y-4">
            <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Accounts...</p>
        </div>`;

    try {
        const [masterSnap, receiptsSnap, transMasterSnap, headsSnap] = await Promise.all([
            db.ref(`foundation/fee_master/${currentSession}`).once('value'),
            db.ref('fee_receipts').orderByChild('studentFolio').equalTo(folio.toString()).once('value'),
            db.ref(`foundation/transport_master/${currentSession}/amounts`).once('value'),
            db.ref(`foundation/fee_heads`).once('value')
        ]);

        const masterData = masterSnap.val() || {};
        const receiptsData = receiptsSnap.val() || {};
        const transportAmounts = transMasterSnap.val() || {};
        const feeHeads = headsSnap.val() || {};

        let totalBilledToDate = 0;
        let totalReceived = 0;
        let totalDiscountGiven = 0;
        let headWisePaid = {}; 
        let monthTracker = { tuition: [], transport: [] };

        const receiptsArray = Object.values(receiptsData).sort((a, b) => new Date(b.date) - new Date(a.date));

        receiptsArray.forEach(receipt => {
            const receiptDiscount = parseFloat(receipt.discount || 0);
            totalReceived += parseFloat(receipt.totalCollected || 0);
            totalDiscountGiven += receiptDiscount;
            if (receipt.feesCollected) {
                receipt.feesCollected.forEach(item => {
                    let key = item.feeKey || item.feeHead;
                    if (item.feeHead.includes("TRANSPORT") && item.feeKey) {
                        key = item.feeKey;
                    }
                    headWisePaid[key] = (headWisePaid[key] || 0) + parseFloat(item.amount);
                    if (item.month && item.month !== "N/A") {
                        const mName = item.month.split('-')[0];
                        if (item.feeHead.includes("TUITION") && !monthTracker.tuition.includes(mName)) {
                            monthTracker.tuition.push(mName);
                        }

                        if (item.feeHead.includes("TRANSPORT") && !monthTracker.transport.includes(mName)) {
                            monthTracker.transport.push(mName);
                        }
                    }
                });
            }
        });

        let ledgerHTML = '';
        Object.keys(masterData).forEach(headID => {
            const headConfig = masterData[headID];
            const headName = feeHeads[headID] ? feeHeads[headID].name : "Academic Fee";
            const rate = parseFloat(headConfig.amounts[studentClass] || 0);
            let billable = 0;

            if (studentType === "GENERAL") {
                if (headConfig.rotation === "One-Time") {
                    const sessionStartDate = new Date(sessionStartYear, 3, 1);
                    billable = admissionDate < sessionStartDate ? 0 : rate;
                } else if (headConfig.rotation === "Annual") {
                    billable = rate;
                } else if (headConfig.rotation === "Monthly") {
                    billable = rate * billingMonthsCount;
                }
            }

            if (billable >= 0) {
                totalBilledToDate += billable;
                const paidAmt = headWisePaid[headID] || 0;
                const balance = billable - paidAmt;
                const isSettled = balance <= 0;

                if (billable > 0 || paidAmt > 0) {
                    ledgerHTML += `
                    <div class="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm mb-4">
                        <div class="flex justify-between items-start">
                            <div class="space-y-2">
                                <div class="flex items-center gap-2">
                                    <h5 class="text-sm font-black text-slate-800 uppercase tracking-tight">${headName}</h5>
                                    <span class="px-2.5 py-0.5 rounded-full text-[8px] font-black ${isSettled ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} uppercase">
                                        ${isSettled ? 'PAID' : 'UNPAID'}
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-widest">${headConfig.rotation}</span>
                                    <span class="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase">Rate: ₹${rate.toLocaleString()}</span>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Total Billable</p>
                                <p class="text-md font-black text-slate-900 leading-none">₹${billable.toLocaleString()}</p>
                                <p class="text-[10px] font-black ${isSettled ? 'text-emerald-500' : 'text-rose-500'} mt-2 uppercase">
                                    ${isSettled ? 'Settled' : `Due: ₹${balance.toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                        ${headName.includes("TUITION") ? renderMonthBadges('tuition', monthTracker.tuition, billingMonthsCount) : ''}
                    </div>`;
                }
            }
        });
        
        if (user.transport?.enabled && user.transport.route) {

            const studentRouteName = user.transport.route;

            const transportSnap = await db.ref('foundation/transport').once('value');
            const transportGroups = transportSnap.val() || {};

            let routeId = Object.keys(transportGroups).find(
                key => transportGroups[key].groupName === studentRouteName
            );

            if (routeId && transportAmounts[routeId]) {

                const tRate = parseFloat(transportAmounts[routeId]) || 0;
                const tBillable = tRate * billingMonthsCount;
                const tPaid = headWisePaid[routeId] || 0;
                const tBalance = tBillable - tPaid;

                totalBilledToDate += tBillable;

                ledgerHTML += `
                <div class="bg-amber-50/30 border border-amber-100 rounded-[2rem] p-6 shadow-sm mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                <i data-lucide="bus" class="w-5 h-5"></i>
                            </div>
                            <div>
                                <h5 class="text-sm font-black text-amber-900 uppercase">Transport Fee</h5>
                                <span class="text-[9px] font-black text-amber-600/70 uppercase tracking-widest mr-2">Monthly</span>
                                <span class="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                    Rate: ₹${tRate.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-black text-slate-900">
                                ₹${tBillable.toLocaleString()}
                            </p>
                            <span class="text-[8px] font-black px-2 py-0.5 rounded-full ${
                                tBalance <= 0
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-rose-500 text-white'
                            }">
                                ${tBalance <= 0 ? 'PAID' : 'UNPAID'}
                            </span>
                        </div>
                    </div>
                    ${renderMonthBadges(routeId, monthTracker.transport, billingMonthsCount)}
                </div>`;
            }
        }

        const netPayable = totalBilledToDate - totalDiscountGiven;
        const netBalance = totalReceived - netPayable;
        const isAdvance = netBalance > 0;

        const finalDue = netBalance < 0 ? Math.abs(netBalance) : 0;
        const finalAdvance = netBalance > 0 ? netBalance : 0;

        mainContent.innerHTML = `
            <div class="max-w-xl mx-auto pt-5 space-y-8 pb-28 px-8 animate-in fade-in duration-700">
                
                <div class="relative overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500 ${isAdvance ? 'bg-gradient-to-br from-emerald-600 to-teal-800' : 'bg-gradient-to-br from-slate-800 to-slate-950'} p-7">
    
                    <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div class="absolute -left-10 -bottom-10 w-40 h-40 ${isAdvance ? 'bg-emerald-400/20' : 'bg-rose-500/10'} rounded-full blur-3xl"></div>

                    <div class="relative z-10 text-white">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <p class="text-[11px] font-bold opacity-70 uppercase tracking-[0.2em] mb-1">Net DUE</p>
                                <h2 class="text-5xl font-extrabold tracking-tight">
                                    <span class="text-2xl mr-1 opacity-80">₹</span>${Math.abs(netBalance).toLocaleString()}
                                </h2>
                            </div>
                            <div class="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full ${isAdvance ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse"></div>
                                <p class="text-[10px] font-bold uppercase tracking-wider">
                                    ${isAdvance ? 'Advance' : 'Outstanding'}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-3 gap-2 pt-6 border-t border-white/10">
                            <div>
                                <p class="text-[9px] font-semibold opacity-60 uppercase mb-1">Billed</p>
                                <p class="text-lg font-bold">₹${totalBilledToDate.toLocaleString()}</p>
                            </div>
                            <div class="border-x border-white/5 px-2">
                                <p class="text-[9px] font-semibold opacity-60 uppercase mb-1">Discount</p>
                                <p class="text-lg font-bold text-amber-300">₹${totalDiscountGiven.toLocaleString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[9px] font-semibold opacity-60 uppercase mb-1">Received</p>
                                <p class="text-lg font-bold text-emerald-300">₹${totalReceived.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <section>
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 px-2">Ledger</h3>
                    ${ledgerHTML}
                </section>

                <section class="space-y-5">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Payment History</h3>
                    ${receiptsArray.map((r, i) => {
                        const paidInThis = parseFloat(r.totalCollected || 0);
                        const ledgerAfter = parseFloat(r.remainingDueInLedger || 0);
                        const pDisc = parseFloat(r.discount || 0);
                        const pOld = parseFloat(r.prevOldDue || 0);
                        
                        const grouped = {};
                        const currentSelTotal = r.feesCollected ? r.feesCollected.reduce((acc, f) => acc + Number(f.amount || 0), 0) : 0;

                        if (r.feesCollected) {
                            r.feesCollected.forEach(f => {
                                if (!grouped[f.feeHead]) {
                                    grouped[f.feeHead] = { head: f.feeHead, months: [], totalAmt: 0, unitAmt: 0, count: 0 };
                                }
                                const amt = Number(f.amount || 0);
                                if (f.month && f.month !== 'N/A') {
                                    grouped[f.feeHead].months.push(f.month.split('-')[0]);
                                    grouped[f.feeHead].unitAmt = amt;
                                    grouped[f.feeHead].count++;
                                }
                                grouped[f.feeHead].totalAmt += amt;
                            });
                        }

                        const netPayableAtTime = (currentSelTotal + pOld) - (parseFloat(r.prevAdvance || 0)) - pDisc;
                        const txnValue = r.transactionId || r.txnId || r.referenceNo || 'N/A';
                        const hasTxnDetails = (txnValue !== 'N/A' || r.bankName || r.chequeNo);

                        return `
                        <div class="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                            <div class="p-6 bg-slate-50/50 flex justify-between items-start border-b border-slate-100">
                                <div>
                                    <p class="text-xs font-black text-slate-800 uppercase tracking-tight">Receipt #${r.receiptNo || (receiptsArray.length - i)}</p>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                        ${new Date(r.date).toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'})}
                                    </p>
                                </div>
                                <div class="px-3 py-1 bg-white rounded-xl border border-slate-200 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                                    ${r.mode}
                                </div>
                            </div>
                            
                            <div class="p-6 space-y-6">
                                <div class="grid grid-cols-2 gap-4 bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200">
                                    <div>
                                        <p class="text-[9px] font-black text-slate-400 uppercase mb-1">Net Payable</p>
                                        <p class="text-sm font-black text-slate-700 font-mono">₹${netPayableAtTime.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-[9px] font-black text-emerald-600 uppercase mb-1">Paid Amount</p>
                                        <p class="text-lg font-black text-emerald-600 font-mono">₹${paidInThis.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>

                                ${hasTxnDetails ? `
                                <div class="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100/50 space-y-2">
                                    <p class="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Transaction Details</p>
                                    ${txnValue !== 'N/A' ? `<p class="text-[10px] font-black text-slate-600 uppercase flex justify-between"><span>TXN ID:</span> <span class="text-slate-900 font-mono text-[9px]">${txnValue}</span></p>` : ''}
                                    ${r.bankName ? `<p class="text-[10px] font-black text-slate-600 uppercase flex justify-between"><span>Bank:</span> <span class="text-slate-900">${r.bankName}</span></p>` : ''}
                                </div>` : ''}

                                <div class="flex flex-col gap-3">
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fees Breakdown:</p>
                                    <div class="space-y-2">
                                        ${Object.values(grouped).map(item => {
                                            let periodDisplay = '';
                                            const headLower = item.head.toLowerCase();
                                            
                                            if (headLower.includes('registration') || headLower.includes('admission')) {
                                                periodDisplay = 'Onetime';
                                            } else if (item.months.length > 0) {
                                                const monthText = item.months.length > 3 
                                                    ? `${item.months[0]} to ${item.months[item.months.length - 1]}` 
                                                    : item.months.join(', ');
                                                periodDisplay = `${monthText} <span class="text-[8px] opacity-60">(${item.count}M x ₹${item.unitAmt})</span>`;
                                            } else {
                                                periodDisplay = 'Annual';
                                            }

                                            return `
                                            <div class="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                <div>
                                                    <p class="text-[10px] font-black text-slate-700 uppercase">${item.head}</p>
                                                    <p class="text-[9px] font-bold text-slate-400 uppercase mt-0.5">${periodDisplay}</p>
                                                </div>
                                                <p class="text-[11px] font-black text-indigo-600 font-mono">₹${item.totalAmt.toLocaleString('en-IN')}</p>
                                            </div>`;
                                        }).join('')}
                                    </div>
                                </div>

                                <div class="flex justify-between items-center pt-4 border-t border-slate-100">
                                    <div>
                                        <p class="text-[8px] font-black text-slate-400 uppercase tracking-tight">Current Status</p>
                                        <p class="text-[10px] font-black ${ledgerAfter <= 0 ? 'text-emerald-600' : 'text-rose-500'} uppercase">
                                            ${ledgerAfter <= 0 ? 'Advance' : 'Due'}: ₹${Math.abs(ledgerAfter).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div class="w-8 h-8 rounded-full ${ledgerAfter <= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'} flex items-center justify-center">
                                        <i data-lucide="${ledgerAfter <= 0 ? 'check' : 'clock'}" class="w-4 h-4"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </section>
            </div>`;

        lucide.createIcons();
    } catch (e) {
        console.error(e);
        mainContent.innerHTML = `<div class="p-20 text-center font-black text-rose-500 uppercase tracking-widest">Sync Error: ${e.message}</div>`;
    }

    function renderMonthBadges(type, paidArray, billingLimit) {
        return `
            <div class="mt-6 pt-5 border-t border-dashed border-slate-100">
                <div class="grid grid-cols-6 gap-2">
                    ${sessionMonths.map((m, idx) => {
                        const isPaid = paidArray.includes(m);
                        const isOverdue = !isPaid && idx < billingLimit;
                        
                        let style = "bg-slate-50 text-slate-300 border-slate-100";
                        if (isPaid) style = "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-100";
                        else if (isOverdue) style = "bg-rose-50 text-rose-500 border-rose-100 animate-pulse";

                        return `
                            <div class="flex flex-col items-center">
                                <div class="w-full h-9 rounded-xl border flex items-center justify-center text-[10px] font-black transition-all ${style}">
                                    ${isPaid ? '<i data-lucide="check" class="w-4 h-4"></i>' : m}
                                </div>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
    }
};