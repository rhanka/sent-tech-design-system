import { Input } from '@sentropic/design-system-react';

export const Default = () => <Input label="Adresse e-mail" />;
export const WithHelper = () => <Input label="Nom d'utilisateur" helperText="Utilisé pour la connexion" />;
export const WithError = () => <Input label="Mot de passe" invalid errorText="Ce champ est requis" />;
export const SmallSize = () => <Input label="Recherche" size="sm" />;
