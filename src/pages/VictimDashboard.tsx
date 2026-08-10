import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { CaseItem } from '../types';
import { VictimOverview } from '../components/victim/VictimOverview';
import { VictimCases } from '../components/victim/VictimCases';
import { FileComplaintWizard } from '../components/victim/FileComplaintWizard';
import { VictimEvidenceVault } from '../components/victim/VictimEvidenceVault';
import { VictimCaseTimeline } from '../components/victim/VictimCaseTimeline';
import { VictimNotifications } from '../components/victim/VictimNotifications';
import { VictimProfile } from '../components/victim/VictimProfile';

export const VictimDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  const pathname = location.pathname;

  const renderSubView = () => {
    if (pathname === '/victim/cases') {
      return <VictimCases initialSelectedCase={selectedCase} />;
    }
    if (pathname === '/victim/file-complaint') {
      return (
        <FileComplaintWizard
          onComplete={newCase => {
            setSelectedCase(newCase);
          }}
        />
      );
    }
    if (pathname === '/victim/evidence') {
      return <VictimEvidenceVault />;
    }
    if (pathname === '/victim/timeline') {
      return <VictimCaseTimeline />;
    }
    if (pathname === '/victim/notifications') {
      return <VictimNotifications />;
    }
    if (pathname === '/victim/profile') {
      return <VictimProfile />;
    }

    // Default overview / dashboard
    return (
      <VictimOverview
        onSelectCase={c => {
          setSelectedCase(c);
        }}
      />
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {renderSubView()}
    </div>
  );
};
