import { Notification } from '@sentropic/design-system-react';

export const Info = () => <Notification tone="info" title="Mise à jour disponible" message="Une nouvelle version est prête." dismissible />;
export const Success = () => <Notification tone="success" title="Enregistré" message="Vos modifications ont été sauvegardées." />;
export const Warning = () => <Notification tone="warning" title="Action requise" message="Votre session expire dans 10 minutes." dismissible />;
export const Error = () => <Notification tone="error" title="Erreur de connexion" message="Impossible de contacter le serveur." />;
