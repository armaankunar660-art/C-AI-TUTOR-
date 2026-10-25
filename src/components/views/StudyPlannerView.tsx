import React, { useState } from 'react';
import { useStudent } from '../../context/StudentContext';
import { StudyTarget } from '../../types';
import { api } from '../../services/api';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';

export const StudyPlannerView: React.FC = () => {
  const { state, addStudyTarget, updateStudyTarget, deleteStudyTarget, addXP } = useStudent();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Target creation form state
  const [isAddingTarget, setIsAddingTarget] = useState(false);
  const [targetTitle, setTargetTitle] = useState('');
  const [targetDesc, setTargetDesc] = useState('');
  const [targetTopic, setTargetTopic] = useState('Pointers & Memory');
  const [targetDueDate, setTargetDueDate] = useState(selectedDateStr);
  const [targetPriority, setTargetPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // AI Study Plan Generator Modal / Drawer state
  const [isAiPlanModalOpen, setIsAiPlanModalOpen] = useState(false);
  const [aiExamDate, setAiExamDate] = useState(
    state.profile.examDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [aiDailyHours, setAiDailyHours] = useState(2);
  const [aiWeakTopics, setAiWeakTopics] = useState('Pointers, Arrays, Dynamic Memory, Functions');
  const [aiIsLoading, setAiIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [planApprovedMessage, setPlanApprovedMessage] = useState(false);

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', {
    month: 'long',
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle.trim()) return;
    addStudyTarget({
      title: targetTitle,
      description: targetDesc,
      topic: targetTopic,
      dueDate: targetDueDate,
      priority: targetPriority,
      status: 'Pending',
    });
    setTargetTitle('');
    setTargetDesc('');
    setIsAddingTarget(false);
  };

  const handleGenerateAiPlan = async () => {
    setAiIsLoading(true);
    setGeneratedPlan(null);
    try {
      const weakList = aiWeakTopics.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.generateStudyPlan({
        examDate: aiExamDate,
        dailyHours: aiDailyHours,
        weakTopics: weakList,
        targetGrade: 'A Grade in University Exam',
      });
      setGeneratedPlan(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setAiIsLoading(false);
    }
  };

  // Approval step: Student approves before adding generated tasks to their calendar
  const handleApprovePlan = () => {
    if (!generatedPlan || !Array.isArray(generatedPlan.dailySchedule)) return;

    let addedCount = 0;
    generatedPlan.dailySchedule.forEach((day: any) => {
      const taskDate = day.date || selectedDateStr;
      if (Array.isArray(day.tasks)) {
        day.tasks.forEach((t: any) => {
          addStudyTarget({
            title: t.title,
            description: `${t.description} (Day ${day.dayNumber} - ${day.focusTopic})`,
            topic: day.focusTopic || 'C Revision',
            dueDate: taskDate,
            priority: (t.priority as any) || 'Medium',
            status: 'Pending',
          });
          addedCount++;
        });
      }
    });

    addXP(addedCount * 15);
    setPlanApprovedMessage(true);
    setTimeout(() => {
      setPlanApprovedMessage(false);
      setIsAiPlanModalOpen(false);
      setGeneratedPlan(null);
    }, 2000);
  };

  const targetsOnSelectedDate = state.studyTargets.filter(
    (t) => t.dueDate === selectedDateStr
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0c1220] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold font-display text-white">
              B.Tech Exam Study Planner & Calendar
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Schedule revision milestones, track deadlines, and generate personalized day-by-day study schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md transition"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>AI Revision Schedule</span>
          </button>

          <button
            onClick={() => setIsAddingTarget(!isAddingTarget)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Target</span>
          </button>
        </div>
      </div>

      {/* Target creation form */}
      {isAddingTarget && (
        <form
          onSubmit={handleCreateTarget}
          className="p-5 rounded-2xl border border-slate-800 bg-[#0c1220] space-y-4"
        >
          <h3 className="text-sm font-bold text-slate-200">Create New Study Target</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
              <input
                type="text"
                required
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="e.g. Master Pointer Arithmetic"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Topic</label>
              <input
                type="text"
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                placeholder="e.g. Pointers, Arrays, Files"
                className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={targetDueDate}
                  onChange={(e) => setTargetDueDate(e.target.value)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
                <select
                  value={targetPriority}
                  onChange={(e) => setTargetPriority(e.target.value as any)}
                  className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-2 py-1.5 text-xs text-slate-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Description / Specific Goal
            </label>
            <input
              type="text"
              value={targetDesc}
              onChange={(e) => setTargetDesc(e.target.value)}
              placeholder="e.g. Complete 3 coding problems on malloc() and free() without leaks"
              className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-1.5 text-xs text-slate-200"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition"
            >
              Add Target (+10 XP)
            </button>
            <button
              type="button"
              onClick={() => setIsAddingTarget(false)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-400 text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Calendar (7 cols) + Selected Date Tasks (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Calendar (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-white">
              {monthName} {currentYear}
            </h3>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-xs">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty_${i}`} className="h-16 rounded-xl bg-transparent" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === todayStr;

              const targetsForDay = state.studyTargets.filter((t) => t.dueDate === dateStr);
              const hasPending = targetsForDay.some((t) => t.status === 'Pending');
              const hasCompleted = targetsForDay.some((t) => t.status === 'Completed');

              return (
                <button
                  key={dayNum}
                  onClick={() => {
                    setSelectedDateStr(dateStr);
                    setTargetDueDate(dateStr);
                  }}
                  className={`h-16 p-1.5 rounded-xl border flex flex-col justify-between text-left transition ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 text-white shadow-md'
                      : isToday
                      ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-200'
                      : 'bg-[#080d17] border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-xs font-bold">{dayNum}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="Today" />
                    )}
                  </div>

                  {targetsForDay.length > 0 && (
                    <div className="flex items-center gap-1">
                      {hasPending && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" title="Pending Tasks" />
                      )}
                      {hasCompleted && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title="Completed Tasks" />
                      )}
                      <span className="text-[9px] font-mono text-slate-400">
                        {targetsForDay.length}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Tasks & Upcoming Targets (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1220] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Targets for</span>
                <h4 className="text-base font-bold font-display text-white">{selectedDateStr}</h4>
              </div>
              <button
                onClick={() => {
                  setTargetDueDate(selectedDateStr);
                  setIsAddingTarget(true);
                }}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add for this day</span>
              </button>
            </div>

            {targetsOnSelectedDate.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No study targets scheduled on this date.
              </div>
            ) : (
              <div className="space-y-2.5">
                {targetsOnSelectedDate.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#080d17] border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <button
                          onClick={() =>
                            updateStudyTarget(t.id, {
                              status: t.status === 'Completed' ? 'Pending' : 'Completed',
                            })
                          }
                          className="mt-0.5 text-slate-400 hover:text-emerald-400"
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              t.status === 'Completed' ? 'text-emerald-400' : 'text-slate-600'
                            }`}
                          />
                        </button>
                        <div>
                          <div
                            className={`font-semibold ${
                              t.status === 'Completed'
                                ? 'line-through text-slate-500'
                                : 'text-slate-200'
                            }`}
                          >
                            {t.title}
                          </div>
                          {t.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteStudyTarget(t.id)}
                        className="text-slate-600 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                      <span>{t.topic}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          t.priority === 'High'
                            ? 'text-rose-400 bg-rose-950/60'
                            : t.priority === 'Medium'
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-emerald-400 bg-emerald-950/60'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Study Planner Modal */}
      {isAiPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-purple-500/40 bg-[#0d1424] p-6 shadow-2xl text-slate-100 max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold font-display text-white">
                  AI Study Schedule Generator
                </h3>
              </div>
              <button
                onClick={() => setIsAiPlanModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            {planApprovedMessage && (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-semibold">
                ✓ Plan approved! All revision tasks have been added to your calendar and synced with your account!
              </div>
            )}

            {!generatedPlan && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={aiExamDate}
                    onChange={(e) => setAiExamDate(e.target.value)}
                    className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Daily Study Time (Hours / Day)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={aiDailyHours}
                    onChange={(e) => setAiDailyHours(Number(e.target.value))}
                    className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Priority / Weak Topics to Cover
                  </label>
                  <input
                    type="text"
                    value={aiWeakTopics}
                    onChange={(e) => setAiWeakTopics(e.target.value)}
                    placeholder="e.g. Pointers, Arrays, Dynamic Memory, Functions"
                    className="w-full rounded-lg bg-[#080d17] border border-slate-700 px-3 py-2 text-slate-200"
                  />
                </div>

                <button
                  onClick={handleGenerateAiPlan}
                  disabled={aiIsLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  {aiIsLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Custom Revision Roadmap...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Day-by-Day Plan</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {generatedPlan && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-purple-200">
                  <span className="font-bold text-white block mb-1">Plan Overview:</span>
                  <p>{generatedPlan.summary}</p>
                </div>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {generatedPlan.dailySchedule?.map((day: any) => (
                    <div
                      key={day.dayNumber}
                      className="p-3 rounded-xl bg-[#080d17] border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span className="text-cyan-400">Day {day.dayNumber}: {day.focusTopic}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{day.date}</span>
                      </div>
                      <div className="space-y-1">
                        {day.tasks?.map((tsk: any, idx: number) => (
                          <div key={idx} className="text-slate-300 text-[11px] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                            <span>{tsk.title} ({tsk.estimatedMinutes} mins)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={handleApprovePlan}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Approve & Add All Tasks to Calendar
                  </button>
                  <button
                    onClick={() => setGeneratedPlan(null)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Adjust Inputs
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
