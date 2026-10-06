import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../lib/store';

interface DemoLoginModalProps {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
}

const DEMO_EMAIL = 'demo@telagri.com';
const DEMO_PASSWORD = 'demo';

const DemoLoginModal: React.FC<DemoLoginModalProps> = ({
  open,
  onClose,
  redirectTo = '/monitoring',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAppStore((s) => s.setAuth);
  const [signingIn, setSigningIn] = useState(false);

  if (!open) return null;

  const handleSignIn = () => {
    setSigningIn(true);
    setTimeout(() => {
      setAuth({
        isAuthenticated: true,
        portal: 'government',
        portfolio: 'cb',
        email: DEMO_EMAIL,
      });
      setSigningIn(false);
      onClose();
      navigate(redirectTo);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
      onClick={() => (signingIn ? null : onClose())}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-center px-6 py-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">
            {t('placeOrder.loginModalTitle')}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-sm font-semibold text-amber-800">
              {t('login.demoNotice')}
            </div>
            <div className="text-xs text-amber-700 mt-1">
              {t('login.demoText')}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('login.email')}
            </label>
            <input
              
              value={DEMO_EMAIL}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={DEMO_PASSWORD}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-800"
            />
          </div>
          <button
            type="button"
            disabled={signingIn}
            onClick={handleSignIn}
            className={`w-full rounded-lg py-3 text-sm font-semibold text-white ${
              signingIn
                ? 'bg-blue-400 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {signingIn ? t('login.signingIn') : t('login.signIn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoLoginModal;
