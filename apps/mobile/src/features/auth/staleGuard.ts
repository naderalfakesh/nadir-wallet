export interface StaleGuard {
  /** Marks every task already started as stale. */
  invalidate: () => void;
  /** Runs the task and reports whether nothing invalidated it while it ran. */
  run: <T>(task: () => Promise<T>) => Promise<{ current: boolean; value: T }>;
}

// An OS prompt and the keychain read after it can outlive the screen state that
// asked for them; results that finish after a clear must be dropped, not shown.
export function createStaleGuard(): StaleGuard {
  let generation = 0;
  return {
    invalidate: () => {
      generation += 1;
    },
    run: async (task) => {
      const started = generation;
      const value = await task();
      return { current: started === generation, value };
    },
  };
}
