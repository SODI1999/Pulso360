export function normalizeConsent(data) {
  if (!data) return null;
  const flags = data.flags || data;
  const version = data.politica_version || data.policyVersion || data.version;
  const policy = data.policy || null;
  const policyAccepted = Boolean(data.acepta_politica ?? data.policyAccepted ?? data.active);
  const acceptedActive = data.active === undefined ? policyAccepted : Boolean(data.active);
  const active = acceptedActive && data.politica_vigente !== false && (!policy || version === policy.version);
  const result = {
    policyAccepted, policyVersion: version, active, version,
    noticeAccepted: Boolean(data.acepta_aviso_privacidad ?? data.noticeAccepted),
    policy, updatedAt: data.registrado_en || data.updatedAt,
    history: (data.history || []).map(row => ({
      id: row.id, policyVersion: row.politica_version, updatedAt: row.registrado_en,
      policyAccepted: row.acepta_politica, c1: row.c1_checkin, c2: row.c2_bitacora,
      c3: row.c3_apoyo, c4: row.c4_analitica, c5: row.c5_contacto
    }))
  };
  ['checkin', 'bitacora', 'apoyo', 'analitica', 'contacto'].forEach((name, index) => {
    const key = `c${index + 1}`;
    result[key] = Boolean(flags[`${key}_${name}`] ?? flags[key]);
    result[`${key}_${name}`] = result[key];
  });
  return result;
}
