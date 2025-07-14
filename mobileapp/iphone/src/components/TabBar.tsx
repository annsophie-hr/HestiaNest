import React, { useState } from 'react';
import { Tab1 } from './Tab1';
import { Tab2 } from './Tab2';
import { Tab3 } from './Tab3';

const TabBar: React.FC = () => {
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
                return null;
        }
    };

    return (
        <div>
            <div className="tab-bar">
                <button onClick={() => setActiveTab('tab1')}>Tab 1</button>
                <button onClick={() => setActiveTab('tab2')}>Tab 2</button>
                <button onClick={() => setActiveTab('tab3')}>Tab 3</button>
            </div>
            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default TabBar;