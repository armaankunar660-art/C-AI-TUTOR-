import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import {
  UserCog,
  Save,
  CheckCircle,
  Download,
  Trash2,
  Moon,
  Calendar,
  GraduationCap,
  Mail,
  User,
  ShieldCheck,
} from 'lucide-react';

interface ProfileSettingsViewProps {
  onOpenAuthModal: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  onOpenAuthModal,
}) => {
  const { state, updateProfile, resetAllData } = useStudent();
  const [name, setName] = useState(state.profile.name);
  const [college, setCollege] = useState(state.profile.college);
  const [branch, setBranch] = useState(state.profile.branch);
  const [semester, setSemester] = useState(state.profile.semester);
  const [examDate, setExamDate] = useState(state.profile.examDate || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      college,
      branch,
      semester,
      examDate,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `c_tutor_profile_${state.profile.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    await resetAllData();
    setResetConfirm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <UserCog className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold font-display text-white">
              Student Profile & Platform Settings
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Configure your B.Tech college details, target exam date, persistence, and data backups.
          </p>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition"
        >
          <span>Switch Student Account</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-5 shadow-xl">
          <h3 className="text-base font-bold font-display text-white">
            Academic Profile Information
          </h3>

          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Profile updated and synced with server!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Student Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                College / Institution Name
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Upcoming C Exam Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700/70 pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Academic Profile</span>
            </button>
          </form>
        </div>

        {/* Right: Data Backups & Theme (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Theme card */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>Appearance Theme</span>
            </h3>
            <p className="text-xs text-slate-400">
              Midnight Dark default with Space Grotesk and electric purple/cyan accents.
            </p>
            <div className="p-3 rounded-xl bg-[#080d17] border border-purple-500/40 text-xs text-purple-200 font-medium">
              ✓ Active Theme: Midnight Dark (High-Contrast Engineering Aesthetic)
            </div>
          </div>

          {/* Backup & Persistence */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Persistence & Backup</span>
            </h3>
            <p className="text-xs text-slate-400">
              Your curriculum progress, quiz attempts, mistake logs, and study calendar are persisted automatically to durable server storage.
            </p>

            <button
              onClick={handleExportData}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export All Learning Data as JSON</span>
            </button>
          </div>

          {/* Danger Zone: Reset Data */}
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/10 p-6 space-y-3">
            <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Reset Data</span>
            </h3>
            <p className="text-xs text-rose-200/70">
              Clear all locally and server-stored progress, mistake notebook entries, and study targets.
            </p>

            <button
              onClick={handleReset}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${
                resetConfirm
                  ? 'bg-rose-700 text-white animate-pulse'
                  : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/60'
              }`}
            >
              {resetConfirm ? 'Click again to permanently reset' : 'Reset Learning Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
