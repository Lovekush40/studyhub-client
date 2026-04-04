import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, LogOut, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  
  // Local state for the form, initialized with context user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    contact: user?.contact || '',
    address: user?.address || '',
    dob: user?.dob || '',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaveSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulate network delay for realism
    setTimeout(() => {
      updateProfile(formData);
      setSaving(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">My Profile</h1>
          <p className="text-sm mt-1 text-[var(--color-text-muted)]">Update your personal information and manage your account.</p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-alt)] shadow-sm ring-1 ring-[var(--color-border)] sm:rounded-xl overflow-hidden">
        {/* Profile Header Block */}
        <div className="px-4 py-6 sm:p-8 bg-gradient-to-r from-[var(--color-primary)]/10 to-transparent flex flex-col sm:flex-row items-center gap-6 border-b border-[var(--color-border)]">
          <div className="h-24 w-24 flex-shrink-0 rounded-full bg-[var(--color-bg-alt)] border-4 border-[var(--color-bg-alt)] shadow-md overflow-hidden relative group">
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
               <span className="text-white text-xs font-semibold">Change</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">{user?.name}</h2>
            <div className="mt-1 flex flex-col sm:flex-row items-center sm:gap-4 text-sm text-[var(--color-text-muted)]">
               <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user?.email}</span>
               <span className="inline-flex mt-2 sm:mt-0 items-center rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                  {user?.role} ACCOUNT
               </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
            
            {/* Name Field */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-[var(--color-text)]">
                Full Name
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-2 pl-10 bg-[var(--color-bg)] text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            {/* Email Field (Disabled) */}
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-[var(--color-text)]">
                Email Address
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full rounded-md border-0 py-2 pl-10 bg-[var(--color-bg)] text-[var(--color-text-muted)] ring-1 ring-inset ring-[var(--color-border)] opacity-60 cursor-not-allowed sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Your email address cannot be changed.</p>
            </div>

            {/* Contact Field */}
            <div className="sm:col-span-1">
              <label htmlFor="contact" className="block text-sm font-medium leading-6 text-[var(--color-text)]">
                Phone Number
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <input
                  type="tel"
                  name="contact"
                  id="contact"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contact}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-2 pl-10 bg-[var(--color-bg)] text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            {/* DOB Field */}
            <div className="sm:col-span-1">
              <label htmlFor="dob" className="block text-sm font-medium leading-6 text-[var(--color-text)]">
                Date of Birth
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-2 pl-10 pr-3 bg-[var(--color-bg)] text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium leading-6 text-[var(--color-text)]">
                Home Address
              </label>
              <div className="mt-2 relative">
                <div className="pointer-events-none absolute top-2 left-0 flex pl-3">
                  <MapPin className="h-5 w-5 text-[var(--color-text-muted)]" />
                </div>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-0 py-2 pl-10 bg-[var(--color-bg)] text-[var(--color-text)] ring-1 ring-inset ring-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] sm:text-sm sm:leading-6 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[var(--color-border)] mt-6">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-md bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out Securely
            </button>

            <div className="flex items-center gap-4">
              {saveSuccess && (
                <span className="text-sm font-medium text-emerald-500 flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Saved successfully
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--color-primary-hover)] transition-colors focus-visible:outline focus-visible:outline-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                   <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
