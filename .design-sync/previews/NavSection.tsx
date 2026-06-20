import { NavSection } from '@sentropic/design-system-react';

export const Default = () => (
  <NavSection label="Menu principal">
    <div style={{ padding: '8px 12px', fontSize: 14 }}>Tableau de bord</div>
    <div style={{ padding: '8px 12px', fontSize: 14 }}>Rapports</div>
    <div style={{ padding: '8px 12px', fontSize: 14 }}>Paramètres</div>
  </NavSection>
);
export const WithCount = () => (
  <NavSection label="Notifications" count={5} collapsible open>
    <div style={{ padding: '8px 12px', fontSize: 14 }}>5 nouvelles alertes</div>
  </NavSection>
);
