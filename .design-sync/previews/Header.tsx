import { Header } from '@sentropic/design-system-react';

export const Default = () => (
  <Header
    brand={<strong style={{ fontSize: 18 }}>Sent Tech</strong>}
    navigation={[
      { label: 'Accueil', href: '#' },
      { label: 'Produits', href: '#' },
      { label: 'Documentation', href: '#' },
    ]}
  />
);
