const MenuConfig = {

    roleMap: {
        STUDENT: [
            { id: 'att', label: 'Attendance', icon: 'user-check', color: 'bg-indigo-600', file: 'modules/student/attendance.js' },
            { id: 'fees', label: 'Due', icon: 'hand-coins', color: 'bg-red-500', file: 'modules/student/fees.js' },
            { id: 'routine', label: 'Class Routine', icon: 'calendar-range', color: 'bg-violet-600', file: 'modules/student/routine.js' },
            { id: 'syllabus', label: 'Syllabus', icon: 'book-open-check', color: 'bg-rose-500', file: 'modules/student/syllabus.js' },
            { id: 'exam', label: 'Exams', icon: 'graduation-cap', color: 'bg-sky-500', file: 'modules/student/exam.js' },
            { id: 'homework', label: 'Homework', icon: 'pen-tool', color: 'bg-amber-500', file: 'modules/student/homework.js' },
            { id: 'gallery', label: 'Gallery', icon: 'images', color: 'bg-pink-500', file: 'modules/student/gallery.js' },
            { id: 'notice', label: 'Notice', icon: 'megaphone', color: 'bg-orange-500', file: 'modules/student/notice.js' },
            { id: 'events', label: 'Events', icon: 'calendar-days', color: 'bg-purple-500', file: 'modules/student/events.js' },
            { id: 'library', label: 'Library', icon: 'library-big', color: 'bg-stone-600', file: 'modules/student/library.js' },
            { id: 'about', label: 'About', icon: 'info', color: 'bg-blue-500', file: 'modules/student/about.js' },
            { id: 'support', label: 'Help', icon: 'headset', color: 'bg-teal-600', file: 'modules/student/support.js' }
        ],

        TEACHER: [
            { id: 'att_take', label: 'Attendance', icon: 'user-check', color: 'bg-indigo-600', file: 'modules/teacher/attendance.js' },
            { id: 'att_view', label: 'Logs', icon: 'calendar-check-2', color: 'bg-emerald-500', file: 'modules/teacher/att_view.js' },
            { id: 'routine', label: 'Class Routine', icon: 'calendar-range', color: 'bg-violet-600', file: 'modules/teacher/routine.js' },
            { id: 'syllabus', label: 'Syllabus', icon: 'book-open-check', color: 'bg-rose-500', file: 'modules/teacher/syllabus.js' },
            { id: 'exam', label: 'Exams', icon: 'graduation-cap', color: 'bg-sky-500', file: 'modules/teacher/exam.js' },
            { id: 'homework', label: 'Homework', icon: 'pen-tool', color: 'bg-amber-500', file: 'modules/teacher/homework.js' },
            { id: 'gallery', label: 'Gallery', icon: 'images', color: 'bg-pink-500', file: 'modules/teacher/gallery.js' },
            { id: 'notice', label: 'Notice', icon: 'megaphone', color: 'bg-orange-500', file: 'modules/teacher/notice.js' },
            { id: 'events', label: 'Events', icon: 'calendar-days', color: 'bg-purple-500', file: 'modules/teacher/events.js' },
            { id: 'library', label: 'Library', icon: 'library-big', color: 'bg-stone-600', file: 'modules/teacher/library.js' },
            { id: 'payout', label: 'Payroll', icon: 'indian-rupee', color: 'bg-slate-700', file: 'modules/teacher/payout.js' },
            { id: 'about', label: 'About', icon: 'info', color: 'bg-blue-500', file: 'modules/teacher/about.js' },
            { id: 'support', label: 'Help', icon: 'headset', color: 'bg-teal-600', file: 'modules/teacher/support.js' }
        ],

        COORDINATOR: [
            { id: 'att_take', label: 'Attendance', icon: 'user-check', color: 'bg-indigo-600', file: 'modules/coordinator/attendance.js' },
            { id: 'att_view', label: 'Logs', icon: 'calendar-check-2', color: 'bg-emerald-500', file: 'modules/coordinator/att_view.js' },
            { id: 'routine', label: 'Class Routine', icon: 'calendar-range', color: 'bg-violet-600', file: 'modules/coordinator/routine.js' },
            { id: 'student_list', label: 'Students', icon: 'users', color: 'bg-blue-600', file: 'modules/coordinator/student_list.js' },
            { id: 'staff_list', label: 'Staffs', icon: 'users-round', color: 'bg-cyan-600', file: 'modules/coordinator/staff_list.js' },
            { id: 'syllabus', label: 'Syllabus', icon: 'book-open-check', color: 'bg-rose-500', file: 'modules/coordinator/syllabus.js' },
            { id: 'homework', label: 'Homework', icon: 'pen-tool', color: 'bg-amber-500', file: 'modules/coordinator/homework.js' },
            { id: 'exam', label: 'Exams', icon: 'graduation-cap', color: 'bg-sky-500', file: 'modules/coordinator/exam.js' },
            { id: 'gallery', label: 'Gallery', icon: 'images', color: 'bg-pink-500', file: 'modules/coordinator/gallery.js' },
            { id: 'notice', label: 'Notice', icon: 'megaphone', color: 'bg-orange-500', file: 'modules/coordinator/notice.js' },
            { id: 'events', label: 'Events', icon: 'calendar-days', color: 'bg-purple-500', file: 'modules/coordinator/events.js' },
            { id: 'library', label: 'Library', icon: 'library-big', color: 'bg-stone-600', file: 'modules/coordinator/library.js' },
            { id: 'due_demand', label: 'Due', icon: 'hand-coins', color: 'bg-red-500', file: 'modules/coordinator/due_demand.js' },
            { id: 'payout', label: 'Payroll', icon: 'indian-rupee', color: 'bg-slate-700', file: 'modules/coordinator/payout.js' },
            { id: 'about', label: 'About', icon: 'info', color: 'bg-blue-500', file: 'modules/coordinator/about.js' },
            { id: 'support', label: 'Help', icon: 'headset', color: 'bg-teal-600', file: 'modules/coordinator/support.js' }
        ],

        PRINCIPAL: [
            { id: 'att_take', label: 'Attendance', icon: 'user-check', color: 'bg-indigo-600', file: 'modules/principal/attendance.js' },
            { id: 'att_view', label: 'Logs', icon: 'calendar-check-2', color: 'bg-emerald-500', file: 'modules/principal/att_view.js' },
            { id: 'routine', label: 'Class Routine', icon: 'calendar-range', color: 'bg-violet-600', file: 'modules/principal/routine.js' },
            { id: 'student_list', label: 'Students', icon: 'users', color: 'bg-blue-600', file: 'modules/principal/student_list.js' },
            { id: 'staff_list', label: 'Staffs', icon: 'users-round', color: 'bg-cyan-600', file: 'modules/principal/staff_list.js' },
            { id: 'syllabus', label: 'Syllabus', icon: 'book-open-check', color: 'bg-rose-500', file: 'modules/principal/syllabus.js' },
            { id: 'homework', label: 'Homework', icon: 'pen-tool', color: 'bg-amber-500', file: 'modules/principal/homework.js' },
            { id: 'exam', label: 'Exams', icon: 'graduation-cap', color: 'bg-sky-500', file: 'modules/principal/exam.js' },
            { id: 'gallery', label: 'Gallery', icon: 'images', color: 'bg-pink-500', file: 'modules/principal/gallery.js' },
            { id: 'notice', label: 'Notice', icon: 'megaphone', color: 'bg-orange-500', file: 'modules/principal/notice.js' },
            { id: 'events', label: 'Events', icon: 'calendar-days', color: 'bg-purple-500', file: 'modules/principal/events.js' },
            { id: 'library', label: 'Library', icon: 'library-big', color: 'bg-stone-600', file: 'modules/principal/library.js' },
            { id: 'due_demand', label: 'Due', icon: 'hand-coins', color: 'bg-red-500', file: 'modules/principal/due_demand.js' },
            { id: 'payout', label: 'Payroll', icon: 'indian-rupee', color: 'bg-slate-700', file: 'modules/principal/payout.js' },
            { id: 'about', label: 'About', icon: 'info', color: 'bg-blue-500', file: 'modules/principal/about.js' },
            { id: 'support', label: 'Help', icon: 'headset', color: 'bg-teal-600', file: 'modules/principal/support.js' }
        ],

        ACCOUNTANT: [
            { id: 'due_demand', label: 'Due', icon: 'hand-coins', color: 'bg-red-500', file: 'modules/accountant/due_demand.js' },
            { id: 'payout', label: 'Payroll', icon: 'indian-rupee', color: 'bg-slate-700', file: 'modules/accountant/payout.js' },
            { id: 'expenses', label: 'Expenses', icon: 'trending-down', color: 'bg-rose-600', file: 'modules/accountant/expenses.js' },
            { id: 'student_list', label: 'Students', icon: 'users', color: 'bg-blue-600', file: 'modules/accountant/student_list.js' },
            { id: 'staff_list', label: 'Staffs', icon: 'users-round', color: 'bg-cyan-600', file: 'modules/accountant/staff_list.js' },
            { id: 'gallery', label: 'Gallery', icon: 'images', color: 'bg-pink-500', file: 'modules/accountant/gallery.js' },
            { id: 'notice', label: 'Notice', icon: 'megaphone', color: 'bg-orange-500', file: 'modules/accountant/notice.js' },
            { id: 'events', label: 'Events', icon: 'calendar-days', color: 'bg-purple-500', file: 'modules/accountant/events.js' },
            { id: 'library', label: 'Library', icon: 'library-big', color: 'bg-stone-600', file: 'modules/accountant/library.js' },
            { id: 'accounts_report', label: 'Reports', icon: 'bar-chart-3', color: 'bg-gray-800', file: 'modules/accountant/finance_report.js' },
            { id: 'about', label: 'About', icon: 'info', color: 'bg-blue-500', file: 'modules/accountant/about.js' },
            { id: 'support', label: 'Help', icon: 'headset', color: 'bg-teal-600', file: 'modules/accountant/support.js' }
        ],

        ADMIN: [
            { id: 'att_take', label: 'Attendance', icon: 'user-check', color: 'bg-indigo-600', file: 'modules/admin/attendance.js' },
            { id: 'att_view', label: 'Logs', icon: 'calendar-check-2', color: 'bg-emerald-500', file: 'modules/admin/att_view.js' },
            { id: 'student_list', label: 'Students', icon: 'users', color: 'bg-blue-600', file: 'modules/admin/student_list.js' },
            { id: 'staff_list', label: 'Staffs', icon: 'users-round', color: 'bg-cyan-600', file: 'modules/admin/staff_list.js' },
            { id: 'routine', label: 'Class Routine', icon: 'calendar-range', color: 'bg-violet-600', file: 'modules/admin/routine.js' },
            { id: 'syllabus', label: 'Syllabus', icon: 'book-open-check', color: 'bg-rose-500', file: 'modules/admin/syllabus.js' },
            { id: 'homework', label: 'Homework', icon: 'pen-tool', color: 'bg-amber-500', file: 'modules/admin/homework.js' },
            { id: 'exam', label: 'Exams', icon: 'graduation-cap', color: 'bg-sky-500', file: 'modules/admin/exam.js' },
            { id: 'gallery', label: 'Gallery', icon: 'images', color: 'bg-pink-500', file: 'modules/admin/gallery.js' },
            { id: 'notice', label: 'Notice', icon: 'megaphone', color: 'bg-orange-500', file: 'modules/admin/notice.js' },
            { id: 'events', label: 'Events', icon: 'calendar-days', color: 'bg-purple-500', file: 'modules/admin/events.js' },
            { id: 'library', label: 'Library', icon: 'library-big', color: 'bg-stone-600', file: 'modules/admin/library.js' },
            { id: 'due_demand', label: 'Due', icon: 'hand-coins', color: 'bg-red-500', file: 'modules/admin/due_demand.js' },
            { id: 'payout', label: 'Payroll', icon: 'indian-rupee', color: 'bg-slate-700', file: 'modules/admin/payout.js' },
            { id: 'expenses', label: 'Expenses', icon: 'trending-down', color: 'bg-rose-600', file: 'modules/admin/expenses.js' },
            { id: 'accounts_report', label: 'Reports', icon: 'bar-chart-3', color: 'bg-gray-800', file: 'modules/admin/finance_report.js' },
            { id: 'about', label: 'About', icon: 'info', color: 'bg-blue-500', file: 'modules/admin/about.js' },
            { id: 'support', label: 'Help', icon: 'headset', color: 'bg-teal-600', file: 'modules/admin/support.js' }
        ],

        CLERK: [
            { id: 'att_take', label: 'Attendance', icon: 'user-check', color: 'bg-indigo-600', file: 'modules/clerk/attendance.js' },
            { id: 'att_view', label: 'Logs', icon: 'calendar-check-2', color: 'bg-emerald-500', file: 'modules/clerk/att_view.js' },
            { id: 'routine', label: 'Class Routine', icon: 'calendar-range', color: 'bg-violet-600', file: 'modules/clerk/routine.js' },
            { id: 'student_list', label: 'Students', icon: 'users', color: 'bg-blue-600', file: 'modules/clerk/student_list.js' },
            { id: 'staff_list', label: 'Staffs', icon: 'users-round', color: 'bg-cyan-600', file: 'modules/clerk/staff_list.js' },
            { id: 'syllabus', label: 'Syllabus', icon: 'book-open-check', color: 'bg-rose-500', file: 'modules/clerk/syllabus.js' },
            { id: 'homework', label: 'Homework', icon: 'pen-tool', color: 'bg-amber-500', file: 'modules/clerk/homework.js' },
            { id: 'exam', label: 'Exams', icon: 'graduation-cap', color: 'bg-sky-500', file: 'modules/clerk/exam.js' },
            { id: 'gallery', label: 'Gallery', icon: 'images', color: 'bg-pink-500', file: 'modules/clerk/gallery.js' },
            { id: 'notice', label: 'Notice', icon: 'megaphone', color: 'bg-orange-500', file: 'modules/clerk/notice.js' },
            { id: 'events', label: 'Events', icon: 'calendar-days', color: 'bg-purple-500', file: 'modules/clerk/events.js' },
            { id: 'library', label: 'Library', icon: 'library-big', color: 'bg-stone-600', file: 'modules/clerk/library.js' },
            { id: 'due_demand', label: 'Due', icon: 'hand-coins', color: 'bg-red-500', file: 'modules/clerk/due_demand.js' },
            { id: 'payout', label: 'Payroll', icon: 'indian-rupee', color: 'bg-slate-700', file: 'modules/clerk/payout.js' },
            { id: 'about', label: 'About', icon: 'info', color: 'bg-blue-500', file: 'modules/clerk/about.js' },
            { id: 'support', label: 'Help', icon: 'headset', color: 'bg-teal-600', file: 'modules/clerk/support.js' }
        ]
    },

    roleResolver(designation = '') {
        const d = designation.toUpperCase();

        if (d.includes('ADMIN')) return 'ADMIN';
        if (d.includes('PRINCIPAL')) return 'PRINCIPAL';
        if (d.includes('COORDINATOR')) return 'COORDINATOR';
        if (d.includes('ACCOUNTANT')) return 'ACCOUNTANT';
        if (d.includes('TEACHER')) return 'TEACHER';
        if (d.includes('STUDENT')) return 'STUDENT';
        if (d.includes('CLERK')) return 'CLERK';

        return null;
    }

};