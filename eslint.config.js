import path from 'node:path';
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Local rule: keep the feature graph and browser storage boundary explicit.
const architectureRules = {
  rules: {
    'module-boundaries': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          dependency:
            'Dependencia no permitida: core no depende de features y las features no importan hermanas.',
          storage: 'El acceso al almacenamiento del navegador pertenece a core/storage.',
          mutation: 'Consultar o modificar pulsoStore corresponde a un servicio de la funcionalidad.',
          environment: 'Leer variables de entorno únicamente desde core/config/env.jsx.'
        }
      },
      create(context) {
        const filename = context.filename.replaceAll('\\', '/');
        const feature = filename.match(/\/src\/features\/([^/]+)\//)?.[1];
        const isCore = filename.includes('/src/core/');
        const isStorage = filename.includes('/src/core/storage/');
        const isFeatureService = filename.includes('/services/');
        return {
          ImportDeclaration(node) {
            if (!node.source.value.startsWith('.')) return;
            const target = path
              .resolve(path.dirname(context.filename), node.source.value)
              .replaceAll('\\', '/');
            const targetFeature = target.match(/\/src\/features\/([^/]+)\//)?.[1];
            if (targetFeature && (isCore || (feature && feature !== targetFeature))) {
              context.report({ node, messageId: 'dependency' });
            }
          },
          MemberExpression(node) {
            const property = node.computed ? node.property.value : node.property.name;
            if (!isStorage && ['localStorage', 'sessionStorage', 'indexedDB'].includes(property)) {
              context.report({ node, messageId: 'storage' });
            }
            if (
              feature &&
              !isFeatureService &&
              node.object.name === 'pulsoStore' &&
              ['get', 'save', 'reset'].includes(property)
            ) {
              context.report({ node, messageId: 'mutation' });
            }
            if (
              node.object.type === 'MetaProperty' &&
              property === 'env' &&
              !filename.endsWith('/src/core/config/env.jsx')
            ) {
              context.report({ node, messageId: 'environment' });
            }
          },
          Identifier(node) {
            if (
              !isStorage &&
              ['localStorage', 'sessionStorage', 'indexedDB'].includes(node.name) &&
              node.parent.type !== 'MemberExpression'
            ) {
              context.report({ node, messageId: 'storage' });
            }
            if (
              !isStorage &&
              ['localStorage', 'sessionStorage', 'indexedDB'].includes(node.name) &&
              node.parent.type === 'MemberExpression' &&
              node.parent.object === node
            ) {
              context.report({ node, messageId: 'storage' });
            }
          }
        };
      }
    }
  }
};

export default [
  { ignores: ['dist', '.kilo', '.agents', '.cline', '.impeccable', 'anti-slop', 'docs'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      architecture: architectureRules
    },
    rules: {
      ...js.configs.recommended.rules,
      'architecture/module-boundaries': 'error',
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
    }
  },
  {
    files: ['src/features/*/data/**/*.jsx'],
    // Los catálogos usan JSX por convención académica, pero no son componentes.
    rules: { 'react-refresh/only-export-components': 'off' }
  }
];
