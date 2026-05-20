fetch('https://synycs.onrender.com/api/health/')
  .catch(() => {});
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Wizard from './components/wizard/Wizard';
import Library from './components/Library';
import Auth from './components/Auth';
import RenderQueue from './components/RenderQueue';
import AccountSettings from './components/AccountSettings';
import Settings from './components/Settings';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingProject, setEditingProject] = useState(null);
  const [wizardKey, setWizardKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    const handleForceLogout = () => {
      setIsAuthenticated(false);
    };
    window.addEventListener('userLoggedOut', handleForceLogout);
    return () => window.removeEventListener('userLoggedOut', handleForceLogout);
  }, []);

  const handleTabChange = (tab) => {
    if (tab === 'wizard') {
      setEditingProject(null);
      setWizardKey(prev => prev + 1);
    }
    setActiveTab(tab);
  };

  const handleLogin = (data) => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setWizardKey(prev => prev + 1); // Ensure fresh wizard state even on editing new projects
    setActiveTab('wizard');
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={handleTabChange} />;
      case 'wizard': return <Wizard 
        key={wizardKey}
        project={editingProject} 
        onComplete={() => handleTabChange('library')} 
        onCancel={() => handleTabChange('dashboard')}
      />;
      case 'library': return <Library onEdit={handleEdit} />;
      case 'queue': return <RenderQueue />;
      case 'account': return <AccountSettings />;
      case 'settings': return <Settings initialSubTab="general" />;
      case 'avatars': return <Settings initialSubTab="avatar" />;
      case 'voice-studio': return <Settings initialSubTab="voice" />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <h3 className="text-xl font-bold text-white mb-2 capitalize">{activeTab}</h3>
            <p className="text-slate-500 text-sm">This section is being optimized for the next release.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 font-sans selection:bg-indigo-500/30">
      <Header 
        onLogout={handleLogout} 
        setActiveTab={handleTabChange} 
      />
      <Sidebar 
        activeTab={activeTab} 
        onLogout={handleLogout}
        setActiveTab={handleTabChange} 
      />
      
      <main className="pl-64 pt-20 min-h-screen">
        <div className="p-8 md:p-10 max-w-[1600px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;

