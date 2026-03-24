import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  Mail, 
  Type, 
  FileText, 
  Save, 
  CheckCircle2,
  Camera
} from 'lucide-react';

const Profile: React.FC = () => {
  const { profile, setProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setSaving(true);
    setSuccess(false);
    
    try {
      const userDoc = doc(db, 'users', profile.uid);
      await updateDoc(userDoc, { displayName, bio });
      setProfile({ ...profile, displayName, bio });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your public profile and personal information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-6">
              {profile?.photoURL ? (
                <img 
                  src={profile.photoURL} 
                  alt="Avatar" 
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <UserIcon className="w-16 h-16" />
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{profile?.displayName || 'User'}</h2>
            <p className="text-slate-500 text-sm mt-1">{profile?.email}</p>
            
            <div className="w-full h-px bg-slate-100 my-6"></div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Account Type</span>
                <span className="font-semibold text-slate-900">Standard</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Member Since</span>
                <span className="font-semibold text-slate-900">March 2026</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Type className="w-4 h-4" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profile?.email || ''}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Biography
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <AnimatePresence>
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-2 text-emerald-600 font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Profile updated successfully
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-auto flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
