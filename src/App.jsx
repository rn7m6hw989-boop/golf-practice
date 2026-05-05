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

export default function App() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("home");
  const [screen, setScreen] = useState({ name: "tab" });

  useEffect(() => {
    (async () => {
      const all = await storage.listSessions();
      setSessions(all);
      setLoading(false);
    })();
  }, []);

  const refreshSessions = async () => {
    const all = await storage.listSessions();
    setSessions(all);
  };

  const handleOpenDrill = (drillId) => setScreen({ name: "drillDetail", drillId });
  const handleStartDrill = (drillId) => setScreen({ name: "session", drillId });

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
        paddingBottom: showNav ? 64 : 0,
        fontFamily: "var(--font-sans)",
      }}
    >
      <div style={{ padding: "0 16px" }}>{content}</div>
      {showNav && <BottomNav currentTab={currentTab} onChangeTab={handleChangeTab} />}
    </div>
  );
}

