-- ── 014: tipe notifikasi booking_rescheduled ──
alter table notifications drop constraint if exists notifications_type_check;
alter table notifications add constraint notifications_type_check
  check (type in (
    'staff_reply','booking_confirmed','booking_cancelled',
    'booking_completed','booking_reminder','booking_rescheduled'
  ));

notify pgrst, 'reload schema';
