import React, { useState } from 'react';
import { X, Lock, Mail, User, Stethoscope, ShieldCheck, Award, Building, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [regType, setRegType] = useState<'patient' | 'doctor'>('patient');

  // Common user fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Doctor specific fields
  const [pmdcNumber, setPmdcNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialty, setSpecialty] = useState('Dermatology');
  const [hospitalName, setHospitalName] = useState('');
  const [city, setCity] = useState('Karachi');
  const [phone, setPhone] = useState('');
  const [consultationFee, setConsultationFee] = useState(2500);

  const { login, register, registerDoctor, loginDemo, isLoading } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const success = await login(email, password);
      if (success) onClose();
    } else if (regType === 'patient') {
      const success = await register({
        email,
        username,
        password,
        first_name: firstName,
        last_name: lastName
      });
      if (success) {
        setMode('login');
      }
    } else {
      // Doctor Registration
      if (!pmdcNumber.trim()) {
        showToast('Valid PMDC / PMC registration number is required.', 'error');
        return;
      }
      const success = await registerDoctor({
        email,
        username,
        password,
        first_name: firstName.startsWith('Dr.') ? firstName : `Dr. ${firstName}`,
        last_name: lastName,
        pmdc_number: pmdcNumber.trim().toUpperCase(),
        qualification: qualification.trim() || 'MBBS, FCPS (Dermatology)',
        specialty,
        hospital_name: hospitalName.trim() || 'Hamdard University Hospital',
        city,
        phone: phone.trim() || '+92 300 1234567',
        consultation_fee: Number(consultationFee) || 2500
      });
      if (success) {
        setMode('login');
      }
    }
  };

  const handleDemoLogin = (role: 'patient' | 'admin' | 'doctor') => {
    loginDemo(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`bg-white rounded-3xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp transition-all ${
        mode === 'register' && regType === 'doctor' ? 'max-w-xl' : 'max-w-md'
      }`}>
        
        {/* Top Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black tracking-tight">
                {mode === 'login'
                  ? 'Sign In to Dermalytics'
                  : regType === 'patient'
                  ? 'Create Patient Account'
                  : 'Register Medical Specialist'}
              </h3>
              {mode === 'register' && regType === 'doctor' && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  PMDC
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === 'login'
                ? 'Access your historical assessments and clinical reports'
                : regType === 'patient'
                ? 'Join to track skin & hair progress and request second opinions'
                : 'Join our certified panel of Pakistani dermatologists'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-3.5 bg-sky-50/70 border-b border-sky-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[10px] font-bold text-sky-900 uppercase">1-Click Demo Login:</span>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleDemoLogin('patient')}
              className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-bold border border-sky-200 shadow-xs"
            >
              Patient
            </button>
            <button
              onClick={() => handleDemoLogin('doctor')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center space-x-1"
            >
              <Stethoscope className="w-3 h-3" />
              <span>Dr. Fatima</span>
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              Dr. Admin
            </button>
          </div>
        </div>

        {/* Register Role Selector Tabs */}
        {mode === 'register' && (
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-center space-x-2">
            <button
              type="button"
              onClick={() => setRegType('patient')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                regType === 'patient'
                  ? 'bg-white text-sky-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Patient Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRegType('doctor')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                regType === 'doctor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor / Specialist (PMDC)</span>
            </button>
          </div>
        )}

        {/* Doctor Verification Notice Banner */}
        {mode === 'register' && regType === 'doctor' && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Medical Credentialing Notice:</strong> Under PMDC regulations, self-registered doctor accounts undergo administrative license validation before clinical queue access is granted.
            </p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          
          {mode === 'register' && (
            <>
              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={regType === 'doctor' ? 'Kamran' : 'Ayesha'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={regType === 'doctor' ? 'Bilgrami' : 'Khan'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={regType === 'doctor' ? 'drkamran' : 'ayesha_k'}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Doctor Specific Fields */}
              {regType === 'doctor' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>PMDC Reg #</span>
                        <span className="text-[10px] text-emerald-600 font-bold">Required</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pmdcNumber}
                        onChange={(e) => setPmdcNumber(e.target.value)}
                        placeholder="PMDC-48921-S"
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/30 text-xs font-mono font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Qualifications</label>
                      <input
                        type="text"
                        required
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="MBBS, FCPS (Derm)"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Specialty</label>
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Dermatology">Dermatology</option>
                        <option value="Trichology & Hair Restoration">Trichology & Hair</option>
                        <option value="Skin Oncology">Skin Oncology</option>
                        <option value="Aesthetic Dermatology">Aesthetic Dermatology</option>
                        <option value="Pediatric Dermatology">Pediatric Dermatology</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="Karachi">Karachi</option>
                        <option value="Lahore">Lahore</option>
                        <option value="Islamabad">Islamabad</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Hospital / Clinic Affiliation</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="Hamdard University Hospital / Aga Khan Hospital"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Clinic Phone / WhatsApp</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 321 8899001"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Consultation Fee (PKR)</label>
                      <input
                        type="number"
                        min={500}
                        step={100}
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl text-xs font-extrabold shadow-md transition-all mt-2 text-white ${
              mode === 'register' && regType === 'doctor'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-600/20'
            }`}
          >
            {isLoading
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In'
              : regType === 'doctor'
              ? 'Submit PMDC Application'
              : 'Register Patient Account'}
          </button>

          <div className="text-center pt-2">
            {mode === 'login' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-sky-600 hover:underline"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-sky-600 hover:underline"
                >
                  Sign In instead
                </button>
              </p>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
