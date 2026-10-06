import { runScheduledAlerts } from '../application/services/weeklyAlertService.js';
import { alertJobEnabled } from '../infrastructure/alertJobConfig.js';

export function startAlertScheduler({enabled = alertJobEnabled(), run = runScheduledAlerts,
  now = () => new Date(), intervalMs = 60000,
  onResult = result => {
    if (result.runs?.length) console.log('[Job alertas]:', JSON.stringify(result));
    if (result.status === 'MIGRATION_REQUIRED') console.error('[Job alertas]: MIGRATION_REQUIRED; no se generaron alertas.');
  },
  onError = () => console.error('[Job alertas]: EVALUATION_FAILED; se reintentará sin avanzar el cierre.')
} = {}) {
  let stopped = !enabled, pending = null, lastStatus = null;
  async function tick() {
    if (stopped || pending) return;
    pending = (async () => {
      try {
        const result = await run(now());
        if (result.runs?.length || result.status !== lastStatus) onResult(result);
        lastStatus = result.status;
        return result;
      }
      catch (error) { onError(error); }
    })();
    try { return await pending; } finally { pending = null; }
  }
  const timer = enabled ? setInterval(() => { void tick(); }, intervalMs) : null;
  timer?.unref();
  if (enabled) void tick();
  return {tick, async stop() { stopped = true; clearInterval(timer); await pending; }};
}
