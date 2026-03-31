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
  const formattedDate = `${day}-${month}-${year}`;

  const path = `attendance/${today.slice(0, 7)}/student/${cls}/${sec}/${folio}`;
  const snap = await db.ref(path).once('value');
  const attendanceData = snap.val() || {};
  if (!(today in attendanceData)) return;

  const isAbsent = attendanceData[today] === "A";

  const UI = {
    color: isAbsent ? "#e11d48" : "#059669",
    bg: isAbsent ? "#fff1f2" : "#f0fdf4",
    label: isAbsent ? "ABSENT" : "PRESENT",
    emoji: isAbsent ? "😡" : "😊"
  };

  Swal.fire({
    showConfirmButton: true,
    confirmButtonText: 'OK',
    confirmButtonColor: UI.color,
    width: '320px',
    padding: '1.5rem',
    background: '#ffffff',
    customClass: { popup: 'rounded-3xl shadow-2xl' },
    html: `
      <div style="font-family: 'Inter', sans-serif; text-align: center;">
        <div style="font-size: 50px; margin-bottom: 10px;">
          ${UI.emoji}
        </div>
        <p style="color: #64748b; font-size: 10px; margin-bottom: 15px;">
          Dear <b style="color: #1e293b;">${name}</b>, you are!
        </p>
        <div style="background: ${UI.bg}; border: 2px solid ${UI.color}33; border-radius: 20px; padding: 20px;">
          <div style="font-size: 25px; font-weight: 900; color: ${UI.color}; letter-spacing: 1px;">
            ${UI.label}
          </div>
          <div style="margin-top: 5px; font-size: 13px; color: #475569; font-weight: 600;">
            ${formattedDate}
          </div>
        </div>
        <div style="margin-top: 15px; font-size: 11px; color: #94a3b8; font-weight: 500;">
          Class: ${cls}-${sec}
        </div>
      </div>
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