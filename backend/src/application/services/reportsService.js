import crypto from 'node:crypto';
import { reportsRepository } from '../../infrastructure/repositories/reportsRepository.js';
import { scopeRepository } from '../../infrastructure/repositories/scopeRepository.js';
import { analyticsRepository } from '../../infrastructure/repositories/analyticsRepository.js';
import { createLog } from '../../infrastructure/repositories/auditorRepository.js';
import { transaction } from '../../infrastructure/db.js';
import { canonicalJson } from '../../domain/canonicalJson.js';
import { authorizeScope } from './scopeAuthorization.js';
import { AppError } from '../errors/AppError.js';
import { isCalendarDate } from '../../domain/calendarDate.js';

const dimensions={energia:'energia_avg',carga:'carga_emocional_avg',carga_emocional:'carga_emocional_avg',recuperacion:'recuperacion_avg',
  apoyo:'apoyo_avg',distanciamiento:'distanciamiento_avg',ineficacia:'ineficacia_avg',participacion:null};
const dateOnly=value=>value instanceof Date?value.toISOString().slice(0,10):String(value).slice(0,10);
function validateDates(desde,hasta){
  for(const value of [desde,hasta].filter(Boolean)){
    if(!isCalendarDate(value))
      throw new AppError('Periodo inválido','INVALID_REPORT_PERIOD',400);
  }
  if(desde&&hasta&&desde>hasta)throw new AppError('Periodo invertido','INVALID_REPORT_PERIOD',400);
}
function snapshot(row){
  const filters=row.parametros_filtro;
  if(!filters||!Object.hasOwn(filters,'snapshot_metrics'))throw new AppError('El reporte histórico no conserva un snapshot verificable','REPORT_SNAPSHOT_UNAVAILABLE',409);
  const content={tipoReporte:row.tipo_reporte,autorId:row.autor_id,fechaCorte:dateOnly(row.fecha_corte),parametrosFiltro:filters,metrics:filters.snapshot_metrics};
  const text=canonicalJson(content);
  if(crypto.createHash('sha256').update(text).digest('hex')!==row.hash_integridad)throw new AppError('El snapshot difiere del hash guardado','REPORT_INTEGRITY_MISMATCH',409);
  return {content,text};
}
function normalize(row){
  return {...row,tipoReporte:row.tipo_reporte,autorId:row.autor_id,campanaId:row.campana_id,equipoId:row.equipo_id,
    fechaCorte:dateOnly(row.fecha_corte),hashIntegridad:row.hash_integridad,parametrosFiltro:row.parametros_filtro,
    rutaArchivo:row.ruta_archivo,createdAt:row.created_at,metrics:row.parametros_filtro?.snapshot_metrics??null};
}
export const reportsService={
  async getReports(user,filters={}){
    const requested=filters.campanaId||filters.campana_id||filters.equipoId||filters.equipo_id;
    const scope=requested?await authorizeScope(user,filters.campanaId||filters.campana_id,filters.equipoId||filters.equipo_id):null;
    const rows=await reportsRepository.findAll(user.id),accessible=[];
    for(const row of rows){
      if(scope&&((scope.equipoId&&row.equipo_id!==scope.equipoId)||(scope.campanaId&&row.campana_id!==scope.campanaId)))continue;
      try{await authorizeScope(user,row.campana_id,row.equipo_id);accessible.push(normalize(row));}
      catch(error){if(!['FORBIDDEN','INVALID_SCOPE','MISSING_FILTERS'].includes(error.code))throw error;}
    }
    return accessible;
  },
  async createReport(user,data){
    const scope=await authorizeScope(user,data.campanaId||data.campana_id,data.equipoId||data.equipo_id);
    const supplied=data.parametrosFiltro||data.parametros_filtro||{};
    const fechaCorte=dateOnly(data.fechaCorte||data.fecha_corte||new Date());
    const desde=data.desde||supplied.desde||null,hasta=data.hasta||supplied.hasta||fechaCorte;
    validateDates(desde,hasta);
    const selected=data.dimensions||(supplied.sections?Object.keys(supplied.sections).filter(key=>supplied.sections[key]===true):['energia','carga','recuperacion','apoyo','distanciamiento','ineficacia']);
    if(!Array.isArray(selected)||selected.length===0||selected.some(key=>!Object.hasOwn(dimensions,key)))throw new AppError('Dimensiones inválidas','INVALID_REPORT_DIMENSIONS',400);
    const format=String(data.format||supplied.format||'json').toLowerCase();
    if(!['json','csv','pdf'].includes(format))throw new AppError('Formato inválido','INVALID_REPORT_FORMAT',400);
    const tipoReporte=data.tipoReporte||data.tipo_reporte||'general',id=`rep-${crypto.randomUUID()}`;
    return transaction(async client=>{
      await authorizeScope(user,scope.campanaId,scope.equipoId,client);
      const params={...scope,desde,hasta};
      const snapshot=await analyticsRepository.getSnapshot(params,client);
      const count=snapshot.cohort_count;
      if(count<5)throw new AppError('Muestra insuficiente para generar un reporte (N < 5)','INSUFFICIENT_COHORT_SIZE',403);
      const averages=snapshot.metrics;
      const metrics=Object.fromEntries([...new Set(selected)].map(key=>[key,dimensions[key]?averages?.[dimensions[key]]??null:null]));
      const parametrosFiltro={desde,hasta,dimensions:[...new Set(selected)],format,cohort_count:count,
        scope_label:await scopeRepository.findLabel(scope.campanaId, scope.equipoId, client),
        requester_name:[user.nombres,user.apellidos].filter(Boolean).join(' ') || null,
        sections:Object.fromEntries(selected.map(key=>[key,true])),snapshot_metrics:metrics};
      const content=canonicalJson({tipoReporte,autorId:user.id,fechaCorte,parametrosFiltro,metrics});
      const hashIntegridad=crypto.createHash('sha256').update(content).digest('hex');
      const saved=await reportsRepository.create({id,tipoReporte,autorId:user.id,...scope,fechaCorte,hashIntegridad,parametrosFiltro,
        rutaArchivo:`/reports/${id}.${format==='csv'?'csv':'json'}`},client);
      await createLog({usuarioId:user.id,rol:user.role||user.rol_codigo,action:'GENERACION_REPORTE',resource:'reportes_generados',resourceId:id,
        details:{...scope,desde,hasta,dimensions:selected,hash:hashIntegridad}},client);
      return normalize(saved);
    });
  },
  async getReportDownload(reportId,user){
    const report=await reportsRepository.findById(reportId);
    if(!report)throw new AppError('Reporte no encontrado','REPORT_NOT_FOUND',404);
    await authorizeScope(user,report.campana_id,report.equipo_id);
    const {content,text}=snapshot(report);
    await createLog({usuarioId:user.id,rol:user.role||user.rol_codigo,action:'EXPORTACION_REPORTE',resource:'reportes_generados',resourceId:report.id,details:{hash:report.hash_integridad}});
    if(report.ruta_archivo?.endsWith('.csv')){
      const metrics=content.metrics||{};
      const csv='Dimension,Promedio\n'+Object.entries(metrics).map(([key,value])=>`"${key.replaceAll('"','""')}",${value===null?'No disponible o protegido':value}`).join('\n');
      return {content:csv,mimeType:'text/csv;charset=utf-8',filename:`reporte_${report.id}.csv`};
    }
    return {content:text,mimeType:'application/json',filename:`reporte_${report.id}.json`};
  }
};
