import { KpiCard } from '@sentropic/design-system-react';

export const Revenue = () => <KpiCard value={142500} label="Revenu mensuel" delta={0.12} format="currency" currency="EUR" sparkline={[80, 92, 85, 110, 125, 138, 142]} />;
export const Conversion = () => <KpiCard value={0.034} label="Taux de conversion" delta={-0.005} format="percent" />;
export const Sessions = () => <KpiCard value={18430} label="Sessions" delta={0.08} trend="up" format="number" />;
export const Flat = () => <KpiCard value={99.8} label="Disponibilité" delta={0} trend="flat" unit="%" />;
