import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { adminOnly } from '../middleware/auth.js';

const r = Router();
const clean = value => String(value || '').trim();
const validRole = role => ['admin', 'petugas'].includes(role);

r.get('/users', adminOnly, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) { next(error); }
});

r.post('/users', adminOnly, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!clean(name) || !clean(email) || String(password || '').length < 6 || !validRole(role)) {
      return res.status(400).json({ message: 'Nama, email, role, dan password minimal 6 karakter wajib diisi.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      'INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,name,email,role,created_at',
      [clean(name), clean(email).toLowerCase(), passwordHash, role]
    );
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

r.put('/users/:id', adminOnly, async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!clean(name) || !clean(email) || !validRole(role)) return res.status(400).json({ message: 'Data pengguna tidak valid.' });
    if (req.user.id === req.params.id && role !== 'admin') return res.status(400).json({ message: 'Anda tidak dapat mengubah role akun sendiri.' });
    const params = [clean(name), clean(email).toLowerCase(), role];
    let sql = 'UPDATE users SET name=$1,email=$2,role=$3';
    if (password) {
      if (String(password).length < 6) return res.status(400).json({ message: 'Password minimal 6 karakter.' });
      params.push(await bcrypt.hash(password, 10));
      sql += `,password_hash=$${params.length}`;
    }
    params.push(req.params.id);
    sql += ` WHERE id=$${params.length} RETURNING id,name,email,role,created_at`;
    const { rows } = await query(sql, params);
    if (!rows[0]) return res.sendStatus(404);
    res.json(rows[0]);
  } catch (error) { next(error); }
});

r.delete('/users/:id', adminOnly, async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) return res.status(400).json({ message: 'Anda tidak dapat menghapus akun sendiri.' });
    const result = await query('DELETE FROM users WHERE id=$1', [req.params.id]);
    if (!result.rowCount) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (error) { next(error); }
});
export default r;
