window.render_fees = async function(user) {
    const mainContent = document.getElementById('main-content');
    const folio = user?.profile?.folio || "";
    const currentSession = user?.academic?.session || "2025-26";
    const studentClass = user?.academic?.class || "";
    const studentType = user?.admission?.type || "";
    const admissionDateRaw = user?.admission?.admissionDate;
    
    let admissionDate = new Date();
    if (admissionDateRaw) {
        const [y, m, d] = admissionDateRaw.split('-').map(Number);
        admissionDate = new Date(y, m - 1, d);
    }

    const sessionStartYear = parseInt(currentSession.split('-')[0]);
    const today = new Date();
    const sessionMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const sessionStartDate = new Date(sessionStartYear, 3, 1);
    const sessionEndDate = new Date(sessionStartYear + 1, 2, 31);

    const sessionMonthDiff = (today.getFullYear() - sessionStartYear) * 12 + (today.getMonth() - 3);
    const billingMonthsCount = Math.max(0, Math.min(sessionMonthDiff + 1, 12));

    let billingStartDate = new Date(admissionDate.getFullYear(), admissionDate.getMonth(), 1);
    if (billingStartDate < sessionStartDate) billingStartDate = sessionStartDate;
    const billingEndDate = today > sessionEndDate ? sessionEndDate : today;

    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center p-20 space-y-4">
            <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Accounts...</p>
        </div>`;

    try {
        const [masterSnap, receiptsSnap, transMasterSnap, headsSnap, sessionLedgerSnap] = await Promise.all([
            db.ref(`foundation/fee_master/${currentSession}`).once('value'),
            db.ref('fee_receipts').orderByChild('studentFolio').equalTo(folio.toString()).once('value'),
            db.ref(`foundation/transport_master/${currentSession}/amounts`).once('value'),
            db.ref(`foundation/fee_heads`).once('value'),
            db.ref(`foundation/session_ledger/${currentSession}/${folio}`).once('value')
        ]);

        const masterData = masterSnap.val() || {};
        const receiptsData = receiptsSnap.val() || {};
        const transportAmounts = transMasterSnap.val() || {};
        const feeHeads = headsSnap.val() || {};
        const sessionLedger = sessionLedgerSnap.val() || {};

        const receiptsArray = Object.values(receiptsData).sort((a, b) => new Date(b.date) - new Date(a.date));

        let totalBilledToDate = 0;
        let totalReceived = 0;
        let totalDiscountGiven = 0;
        let totalAdvanceAdjusted = 0;
        let headWiseBilled = {};
        let headWisePaid = {};
        let monthTracker = { tuition: [], transport: [] };
        let sessionAdjustments = {
            discount: parseFloat(sessionLedger.discount || 0),
            advance: parseFloat(sessionLedger.advance || 0)
        };

        Object.keys(masterData).forEach(headID => {
            const headConfig = masterData[headID];
            const rate = parseFloat(headConfig.amounts[studentClass] || 0);
            let billable = 0;

            if (studentType === "GENERAL") {
                if (headConfig.rotation === "One-Time") {
                    billable = admissionDate >= sessionStartDate ? rate : 0;
                } else if (headConfig.rotation === "Annual") {
                    billable = rate;
                } else if (headConfig.rotation === "Monthly") {
                    billable = rate * billingMonthsCount;
                }
            }

            if (billable > 0) {
                totalBilledToDate += billable;
                headWiseBilled[headID] = billable;
                if (headConfig.rotation === "Monthly") {
                    monthTracker[headID] = [];
                }
            }
        });

        receiptsArray.forEach(receipt => {
            totalReceived += parseFloat(receipt.totalCollected || 0);
            totalDiscountGiven += parseFloat(receipt.discount || 0);
            totalAdvanceAdjusted += parseFloat(receipt.advanceAdjusted || 0);

            if (receipt.feesCollected) {
                receipt.feesCollected.forEach(item => {
                    let key = item.feeKey || item.feeHead;
                    if (item.feeHead && item.feeHead.includes("TRANSPORT") && item.feeKey) {
                        key = item.feeKey;
                    }
                    headWisePaid[key] = (headWisePaid[key] || 0) + parseFloat(item.amount || 0);
                    
                    if (item.month && item.month !== "N/A") {
                        const mName = item.month.split('-')[0];
                        if (item.feeHead?.includes("TUITION") && !monthTracker.tuition.includes(mName)) {
                            monthTracker.tuition.push(mName);
                        }
                        if (item.feeHead?.includes("TRANSPORT") && !monthTracker.transport.includes(mName)) {
                            monthTracker.transport.push(mName);
                        }
                        if (monthTracker[key] && !monthTracker[key].includes(mName)) {
                            monthTracker[key].push(mName);
                        }
                    }
                });
            }
        });

        let ledgerHTML = '';
        Object.keys(masterData).forEach(headID => {
            const headConfig = masterData[headID];
            const headName = feeHeads[headID]?.name || "Academic Fee";
            const billable = headWiseBilled[headID] || 0;
            const paidAmt = headWisePaid[headID] || 0;
            const balance = billable - paidAmt;
            const isSettled = balance <= 0;
            const isMonthly = headConfig.rotation === "Monthly";

            if (billable > 0 || paidAmt > 0) {
                ledgerHTML += `
                <div class="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm mb-4">
                    <div class="flex justify-between items-start">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <h5 class="text-sm font-black text-slate-800 uppercase tracking-tight">${headName}</h5>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-widest">${headConfig.rotation}</span>
                                <span class="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg uppercase">₹${parseFloat(headConfig.amounts[studentClass] || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-md font-black text-slate-900 leading-none">₹${billable.toLocaleString()}</p>
                            <p class="text-[10px] font-black ${isSettled ? 'text-emerald-500' : 'text-rose-500'} mt-2">
                                ${isSettled ? 'PAID' : `UNPAID ₹${Math.abs(balance).toLocaleString()}`}
                            </p>
                        </div>
                    </div>
                    ${isMonthly ? renderMonthBadges(headID, monthTracker[headID] || monthTracker.tuition, billingMonthsCount) : ''}
                </div>`;
            }
        });

        let transportHTML = '';
        if (user.transport?.enabled && user.transport.route) {
            const studentRouteName = user.transport.route;
            const transportSnap = await db.ref('foundation/transport').once('value');
            const transportGroups = transportSnap.val() || {};

            const routeId = Object.keys(transportGroups).find(
                key => transportGroups[key].groupName === studentRouteName
            );

            if (routeId && transportAmounts[routeId]) {
                const tRate = parseFloat(transportAmounts[routeId]) || 0;
                const tBillable = tRate * billingMonthsCount;
                const tPaid = headWisePaid[routeId] || 0;
                const tBalance = tBillable - tPaid;

                totalBilledToDate += tBillable;

                transportHTML = `
                <div class="bg-amber-50/30 border border-amber-100 rounded-[2rem] p-6 shadow-sm mb-4">
                    <div class="flex justify-between items-start">
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <h5 class="text-sm font-black text-amber-900 uppercase tracking-tight">Transport Fee</h5>
                                <span class="px-2.5 py-0.5 rounded-full text-[8px] font-black ${tBalance <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} uppercase">
                                    ${tBalance <= 0 ? 'PAID' : 'UNPAID'}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="text-[9px] font-bold text-amber-400 bg-amber-50 px-2 py-1 rounded-lg uppercase tracking-widest">Monthly</span>
                                <span class="text-[9px] font-black text-amber-700 bg-amber-100 px-2 py-1 rounded-lg uppercase">₹${tRate.toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-md font-black text-slate-900 leading-none">₹${tBillable.toLocaleString()}</p>
                            <p class="text-[10px] font-black ${tBalance <= 0 ? 'text-emerald-500' : 'text-rose-500'} mt-2">
                                ${tBalance <= 0 ? 'PAID' : `UNPAID ₹${Math.abs(tBalance).toLocaleString()}`}
                            </p>
                        </div>
                    </div>
                    ${renderMonthBadges(routeId, monthTracker.transport, billingMonthsCount)}
                </div>`;
            }
        }

        const sessionDiscountTotal = totalDiscountGiven + sessionAdjustments.discount;
        const sessionAdvanceTotal = totalAdvanceAdjusted + sessionAdjustments.advance;
        const netPayable = totalBilledToDate - sessionDiscountTotal;
        const netBalance = totalReceived + sessionAdvanceTotal - netPayable;
        const isAdvance = netBalance > 0;

        mainContent.innerHTML = `
            <div class="max-w-xl mx-auto pt-5 space-y-8 pb-28 px-8 animate-in fade-in duration-700">
                <div class="relative overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500 ${isAdvance ? 'bg-gradient-to-br from-emerald-600 to-teal-800' : 'bg-gradient-to-br from-slate-800 to-slate-950'} p-7">
                    <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div class="absolute -left-10 -bottom-10 w-40 h-40 ${isAdvance ? 'bg-emerald-400/20' : 'bg-rose-500/10'} rounded-full blur-3xl"></div>
                    <div class="relative z-10 text-white">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <p class="text-[11px] font-bold opacity-70 uppercase tracking-[0.2em] mb-1">Net ${isAdvance ? 'ADVANCE' : 'DUE'}</p>
                                <h2 class="text-5xl font-extrabold tracking-tight">
                                    <span class="text-2xl mr-1 opacity-80">₹</span>${Math.abs(netBalance).toLocaleString()}
                                </h2>
                            </div>
                            <div class="w-7 h-7 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 rounded-full flex items-center justify-center shadow-sm shadow-emerald-900/20">
                                <span class="text-[14px] font-black text-emerald-400 leading-none">₹</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-2 pt-6 border-t border-white/10">
                            <div>
                                <p class="text-[9px] font-semibold opacity-60 uppercase mb-1">Billed</p>
                                <p class="text-lg font-bold">₹${totalBilledToDate.toLocaleString()}</p>
                            </div>
                            <div class="border-x border-white/5 px-2">
                                <p class="text-[9px] font-semibold opacity-60 uppercase mb-1">Total Discount</p>
                                <p class="text-lg font-bold text-amber-300">₹${sessionDiscountTotal.toLocaleString()}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-[9px] font-semibold opacity-60 uppercase mb-1">Total Received</p>
                                <p class="text-lg font-bold text-emerald-300">₹${(totalReceived + sessionAdvanceTotal).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <section>
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 px-2">Ledger</h3>
                    ${ledgerHTML}
                    ${transportHTML}
                </section>

                <section class="space-y-5">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">Payment History</h3>
                    ${receiptsArray.map((r, i) => {
                        const paidInThis = parseFloat(r.totalCollected || 0);
                        const pDisc = parseFloat(r.discount || 0);
                        const pAdvanceAdj = parseFloat(r.advanceAdjusted || 0);
                        const pOldDue = parseFloat(r.prevOldDue || 0);
                        const currentSelTotal = r.feesCollected ? r.feesCollected.reduce((acc, f) => acc + Number(f.amount || 0), 0) : 0;
                        const netPayableAtTime = (currentSelTotal + pOldDue) - pAdvanceAdj - pDisc;
                        const txnValue = r.transactionId || r.txnId || r.referenceNo || 'N/A';
                        const txnNote = r.transactionNote || r.note || ''; // Transaction note added
                        const hasTxnDetails = (txnValue !== 'N/A' || r.bankName || r.chequeNo || txnNote);

                        const grouped = {};
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

                        return `
                        <div class="receipt-item bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm mb-4 group" data-receipt="${i}">
                            <div class="p-6 bg-slate-50/50 flex justify-between items-start border-b border-slate-100 cursor-pointer receipt-header" data-receipt="${i}">
                                <div>
                                    <p class="text-xs font-black text-slate-800 uppercase tracking-tight">Receipt #${r.receiptNo || (receiptsArray.length - i)}</p>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                        ${new Date(r.date).toLocaleDateString('en-IN', {day:'2-digit', month:'long', year:'numeric'})}
                                    </p>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="px-3 py-1 bg-white rounded-xl border border-slate-200 text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                                        ${r.mode}
                                    </div>
                                    <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all duration-200">
                                        <i data-lucide="chevron-down" class="w-4 h-4 receipt-toggle"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="receipt-content p-6 space-y-6 max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out scale-y-95 origin-top">
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
                                    ${txnNote ? `<p class="text-[10px] font-black text-slate-600 uppercase flex justify-between items-start"><span>Note:</span> <span class="text-slate-900 text-[9px] break-words max-w-[200px]">${txnNote}</span></p>` : ''}
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
                                        <p class="text-[10px] font-black text-slate-600 uppercase">
                                            Discount: ₹${pDisc.toLocaleString('en-IN')} | Advance Adj: ₹${pAdvanceAdj.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                                        <i data-lucide="file-text" class="w-4 h-4"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                    }).join('')}
                </section>

                ${sessionAdjustments.discount > 0 || sessionAdjustments.advance > 0 ? `
                <section class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[2rem] p-6 border border-indigo-100">
                    <h3 class="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4">Session Adjustments</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="text-center p-3 bg-white rounded-xl border border-indigo-100">
                            <p class="text-[11px] font-black text-amber-600">Session Discount</p>
                            <p class="text-lg font-black text-amber-700">₹${sessionAdjustments.discount.toLocaleString()}</p>
                        </div>
                        <div class="text-center p-3 bg-white rounded-xl border border-emerald-100">
                            <p class="text-[11px] font-black text-emerald-600">Session Advance</p>
                            <p class="text-lg font-black text-emerald-700">₹${sessionAdjustments.advance.toLocaleString()}</p>
                        </div>
                    </div>
                </section>
                ` : ''}
            </div>`;
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.receipt-header');
            if (header) {
                const receiptItem = header.closest('.receipt-item');
                const content = receiptItem.querySelector('.receipt-content');
                const toggleIcon = receiptItem.querySelector('.receipt-toggle');
                
                const isExpanded = content.classList.contains('max-h-[2000px]');
                
                if (isExpanded) {
                    content.classList.remove('max-h-[2000px]', 'opacity-100', 'scale-y-100');
                    toggleIcon.style.transform = 'rotate(0deg)';
                } else {
                    content.classList.add('max-h-[2000px]', 'opacity-100', 'scale-y-100');
                    toggleIcon.style.transform = 'rotate(180deg)';
                }
            }
        });

        lucide.createIcons();

    } catch (e) {
        console.error(e);
        mainContent.innerHTML = `<div class="p-20 text-center font-black text-rose-500 uppercase tracking-widest">Sync Error: ${e.message}</div>`;
    }
};

function renderMonthBadges(headId, paidArray, billingLimit) {
    return `
    <div class="mt-6 pt-5 border-t border-dashed border-slate-100">
        <div class="grid grid-cols-6 gap-2">
            ${["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"].map((m, idx) => {
                const isPaid = paidArray.includes(m);
                const isBillable = idx < billingLimit;
                let style = "bg-slate-50 text-slate-300 border-slate-100";
                
                if (isPaid) {
                    style = "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-100";
                } else if (isBillable) {
                    style = "bg-rose-50 text-rose-500 border-rose-100 animate-pulse";
                }

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