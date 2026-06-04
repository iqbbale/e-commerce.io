import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check, X } from 'lucide-react';
import { authService } from '../../../service/auth.service';
import { IRegisterForm } from '../../../types';
import { Spinner } from '../../ui/index';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const guard = useRef(false);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IRegisterForm>();
  const pwd = watch('password', '');
  const confirm = watch('confirmPassword', '');

  const strength = (() => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 6) s++;
    if (pwd.length >= 10) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^a-zA-Z0-9]/.test(pwd)) s++;
    return Math.min(4, s);
  })();

  const SC = ['','#ef4444','#f97316','#eab308','#10b981'];
  const SL = ['','Lemah','Cukup','Bagus','Kuat'];
  const pwMatch = confirm.length > 0 && pwd === confirm;
  const pwMismatch = confirm.length > 0 && pwd !== confirm;

  const onSubmit = async (data: IRegisterForm) => {
    if (guard.current) return;
    if (data.password !== data.confirmPassword) {
      toast.error('Password dan konfirmasi tidak cocok');
      return;
    }
    guard.current = true;
    setLoading(true);
    try {
      // Register - TIDAK login otomatis, arahkan ke halaman login
      await authService.register(data);
      toast.success('Akun berhasil dibuat! Silakan masuk.', { duration: 4000 });
      // Arahkan ke login dengan email terisi
      navigate('/login', { state: { email: data.email }, replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (status === 409) {
        toast.error('Email sudah terdaftar. Silakan masuk atau gunakan email lain.');
      } else {
        toast.error(msg || 'Registrasi gagal, coba lagi');
      }
      guard.current = false;
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', animation: 'fadeIn .35s ease-out' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, marginBottom:8, color:'var(--color-text)' }}>
          Buat Akun Baru ✨
        </h1>
        <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem', lineHeight:1.5 }}>
          Bergabung dengan jutaan pembeli di NovaMart
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* Nama */}
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--color-text)' }}>
            Nama Lengkap <span style={{color:'#f43f5e'}}>*</span>
          </label>
          <div style={{ position:'relative' }}>
            <User size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)', pointerEvents:'none' }} />
            <input {...register('name',{required:'Nama wajib diisi',minLength:{value:2,message:'Min. 2 karakter'}})}
              type="text" placeholder="Nama lengkap" disabled={loading}
              style={{ width:'100%', padding:'11px 14px 11px 38px', border:`1.5px solid ${errors.name?'#f43f5e':'var(--color-border)'}`, borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'var(--color-bg)', color:'var(--color-text)', transition:'border-color .2s' }}
              onFocus={e=>e.target.style.borderColor='var(--color-primary)'}
              onBlur={e=>e.target.style.borderColor=errors.name?'#f43f5e':'var(--color-border)'}
            />
          </div>
          {errors.name && <p style={{fontSize:12,color:'#f43f5e',marginTop:4}}>{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--color-text)' }}>
            Email <span style={{color:'#f43f5e'}}>*</span>
          </label>
          <div style={{ position:'relative' }}>
            <Mail size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)', pointerEvents:'none' }} />
            <input {...register('email',{required:'Email wajib diisi',pattern:{value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/,message:'Format email tidak valid'}})}
              type="email" placeholder="email@contoh.com" disabled={loading}
              style={{ width:'100%', padding:'11px 14px 11px 38px', border:`1.5px solid ${errors.email?'#f43f5e':'var(--color-border)'}`, borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'var(--color-bg)', color:'var(--color-text)', transition:'border-color .2s' }}
              onFocus={e=>e.target.style.borderColor='var(--color-primary)'}
              onBlur={e=>e.target.style.borderColor=errors.email?'#f43f5e':'var(--color-border)'}
            />
          </div>
          {errors.email && <p style={{fontSize:12,color:'#f43f5e',marginTop:4}}>{errors.email.message}</p>}
        </div>

        {/* No HP */}
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--color-text)' }}>
            Nomor HP <span style={{fontWeight:400, color:'var(--color-text-muted)'}}>(Opsional)</span>
          </label>
          <div style={{ position:'relative' }}>
            <Phone size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)', pointerEvents:'none' }} />
            <input {...register('phone')} type="tel" placeholder="08xxxxxxxxxx" disabled={loading}
              style={{ width:'100%', padding:'11px 14px 11px 38px', border:'1.5px solid var(--color-border)', borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'var(--color-bg)', color:'var(--color-text)', transition:'border-color .2s' }}
              onFocus={e=>e.target.style.borderColor='var(--color-primary)'}
              onBlur={e=>e.target.style.borderColor='var(--color-border)'}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--color-text)' }}>
            Password <span style={{color:'#f43f5e'}}>*</span>
          </label>
          <div style={{ position:'relative' }}>
            <Lock size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)', pointerEvents:'none' }} />
            <input {...register('password',{required:'Password wajib diisi',minLength:{value:6,message:'Min. 6 karakter'}})}
              type={showPwd?'text':'password'} placeholder="Minimal 6 karakter" disabled={loading}
              style={{ width:'100%', padding:'11px 40px 11px 38px', border:`1.5px solid ${errors.password?'#f43f5e':'var(--color-border)'}`, borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'var(--color-bg)', color:'var(--color-text)', transition:'border-color .2s' }}
              onFocus={e=>e.target.style.borderColor='var(--color-primary)'}
              onBlur={e=>e.target.style.borderColor=errors.password?'#f43f5e':'var(--color-border)'}
            />
            <button type="button" onClick={()=>setShowPwd(!showPwd)} tabIndex={-1}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' }}>
              {showPwd?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {pwd.length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i=>(
                  <div key={i} style={{ height:5, flex:1, borderRadius:99, transition:'background .3s', background: i<=strength?SC[strength]:'var(--color-border)' }}/>
                ))}
              </div>
              <p style={{ fontSize:11, fontWeight:600, color:SC[strength] }}>Kekuatan: {SL[strength]}</p>
            </div>
          )}
          {errors.password && <p style={{fontSize:12,color:'#f43f5e',marginTop:4}}>{errors.password.message}</p>}
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--color-text)' }}>
            Konfirmasi Password <span style={{color:'#f43f5e'}}>*</span>
          </label>
          <div style={{ position:'relative' }}>
            <Lock size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)', pointerEvents:'none' }} />
            <input {...register('confirmPassword',{required:'Wajib diisi',validate:v=>v===pwd||'Password tidak cocok'})}
              type={showConfirm?'text':'password'} placeholder="Ulangi password" disabled={loading}
              style={{ width:'100%', padding:'11px 40px 11px 38px', border:`1.5px solid ${pwMismatch?'#f43f5e':pwMatch?'#10b981':'var(--color-border)'}`, borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none', background:'var(--color-bg)', color:'var(--color-text)', transition:'border-color .2s' }}
            />
            <button type="button" onClick={()=>setShowConfirm(!showConfirm)} tabIndex={-1}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color: pwMatch?'#10b981':pwMismatch?'#f43f5e':'var(--color-text-muted)', display:'flex', alignItems:'center' }}>
              {pwMatch?<Check size={16}/>:pwMismatch?<X size={16}/>:showConfirm?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {pwMatch && <p style={{fontSize:12,color:'#10b981',marginTop:4,fontWeight:500}}>✓ Password cocok</p>}
          {errors.confirmPassword && <p style={{fontSize:12,color:'#f43f5e',marginTop:4}}>{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:'13px', marginTop:4, border:'none', borderRadius:10, background:'linear-gradient(135deg,#f97316,#ea580c)', color:'#fff', fontSize:15, fontWeight:700, fontFamily:'inherit', cursor:loading?'not-allowed':'pointer', opacity:loading?.8:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(249,115,22,.35)', transition:'all .2s' }}>
          {loading?<><Spinner size={18}/> Membuat akun...</>:<>Buat Akun <ArrowRight size={16}/></>}
        </button>
      </form>

      <p style={{fontSize:12,textAlign:'center',marginTop:14,color:'var(--color-text-muted)'}}>
        Dengan mendaftar, Anda menyetujui{' '}
        <a href="#" style={{color:'var(--color-primary)',fontWeight:600}}>Syarat & Ketentuan</a> kami.
      </p>
      <p style={{fontSize:14,textAlign:'center',marginTop:12,color:'var(--color-text-muted)'}}>
        Sudah punya akun?{' '}
        <Link to="/login" style={{color:'var(--color-primary)',fontWeight:700}}>Masuk</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
