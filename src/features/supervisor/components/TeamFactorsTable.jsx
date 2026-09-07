// src/features/supervisor/components/TeamFactorsTable.jsx
// Tabla de factores psicosociales evaluados a nivel colectivo (RF-07 / RF-11)

export function TeamFactorsTable({
    factors = [
        { name: 'Apoyo Social entre Pares', score: '82 / 100', status: 'Favorable', statusType: 'ok', recommendation: 'Mantener dinámicas de inicio de turno' },
        { name: 'Recuperación agregada', score: '78 / 100', status: 'Favorable', statusType: 'ok', recommendation: 'Resolución de dudas rápida en chat' },
        { name: 'Carga emocional agregada', score: '68 / 100', status: 'Atención', statusType: 'warn', recommendation: 'Reforzar descansos cognitivos' }
    ]
}) {
    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <h2 className="card-title">Indicadores del equipo · Consolidado semanal</h2>
                    <p className="card-subtitle">Promedios agregados de las dimensiones evaluadas para la campaña.</p>
                </div>
            </div>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th scope="col">Factor Evaluado</th>
                            <th scope="col">Nivel Agregado</th>
                            <th scope="col">Estado</th>
                            <th scope="col">Recomendación Preventiva</th>
                        </tr>
                    </thead>
                    <tbody>
                        {factors.map((factor, idx) => (
                            <tr key={idx}>
                                <td><strong>{factor.name}</strong></td>
                                <td>{factor.score}</td>
                                <td>
                                    <span className={`badge badge-${factor.statusType}`}>
                                        {factor.status}
                                    </span>
                                </td>
                                <td>{factor.recommendation}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
