// server/routes/concierge.routes.js — support contact logging
import { getDb } from '../db.js';
import { logAudit } from '../middleware.js';
import { newId } from '../auth.js';

// POST /api/concierge/contact
export function contactConcierge(req, res) {
  const { subject, message } = req.body;
  const db = getDb();
  const userId = req.user?.id || null;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';

  db.prepare(`
    INSERT INTO concierge_requests (id, user_id, subject, message, ip)
    VALUES (?, ?, ?, ?, ?)
  `).run(newId('cq_'), userId, subject || 'General Inquiry', message || '', ip);

  if (userId) {
    logAudit(userId, 'CONCIERGE_CONTACT', 'info', { subject }, ip);
  }

  return res.json(200, { ok: true, message: 'Your concierge request has been received.' });
}
