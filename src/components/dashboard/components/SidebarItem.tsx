import type { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
  glow?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick, hasNotification, glow }: SidebarItemProps) => (
  <div
    className={`sidebar-item ${active ? 'active' : ''} ${glow && !active ? 'glow' : ''}`}
    onClick={onClick}
  >
    <Icon size={20} />
    <span style={{ flex: 1 }}>{label}</span>
    {hasNotification && (
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ea580c', boxShadow: '0 0 8px #ea580c' }} />
    )}
  </div>
);
