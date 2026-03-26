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

    let billingMonthsCount = 12;
    let billingStartMonthIndex = 0;

    if (studentType === "GENERAL") {
        if (admissionDate > sessionStartDate) {
            const admissionMonthIndex = Math.max(0, admissionDate.getMonth() - 3);
            const currentMonthIndex = Math.min(11, (today.getMonth() - 3 + (today.getFullYear() - sessionStartYear) * 12));
            billingMonthsCount = Math.max(0, currentMonthIndex - admissionMonthIndex + 1);
            billingStartMonthIndex = admissionMonthIndex;
        }
    } else if (studentType === "RTE" || studentType === "FREE") {
        billingMonthsCount = 0;
    }

    const sessionMonthDiff = (today.getFullYear() - sessionStartYear) * 12 + (today.getMonth() - 3);
    billingMonthsCount = Math.max(0, Math.min(sessionMonthDiff + 1, billingMonthsCount));

    mainContent.innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div class="relative w-16 h-16">
                <div class="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div class="text-center">
                <h3 class="text-lg font-black text-slate-800 uppercase tracking-widest">Finance Engine</h3>
            </div>
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
                    billable = (admissionDate >= sessionStartDate) ? rate : 0;
                } else if (headConfig.rotation === "Annual") {
                    billable = rate;
                } else if (headConfig.rotation === "Monthly") {
                    billable = rate * billingMonthsCount;
                }
            } else if (studentType !== "RTE" && studentType !== "FREE") {
                if (headConfig.rotation === "Annual") billable = rate;
                else if (headConfig.rotation === "Monthly") billable = rate * 12;
            }

            if (billable > 0) {
                totalBilledToDate += billable;
                headWiseBilled[headID] = billable;
                if (headConfig.rotation === "Monthly") monthTracker[headID] = [];
            }
        });

        receiptsArray.forEach(receipt => {
            totalReceived += parseFloat(receipt.totalCollected || 0);
            totalDiscountGiven += parseFloat(receipt.discount || 0);
            totalAdvanceAdjusted += parseFloat(receipt.advanceAdjusted || 0);

            if (receipt.feesCollected) {
                receipt.feesCollected.forEach(item => {
                    let key = item.feeKey || item.feeHead;
                    if (item.feeHead && item.feeHead.includes("TRANSPORT") && item.feeKey) key = item.feeKey;
                    
                    headWisePaid[key] = (headWisePaid[key] || 0) + parseFloat(item.amount || 0);
                    
                    if (item.month && item.month !== "N/A") {
                        const mName = item.month.split('-')[0];
                        if (item.feeHead?.includes("TUITION") && !monthTracker.tuition.includes(mName)) monthTracker.tuition.push(mName);
                        if (item.feeHead?.includes("TRANSPORT") && !monthTracker.transport.includes(mName)) monthTracker.transport.push(mName);
                        if (monthTracker[key] && !monthTracker[key].includes(mName)) monthTracker[key].push(mName);
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

            if (billable > 0 || paidAmt > 0) {
                ledgerHTML += `
                <div class="group bg-white border border-slate-200 rounded-[2.5rem] p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 mb-4">
                    <div class="flex justify-between items-center">
                        <div class="space-y-3">
                            <h5 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-500 transition-colors">${headName}</h5>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-black text-slate-600 bg-slate-100 px-3 py-1 rounded-full uppercase">${headConfig.rotation}</span>
                                <span class="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">₹${parseFloat(headConfig.amounts[studentClass] || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xl font-black text-slate-900 leading-none">₹${billable.toLocaleString()}</p>
                            <div class="flex items-center justify-end gap-1.5 mt-2">
                                <div class="w-1.5 h-1.5 rounded-full ${isSettled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}"></div>
                                <p class="text-[10px] font-black ${isSettled ? 'text-emerald-600' : 'text-rose-600'} uppercase tracking-wider">
                                    ${isSettled ? 'Settled' : `Due ₹${Math.abs(balance).toLocaleString()}`}
                                </p>
                            </div>
                        </div>
                    </div>
                    ${headConfig.rotation === "Monthly" ? renderMonthBadges(headID, monthTracker[headID] || monthTracker.tuition, billingMonthsCount, billingStartMonthIndex) : ''}
                </div>`;
            }
        });

        let transportHTML = '';
        if ((user.transport?.enabled && user.transport.route) || (studentType === "RTE" || studentType === "FREE")) {
            const studentRouteName = user.transport?.route || "Default";
            const transportSnap = await db.ref('foundation/transport').once('value');
            const transportGroups = transportSnap.val() || {};
            const routeId = Object.keys(transportGroups).find(key => transportGroups[key].groupName === studentRouteName);

            if (routeId && transportAmounts[routeId]) {
                const tRate = parseFloat(transportAmounts[routeId]) || 0;
                let tBillingMonths = (studentType === "GENERAL") ? billingMonthsCount : 12;
                const tBillable = tRate * tBillingMonths;
                const tPaid = headWisePaid[routeId] || 0;
                const tBalance = tBillable - tPaid;
                totalBilledToDate += tBillable;

                transportHTML = `
                <div class="bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-6 mb-4 relative overflow-hidden group">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div class="relative z-10 flex justify-between items-center">
                        <div class="space-y-3">
                            <h5 class="text-xs font-black text-amber-700 uppercase tracking-[0.2em]">Transit Services</h5>
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-black text-amber-600 bg-amber-100/50 px-3 py-1 rounded-full uppercase">Monthly</span>
                                <span class="text-[10px] font-black text-amber-800 bg-amber-200/50 px-3 py-1 rounded-full uppercase">${studentRouteName}</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-xl font-black text-slate-900 leading-none">₹${tBillable.toLocaleString()}</p>
                            <p class="text-[10px] font-black ${tBalance <= 0 ? 'text-emerald-600' : 'text-rose-600'} mt-2 uppercase tracking-wider">
                                ${tBalance <= 0 ? 'Settled' : `Due ₹${Math.abs(tBalance).toLocaleString()}`}
                            </p>
                        </div>
                    </div>
                    ${renderMonthBadges(routeId, monthTracker.transport, tBillingMonths, billingStartMonthIndex)}
                </div>`;
            }
        }

        const sessionDiscountTotal = totalDiscountGiven + sessionAdjustments.discount;
        const sessionAdvanceTotal = totalAdvanceAdjusted + sessionAdjustments.advance;
        const netPayable = totalBilledToDate - sessionDiscountTotal;
        const netBalance = totalReceived + sessionAdvanceTotal - netPayable;
        const isAdvance = netBalance > 0;

        let receiptsHTML = '';
        if (receiptsArray.length === 0) {
            receiptsHTML = `
                <div class="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                        <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 0h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <p class="text-sm font-black text-slate-400 uppercase tracking-widest">No Transaction History</p>
                </div>`;
        } else {
            receiptsArray.forEach((r, i) => {
                const paidInThis = parseFloat(r.totalCollected || 0);
                const pDisc = parseFloat(r.discount || 0);
                const pAdv = parseFloat(r.advanceAdjusted || 0);
                const pOldDue = parseFloat(r.prevOldDue || 0);
                const currentSelTotal = r.feesCollected ? r.feesCollected.reduce((acc, f) => acc + Number(f.amount || 0), 0) : 0;
                const netPayableAtTime = (currentSelTotal + pOldDue) - pAdv - pDisc;
                const txnValue = r.transactionId || r.txnId || r.referenceNo || 'N/A';

                const grouped = {};
                if (r.feesCollected) {
                    r.feesCollected.forEach(f => {
                        if (!grouped[f.feeHead]) grouped[f.feeHead] = { head: f.feeHead, months: [], totalAmt: 0, count: 0 };
                        const amt = Number(f.amount || 0);
                        if (f.month && f.month !== 'N/A') {
                            grouped[f.feeHead].months.push(f.month.split('-')[0]);
                            grouped[f.feeHead].count++;
                        }
                        grouped[f.feeHead].totalAmt += amt;
                    });
                }

                receiptsHTML += `
                <div class="receipt-item bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden mb-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10" data-receipt-id="${i}">
                    <div class="receipt-header p-6 bg-slate-900 text-white flex justify-between items-center cursor-pointer" data-receipt-id="${i}">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-lg">${receiptsArray.length - i}</div>
                            <div>
                                <p class="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Ref: ${r.receiptNo || 'N/A'}</p>
                                <p class="text-sm font-black mt-0.5">${new Date(r.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="text-right hidden sm:block">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                                <p class="text-lg font-black text-emerald-400">₹${paidInThis.toLocaleString()}</p>
                            </div>
                            <div class="receipt-toggle w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                <span class="chevron-icon transition-transform duration-300 inline-block text-[10px]" data-receipt-id="${i}">▼</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="receipt-content max-h-0 opacity-0 overflow-hidden transition-all duration-500 ease-in-out bg-slate-50" data-receipt-id="${i}">
                        <div class="p-6 space-y-6">
                            <div class="grid grid-cols-2 gap-3">
                                <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Mode</p>
                                    <p class="text-sm font-black text-slate-800">${r.mode || 'Cash'}</p>
                                </div>
                                <div class="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">TXN ID</p>
                                    <p class="text-sm font-mono font-bold text-indigo-600 truncate">${txnValue}</p>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Breakdown</p>
                                ${Object.values(grouped).map(item => `
                                    <div class="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100">
                                        <div>
                                            <p class="text-xs font-black text-slate-800 uppercase tracking-tight">${item.head}</p>
                                            <p class="text-[9px] font-bold text-slate-400">${item.months.length > 0 ? item.months.join(', ') : 'Academic'}</p>
                                        </div>
                                        <p class="text-sm font-black text-indigo-600">₹${item.totalAmt.toLocaleString()}</p>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-lg shadow-indigo-200 space-y-3">
                                ${pDisc > 0 ? `
                                <div class="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                                    <span class="text-xs font-bold opacity-70 uppercase tracking-widest">Payable</span>
                                    <span class="text-lg font-black">₹${(currentSelTotal + pOldDue).toLocaleString()}</span>
                                </div>
                                <div class="flex justify-between items-center py-2 border-b border-white/10">
                                    <span class="text-xs font-bold opacity-70 uppercase tracking-wider">Discount</span>
                                    <span class="text-lg font-black">-₹${pDisc.toLocaleString()}</span>
                                </div>` : ''}
                                ${pAdv > 0 ? `
                                <div class="flex justify-between items-center py-2 border-b border-white/10">
                                    <span class="text-xs font-bold opacity-70 uppercase tracking-wider">Advance Adjusted</span>
                                    <span class="text-lg font-black">-₹${pAdv.toLocaleString()}</span>
                                </div>` : ''}
                                <div class="flex justify-between items-center text-xl">
                                    <span class="font-black uppercase tracking-tighter">Amount Paid</span>
                                    <span class="font-black">₹${paidInThis.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        }

        mainContent.innerHTML = `
            <div class="max-w-xl mx-auto pt-8 space-y-10 pb-32 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div class="relative overflow-hidden rounded-[3rem] shadow-2xl transition-all duration-700 ${isAdvance ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700' : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900'} p-8">
                    <div class="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    
                    <div class="relative z-10">
                        <div class="flex justify-between items-center mb-10">
                            <span class="px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em]">${currentSession}</span>
                            <div class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                        </div>

                        <div class="text-center text-white space-y-2">
                            <p class="text-[11px] font-black opacity-60 uppercase tracking-[0.4em]">Current ${isAdvance ? 'Advance' : 'Due'} Balance</p>
                            <h2 class="text-6xl font-black tracking-tighter tabular-nums drop-shadow-2xl">
                                <span class="text-3xl mr-1 font-bold opacity-50">₹</span>${Math.abs(netBalance).toLocaleString()}
                            </h2>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-white/20">
                            <div class="text-center p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/5">
                                <p class="text-[11px] font-black text-yellow-400 uppercase tracking-[0.15em] mb-2">
                                    Total Billed
                                </p>
                                <p class="text-2xl font-black text-white drop-shadow-md">
                                    ₹${totalBilledToDate.toLocaleString()}
                                </p>
                            </div>

                            <div class="text-center p-3 rounded-xl bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/10">
                                <p class="text-[11px] font-black text-yellow-400 uppercase tracking-[0.15em] mb-2">
                                    Total Paid
                                </p>
                                <p class="text-2xl font-black text-emerald-400 drop-shadow-md">
                                    ₹${(totalReceived + sessionAdvanceTotal).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <section>
                    <div class="flex items-center justify-between mb-6 px-4">
                        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Head-wise Ledger</h3>
                        <div class="h-[1px] flex-1 bg-slate-100 mx-4"></div>
                    </div>
                    ${ledgerHTML}
                    ${transportHTML}
                </section>

                <section>
                    <div class="flex items-center justify-between mb-6 px-4">
                        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Transaction Vault</h3>
                        <div class="h-[1px] flex-1 bg-slate-100 mx-4"></div>
                    </div>
                    ${receiptsHTML}
                </section>
            </div>`;

        document.addEventListener('click', function(e) {
            const header = e.target.closest('.receipt-header');
            if (header) {
                const id = header.getAttribute('data-receipt-id');
                const content = document.querySelector(`.receipt-content[data-receipt-id="${id}"]`);
                const icon = document.querySelector(`.chevron-icon[data-receipt-id="${id}"]`);
                const isOpen = content.classList.contains('max-h-[2000px]');
                
                content.classList.toggle('max-h-0', isOpen);
                content.classList.toggle('max-h-[2000px]', !isOpen);
                content.classList.toggle('opacity-0', isOpen);
                content.classList.toggle('opacity-100', !isOpen);
                content.classList.toggle('mt-2', !isOpen);
                icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });

    } catch (error) {
        console.error(error);
        mainContent.innerHTML = `<div class="p-10 text-center font-black text-rose-500 uppercase tracking-widest">Sync Error: ${error.message}</div>`;
    }
};

function renderMonthBadges(headID, paidMonths, totalCount, startIndex) {
    const sessionMonths = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    let html = '<div class="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-6 pt-6 border-t border-slate-100">';
    
    for (let i = 0; i < totalCount; i++) {
        const monthIdx = (startIndex + i) % 12;
        const mName = sessionMonths[monthIdx];
        const isPaid = paidMonths.includes(mName);
        
        html += `
        <div class="flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-300 ${isPaid ? 'bg-emerald-50 border border-emerald-100' : 'bg-slate-50 border border-slate-100'}">
            <span class="text-[9px] font-black ${isPaid ? 'text-emerald-700' : 'text-slate-400'} uppercase">${mName}</span>
            <div class="w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 'bg-slate-300'}"></div>
        </div>`;
    }
    
    return html + '</div>';
}