// App — root component, manages navigation state and screen routing
import React, { useState, useEffect } from "react";
import { T } from "./theme.js";
import { storage } from "./storage.js";
import { HomeView } from "./views/HomeView.jsx";
import { DrillsView } from "./views/DrillsView.jsx";
import { HistoryView } from "./views/HistoryView.jsx";
import { DrillDetailView } from "./views/DrillDetailView.jsx";
import { BenchmarksView } from "./views/BenchmarksView.jsx";
import { SessionDetailView } from "./views/SessionDetailView.jsx";
import { SummaryView } from "./views/SummaryView.jsx";
import { SessionView } from "./sessions/SessionView.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { EndRoundModal } from "./components/EndRoundModal.jsx";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("home");
  const [screen, setScreen] = useState({ name: "tab" });

  // When a drill-start is gated by an active round, the requested drill is
  // held here and the modal is shown. If the user confirms ending the round,
  // we end the round and proceed with this drill.
  const [pendingDrillStart, setPendingDrillStart] = useState(null);

  useEffect(() => {
    (async () => {
      const [allSessions, active] = await Promise.all([
        storage.listSessions(),
        storage.getActiveRound(),
      ]);
      setSessions(allSessions);
      setActiveRound(active);
      setLoading(false);
    })();
  }, []);

  const refreshSessions = async () => {
    const all = await storage.listSessions();
    setSessions(all);
  };

  const refreshActiveRound = async () => {
    const active = await storage.getActiveRound();
    setActiveRound(active);
  };

  const handleOpenDrill = (drillId) => setScreen({ name: "drillDetail", drillId });

  // Drill-start chokepoint. If a round is in progress, prompt the user to
  // end it first; otherwise proceed directly. Phase A: rounds can only be
  // ended via this prompt (no round-creation UI yet, so any active round is
  // historical from prior phases — but the gating still works).
  const handleStartDrill = (drillId) => {
    if (activeRound) {
      setPendingDrillStart(drillId);
      return;
    }
    setScreen({ name: "session", drillId });
  };

  // From the gating modal: end the active round and then proceed with the
  // pending drill. The round is moved to completed-rounds in whatever state
  // it's in; the user can edit it later.
  const handleEndRoundAndStartDrill = async () => {
    await storage.completeActiveRound();
    await refreshActiveRound();
    const drillId = pendingDrillStart;
    setPendingDrillStart(null);
    if (drillId) {
      setScreen({ name: "session", drillId });
    }
  };

  const handleCancelPendingDrill = () => {
    setPendingDrillStart(null);
  };

  const handleSessionComplete = async (session) => {
    await storage.saveSession(session);
    await refreshSessions();
    setScreen({ name: "summary", session });
  };

  const handleSessionCancel = () => {
    setScreen({ name: "tab" });
    setCurrentTab("home");
  };

  const handleSummaryDone = () => {
    setScreen({ name: "tab" });
    setCurrentTab("home");
  };

  const handleViewBenchmarks = (session) => {
    setScreen({
      name: "benchmarks",
      drillId: session.drillId,
      session,
      returnTo: screen,
    });
  };

  const handleOpenSession = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) setScreen({ name: "sessionDetail", session });
  };

  const handleDeleteSession = async (session) => {
    await storage.deleteSession(session.drillId, session.id);
    await refreshSessions();
    setScreen({ name: "tab" });
  };

  const handleChangeTab = (tabId) => {
    setCurrentTab(tabId);
    setScreen({ name: "tab" });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.textFaint,
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );
  }

  let content;
  const showNav =
    screen.name === "tab" ||
    screen.name === "drillDetail" ||
    screen.name === "sessionDetail" ||
    screen.name === "benchmarks";

  if (screen.name === "session") {
    content = (
      <SessionView
        drillId={screen.drillId}
        onComplete={handleSessionComplete}
        onCancel={handleSessionCancel}
      />
    );
  } else if (screen.name === "summary") {
    content = (
      <SummaryView
        session={screen.session}
        allSessions={sessions}
        onDone={handleSummaryDone}
        onViewBenchmarks={() => handleViewBenchmarks(screen.session)}
      />
    );
  } else if (screen.name === "benchmarks") {
    content = (
      <BenchmarksView
        drillId={screen.drillId}
        currentSession={screen.session}
        onBack={() => setScreen(screen.returnTo || { name: "tab" })}
      />
    );
  } else if (screen.name === "drillDetail") {
    content = (
      <DrillDetailView
        drillId={screen.drillId}
        onBack={() => setScreen({ name: "tab" })}
        onStart={handleStartDrill}
      />
    );
  } else if (screen.name === "sessionDetail") {
    content = (
      <SessionDetailView
        session={screen.session}
        onBack={() => setScreen({ name: "tab" })}
        onDelete={handleDeleteSession}
        onViewBenchmarks={() => handleViewBenchmarks(screen.session)}
      />
    );
  } else {
    if (currentTab === "home") {
      content = (
        <HomeView
          sessions={sessions}
          onOpenSession={handleOpenSession}
          onChangeTab={handleChangeTab}
        />
      );
    } else if (currentTab === "drills") {
      content = <DrillsView sessions={sessions} onOpenDrill={handleOpenDrill} />;
    } else if (currentTab === "history") {
      content = (
        <HistoryView sessions={sessions} onOpenSession={handleOpenSession} />
      );
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: showNav ? "calc(64px + env(safe-area-inset-bottom))" : 0,
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ padding: "0 16px" }}>{content}</div>
      {showNav && <BottomNav currentTab={currentTab} onChangeTab={handleChangeTab} />}
      {pendingDrillStart && (
        <EndRoundModal
          activeRound={activeRound}
          onConfirm={handleEndRoundAndStartDrill}
          onCancel={handleCancelPendingDrill}
        />
      )}
    </div>
  );
}

