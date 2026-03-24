import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  StickyNote, 
  Save, 
  Clock, 
  FileText, 
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile, setProfile } = useAuth();
  const [notes, setNotes] = useState(profile?.notes || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (profile?.notes) {
      setNotes(profile.notes);
    }
  }, [profile]);

  const handleSaveNotes = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const userDoc = doc(db, 'users', profile.uid);
      await updateDoc(userDoc, { notes });
      setProfile({ ...profile, notes });
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Profile Status', value: 'Complete', icon: UserIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Last Login', value: 'Today', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Notes Count', value: notes.length > 0 ? notes.split(' ').length : 0, icon: StickyNote, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome back, {profile?.displayName || 'User'}!</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your account today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notes Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Personal Notes</h2>
              <p className="text-sm text-slate-500">Draft your thoughts and save them for later.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {lastSaved && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={handleSaveNotes}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
        <div className="p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start typing your notes here..."
            className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none text-slate-700 leading-relaxed"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
