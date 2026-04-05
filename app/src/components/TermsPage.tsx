import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBack?: () => void;
}

export function TermsPage({ onBack }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦍</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Terms & Conditions</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg p-8 prose prose-gray dark:prose-invert max-w-none">

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Effective Date: March 13, 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Welcome to Ape Academy. By accessing or using our platform, you agree to be bound by these Terms and Conditions.
            Ape Academy provides a professional academic assistance service connecting students with expert support on a pay-per-assignment basis.
            Please read these Terms carefully. If you do not agree, do not use our services.
          </p>

          <h2>2. Services Provided</h2>
          <p>
            Ape Academy offers academic assistance including assignment review, tutoring guidance, and expert feedback across a wide range of subjects and academic levels.
            The service operates on a pay-per-assignment model - users pay for each individual submission reviewed and supported by our team.
            Users acknowledge that Ape Academy is a professional paid service, not a free tool.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            Users must create an account using accurate, current personal information. You are solely responsible for maintaining the security of your account credentials.
            Sharing accounts or login credentials with other individuals is strictly prohibited.
            Users must be at least 13 years of age to register and use the platform.
          </p>

          <h2>4. Payment</h2>
          <p>
            Payment is required per assignment submission. Fees are calculated based on assignment type, complexity, and urgency, and are displayed clearly before any payment is processed.
            Payments are processed securely via designated third-party payment providers.
            Refunds are considered only in cases of verified technical failure and remain at the sole discretion of Ape Academy. Change-of-mind refunds are not offered.
          </p>

          <h2>5. Intellectual Property</h2>
          <p>
            All platform content, features, software, branding, and materials are the exclusive intellectual property of Ape Academy. Users may not reproduce, redistribute, or commercially exploit any part of the platform or its content without prior written consent.
            Any feedback submitted by users may be used by Ape Academy to improve the platform without compensation or attribution.
          </p>

          <h2>6. Acceptable Use</h2>
          <p>Users must not:</p>
          <ul>
            <li>Interfere with, disrupt, or attempt to circumvent the platforms security or operation</li>
            <li>Reverse-engineer, decompile, or exploit any part of the platform</li>
            <li>Use the platform for any unlawful purpose or to harass, threaten, or harm others</li>
            <li>Submit false, misleading, or fraudulent information</li>
          </ul>

          <h2>7. Termination and Suspension</h2>
          <p>
            Ape Academy reserves the right to suspend or permanently terminate any account found to be in violation of these Terms, without prior notice.
            Users may request account deletion at any time via the Settings page. Upon account deletion, access to the platform and all associated data will be permanently revoked.
          </p>

          <h2>8. Disclaimer and Limitation of Liability</h2>
          <p>
            Ape Academy provides an academic assistance service. Outcomes, grades, and academic results are the sole responsibility of the student and cannot be guaranteed.
            To the fullest extent permitted by applicable law, Ape Academy disclaims all warranties, express or implied.
            Ape Academys total liability to any user shall not exceed the amount paid by that user for the specific service giving rise to the claim.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
            Any disputes arising from these Terms or the use of the platform shall be subject to the exclusive jurisdiction of the courts of Nigeria.
          </p>

          <h2>10. Contact</h2>
          <p>
            For any questions or concerns regarding these Terms, contact us at:
            Email: apeacad3my@gmail.com
          </p>
        </motion.div>
      </main>
    </div>
  );
}
