import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { WelcomeSection } from '../../components/dashboard/WelcomeSection';
import { MyDecisionsSection } from '../../components/dashboard/MyDecisionsSection';
import { ActionPlansSection } from '../../components/dashboard/ActionPlansSection';
import { CircularPathways } from '../../components/dashboard/CircularPathways';
import { DashboardFooter } from '../../components/dashboard/DashboardFooter';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Guard against premature redirect while auth callback (code or hash tokens) is processing
  const isCallbackInFlight =
    typeof window !== 'undefined' &&
    (window.location.search.includes('code=') ||
      window.location.hash.includes('access_token='));

  useEffect(() => {
    // Only redirect when not loading, no user, and no auth callback parameters are pending
    if (!loading && !user && !isCallbackInFlight) {
      navigate('/login');
    }
  }, [user, loading, isCallbackInFlight, navigate]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/');
    } catch {
      setIsSigningOut(false);
    }
  };

  if (loading || (isCallbackInFlight && !user)) {
    return (
      <div className="dashboard-page items-center justify-center retro-grid-pattern">
        <div className="retro-box p-6 flex items-center gap-3 font-mono text-sm font-bold bg-[#FFFDF5]">
          <Loader2 className="w-5 h-5 animate-spin text-[#0B0B0B]" />
          <span>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userDisplayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User';

  return (
    <div className="dashboard-page retro-grid-pattern">
      {/* Top Header & Account Navigation */}
      <DashboardHeader
        userDisplayName={userDisplayName}
        userEmail={user.email}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      {/* Main Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome & Primary Action Section */}
        <WelcomeSection userDisplayName={userDisplayName} />

        {/* My Decisions Section (Saved Circular Assessments) */}
        <MyDecisionsSection />

        {/* Action Plans Section (Execution Roadmaps) */}
        <ActionPlansSection />

        {/* Five Circular Outcomes Primer */}
        <CircularPathways />
      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
