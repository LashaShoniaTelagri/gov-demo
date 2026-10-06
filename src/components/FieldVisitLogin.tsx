import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authenticate } from '../lib/fieldVisitCases';
import { useAppStore } from '../lib/store';

// Login gate for the Field Visit Alternative module. The username routes the
// visitor to their client case (e.g. 'credo'); credentials are checked against
// the base64 credential stored in the case registry.
const FieldVisitLogin: React.FC = () => {
  const { t } = useTranslation();
  const setDemoAuth = useAppStore((s) => s.setDemoAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    setSigningIn(true);
    // Small delay so it feels like a real authorization.
    setTimeout(() => {
      const caseId = authenticate(username.trim(), password);
      if (caseId) {
        setDemoAuth({ caseId });
      } else {
        setError(true);
        setSigningIn(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white text-center px-6 py-8">
          <div className="mx-auto w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">{t('fieldVisit.loginTitle')}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('fieldVisit.username')}
            </label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-800"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              {t('fieldVisit.password')}
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-800"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {t('fieldVisit.loginError')}
            </div>
          )}
          <button
            type="submit"
            disabled={signingIn}
            className={`w-full rounded-lg py-3 text-sm font-semibold text-white ${
              signingIn ? 'bg-emerald-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {signingIn ? t('fieldVisit.signingIn') : t('fieldVisit.signIn')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FieldVisitLogin;
