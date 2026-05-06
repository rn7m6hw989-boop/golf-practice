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
import { RoundSummaryView } from "./views/RoundSummaryView.jsx";
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

  // When the user attempts to navigate away from a mid-drill session, the
  // requested destination is held here and a confirmation is shown. This
  // protects against accidentally losing in-progress drill data.
  const [pendingNavAwayFromDrill, setPendingNavAwayFromDrill] = useState(null);

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
    const completed = await storage.completeActiveRound();
    await refreshAll();
    if (completed) {
      setScreen({ name: "roundSummary", round: completed });
    } else {
      // No active round to complete — fall back to Rounds tab.
      setScreen({ name: "tab" });
      setCurrentTab("rounds");
    }
  };

  const handleRoundSummaryDone = () => {
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
    // If the user is in the middle of a drill session, prompt before
    // navigating away (cancels the drill). Round screens don't need this
    // gate because the round persists naturally.
    if (screen.name === "session" && tabId !== currentTab) {
      setPendingNavAwayFromDrill(tabId);
      return;
    }
    setCurrentTab(tabId);
    setScreen({ name: "tab" });
  };

  const handleConfirmNavAwayFromDrill = () => {
    const dest = pendingNavAwayFromDrill;
    setPendingNavAwayFromDrill(null);
    if (dest) {
      setCurrentTab(dest);
      setScreen({ name: "tab" });
    }
  };

  const handleCancelNavAwayFromDrill = () => {
    setPendingNavAwayFromDrill(null);
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

  // Routes always render the bottom nav. Tab-switching during an active
  // drill is gated by handleChangeTab.
  let content;

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
        onRoundChanged={refreshAll}
      />
    );
  } else if (screen.name === "roundSummary") {
    content = (
      <RoundSummaryView round={screen.round} onDone={handleRoundSummaryDone} />
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
        paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ padding: "0 16px" }}>{content}</div>
      <BottomNav currentTab={currentTab} onChangeTab={handleChangeTab} />
      {pendingDrillStart && (
        <EndRoundModal
          activeRound={activeRound}
          onConfirm={handleEndRoundAndStartDrill}
          onCancel={handleCancelPendingDrill}
        />
      )}
      {pendingNavAwayFromDrill && (
        <CancelDrillConfirm
          onConfirm={handleConfirmNavAwayFromDrill}
          onCancel={handleCancelNavAwayFromDrill}
        />
      )}
    </div>
  );
}

// Small inline modal: shown when the user navigates away from a drill in
// progress. Confirms the drill should be cancelled.
function CancelDrillConfirm({ onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.surface,
          border: `0.5px solid ${T.borderStrong}`,
          borderRadius: "var(--border-radius-lg)",
          padding: "1.25rem",
          maxWidth: 380,
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 8,
            letterSpacing: -0.2,
          }}
        >
          Leave the drill?
        </div>
        <div
          style={{
            fontSize: 13,
            color: T.textDim,
            lineHeight: 1.5,
            marginBottom: 18,
          }}
        >
          You have a drill in progress. Leaving now will discard it.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={onConfirm}
            style={{
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 500,
              background: T.lossSoft,
              color: T.loss,
              border: "none",
              borderRadius: "var(--border-radius-md)",
              cursor: "pointer",
            }}
          >
            Leave and discard
          </button>
          <button
            onClick={onCancel}
            style={{
              padding: "13px 16px",
              fontSize: 14,
              fontWeight: 500,
              background: "transparent",
              color: T.text,
              border: `0.5px solid ${T.borderStrong}`,
              borderRadius: "var(--border-radius-md)",
              cursor: "pointer",
            }}
          >
            Stay in drill
          </button>
        </div>
      </div>
    </div>
  );
}
