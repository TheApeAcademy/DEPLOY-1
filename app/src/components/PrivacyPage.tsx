import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBack?: () => void;
}

export function PrivacyPage({ onBack }: LegalPageProps) {
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
            <span className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-lg p-8 prose prose-gray dark:prose-invert max-w-none">

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Effective Date: March 13, 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Your privacy matters to Ape Academy. This policy explains what personal data we collect, how we use it, and the rights you have over it.
            By using our platform, you agree to the practices described in this policy.
          </p>

          <h2>2. Data We Collect</h2>
          <p>We collect the following categories of data:</p>
          <ul>
            <li>Personal Information: Your name, email address, and account details provided at registration</li>
            <li>Academic Data: Assignment details, files, and submission information you provide when using the service</li>
            <li>Usage Data: Login activity, assignment submission history, and activity logs for security and quality purposes</li>
            <li>Technical Data: Browser type, device information, and session metadata for platform performance and analytics</li>
          </ul>

          <h2>3. How We Use Your Data</h2>
          <p>Your data is used to:</p>
          <ul>
            <li>Provide, maintain, and improve the Ape Academy service</li>
            <li>Process payments and track assignment status</li>
            <li>Personalise your experience on the platform</li>
            <li>Send service-related communications such as assignment updates and important notices</li>
            <li>Conduct internal analytics and reporting using anonymised data only</li>
            <li>Comply with legal obligations where required</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal data to third parties under any circumstances.
            We may share anonymised, aggregated data for research or platform improvement purposes.
            Personal data may be shared with third-party service providers solely to deliver the service — these providers are contractually bound to protect your data.
            We may disclose data where required by law or to protect the rights, property, or safety of Ape Academy or its users.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We apply industry-standard security measures including encryption in transit and at rest.
            Access to personal data is restricted to authorised personnel only.
            Users are responsible for maintaining the confidentiality of their own account credentials.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request corrections to inaccurate data</li>
            <li>Request deletion of your account and associated personal data via the Settings page</li>
            <li>Opt out of non-essential communications at any time via notification settings</li>
            <li>Submit a data request or privacy concern to apeacad3my@gmail.com</li>
          </ul>

          <h2>7. Third-Party Services</h2>
          <p>
            Ape Academy integrates with the following third-party services: Supabase for database and authentication, Cloudinary for file storage, and payment processing providers.
            Each provider maintains their own privacy policies which we encourage you to review.
          </p>

          <h2>8. Childrens Privacy</h2>
          <p>
            Ape Academy is not intended for children under the age of 13. We do not knowingly collect personal data from children under this age.
            If you believe a minor has registered on our platform, please contact us immediately and we will remove the account and associated data.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law.
            Users will be notified of significant updates via email or through a notice on the platform.
          </p>

          <h2>10. Contact</h2>
          <p>
            For any privacy-related questions, requests, or concerns, contact us at:
            Email: apeacad3my@gmail.com
          </p>
        </motion.div>
      </main>
    </div>
  );
}
