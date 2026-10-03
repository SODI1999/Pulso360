import { getSystemParameters, fetchAdminParams } from '../services/adminQueries';
import { revertNlp } from '../services/systemParamsService';
import { saveParams, publishPolicy, activateNlp, approveRule } from '../services/systemParamsService';
import { useState, useMemo, useEffect } from 'react';
import { env } from '../../../core/config/env';
import { authService } from '../../../core/auth/authService';

export function useSystemParams() {
  const currentUser = authService.getCurrentUser();
  const [version, setVersion] = useState(0);

  // Almacén
  const [storeData, setStoreData] = useState(() => getSystemParameters());

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      if (!env.useMockStorage) {
        try {
          const paramsData = await fetchAdminParams();
          if (active) {
            setStoreData((prev) => ({
              ...prev,
              settings: paramsData
            }));
          }
        } catch (error) {
          console.error('Error fetching live system params:', error);
        }
      } else {
        setStoreData(getSystemParameters());
      }
    };
    loadData();
    return () => { active = false; };
  }, [version]);

  const settings = storeData.settings || {};

  // Estados locales de formularios
  const [umbralN, setUmbralN] = useState(settings.umbralMinimo || 5);
  const [checkinEditHours, setCheckinEditHours] = useState(settings.checkinEditHours || 2);
  const [minGranularity, setMinGranularity] = useState(settings.minGranularity || 'semanal');
  const [auditRetentionYears, setAuditRetentionYears] = useState(settings.auditRetentionYears || 5);

  const [slaAlta, setSlaAlta] = useState(settings.slaAltaHoras || 24);
  const [slaMedia, setSlaMedia] = useState(settings.slaMediaHoras || 48);
  const [slaBaja, setSlaBaja] = useState(settings.slaBajaHoras || 72);
  const [slaSolicitudes, setSlaSolicitudes] = useState(settings.slaSolicitudesHoras || 24);

  const [justification, setJustification] = useState('');
  const [paramFeedback, setParamFeedback] = useState('');
  const [paramError, setParamError] = useState('');

  // Estados de versionado
  const [newPolicyVersion, setNewPolicyVersion] = useState('');
  const [policyFeedback, setPolicyFeedback] = useState('');
  const [newNlpVersion, setNewNlpVersion] = useState('');
  const [nlpFeedback, setNlpFeedback] = useState('');

  const actorLabel = `${currentUser?.name || 'Administrador'} (${currentUser?.role || 'admin'})`;

  // Detección reactiva de debilitamiento de protecciones institucionales
  const riskReasons = useMemo(() => {
    const reasons = [];
    if (Number(umbralN) < 5) reasons.push(`Umbral N inferior al estándar institucional (N=${umbralN} < 5)`);
    if (Number(auditRetentionYears) < 5)
      reasons.push(`Retención de auditoría reducida (${auditRetentionYears} años < 5)`);
    if (Number(checkinEditHours) > 2)
      reasons.push(`Ventana de edición extendida (${checkinEditHours}h > 2h base)`);
    if (Number(slaAlta) > 24) reasons.push(`SLA Alta dilatado (${slaAlta}h > 24h)`);
    if (Number(slaMedia) > 48) reasons.push(`SLA Media dilatado (${slaMedia}h > 48h)`);
    if (Number(slaBaja) > 72) reasons.push(`SLA Baja dilatado (${slaBaja}h > 72h)`);
    if (Number(slaSolicitudes) > 24) reasons.push(`SLA Solicitudes dilatado (${slaSolicitudes}h > 24h)`);
    return reasons;
  }, [umbralN, auditRetentionYears, checkinEditHours, slaAlta, slaMedia, slaBaja, slaSolicitudes]);

  const isRisky = riskReasons.length > 0;

  // Guardado de Parámetros y SLAs
  const handleSaveParams = async (e) => {
    e.preventDefault();
    setParamError('');
    setParamFeedback('');

    const parsedN = Number(umbralN);
    const parsedAudit = Number(auditRetentionYears);
    const parsedAlta = Number(slaAlta);
    const parsedMedia = Number(slaMedia);
    const parsedBaja = Number(slaBaja);
    const parsedSol = Number(slaSolicitudes);

    if (parsedN < 3) {
      setParamError('El umbral N no puede ser inferior al mínimo legal de 3 integrantes.');
      return;
    }

    if (parsedAudit < 5) {
      setParamError('La retención de auditoría debe ser de al menos 5 años según la normativa legal.');
      return;
    }

    if (parsedAlta < 1 || parsedMedia < 1 || parsedBaja < 1 || parsedSol < 1) {
      setParamError('Los tiempos de atención SLA deben ser de al menos 1 hora hábil.');
      return;
    }

    if (isRisky && justification.trim().length < 10) {
      setParamError(
        'Esta configuración debilita parámetros base o dilata SLAs. Debes ingresar una justificación formal de al menos 10 caracteres.'
      );
      return;
    }

    await saveParams(
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
    );

    setParamFeedback('Parámetros y SLAs guardados y registrados en la cadena de auditoría.');
    setJustification('');
    setVersion((v) => v + 1);
  };

  // Publicación de nueva política (RF-15)
  const handlePublishPolicy = async (e) => {
    e.preventDefault();
    setPolicyFeedback('');
    const v = newPolicyVersion.trim();

    if (!/^v\d+\.\d+$/.test(v)) {
      alert('Formato de versión inválido. Usa el estándar "v2.5".');
      return;
    }

    const res = await publishPolicy(v, actorLabel);
    if (res && res.error) {
      setPolicyFeedback(`Error al publicar política: ${res.error}`);
      return;
    }

    setPolicyFeedback(`Política ${v} publicada con éxito. Notificación enviada a todos los agentes.`);
    setNewPolicyVersion('');
    setVersion((v) => v + 1);
  };

  // Activación de nuevo léxico NLP (RF-15)
  const handleActivateNlp = (e) => {
    e.preventDefault();
    setNlpFeedback('');
    const v = newNlpVersion.trim();

    if (!/^lexico-v\d+\.\d+$/.test(v)) {
      alert('Formato inválido. Usa el estándar "lexico-v1.3".');
      return;
    }

    activateNlp(v, actorLabel);

    setNlpFeedback(`Léxico ${v} activado correctamente. Análisis de bitácoras actualizado.`);
    setNewNlpVersion('');
    setVersion((v) => v + 1);
  };

  // Reversión de modelo NLP
  const handleRevertNlp = () => {
    const result = revertNlp(actorLabel);
    if (result.error) {
      alert(result.error);
      return;
    }
    const { prevVersion } = result;
    setNlpFeedback(`Modelo léxico revertido a la versión previa: ${prevVersion}.`);
    setVersion((v) => v + 1);
  };

  // Aprobación de Regla de Alerta SST
  const handleApproveRule = (ruleId) => {
    const operationResult = approveRule(ruleId, actorLabel);
    if (!operationResult) return;

    setVersion((v) => v + 1);
  };

  const rules = storeData.rules || [];

  return {
    settings,
    umbralN,
    setUmbralN,
    checkinEditHours,
    setCheckinEditHours,
    minGranularity,
    setMinGranularity,
    auditRetentionYears,
    setAuditRetentionYears,
    slaAlta,
    setSlaAlta,
    slaMedia,
    setSlaMedia,
    slaBaja,
    setSlaBaja,
    slaSolicitudes,
    setSlaSolicitudes,
    justification,
    setJustification,
    paramFeedback,
    paramError,
    newPolicyVersion,
    setNewPolicyVersion,
    policyFeedback,
    newNlpVersion,
    setNewNlpVersion,
    nlpFeedback,
    riskReasons,
    isRisky,
    handleSaveParams,
    handlePublishPolicy,
    handleActivateNlp,
    handleRevertNlp,
    handleApproveRule,
    rules
  };
}
