import { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../../../service/auth.service';
import { useAuthStore } from '../../../utils/store.utils';
import { ILoginForm } from '../../../types';
import { Spinner } from '../../ui/index';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const guard = useRef(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil email dari state jika datang dari register
  const fromRegister = (location.state as { email?: string } | null)?.email || '';
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors } } = useForm<ILoginForm>({
    defaultValues: { email: fromRegister, password: '' }
  });

  const onSubmit = async (data: ILoginForm) => {
    if (guard.current) return;
    guard.current = true;
    setLoading(true);
    try {
      const result = await authService.login({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      // Simpan auth state
      setAuth(result.user, result.accessToken, result.refreshToken);
      toast.success(`Selamat datang, ${result.user.name}! 👋`);

      // Redirect berdasarkan role
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const dest = from && from !== '/login' && from !== '/register' ? from : '/';
        navigate(dest, { replace: true });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Email atau password salah');
      guard.current = false;
      setLoading(false);
    }
  };

  const inputStyle = (hasErr: boolean): React.CSSProperties => ({
    width:'100%', padding:'11px 14px 11px 38px',
    border:`1.5px solid ${hasErr?'#f43f5e':'var(--color-border)'}`,
    borderRadius:8, fontSize:14, fontFamily:'inherit', outline:'none',
    background:'var(--color-bg)', color:'var(--color-text)', transition:'border-color .2s',
  });

  const iconStyle: React.CSSProperties = {
    position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
    color:'var(--color-text-muted)', pointerEvents:'none',
  };

  return (
    <div style={{ width:'100%', animation:'fadeIn .35s ease-out' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'1.75rem', fontWeight:800, marginBottom:8, color:'var(--color-text)' }}>
          Selamat Datang 👋
        </h1>
        <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>
          Masuk ke akun NovaMart Anda
        </p>
        {fromRegister && (
          <div style={{ marginTop:10, padding:'10px 14px', borderRadius:8, background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.25)' }}>
            <p style={{ fontSize:13, color:'#059669', fontWeight:500 }}>✅ Akun berhasil dibuat! Silakan masuk.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display:'flex', flexDirection:'column', gap:16 }}>

        {/* Email */}
        <div>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--color-text)' }}>
            Email
          </label>
          <div style={{ position:'relative' }}>
            <Mail size={15} style={iconStyle} />
            <input
              {...register('email', { required:'Email wajib diisi', pattern:{ value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message:'Format tidak valid' } })}
              type="email" placeholder="email@contoh.com" disabled={loading}
              style={inputStyle(!!errors.email)}
              onFocus={e=>e.target.style.borderColor='var(--color-primary)'}
              onBlur={e=>e.target.style.borderColor=errors.email?'#f43f5e':'var(--color-border)'}
            />
          </div>
          {errors.email && <p style={{fontSize:12,color:'#f43f5e',marginTop:4}}>{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <label style={{ fontSize:13, fontWeight:600, color:'var(--color-text)' }}>Password</label>
            <a href="#" style={{ fontSize:12, color:'var(--color-primary)', fontWeight:600 }}>Lupa password?</a>
          </div>
          <div style={{ position:'relative' }}>
            <Lock size={15} style={iconStyle} />
            <input
              {...register('password', { required:'Password wajib diisi' })}
              type={showPwd?'text':'password'} placeholder="Masukkan password" disabled={loading}
              style={{ ...inputStyle(!!errors.password), paddingRight:40 }}
              onFocus={e=>e.target.style.borderColor='var(--color-primary)'}
              onBlur={e=>e.target.style.borderColor=errors.password?'#f43f5e':'var(--color-border)'}
            />
            <button type="button" onClick={()=>setShowPwd(!showPwd)} tabIndex={-1}
              style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--color-text-muted)', display:'flex', alignItems:'center' }}>
              {showPwd?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
          {errors.password && <p style={{fontSize:12,color:'#f43f5e',marginTop:4}}>{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={loading}
          style={{ width:'100%', padding:'13px', marginTop:4, border:'none', borderRadius:10, background:'linear-gradient(135deg,#f97316,#ea580c)', color:'#fff', fontSize:15, fontWeight:700, fontFamily:'inherit', cursor:loading?'not-allowed':'pointer', opacity:loading?.8:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(249,115,22,.35)', transition:'all .2s' }}>
          {loading?<><Spinner size={18}/> Memproses...</>:<>Masuk <ArrowRight size={16}/></>}
        </button>
      </form>

      <p style={{fontSize:14,textAlign:'center',marginTop:20,color:'var(--color-text-muted)'}}>
        Belum punya akun?{' '}
        <Link to="/register" style={{color:'var(--color-primary)',fontWeight:700}}>Daftar sekarang</Link>
      </p>

      {/* Demo */}
      <div style={{ marginTop:20, padding:'14px 16px', borderRadius:10, background:'rgba(249,115,22,.06)', border:'1px solid rgba(249,115,22,.2)' }}>
        <p style={{fontWeight:700,marginBottom:8,color:'var(--color-primary)',fontSize:13}}>🔑 Demo Admin Login</p>
        <p style={{fontSize:13,color:'var(--color-text-muted)',marginBottom:3}}>
          <strong>Email:</strong> admin@ecommerce.com
        </p>
        <p style={{fontSize:13,color:'var(--color-text-muted)',marginBottom:6}}>
          <strong>Password:</strong> Admin@123456
        </p>
        <p style={{fontSize:11,color:'var(--color-text-muted)',fontStyle:'italic'}}>
          * Pastikan sudah jalankan <code style={{background:'var(--color-bg-secondary)',padding:'1px 5px',borderRadius:4,fontStyle:'normal'}}>pnpm reset:admin</code> di folder backend
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
