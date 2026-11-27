export interface StaleGuard {
  invalidate: () => void;
  run: <T>(task: () => Promise<T>) => Promise<{ current: boolean; value: T }>;
}

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
