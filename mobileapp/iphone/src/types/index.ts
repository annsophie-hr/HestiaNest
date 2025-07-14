export interface TabProps {
    title: string;
    content: React.ReactNode;
}

export interface TabBarProps {
    tabs: TabProps[];
    activeTab: number;
    onTabChange: (index: number) => void;
}