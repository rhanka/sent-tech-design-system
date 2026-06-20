import { FilterPill } from '@sentropic/design-system-react';

export const Default = () => <FilterPill field="Statut" value="Actif" />;
export const WithOperator = () => <FilterPill field="Montant" operator=">" value="1 000 €" />;
export const MultiValue = () => <FilterPill field="Région" value="France, Belgique, Suisse" />;
export const Warning = () => <FilterPill field="Délai" value="En retard" tone="warning" />;
