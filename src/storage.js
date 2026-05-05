// ============================================================================
// STORAGE LAYER — wraps idb-keyval (IndexedDB) with the same API the rest of
// the app expects. Sessions are stored at: sessions:{drillId}:{sessionId}
// ============================================================================

import { get, set, del, keys } from "idb-keyval";

export const storage = {
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
            // Stored as JSON string for compatibility with the original
            // storage layer; idb-keyval can handle objects directly but we
            // keep stringification for portability.
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
};
