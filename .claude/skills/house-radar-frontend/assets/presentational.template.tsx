// Path: src/contexts/<context>/presentation/components/<name>/<name>.component.tsx
// Presentational: props in, markup out. No hooks from application, no data fetching. Named export only.
// Texts come from useTranslation (namespace per context); formatting through the i18n adapter.
import { useTranslation } from 'react-i18next';

import type { PropertySummary } from '@contexts/search/domain/models/property-summary.model';

interface PropertyListProps {
  readonly properties: PropertySummary[];
  readonly isLoading: boolean;
  readonly error: Error | null;
}

export function PropertyList({ properties, isLoading, error }: PropertyListProps) {
  const { t } = useTranslation('search');

  if (isLoading) return <p>{t('list.loading')}</p>;
  if (error) return <p role="alert">{t('list.error')}</p>;

  return (
    <ul>
      {properties.map((property) => (
        <li key={property.id}>{property.title}</li>
      ))}
    </ul>
  );
}
