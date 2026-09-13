import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { UploadForm } from './components/analysis/UploadForm';
import { ResultsDisplay } from './components/analysis/ResultsDisplay';
import { HistoryList } from './components/history/HistoryList';
import { ProgressTracker } from './components/progress/ProgressTracker';
import { ProfileForm } from './components/profile/ProfileForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { AiChatWidget } from './components/chat/AiChatWidget';
import { Assessment } from './types/assessment';
import { SAMPLE_CASES } from './utils/sampleData';
import { useAuth } from './context/AuthContext';
import { analysisApi } from './api/analysis';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeAssessment, setActiveAssessment] = useState<any | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [history, setHistory] = useState<Assessment[]>([]);

  const { isAuthenticated, user } = useAuth();

  // Load initial demo assessment history
  useEffect(() => {
    const defaultHistory: Assessment[] = [
      {
        id: 'asm-prev-1',
        type: 'skin',
        image_url: SAMPLE_CASES[0].image_url,
        thumbnail_url: SAMPLE_CASES[0].image_url,
        status: 'completed',
        created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
        prediction: {
          class: 'Melanocytic Nevus',
          code: 'nv',
          full_name: 'Melanocytic Nevus (Common Mole)',
          confidence: 94.8,
          risk_level: 'low',
          requires_consultation: false,
          diagnostic_rationale: 'Uniform pigment network with regular border morphology.',
          model_name: 'EfficientNetB3',
          model_version: 'v2.1.0'
        }
      },
      {
        id: 'asm-prev-2',
        type: 'hair',
        image_url: SAMPLE_CASES[3].image_url,
        thumbnail_url: SAMPLE_CASES[3].image_url,
        status: 'completed',
        created_at: new Date(Date.now() - 45 * 86400000).toISOString(),
        prediction: {
          density_score: 88.2,
          thinning_stage: 'Normal / Dense (Norwood Stage I)',
          hairline_type: 'Juvenile Symmetrical',
          severity: 'Low',
          recommendation: 'Optimal follicular density. Maintain routine care.',
          diagnostic_rationale: 'Robust multi-follicular units with uniform shaft caliber.',
          metrics: {
            coverage_percentage: 92,
            follicle_density: 88,
            hair_diameter: 0.072,
            scalp_visibility: 8
          },
          model_name: 'MobileNetV3',
          model_version: 'v2.1.0'
        }
      }
    ];

    // Try fetching from backend or fallback to initial records
    analysisApi.getHistory(1, 20)
      .then((res) => {
        if (res?.data?.assessments && res.data.assessments.length > 0) {
          setHistory(res.data.assessments);
        } else {
          setHistory(defaultHistory);
        }
      })
      .catch(() => {
        setHistory(defaultHistory);
      });
  }, []);

  const handleAnalysisComplete = (result: any) => {
    setActiveAssessment(result);
    // Add to local history list
    const newEntry: Assessment = {
      id: result.assessment_id || `asm-${Date.now()}`,
      type: result.assessment_type || 'skin',
      image_url: result.image_url,
      thumbnail_url: result.image_url,
      prediction: result.prediction,
      status: 'completed',
      created_at: result.created_at || new Date().toISOString()
    };
    setHistory((prev) => [newEntry, ...prev]);
  };

  const handleSaveToHistory = (assessment: any) => {
    // Already in state
  };

  const handleDeleteAssessment = (id: string) => {
    setHistory((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
  };

  const handleResetAssessment = () => {
    setActiveAssessment(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans relative">
      
      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveAssessment(null);
          setCurrentTab(tab);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* If an active assessment is currently being viewed */}
        {activeAssessment ? (
          <ResultsDisplay
            assessment={activeAssessment}
            onReset={handleResetAssessment}
            onSaveToHistory={handleSaveToHistory}
          />
        ) : (
          <>
            {currentTab === 'landing' && (
              <LandingPage
                onStart={(type) => {
                  setCurrentTab(type === 'skin' ? 'skin-analysis' : 'hair-analysis');
                }}
                onExploreDemo={() => {
                  setCurrentTab('dashboard');
                }}
              />
            )}

            {currentTab === 'dashboard' && (
              <Dashboard
                onNavigate={(tab) => setCurrentTab(tab)}
                recentAssessments={history}
                onSelectAssessment={handleSelectAssessment}
              />
            )}

            {currentTab === 'skin-analysis' && (
              <UploadForm
                initialType="skin"
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}

            {currentTab === 'hair-analysis' && (
              <UploadForm
                initialType="hair"
                onAnalysisComplete={handleAnalysisComplete}
              />
            )}

            {currentTab === 'history' && (
              <HistoryList
                history={history}
                onSelectAssessment={handleSelectAssessment}
                onDeleteAssessment={handleDeleteAssessment}
              />
            )}

            {currentTab === 'progress' && (
              <ProgressTracker
                history={history}
                onSelectAssessment={handleSelectAssessment}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileForm />
            )}

            {currentTab === 'admin' && (
              <AdminDashboard />
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Floating AI Knowledge Chat Widget */}
      <AiChatWidget />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

    </div>
  );
}
