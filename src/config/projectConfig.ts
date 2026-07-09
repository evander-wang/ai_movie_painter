import { parse } from 'smol-toml';
import appConfigToml from '../../config/app.toml?raw';

type RawTomlObject = Record<string, unknown>;

export type ProjectConfig = {
  app: {
    name: string;
    displayName: string;
    description: string;
  };
  server: {
    host: string;
    port: number;
  };
  canvas: {
    minZoom: number;
    maxZoom: number;
    snapGrid: number;
    defaultViewport: {
      x: number;
      y: number;
      zoom: number;
    };
  };
  ui: {
    theme: string;
    accent: string;
    nodePulseMode: 'active-only' | 'always' | 'off';
  };
};

function readObject(value: unknown, key: string): RawTomlObject {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Invalid TOML config: ${key} must be an object`);
  }
  return value as RawTomlObject;
}

function readString(source: RawTomlObject, key: string): string {
  const value = source[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid TOML config: ${key} must be a non-empty string`);
  }
  return value;
}

function readNumber(source: RawTomlObject, key: string): number {
  const value = source[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid TOML config: ${key} must be a finite number`);
  }
  return value;
}

function readPulseMode(source: RawTomlObject): ProjectConfig['ui']['nodePulseMode'] {
  const value = readString(source, 'nodePulseMode');
  if (value === 'active-only' || value === 'always' || value === 'off') return value;
  throw new Error('Invalid TOML config: nodePulseMode must be active-only, always, or off');
}

function loadProjectConfig(): ProjectConfig {
  const root = parse(appConfigToml) as RawTomlObject;
  const app = readObject(root.app, 'app');
  const server = readObject(root.server, 'server');
  const canvas = readObject(root.canvas, 'canvas');
  const viewport = readObject(canvas.defaultViewport, 'canvas.defaultViewport');
  const ui = readObject(root.ui, 'ui');

  return {
    app: {
      name: readString(app, 'name'),
      displayName: readString(app, 'displayName'),
      description: readString(app, 'description'),
    },
    server: {
      host: readString(server, 'host'),
      port: readNumber(server, 'port'),
    },
    canvas: {
      minZoom: readNumber(canvas, 'minZoom'),
      maxZoom: readNumber(canvas, 'maxZoom'),
      snapGrid: readNumber(canvas, 'snapGrid'),
      defaultViewport: {
        x: readNumber(viewport, 'x'),
        y: readNumber(viewport, 'y'),
        zoom: readNumber(viewport, 'zoom'),
      },
    },
    ui: {
      theme: readString(ui, 'theme'),
      accent: readString(ui, 'accent'),
      nodePulseMode: readPulseMode(ui),
    },
  };
}

export const projectConfig = loadProjectConfig();
