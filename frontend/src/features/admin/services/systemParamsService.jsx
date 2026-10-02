import { pulsoStore } from '../../../core/storage/pulsoStore';
import { apiClient, getAuthToken } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';

export async function saveParams(
  parsedN,
  checkinEditHours,
  minGranularity,
  parsedAudit,
  parsedAlta,
  parsedMedia,
  parsedBaja,
  parsedSol,
  justification,
  actorLabel
) {
  const data = pulsoStore.get();
  data.settings = data.settings || {};
  data.settings.umbralMinimo = parsedN;
  data.settings.checkinEditHours = Number(checkinEditHours);
  data.settings.minGranularity = minGranularity;
  data.settings.auditRetentionYears = parsedAudit;
  data.settings.slaAltaHoras = parsedAlta;
  data.settings.slaMediaHoras = parsedMedia;
  data.settings.slaBajaHoras = parsedBaja;
  data.settings.slaSolicitudesHoras = parsedSol;

  pulsoStore.save(data);

  const justificationText = justification.trim() || 'Ajuste operativo estándar';
  pulsoStore.audit({
    actor: actorLabel,
    action: 'MODIFICACION_PARAMETROS_SISTEMA',
    target: `N=${parsedN}; Granularidad=${minGranularity}; Retención=${parsedAudit}a; SLAs(Alta=${parsedAlta}h, Media=${parsedMedia}h, Baja=${parsedBaja}h, Sol=${parsedSol}h) · Justificación: ${justificationText}`
  });

  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.put('/admin/params/umbral_k_anonimato', { valor: parsedN });
    } catch (error) {
      console.error('Error updating umbral_k_anonimato via API:', error);
    }
  }

  return {};
}

export async function publishPolicy(v, actorLabel) {
  const data = pulsoStore.get();
  data.settings = data.settings || {};
  data.settings.policyVersions = data.settings.policyVersions || [];

  if (!data.settings.policyVersions.includes(v)) {
    data.settings.policyVersions.push(v);
  }

  data.settings.policyVersion = v;
  data.settings.policyEffectiveDate = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());

  // Generar notificación a los agentes para re-consentimiento obligatorio
  data.notifications = data.notifications || [];
  data.notifications.unshift({
    id: `not-${Date.now()}`,
    role: 'agente',
    title: `Nueva versión de política de datos (${v})`,
    context:
      'Debes revisar y actualizar tus consentimientos para continuar interactuando con módulos protegidos.',
    date: new Date().toISOString(),
    read: false,
    href: '/consentimiento'
  });

  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'PUBLICACION_POLITICA',
    target: `Versión ${v} publicada. Se requiere re-consentimiento de titulares.`
  });

  if (!env.useMockStorage && getAuthToken()) {
    try {
      await apiClient.post('/admin/policies', { version: v, titulo: 'Política de Privacidad ' + v });
    } catch (error) {
      console.error('Error publishing policy via API:', error);
    }
  }

  return {};
}

export function activateNlp(v, actorLabel) {
  const data = pulsoStore.get();
  data.settings = data.settings || {};
  data.settings.nlpVersions = data.settings.nlpVersions || [];

  if (!data.settings.nlpVersions.includes(v)) {
    data.settings.nlpVersions.push(v);
  }

  data.settings.nlpVersion = v;
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'ACTIVACION_LEXICO_NLP',
    target: `Modelo activo: ${v}`
  });
  return {};
}

export function approveRule(ruleId, actorLabel) {
  const data = pulsoStore.get();
  const rule = (data.rules || []).find((r) => r.id === ruleId);
  if (!rule) return null;

  rule.active = true;
  rule.pendingApproval = false;
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'APROBACION_REGLA_ALERTA',
    target: `${rule.id} (${rule.metric} ${rule.operator} ${rule.value}%) aprobada y activada`
  });
  return {};
}
export function revertNlp(actorLabel) {
  const data = pulsoStore.get();
  const versions = data.settings?.nlpVersions || [];
  const currentIndex = versions.indexOf(data.settings?.nlpVersion);

  if (currentIndex <= 0) {
    return { error: 'No hay una versión previa registrada a la cual revertir.' };
  }

  const prevVersion = versions[currentIndex - 1];
  data.settings.nlpVersion = prevVersion;
  pulsoStore.save(data);

  pulsoStore.audit({
    actor: actorLabel,
    action: 'REVERSION_LEXICO_NLP',
    target: `Revertido a versión: ${prevVersion}`
  });

  return { prevVersion };
}
