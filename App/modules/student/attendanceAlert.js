window.checkAttendanceAlert = async function (App, db) {
  const { user: u, role } = App.state;
  if (!u || role !== 'STUDENT' || new Date().getHours() < 10) return;

  const name = u.profile?.studentName || u.name || "Student";
  const { class: cls, section: sec } = u.academic || {};
  const folio = u.profile?.folio;
  if (!folio) return;

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const day = now.getDate().toString().padStart(2, '0');
  const month = now.toLocaleString('en-GB', { month: 'short' });
  const year = now.getFullYear();
  const formattedDate = `${day} ${month}, ${year}`;

  const path = `attendance/${today.slice(0, 7)}/student/${cls}/${sec}/${folio}`;
  const snap = await db.ref(path).once('value');
  const attendanceData = snap.val() || {};
  if (!(today in attendanceData)) return;

  const isAbsent = attendanceData[today] === "A";

  const UI = {
    themeColor: isAbsent ? "#ff4b2b" : "#00b09b",
    gradient: isAbsent 
      ? "linear-gradient(135deg, #ff4b2b 0%, #ff416c 100%)" 
      : "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    bgLight: isAbsent ? "#fff5f5" : "#f0fff4",
    icon: isAbsent 
      ? "https://cdn-icons-png.flaticon.com/512/6659/6659895.png" 
      : "https://cdn-icons-png.flaticon.com/512/190/190411.png",
    label: isAbsent ? "ABSENT" : "PRESENT",
    subtext: isAbsent ? "Oh no! You missed class today." : "Great! Good Going!"
  };

  Swal.fire({
    showConfirmButton: true,
    confirmButtonText: 'DISMISS',
    confirmButtonColor: '#1e293b',
    width: '350px',
    background: '#ffffff',
    padding: '0',
    customClass: {
      popup: 'rounded-[30px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)]',
      confirmButton: 'rounded-xl px-8 py-3 text-sm font-bold tracking-wider'
    },
    showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
    hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
    html: `
      <div style="font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;">
        <div style="background: ${UI.gradient}; padding: 40px 20px; position: relative; border-radius: 20px;">
          <img src="${UI.icon}" style="width: 80px; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));" />
          <div style="position: absolute; bottom: -15px; left: 50%; transform: translateX(-50%); 
                      background: white; padding: 5px 20px; border-radius: 50px; 
                      box-shadow: 0 4px 10px rgba(0,0,0,0.1); font-weight: 800; 
                      color: ${UI.themeColor}; font-size: 12px; letter-spacing: 2px;">
            STATUS
          </div>
        </div>

        <div style="padding: 40px 25px 25px 25px; text-align: center;">
          <h2 style="margin: 0; font-size: 14px; color: #64748b; font-weight: 500; text-transform: uppercase;">
            Hi, ${name.split(' ')[0]}
          </h2>
          <h1 style="margin: 5px 0 20px 0; font-size: 32px; font-weight: 800; color: #1e293b;">
            You are <span style="color: ${UI.themeColor}">${UI.label}</span>
          </h1>

          <div style="background: ${UI.bgLight}; border-radius: 20px; padding: 15px; border: 1px dashed ${UI.themeColor}55;">
             <div style="font-size: 15px; font-weight: 700; color: #334155;">
                ${formattedDate}
             </div>
             <div style="font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600;">
                Class: ${cls} • Section: ${sec}
             </div>
          </div>

          <p style="margin-top: 20px; font-size: 13px; color: #94a3b8; line-height: 1.5;">
            ${UI.subtext}
          </p>
        </div>
      </div>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap');
        .swal2-actions { margin-top: 0 !important; padding-bottom: 25px; }
      </style>
    `
  });
};

window.initAttendanceAlerts = function (App, db) {
  if (typeof window.checkAttendanceAlert !== 'function') return;

  let lastFolio = App.state.user?.profile?.folio || null;
  window.checkAttendanceAlert(App, db);

  new MutationObserver(() => {
    const currentFolio = App.state.user?.profile?.folio || null;
    if (currentFolio && currentFolio !== lastFolio) {
      lastFolio = currentFolio;
      window.checkAttendanceAlert(App, db);
    }
  }).observe(document.body, { childList: true, subtree: true });
};
