// src/core/auth/avatarPool.js
// Catálogo de avatares fotográficos/3D documentales BPO por rol operativo

export const ROLE_AVATAR_POOLS = {
  agente: [
    '/assets/fotos/bpo-agent-profile.jpg',
    '/assets/fotos/bpo-avatar-male-agent.webp',
    '/assets/fotos/bpo-avatar-female-agent-2.webp'
  ],
  supervisor: [
    '/assets/fotos/bpo-avatar-male-supervisor.webp',
    '/assets/fotos/bpo-avatar-male-agent.webp',
    '/assets/fotos/bpo-agent-profile.jpg'
  ],
  sst: [
    '/assets/fotos/bpo-sst-guardian.jpg',
    '/assets/fotos/bpo-avatar-male-supervisor.webp'
  ],
  auditor: [
    '/assets/fotos/bpo-avatar-male-agent.webp',
    '/assets/fotos/bpo-avatar-female-agent-2.webp'
  ],
  admin: [
    '/assets/fotos/bpo-avatar-female-agent-2.webp',
    '/assets/fotos/bpo-avatar-male-supervisor.webp'
  ]
};

/**
 * Retorna un avatar institucional aleatorio según el rol del usuario
 * @param {string} role - Código del rol ('agente', 'supervisor', 'sst', 'auditor', 'admin')
 * @returns {string} Ruta del activo de imagen
 */
export function getRandomAvatarForRole(role) {
  const normalizedRole = (role || '').toLowerCase();
  const pool = ROLE_AVATAR_POOLS[normalizedRole] || ROLE_AVATAR_POOLS.agente;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
