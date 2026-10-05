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
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { error: 'Sesión no válida o token ausente' };
    }
    try {
      await Promise.all([
        apiClient.put('/admin/params/umbral_k_anonimato', { valor: { valor: parsedN, minimo_permitido: 3 } }),
        apiClient.put('/admin/params/slas_atencion', { valor: { alta_horas: parsedAlta, media_horas: parsedMedia, baja_horas: parsedBaja, solicitudes_horas: parsedSol } }),
        apiClient.put('/admin/params/gobernanza_checkin', { valor: { horas_edicion_permitidas: Number(checkinEditHours), granularidad_minima: minGranularity, retencion_auditoria_anios: parsedAudit } })
      ]);
      return {};
    } catch (error) {
      return { error: error.response?.data?.error?.message || 'Error en el servidor' };
    }
  }

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

  return {};
}

export async function publishPolicy(v, actorLabel, title, policyText, noticeText) {
  if (!env.useMockStorage) {
    if (!getAuthToken()) {
      return { error: 'Sesión no válida o token ausente' };
    }
    try {
      await apiClient.post('/admin/policies', {
        version: v,
        titulo: title || ('Política de Privacidad ' + v),
        textoPolitica: policyText || 'Política de Privacidad y Tratamiento de Datos Personales Pulso360 versión ' + v,
        textoAviso: noticeText || 'Aviso de Privacidad Integral conforme a la Ley 1581 de 2012.'
      });
      return {};
    } catch (error) {
      return { error: error.response?.data?.error?.message || error.message || 'Error en el servidor' };
    }
  }

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
