import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaseItem } from '../types';
import { OfficerOverview } from '../components/officer/OfficerOverview';
import { OfficerCases } from '../components/officer/OfficerCases';
import { OfficerEvidenceVault } from '../components/officer/OfficerEvidenceVault';
import { OfficerAIAnalysis } from '../components/officer/OfficerAIAnalysis';
import { OfficerTimeline } from '../components/officer/OfficerTimeline';
import { OfficerSuspectNetwork } from '../components/officer/OfficerSuspectNetwork';
import { OfficerReports } from '../components/officer/OfficerReports';
import { OfficerNotifications } from '../components/officer/OfficerNotifications';
import { OfficerProfile } from '../components/officer/OfficerProfile';
import { CaseInvestigationModal } from '../components/officer/CaseInvestigationModal';
import { CaseInvestigationPage } from './CaseInvestigationPage';

export const OfficerDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectCase = (c: CaseItem) => {
    navigate(`/officer/case/${c.id}`);
  };

  const renderSubView = () => {
    if (pathname.startsWith('/officer/case/')) {
      return <CaseInvestigationPage />;
    }
    if (pathname === '/officer/cases') {
      return <OfficerCases onSelectCase={handleSelectCase} />;
    }
    if (pathname === '/officer/evidence-vault') {
      return <OfficerEvidenceVault />;
    }
    if (pathname === '/officer/ai-analysis') {
      return <OfficerAIAnalysis />;
    }
    if (pathname === '/officer/timeline') {
      return <OfficerTimeline />;
    }
    if (pathname === '/officer/suspects') {
      return <OfficerSuspectNetwork />;
    }
    if (pathname === '/officer/reports') {
      return <OfficerReports />;
    }
    if (pathname === '/officer/notifications') {
      return <OfficerNotifications />;
    }
    if (pathname === '/officer/profile') {
      return <OfficerProfile />;
    }

    // Default: Officer Dashboard Overview
    return <OfficerOverview onSelectCase={handleSelectCase} />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {renderSubView()}

      <CaseInvestigationModal
        caseItem={selectedCase}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
