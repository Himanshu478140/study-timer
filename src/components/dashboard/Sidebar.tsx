import { GalleryHorizontalEnd, Clock, BarChart2, Quote, Database, BadgeInfo, MessageSquare } from 'lucide-react';
import { SidebarItem } from './components/SidebarItem';
import type { DashboardTab } from './types';

interface SidebarProps {
  activeTab: DashboardTab;
  aboutVisited: boolean;
  onTabChange: (tab: DashboardTab) => void;
  onAboutVisited: () => void;
}

export const Sidebar = ({
  activeTab,
  aboutVisited,
  onTabChange,
  onAboutVisited
}: SidebarProps) => {
  return (
    <div className="dashboard-sidebar">
      <SidebarItem
        icon={GalleryHorizontalEnd}
        label="Themes"
        active={activeTab === 'themes'}
        onClick={() => onTabChange('themes')}
      />
      <SidebarItem
        icon={Clock}
        label="Clock"
        active={activeTab === 'clock'}
        onClick={() => onTabChange('clock')}
      />
      <SidebarItem
        icon={BarChart2}
        label="Stats"
        active={activeTab === 'stats'}
        onClick={() => onTabChange('stats')}
      />
      <SidebarItem
        icon={Quote}
        label="Quotes"
        active={activeTab === 'quotes'}
        onClick={() => onTabChange('quotes')}
      />
      <SidebarItem
        icon={Database}
        label="Account"
        active={activeTab === 'account'}
        onClick={() => onTabChange('account')}
      />
      <SidebarItem
        icon={BadgeInfo}
        label="About"
        active={activeTab === 'about'}
        glow={!aboutVisited}
        onClick={() => {
          onTabChange('about');
          onAboutVisited();
        }}
      />
      <SidebarItem
        icon={MessageSquare}
        label="Support"
        active={activeTab === 'support'}
        onClick={() => onTabChange('support')}
      />
    </div>
  );
};
