import { Textarea } from '@sentropic/design-system-react';

export const Default = () => <Textarea label="Description" />;
export const WithHelper = () => <Textarea label="Notes internes" helperText="Visible uniquement par votre équipe" />;
export const WithError = () => <Textarea label="Commentaire" invalid errorText="Ce champ est requis" />;
