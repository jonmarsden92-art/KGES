// ============================================================
// App.jsx  —  Firebase-connected version
// Drop this into your src/ folder replacing the sample App.jsx
// All data now comes from Firestore with real-time listeners.
// ============================================================

import { useState, useMemo } from "react";
import { useAuth }      from "./hooks/useAuth";
import { useEngineers } from "./hooks/useEngineers";
import { useJobs }      from "./hooks/useJobs";
import { useReports }   from "./hooks/useReports";

// Re-use all the presentational components from the original file
// (Dashboard, CalendarView, EngineersView, SkillsMatrix, JobsView,
//  ReportsView, JobModal, EngineerModal, ReportUploadModal)
// — import them from a shared components file or keep them in one file.
import {
  Dashboard,
  CalendarView,
  EngineersView,
  SkillsMatrix,
  JobsView,
  ReportsView,
  JobModal,
  EngineerModal,
  ReportUploadModal,
  LoginScreen,
  Spinner,
} from "./components";

// ============================================================
export default function App() {
  // ── Auth ──────────────────────────────────────────────────
  const { user, isAdmin, loading: authLoading, error: authError, login, logout } = useAuth();

  // ── Data (only subscribed once user is authenticated) ─────
  const { engineers, loading: engLoading, addEngineer, updateEngineer } = useEngineers();
  const { jobs,      loading: jobLoading, addJob, updateJob }           = useJobs();
  const { reports,   loading: repLoading, uploadProgress, uploadReport, deleteReport } = useReports();

  // ── UI state ──────────────────────────────────────────────
  const [view, setView]               = useState("dashboard");
  const [calMonth, setCalMonth]       = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showJobModal, setShowJobModal]     = useState(false);
  const [showEngModal, setShowEngModal]     = useState(false);
  const [showRepModal, setShowRepModal]     = useState(false);
  const [selectedJob, setSelectedJob]       = useState(null);
  const [selectedEng, setSelectedEng]       = useState(null);
  const [skillFilter, setSkillFilter]       = useState([]);
  const [search, setSearch]                 = useState("");
  const [notification, setNotification]     = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Derived data ──────────────────────────────────────────
  const filteredEngineers = useMemo(() => {
    return engineers.filter((eng) => {
      const matchSearch =
        eng.name.toLowerCase().includes(search.toLowerCase()) ||
        eng.role.toLowerCase().includes(search.toLowerCase());
      const matchSkills =
        skillFilter.length === 0 ||
        skillFilter.every((s) => eng.skills.includes(s));
      return matchSearch && matchSkills;
    });
  }, [engineers, search, skillFilter]);

  const jobsOnDate = (dateStr) =>
    jobs.filter((j) => j.date <= dateStr && j.endDate >= dateStr);

  const busyEngineers = (dateStr) =>
    new Set(jobsOnDate(dateStr).flatMap((j) => j.assignedEngineers));

  // ── Loading / Auth gates ──────────────────────────────────
  if (authLoading) return <Spinner message="Connecting to Firebase..." />;
  if (!user)       return <LoginScreen onLogin={login} error={authError} />;

  const dataLoading = engLoading || jobLoading || repLoading;

  // ── Handlers ─────────────────────────────────────────────
  const handleSaveJob = async (jobData) => {
    try {
      if (jobData.id) {
        const { id, ...updates } = jobData;
        await updateJob(id, updates);
        showNotif("Job updated successfully");
      } else {
        await addJob(jobData);
        showNotif("Job created successfully");
      }
      setShowJobModal(false);
    } catch (err) {
      showNotif("Failed to save job: " + err.message, "error");
    }
  };

  const handleSaveEngineer = async (engData) => {
    try {
      if (engData.id) {
        const { id, ...updates } = engData;
        await updateEngineer(id, updates);
        showNotif("Engineer updated");
      } else {
        await addEngineer(engData);
        showNotif("Engineer added");
      }
      setShowEngModal(false);
    } catch (err) {
      showNotif("Failed to save engineer: " + err.message, "error");
    }
  };

  const handleUploadReport = async (file) => {
    try {
      await uploadReport(file, user.displayName || user.email);
      setShowRepModal(false);
      showNotif("Report uploaded successfully");
    } catch (err) {
      showNotif("Upload failed: " + err.message, "error");
    }
  };

  const handleDeleteReport = async (report) => {
    if (!window.confirm(`Delete "${report.name}"?`)) return;
    try {
      await deleteReport(report);
      showNotif("Report deleted");
    } catch (err) {
      showNotif("Delete failed: " + err.message, "error");
    }
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard",    icon: "▦" },
    { id: "calendar",  label: "Calendar",     icon: "◫" },
    { id: "engineers", label: "Engineers",    icon: "◉" },
    { id: "skills",    label: "Skills Matrix",icon: "◈" },
    { id: "jobs",      label: "Jobs",         icon: "◧" },
    { id: "reports",   label: "Reports",      icon: "◨" },
  ];

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 210, background: "#0f172a", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 16px 20px", borderBottom: "1px solid #1e293b", marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Engineer Plan</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}>KG Resource</div>
        </div>
        <nav style={{ flex: 1, padding: "8px" }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 10px", borderRadius: 7, border: "none", cursor: "pointer", marginBottom: 2, background: view === n.id ? "#1e40af" : "transparent", color: view === n.id ? "#fff" : "#94a3b8", fontSize: 13, fontWeight: view === n.id ? 600 : 400, textAlign: "left" }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#64748b" }}>Signed in as</div>
          <div style={{ fontSize: 12, color: "#f1f5f9", fontWeight: 500, marginBottom: 6 }}>
            {user.displayName || user.email}
          </div>
          {isAdmin && (
            <span style={{ fontSize: 9, background: "#1d4ed8", color: "#bfdbfe", padding: "2px 6px", borderRadius: 99, display: "inline-block", marginBottom: 8 }}>ADMIN</span>
          )}
          <button onClick={logout} style={{ display: "block", width: "100%", padding: "5px", borderRadius: 5, border: "1px solid #334155", background: "none", color: "#64748b", fontSize: 11, cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#0f172a" }}>
            {NAV.find((n) => n.id === view)?.label}
            {dataLoading && <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>syncing…</span>}
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {view === "jobs"      && isAdmin && <ActionBtn onClick={() => { setSelectedJob(null);  setShowJobModal(true); }}>+ New Job</ActionBtn>}
            {view === "engineers" && isAdmin && <ActionBtn onClick={() => { setSelectedEng(null);  setShowEngModal(true); }}>+ Add Engineer</ActionBtn>}
            {view === "reports"              && <ActionBtn onClick={() => setShowRepModal(true)}>Upload Report</ActionBtn>}
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: 22 }}>
          {view === "dashboard"  && <Dashboard engineers={engineers} jobs={jobs} jobsOnDate={jobsOnDate} busyOnDate={busyEngineers} />}
          {view === "calendar"   && <CalendarView engineers={engineers} jobs={jobs} calMonth={calMonth} setCalMonth={setCalMonth} selectedDate={selectedDate} setSelectedDate={setSelectedDate} jobsOnDate={jobsOnDate} busyEngineers={busyEngineers} />}
          {view === "engineers"  && <EngineersView engineers={filteredEngineers} jobs={jobs} search={search} setSearch={setSearch} isAdmin={isAdmin} setSelectedEngineer={setSelectedEng} setShowEngineerModal={setShowEngModal} />}
          {view === "skills"     && <SkillsMatrix engineers={engineers} skillFilter={skillFilter} setSkillFilter={setSkillFilter} search={search} setSearch={setSearch} filteredEngineers={filteredEngineers} />}
          {view === "jobs"       && <JobsView jobs={jobs} engineers={engineers} setSelectedJob={setSelectedJob} setShowJobModal={setShowJobModal} isAdmin={isAdmin} />}
          {view === "reports"    && <ReportsView reports={reports} onDelete={isAdmin ? handleDeleteReport : null} uploadProgress={uploadProgress} />}
        </div>
      </main>

      {/* Modals */}
      {showJobModal && (
        <JobModal job={selectedJob} engineers={engineers} onClose={() => setShowJobModal(false)} onSave={handleSaveJob} />
      )}
      {showEngModal && (
        <EngineerModal engineer={selectedEng} onClose={() => setShowEngModal(false)} onSave={handleSaveEngineer} />
      )}
      {showRepModal && (
        <ReportUploadModal uploadProgress={uploadProgress} onClose={() => setShowRepModal(false)} onUpload={handleUploadReport} />
      )}

      {/* Toast notification */}
      {notification && (
        <div style={{ position: "fixed", bottom: 20, right: 20, background: notification.type === "success" ? "#166534" : "#991b1b", color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          {notification.msg}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 7, padding: "7px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
      {children}
    </button>
  );
}
