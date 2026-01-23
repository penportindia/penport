window.render_fees = async function(user) {
    const mainContent = document.getElementById('main-content');
    const folio = user.profile.folio;
    const currentSession = user.academic.session || "2025-26";
    const studentClass = user.academic.class;
    const studentType = user.admission.type; 
    const admissionDate = new Date(user.admission.admissionDate);
    const sessionStartYear = parseInt(currentSession.split('-')[0]); 

    const sessionMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIdx = today.getMonth(); 
    
    let monthsElapsed = 0;
    if (currentYear === sessionStartYear) {
        monthsElapsed = Math.max(0, currentMonthIdx - 3); 
    } else {
        monthsElapsed = (currentMonthIdx <= 2) ? (currentMonthIdx + 9) : 12; 
    }
    const billingMonthsCount = Math.min(12, monthsElapsed + 1); 

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
        let headWisePaid = {}; 
        let monthTracker = { tuition: [], transport: [] };

        const receiptsArray = Object.values(receiptsData).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        receiptsArray.forEach(receipt => {
            totalReceived += parseFloat(receipt.totalCollected || 0);
            if (receipt.feesCollected) {
                receipt.feesCollected.forEach(item => {
                    const key = item.feeKey || item.feeHead;
                    headWisePaid[key] = (headWisePaid[key] || 0) + parseFloat(item.amount);
                    if (item.month && item.month !== "N/A") {
                        const mName = item.month.split('-')[0];
                        if (item.feeHead.includes("TUTTION")) monthTracker.tuition.push(mName);
                        if (item.feeHead.includes("TRANSPORT")) monthTracker.transport.push(mName);
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
                    billable = (admissionDate.getFullYear() < sessionStartYear) ? 0 : rate;
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
                        ${headName.includes("TUTTION") ? renderMonthBadges('tuition', monthTracker.tuition, billingMonthsCount) : ''}
                    </div>`;
                }
            }
        });

        // Transport
        if (user.transport && user.transport.enabled) {
            const tRate = parseFloat(transportAmounts['-OiSHOEf65BmAQYc6N3j'] || 0);
            const tBillable = tRate * billingMonthsCount;
            const tPaid = headWisePaid['-OiSHOEf65BmAQYc6N3j'] || 0;
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
                            <span class="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">Rate: ₹${tRate.toLocaleString()}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-black text-slate-900">₹${tBillable.toLocaleString()}</p>
                        <span class="text-[8px] font-black px-2 py-0.5 rounded-full ${tBalance <= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}">
                            ${tBalance <= 0 ? 'PAID' : 'UNPAID'}
                        </span>
                    </div>
                </div>
                ${renderMonthBadges('transport', monthTracker.transport, billingMonthsCount)}
            </div>`;
        }

        const netBalance = totalReceived - totalBilledToDate;
        const isAdvance = netBalance >= 0;

        mainContent.innerHTML = `
            <div class="max-w-xl mx-auto space-y-8 pb-24 px-4 animate-in fade-in duration-700">
                
                <div class="relative overflow-hidden rounded-[2.5rem] ${isAdvance ? 'bg-indigo-600' : 'bg-slate-900'} p-8 shadow-2xl">
                    <div class="relative z-10 text-white">
                        <p class="text-[10px] font-black opacity-60 uppercase tracking-[0.4em] mb-2">Net Ledger Balance</p>
                        <h2 class="text-6xl font-black tracking-tighter mb-8">
                            ₹${Math.abs(netBalance).toLocaleString()}
                        </h2>

                        <div class="flex items-center gap-2 mb-10">
                            <div class="px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full ${isAdvance ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse"></div>
                                <p class="text-[10px] font-black uppercase tracking-widest">
                                    ${isAdvance ? 'Advance Credit' : 'Net Outstanding Due'}
                                </p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                            <div>
                                <p class="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-1">Net Billed (Till Date)</p>
                                <p class="text-xl font-black">₹${totalBilledToDate.toLocaleString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[9px] font-bold opacity-50 uppercase tracking-widest mb-1">Net Received</p>
                                <p class="text-xl font-black text-emerald-400">₹${totalReceived.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div class="absolute -right-16 -bottom-16 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                <section>
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 px-2">Academic Ledger</h3>
                    ${ledgerHTML}
                </section>

                <section class="space-y-5">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Payment History</h3>
                    ${receiptsArray.map((r, i) => {
                        const paidInThis = parseFloat(r.totalCollected);
                        const ledgerAfter = parseFloat(r.remainingDueInLedger || 0);
                        const netPayableAtTime = paidInThis + ledgerAfter;
                        
                        // Checking Transaction Detail Fields
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
                                        <p class="text-sm font-black text-slate-700 font-mono">₹${netPayableAtTime.toLocaleString()}</p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-[9px] font-black text-emerald-600 uppercase mb-1">Paid Amount</p>
                                        <p class="text-lg font-black text-emerald-600 font-mono">₹${paidInThis.toLocaleString()}</p>
                                    </div>
                                </div>

                                ${hasTxnDetails ? `
                                <div class="bg-indigo-50/30 rounded-2xl p-4 border border-indigo-100/50 space-y-2">
                                    <p class="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Transaction Details</p>
                                    ${txnValue !== 'N/A' ? `<p class="text-[10px] font-black text-slate-600 uppercase flex justify-between"><span>TXN ID:</span> <span class="text-slate-900">${txnValue}</span></p>` : ''}
                                    ${r.bankName ? `<p class="text-[10px] font-black text-slate-600 uppercase flex justify-between"><span>Bank:</span> <span class="text-slate-900">${r.bankName}</span></p>` : ''}
                                    ${r.chequeNo ? `<p class="text-[10px] font-black text-slate-600 uppercase flex justify-between"><span>Cheque:</span> <span class="text-slate-900">${r.chequeNo}</span></p>` : ''}
                                </div>` : ''}

                                <div class="flex flex-col gap-2">
                                    <p class="text-[8px] font-black text-slate-400 uppercase tracking-widest">Collected Under:</p>
                                    <div class="flex flex-wrap gap-2">
                                        ${r.feesCollected ? r.feesCollected.map(fc => `
                                            <div class="px-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[9px] font-black text-slate-600 shadow-sm flex items-center gap-1 uppercase">
                                                <span>${fc.feeHead}</span>
                                                ${fc.month && fc.month !== "N/A" ? `<span class="text-[8px] bg-slate-100 px-1 rounded text-slate-400">(${fc.month})</span>` : ''}
                                                <span class="text-indigo-600 ml-1">₹${fc.amount}</span>
                                            </div>
                                        `).join('') : ''}
                                    </div>
                                </div>

                                <div class="flex justify-between items-center pt-4 border-t border-slate-50">
                                     <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest font-black">Due Remaining: <span class="text-rose-500 ml-1">₹${ledgerAfter.toLocaleString()}</span></p>
                                     <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <i data-lucide="check" class="w-4 h-4"></i>
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