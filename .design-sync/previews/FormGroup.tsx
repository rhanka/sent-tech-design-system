import { FormGroup, Input } from '@sentropic/design-system-react';

export const Default = () => (
  <FormGroup legend="Informations de contact" helperText="Tous les champs sont requis">
    <Input label="Prénom" size="sm" />
    <Input label="Nom" size="sm" />
    <Input label="E-mail" size="sm" />
  </FormGroup>
);
