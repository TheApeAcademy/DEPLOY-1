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

          {/* GDPR Compliance Section */}
          <div className="mb-10 p-6 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30">
            <h2 className="text-emerald-700 dark:text-emerald-400 mt-0">GDPR Compliance &amp; Your Data Rights</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">This section applies to all users, particularly those in the European Economic Area (EEA).</p>

            <h3 className="font-semibold mt-4 mb-2">What Data We Collect</h3>
            <ul>
              <li><strong>Identity data:</strong> your name and email address provided at registration</li>
              <li><strong>Academic data:</strong> assignment details, uploaded files, subject and course information</li>
              <li><strong>Payment reference:</strong> transaction reference numbers (we do not store card details)</li>
              <li><strong>Usage data:</strong> login timestamps, assignment submission history, and activity logs</li>
            </ul>

            <h3 className="font-semibold mt-4 mb-2">How It Is Stored</h3>
            <p>All personal data is stored in <strong>Supabase</strong>, a secure cloud database with encryption at rest and in transit. Access is restricted to authorised personnel only. Uploaded files are stored via <strong>Cloudinary</strong> with access-controlled URLs.</p>

            <h3 className="font-semibold mt-4 mb-2">How Long We Keep It</h3>
            <p>We retain your personal data for <strong>12 months from your last activity</strong> on the platform. After this period, inactive accounts and their associated data are permanently deleted. You may request earlier deletion at any time.</p>

            <h3 className="font-semibold mt-4 mb-2">Your Rights</h3>
            <p>Under GDPR and applicable data protection laws, you have the right to:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Rectification</strong> — request correction of inaccurate or incomplete data</li>
              <li><strong>Erasure</strong> — request deletion of your account and all personal data (the "right to be forgotten")</li>
              <li><strong>Portability</strong> — request your data in a machine-readable format</li>
              <li><strong>Objection</strong> — object to processing of your data for certain purposes</li>
            </ul>
            <p>To exercise any of these rights, contact us at: <strong>ojoshbanky@gmail.com</strong>. We will respond within 30 days.</p>

            <h3 className="font-semibold mt-4 mb-2">Cookies</h3>
            <p>We use <strong>session cookies only</strong> — these are strictly necessary to keep you logged in during your visit. We do not use tracking cookies, advertising cookies, or third-party analytics cookies. No cookie consent banner is required as we only use essential cookies.</p>

            <h3 className="font-semibold mt-4 mb-2">GDPR Compliance Statement</h3>
            <p>Ape Academy is committed to processing personal data in accordance with the <strong>General Data Protection Regulation (GDPR)</strong> (EU) 2016/679. Our lawful basis for processing is <em>contractual necessity</em> — we process your data to deliver the service you requested. For EU/EEA users, you also have the right to lodge a complaint with your local data protection authority if you believe your rights have been violated.</p>
          </div>

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
