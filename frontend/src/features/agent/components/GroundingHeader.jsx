import { Icon } from '../../../core/components/Icon';

export function GroundingHeader({
  totalAnchorsCompleted,
  groundingMode,
  setGroundingMode,
  setIsAssistedPlaying,
  isAssistedPlaying,
  isVoiceEnabled,
  setIsVoiceEnabled
}) {
  return (
    <div className="crisis-section-top">
      <div className="crisis-section-heading-group">
        <div className="crisis-section-title-row">
          <h2 id="grounding-heading" className="crisis-section-title">
            Anclaje somático en estación de trabajo (Grounding 5-4-3-2-1)
          </h2>
          <span className="crisis-progress-pill">{totalAnchorsCompleted} de 15 anclas fijadas</span>
        </div>
        <p className="crisis-section-desc">
          Desescalada psicofisiológica rápida para recuperar el control corporal y la atención presente tras
          llamadas difíciles o escaladas operativas.
        </p>
      </div>

      <div className="crisis-header-tools">
        {/* Selector de modo: Táctil vs Asistido */}
        <div className="crisis-mode-switcher" role="group" aria-label="Modalidad del anclaje">
          <button
            type="button"
            className={`crisis-mode-btn ${groundingMode === 'tactile' ? 'is-active' : ''}`}
            onClick={() => {
              setGroundingMode('tactile');
              setIsAssistedPlaying(false);
            }}
          >
            <Icon name="touchApp" size={15} />
            <span>A tu ritmo (táctil)</span>
          </button>
          <button
            type="button"
            className={`crisis-mode-btn ${groundingMode === 'assisted' ? 'is-active' : ''}`}
            onClick={() => {
              setGroundingMode('assisted');
              setIsAssistedPlaying((prev) => !prev);
            }}
          >
            <Icon name={isAssistedPlaying ? 'pause' : 'play'} size={14} />
            <span>{isAssistedPlaying ? 'Pausar cadencia' : 'Cadencia guiada'}</span>
          </button>
        </div>

        {/* Control de voz del sistema */}
        <button
          type="button"
          className={`crisis-mode-btn ${isVoiceEnabled ? 'is-active' : ''}`}
          onClick={() => {
            setIsVoiceEnabled((prev) => {
              const next = !prev;
              if (!next && typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
              return next;
            });
          }}
          title={isVoiceEnabled ? 'Silenciar voz del sistema' : 'Activar voz del sistema'}
          aria-label={isVoiceEnabled ? 'Silenciar voz del sistema' : 'Activar voz del sistema'}
        >
          <Icon name={isVoiceEnabled ? 'volumeOn' : 'volumeOff'} size={15} />
          <span>{isVoiceEnabled ? 'Voz activada' : 'Voz silenciada'}</span>
        </button>
      </div>
    </div>
  );
}
