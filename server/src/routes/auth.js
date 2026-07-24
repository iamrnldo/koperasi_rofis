import {Router} from 'express'; import bcrypt from 'bcryptjs'; import jwt from 'jsonwebtoken'; import {query} from '../db.js';
const r=Router();
r.post('/login',async(req,res,next)=>{try{const {email,password}=req.body;if(!email||!password)return res.status(400).json({message:'Email dan password wajib'});const {rows}=await query('SELECT * FROM users WHERE email=$1',[email.toLowerCase()]);const u=rows[0];if(!u||!await bcrypt.compare(password,u.password_hash))return res.status(401).json({message:'Email atau password salah'});const user={id:u.id,name:u.name,email:u.email,role:u.role};
if(user.role==='petugas' && req.get('X-Client-Platform')!=='mobile') return res.status(403).json({message:'Akun petugas hanya dapat digunakan melalui aplikasi mobile.'});
res.json({token:jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'8h'}),user})}catch(e){next(e)}});
export default r;
