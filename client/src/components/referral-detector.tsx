import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { ref, get } from 'firebase/database';
import { database } from '@/lib/firebase';

export function ReferralDetector() {
  const [location] = useLocation();
  const [isDetecting, setIsDetecting] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState<any>(null);

  useEffect(() => {
    const detectReferral = async () => {
      // Check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      let refCode = urlParams.get('ref');
      
      // Check hash-based referral (for WhatsApp sharing)
      if (!refCode && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        refCode = hashParams.get('inviteCode') || hashParams.get('ref');
      }

      if (refCode && (location === '/signup' || location === '/login')) {
        setIsDetecting(true);

        try {
          // Verify referral code exists in database
          const usersRef = ref(database, 'users');
          const snapshot = await get(usersRef);
          
          if (snapshot.exists()) {
            const users = snapshot.val();
            const referrer = Object.entries(users).find(([id, user]: [string, any]) => 
              user.referralCode === refCode
            );

            if (referrer) {
              const [referrerId, referrerData] = referrer;
              setReferrerInfo({
                id: referrerId,
                name: referrerData.displayName || 'Unknown User',
                code: refCode
              });
              setIsValidCode(true);
            }
          }
        } catch (error) {
          console.error('Error validating referral code:', error);
        }

        // Show detection animation for 3 seconds
        setTimeout(() => {
          // Auto-fill referral code and disable input
          const referralInput = document.querySelector('input[name="referralCode"]') as HTMLInputElement;
          if (referralInput && isValidCode) {
            referralInput.value = refCode;
            referralInput.disabled = true;
            referralInput.classList.add('bg-green-50', 'border-green-300', 'text-green-700');

            // Show success message with referrer info
            const existingSuccess = referralInput.parentNode?.querySelector('.referral-success');
            if (!existingSuccess) {
              const successDiv = document.createElement('div');
              successDiv.className = 'text-green-600 text-sm mt-1 flex items-center referral-success';
              successDiv.innerHTML = `✅ Referral code from ${referrerInfo?.name} detected! You both get ₹10 bonus on signup.`;
              referralInput.parentNode?.appendChild(successDiv);
            }
          } else if (referralInput && !isValidCode) {
            // Show error for invalid code
            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-red-600 text-sm mt-1 flex items-center referral-error';
            errorDiv.innerHTML = '❌ Invalid referral code. Please check the link and try again.';
            referralInput.parentNode?.appendChild(errorDiv);
          }

          setIsDetecting(false);
        }, 3000);
      }
    };

    detectReferral();
  }, [location, isValidCode, referrerInfo]);

  if (!isDetecting) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-2xl max-w-md mx-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          🔍 Smart Referral Detection
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Validating referral code and preparing bonuses...
        </p>
        
        {referrerInfo && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <p className="text-green-700 dark:text-green-300 text-sm">
              <strong>Referrer:</strong> {referrerInfo.name}
            </p>
            <p className="text-green-600 dark:text-green-400 text-xs">
              Code: {referrerInfo.code}
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
          <span>Applying instant bonus...</span>
        </div>
      </div>
    </div>
  );
}