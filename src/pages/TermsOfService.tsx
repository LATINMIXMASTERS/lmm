
import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { Separator } from '@/components/ui/separator';

const TermsOfService: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-sm text-gray mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <Separator className="mb-8" />
        
        <div className="prose prose-sm max-w-none">
          <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the LATINMIXMASTERS LLC website and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily access the materials on LATINMIXMASTERS LLC's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Modify or copy the materials;</li>
            <li>Use the materials for any commercial purpose, or for any public display;</li>
            <li>Attempt to decompile or reverse engineer any software contained on LATINMIXMASTERS LLC's website;</li>
            <li>Remove any copyright or other proprietary notations from the materials; or</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">3. Account Responsibilities</h2>
          <p className="mb-4">
            If you create an account on the website, you are responsible for maintaining the security of your account and for all activities that occur under the account. You must immediately notify LATINMIXMASTERS LLC of any unauthorized use of your account or any other breaches of security. LATINMIXMASTERS LLC will not be liable for any acts or omissions by you, including any damages of any kind incurred as a result of such acts or omissions.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">4. User Content</h2>
          <p className="mb-4">
            Users may submit content such as comments, audio tracks, or other materials. By submitting content, you grant LATINMIXMASTERS LLC a worldwide, non-exclusive, royalty-free license to use, reproduce, adapt, publish, translate, and distribute your content in any existing or future media. You also grant LATINMIXMASTERS LLC the right to sub-license these rights and the right to bring an action for infringement of these rights.
          </p>
          <p className="mb-4">
            Your content must not be illegal or unlawful, must not infringe any third party's legal rights, and must not be capable of giving rise to legal action whether against you or LATINMIXMASTERS LLC or a third party.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">5. Disclaimer</h2>
          <p className="mb-4">
            The materials on LATINMIXMASTERS LLC's website are provided on an 'as is' basis. LATINMIXMASTERS LLC makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">6. Limitations</h2>
          <p className="mb-4">
            In no event shall LATINMIXMASTERS LLC or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on LATINMIXMASTERS LLC's website, even if LATINMIXMASTERS LLC or a LATINMIXMASTERS LLC authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">7. Governing Law</h2>
          <p className="mb-4">
            These terms and conditions are governed by and construed in accordance with the laws of the State of Florida and you irrevocably submit to the exclusive jurisdiction of the courts in that State.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">8. Changes to Terms</h2>
          <p className="mb-4">
            LATINMIXMASTERS LLC reserves the right, at its sole discretion, to modify or replace these Terms at any time. By continuing to access or use our website after those revisions become effective, you agree to be bound by the revised terms.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">9. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at: info@latinmixmasters.com
          </p>
          
          <div className="mt-8 mb-4">
            <p className="italic">LATINMIXMASTERS LLC</p>
            <p className="italic">Miami, Florida</p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TermsOfService;
