// App — root component, manages navigation state and screen routing
import React, { useState, useEffect } from "react";
import { T } from "./theme.js";
import { storage } from "./storage.js";
import { GoalsView } from "./views/GoalsView.jsx";
import { DrillsView } from "./views/DrillsView.jsx";
import { RoundsView } from "./views/RoundsView.jsx";
import { StatsView } from "./views/StatsView.jsx";
import { DrillDetailView } from "./views/DrillDetailView.jsx";
import { BenchmarksView } from "./views/BenchmarksView.jsx";
import { SessionDetailView } from "./views/SessionDetailView.jsx";
import { SummaryView } from "./views/SummaryView.jsx";
import { RoundSetupView } from "./views/RoundSetupView.jsx";
import { RoundView } from "./views/RoundView.jsx";
import { SessionView } from "./sessions/SessionView.jsx";
import { BottomNav } from "./components/BottomNav.jsx";
import { EndRoundModal } from "./components/EndRoundModal.jsx";

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [activeRound, setActiveRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("goals");
  const [screen, setScreen] = useState({ name: "tab" });

  // refreshKey is bumped whenever sessions/rounds change so child views
  // (StatsView in particular) can re-fetch the activity feed.
  const [refreshKey, setRefreshKey] = useState(0);

  // When a drill-start is gated by an active round, the requested drill is
  // held here and the modal is shown.
  const [pendingDrillStart, setPendingDrillStart] = useState(null);

  useEffect(() => {
    (async () => {
      const [allSessions, allRounds, active] = await Promise.all([
        storage.listSessions(),
        storage.listRounds(),
        storage.getActiveRound(),
      ]);
      setSessions(allSessions);
      setRounds(allRounds);
      setActiveRound(active);
      setLoading(false);
    })();
  }, []);

  const refreshAll = async () => {
    const [allSessions, allRounds, active] = await Promise.all([
      storage.listSessions(),
      storage.listRounds(),
      storage.getActiveRound(),
    ]);
    setSessions(allSessions);
    setRounds(allRounds);
    setActiveRound(active);
    setRefreshKey((k) => k + 1);
  };

  // ==========================================================================
  // DRILL FLOWS
  // ==========================================================================

  const handleOpenDrill = (drillId) =>
    setScreen({ name: "drillDetail", drillId });

  const handleStartDrill = (drillId) => {
    if (activeRound) {
      setPendingDrillStart(drillId);
      return;
    }
    setScreen({ name: "session", drillId });
  };

  const handleEndRoundAndStartDrill = async () => {
    await storage.completeActiveRound();
    await refreshAll();
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
    await refreshAll();
    setScreen({ name: "summary", session });
  };

  const handleSessionCancel = () => {
    setScreen({ name: "tab" });
    setCurrentTab("drills");
  };

  const handleSummaryDone = () => {
    setScreen({ name: "tab" });
    setCurrentTab("drills");
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
    await refreshAll();
    setScreen({ name: "tab" });
  };

  // ==========================================================================
  // ROUND FLOWS
  // ==========================================================================

  const handleStartRound = () => {
    setScreen({ name: "roundSetup" });
  };

  const handleConfirmRoundSetup = async (setup) => {
    const round = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      date: setup.date,
      course: setup.course,
      tees: setup.tees,
      pars: setup.pars,
      holes: {},
      shots: [],
      status: "in-progress",
      finishedAt: null,
    };
    await storage.setActiveRound(round);
    await refreshAll();
    setScreen({ name: "round", round });
  };

  const handleResumeRound = () => {
    if (!activeRound) return;
    setScreen({ name: "round", round: activeRound });
  };

  const handleExitRound = () => {
    // Exiting keeps the round active. Returns the user to the Rounds tab.
    setScreen({ name: "tab" });
    setCurrentTab("rounds");
  };

  const handleEndRound = async () => {
    await storage.completeActiveRound();
    await refreshAll();
    setScreen({ name: "tab" });
    setCurrentTab("rounds");
  };

  const handleOpenRound = (roundId) => {
    // Phase B1: round detail view doesn't exist yet. For now, opening a past
    // round is a no-op. (Will be wired up in B5.)
    console.log("Open round (not yet implemented):", roundId);
  };

  // ==========================================================================
  // NAV
  // ==========================================================================

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

  // Routes that aren't simple tabs override the bottom nav.
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
  } else if (screen.name === "roundSetup") {
    content = (
      <RoundSetupView
        onCancel={() => {
          setScreen({ name: "tab" });
          setCurrentTab("rounds");
        }}
        onStart={handleConfirmRoundSetup}
      />
    );
  } else if (screen.name === "round") {
    content = (
      <RoundView
        round={activeRound || screen.round}
        onEndRound={handleEndRound}
        onExit={handleExitRound}
      />
    );
  } else {
    if (currentTab === "goals") {
      content = <GoalsView onChangeTab={handleChangeTab} />;
    } else if (currentTab === "drills") {
      content = <DrillsView sessions={sessions} onOpenDrill={handleOpenDrill} />;
    } else if (currentTab === "rounds") {
      content = (
        <RoundsView
          rounds={rounds}
          activeRound={activeRound}
          onStartRound={handleStartRound}
          onResumeRound={handleResumeRound}
          onOpenRound={handleOpenRound}
        />
      );
    } else if (currentTab === "stats") {
      content = (
        <StatsView
          onOpenSession={handleOpenSession}
          onOpenRound={handleOpenRound}
          refreshKey={refreshKey}
        />
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
