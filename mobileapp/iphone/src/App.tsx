import React, { useState } from 'react';
import TabBar from './components/TabBar';
import Tab1 from './components/Tab1';
import Tab2 from './components/Tab2';
import Tab3 from './components/Tab3';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tab1');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'tab1':
                return <Tab1 />;
            case 'tab2':
                return <Tab2 />;
            case 'tab3':
                return <Tab3 />;
            default:
                return <Tab1 />;
        }
    };

    return (
        <div>
            <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
            {renderTabContent()}
        </div>
    );
};

export default App;