import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  User,
  Mail,
  GraduationCap,
  Calendar,
  CheckCircle,
  LogOut,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthScreen?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenAuthScreen,
}) => {
  const { state, updateProfile } = useStudent();
  const { currentUser, isGuest, logOut } = useAuth();

  const [name, setName] = useState(state.profile.name);
  const [college, setCollege] = useState(state.profile.college);
  const [branch, setBranch] = useState(state.profile.branch);
  const [semester, setSemester] = useState(state.profile.semester);
  const [examDate, setExamDate] = useState(state.profile.examDate || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, college, branch, semester, examDate });
    setSuccessMsg('Academic profile updated and synchronized!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await logOut();
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0d1424] p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Student Account & Profile
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                {currentUser ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Cloud Account
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium">Guest Mode (Local session only)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Guest Banner Prompt */}
        {!currentUser && isGuest && (
          <div className="mb-4 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs flex items-center justify-between">
            <div>
              <div className="font-semibold">Exploring as Guest</div>
              <div className="text-[11px] text-amber-200/80">Sign in to save progress to Cloud Firestore.</div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthScreen?.();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Sign In
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Account Email {currentUser && '(Registered)'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                disabled={Boolean(currentUser)}
                value={currentUser?.email || state.profile.email}
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-300 disabled:opacity-75 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">College / Campus</label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="CSE">CSE / IT</option>
                <option value="ECE">ECE / EEE</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="AI & DS">AI & Data Science</option>
                <option value="Other">Other / Self Learner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5+">Semester 5+</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Upcoming Exam Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/30 transition"
            >
              Save Profile Changes
            </button>

            <button
              type="button"
              onClick={handleLogoutClick}
              disabled={isLoggingOut}
              className="px-4 py-2.5 rounded-lg border border-rose-800/60 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 font-medium text-sm flex items-center gap-1.5 transition disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              <span>{currentUser ? 'Logout' : 'Exit Guest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
