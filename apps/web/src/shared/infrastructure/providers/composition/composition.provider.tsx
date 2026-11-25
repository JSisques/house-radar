import { createContext, type ReactNode, useContext } from 'react';

import type { HttpClientPort } from '@shared/domain/http-client/http-client.port';
import type { I18nPort } from '@shared/domain/i18n/i18n.port';
import { createOpenApiFetchAdapter } from '@shared/infrastructure/http-client/openapi-fetch-adapter/openapi-fetch.adapter';
import { createReactI18nextAdapter } from '@shared/infrastructure/i18n/react-i18next-adapter/react-i18next.adapter';

/** Every adapter the app injects. New ports are added here. */
export interface AppPorts {
  httpClient: HttpClientPort;
  i18n: I18nPort;
}

/** Wires the real adapters; tests pass overrides instead of using `vi.mock`. */
export async function createAppPorts(overrides: Partial<AppPorts> = {}): Promise<AppPorts> {
  return {
    httpClient: createOpenApiFetchAdapter({ baseUrl: globalThis.location.origin }),
    i18n: await createReactI18nextAdapter(),
    ...overrides,
  };
}

const CompositionContext = createContext<AppPorts | null>(null);

export function CompositionProvider({ ports, children }: { ports: AppPorts; children: ReactNode }) {
  return <CompositionContext.Provider value={ports}>{children}</CompositionContext.Provider>;
}

function usePorts(): AppPorts {
  const ports = useContext(CompositionContext);
  if (!ports) throw new Error('usePorts must be used inside a CompositionProvider');
  return ports;
}

export function useI18n(): I18nPort {
  return usePorts().i18n;
}

export function useHttpClient(): HttpClientPort {
  return usePorts().httpClient;
}
