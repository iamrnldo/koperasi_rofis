import 'dotenv/config'; import express from 'express'; import cors from 'cors'; import morgan from 'morgan'; import {pool} from './db.js'; import {migrateDatabase} from './migrate.js'; import authRoutes from './routes/auth.js'; import crudRoutes from './routes/crud.js'; import stockRoutes from './routes/stock.js'; import userRoutes from './routes/users.js'; import {auth} from './middleware/auth.js';
const app=express();
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(x => x.trim());
// Use CORS_ORIGIN=* only on a trusted local network during Android development.
app.use(cors({ origin: corsOrigins.includes('*') ? true : corsOrigins, credentials: false }));
app.use(express.json()); app.use(morgan('tiny'));
app.get('/api', (req,res)=>res.json({name:'Koperasi Rofis API', status:'ok', health:'/api/health'}));
app.get('/api/health',async(req,res)=>{await pool.query('SELECT 1');res.json({status:'ok'})});app.use('/api/auth',authRoutes);app.use('/api',auth,crudRoutes);app.use('/api',auth,stockRoutes);app.use('/api',auth,userRoutes);
app.use((e,req,res,next)=>{console.error(e);res.status(e.code==='23505'?409:500).json({message:e.code==='23505'?'Data duplikat':e.message||'Terjadi kesalahan server'})});

async function start(){
  try { await migrateDatabase(); app.listen(process.env.PORT||3000,()=>console.log('API berjalan; database siap')); }
  catch (error) { console.error('Gagal menyiapkan database:', error); process.exit(1); }
}
start();
