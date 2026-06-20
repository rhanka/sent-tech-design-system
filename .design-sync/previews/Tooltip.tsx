import { Tooltip, Badge } from '@sentropic/design-system-react';

export const Default = () => <Tooltip content="Informations supplémentaires"><Badge>Survolez-moi</Badge></Tooltip>;
export const Bottom = () => <Tooltip content="Affiché en dessous" placement="bottom"><Badge variant="outlined">Bas</Badge></Tooltip>;
