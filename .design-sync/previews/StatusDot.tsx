import { StatusDot } from '@sentropic/design-system-react';

export const Success = () => <StatusDot tone="success" label="En ligne" />;
export const Warning = () => <StatusDot tone="warning" label="Dégradé" />;
export const Error = () => <StatusDot tone="error" label="Hors ligne" />;
export const Live = () => <StatusDot tone="success" pulse label="Temps réel" />;
export const Neutral = () => <StatusDot tone="neutral" label="Inactif" />;
