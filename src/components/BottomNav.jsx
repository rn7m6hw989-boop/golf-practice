// BottomNav
import React from "react";
import { Home, Target, History as HistoryIcon } from "lucide-react";
import { T } from "../theme.js";

export function BottomNav({ currentTab, onChangeTab }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "drills", label: "Drills", icon: Target },
    { id: "history", label: "History", icon: HistoryIcon },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: T.surface,
        borderTop: `0.5px solid ${T.border}`,
        display: "flex",
        paddingBottom: "env(safe-area-inset-bottom)",
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            style={{
              flex: 1,
              padding: "10px 0 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: active ? T.green : T.textFaint,
              position: "relative",
            }}
          >
            {active && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 28,
                  height: 2,
                  background: T.green,
                  borderRadius: 999,
                }}
              />
            )}
            <Icon size={20} strokeWidth={active ? 2.2 : 1.6} />
            <span style={{ fontSize: 11, fontWeight: active ? 500 : 400 }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
