import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { X, User, Mail, GraduationCap, Calendar, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { state, updateProfile, switchUser } = useStudent();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState(state.profile.name);
  const [email, setEmail] = useState(state.profile.email);
  const [college, setCollege] = useState(state.profile.college);
  const [branch, setBranch] = useState(state.profile.branch);
  const [semester, setSemester] = useState(state.profile.semester);
  const [examDate, setExamDate] = useState(state.profile.examDate || '');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      switchUser(email, name);
      updateProfile({ college, branch, semester, examDate });
      setSuccessMsg('Account registered and profile activated!');
    } else {
      updateProfile({ name, email, college, branch, semester, examDate });
      setSuccessMsg('Profile updated and saved!');
    }
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#0d1424] p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                {isRegistering ? 'Student Registration' : 'Student Account & Profile'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRegistering
                  ? 'Create your persistent B.Tech learning profile'
                  : 'Manage college details, exam target, and account'}
              </p>
            </div>
          </div>
        </div>

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
            <label className="block text-xs font-medium text-slate-300 mb-1">Email / Student ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Exam Date</label>
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

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-purple-900/30 transition"
            >
              {isRegistering ? 'Create Student Account' : 'Save Changes'}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-xs text-purple-400 hover:text-purple-300 underline"
          >
            {isRegistering ? 'Already have an account? Manage profile' : 'Need a new student profile? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
};
