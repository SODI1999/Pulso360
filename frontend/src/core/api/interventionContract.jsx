export function normalizeIntervention(row) {
  const followups = (row.seguimientos ?? row.followups ?? []).map(s => ({ ...s, date: s.fecha?.slice(0,10) ?? s.date,
    progress: s.progreso_reportado ?? s.progress, note: s.nota_avance ?? s.note, authorId: s.autor_id ?? s.authorId, actionType: s.tipo_accion ?? s.actionType }));
  return { ...row, campaign: row.campana_nombre ?? row.campaign, team: row.equipo_nombre ?? row.team,
    campaignId: row.campana_id ?? row.campaignId, teamId: row.equipo_id ?? row.teamId,
    assignedTo: row.assigned_to ?? row.assignedTo, assignedName: row.assigned_name ?? row.assignedName,
    startDate: row.start_date?.slice(0,10) ?? row.startDate, endDate: row.end_date?.slice(0,10) ?? row.endDate,
    target: row.target_desc ?? row.target, externalAction: row.external_action ?? row.externalAction,
    baseline: row.baseline == null ? null : Number(row.baseline), after: row.after_val == null ? null : Number(row.after_val),
    followups, lastFollowup: followups[0] ?? row.lastFollowup ?? null };
}
