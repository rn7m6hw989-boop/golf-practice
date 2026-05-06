// ============================================================================
// STORAGE LAYER — wraps idb-keyval (IndexedDB) with the same API the rest of
// the app expects.
//
// Drill sessions live at:  sessions:{drillId}:{sessionId}
// Completed rounds live at: rounds:{roundId}
// In-progress round lives at: activeRound  (singleton — only one allowed)
//
// Drill sessions and rounds are independent entities. Neither references the
// other. The activity feed (getRecentActivity in helpers) merges them at
// view time.
// ============================================================================

import { get, set, del, keys } from "idb-keyval";

const ACTIVE_ROUND_KEY = "activeRound";

export const storage = {
  // ==========================================================================
  // DRILL SESSIONS
  // ==========================================================================

  async listSessions(drillId) {
    try {
      const allKeys = await keys();
      const prefix = drillId ? `sessions:${drillId}:` : "sessions:";
      const matchingKeys = allKeys.filter(
        (k) => typeof k === "string" && k.startsWith(prefix),
      );
      const sessions = [];
      for (const key of matchingKeys) {
        try {
          const value = await get(key);
          if (value) {
            sessions.push(typeof value === "string" ? JSON.parse(value) : value);
          }
        } catch (e) {
          // skip unreadable entries
        }
      }
      return sessions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (e) {
      console.error("listSessions failed", e);
      return [];
    }
  },

  async saveSession(session) {
    try {
      const key = `sessions:${session.drillId}:${session.id}`;
      await set(key, JSON.stringify(session));
      return true;
    } catch (e) {
      console.error("saveSession failed", e);
      return false;
    }
  },

  async deleteSession(drillId, sessionId) {
    try {
      const key = `sessions:${drillId}:${sessionId}`;
      await del(key);
      return true;
    } catch (e) {
      console.error("deleteSession failed", e);
      return false;
    }
  },

  // ==========================================================================
  // ROUNDS — completed
  //
  // A "round" record:
  //   id            unique id
  //   timestamp     when the round started (or was logged)
  //   date          ISO date string for the round
  //   course        free text
  //   tees          free text
  //   pars          array of par values per hole (length-18, may contain
  //                 null for unset holes)
  //   holes         { [holeNumber]: { par, score, mistakes, notes } }
  //   shots         [{ hole, shotNum, lie, dist, penalty }]
  //   status        "in-progress" | "complete"
  //   finishedAt    timestamp when marked complete (null if in-progress)
  // ==========================================================================

  async listRounds() {
    try {
      const allKeys = await keys();
      const matchingKeys = allKeys.filter(
        (k) => typeof k === "string" && k.startsWith("rounds:"),
      );
      const rounds = [];
      for (const key of matchingKeys) {
        try {
          const value = await get(key);
          if (value) {
            rounds.push(typeof value === "string" ? JSON.parse(value) : value);
          }
        } catch (e) {
          // skip unreadable entries
        }
      }
      // Sort newest-first by timestamp (start time of the round).
      return rounds.sort((a, b) => b.timestamp - a.timestamp);
    } catch (e) {
      console.error("listRounds failed", e);
      return [];
    }
  },

  async saveRound(round) {
    try {
      const key = `rounds:${round.id}`;
      await set(key, JSON.stringify(round));
      return true;
    } catch (e) {
      console.error("saveRound failed", e);
      return false;
    }
  },

  async deleteRound(roundId) {
    try {
      const key = `rounds:${roundId}`;
      await del(key);
      return true;
    } catch (e) {
      console.error("deleteRound failed", e);
      return false;
    }
  },

  // ==========================================================================
  // ACTIVE ROUND — singleton in-progress round
  //
  // At most one round may be in-progress at any time. Enforced at call sites
  // (e.g., a drill session can't be started while one exists).
  // ==========================================================================

  async getActiveRound() {
    try {
      const value = await get(ACTIVE_ROUND_KEY);
      if (!value) return null;
      return typeof value === "string" ? JSON.parse(value) : value;
    } catch (e) {
      console.error("getActiveRound failed", e);
      return null;
    }
  },

  async setActiveRound(round) {
    try {
      // Defensive: ensure status is 'in-progress' for the active round.
      const toStore = { ...round, status: "in-progress" };
      await set(ACTIVE_ROUND_KEY, JSON.stringify(toStore));
      return true;
    } catch (e) {
      console.error("setActiveRound failed", e);
      return false;
    }
  },

  async clearActiveRound() {
    try {
      await del(ACTIVE_ROUND_KEY);
      return true;
    } catch (e) {
      console.error("clearActiveRound failed", e);
      return false;
    }
  },

  // Move the active round into the completed-rounds collection. Marks it
  // complete, copies it to rounds:{id}, and removes the active-round slot.
  async completeActiveRound() {
    try {
      const active = await this.getActiveRound();
      if (!active) return null;
      const completed = {
        ...active,
        status: "complete",
        finishedAt: Date.now(),
      };
      await this.saveRound(completed);
      await this.clearActiveRound();
      return completed;
    } catch (e) {
      console.error("completeActiveRound failed", e);
      return null;
    }
  },
};
