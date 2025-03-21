
import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicy: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <Separator className="mb-8" />
        
        <div className="prose prose-sm max-w-none">
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            LATINMIXMASTERS LLC ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit our website and our practices for collecting, using, maintaining, protecting, and disclosing that information.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">2. Information We Collect</h2>
          <p className="mb-4">
            We collect several types of information from and about users of our website, including:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Personal information such as name, email address, and login credentials when you register for an account.</li>
            <li>Information about your internet connection, the equipment you use to access our website, and usage details.</li>
            <li>Records and copies of your correspondence if you contact us.</li>
            <li>Details of transactions you carry out through our website and of the fulfillment of your orders.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">3. How We Use Your Information</h2>
          <p className="mb-4">
            We use information that we collect about you or that you provide to us:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>To present our website and its contents to you.</li>
            <li>To provide you with information, products, or services that you request from us.</li>
            <li>To fulfill any other purpose for which you provide it.</li>
            <li>To carry out our obligations and enforce our rights.</li>
            <li>To notify you about changes to our website or any products or services we offer.</li>
            <li>For any other purpose with your consent.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">4. Disclosure of Your Information</h2>
          <p className="mb-4">
            We may disclose personal information that we collect or you provide as described in this privacy policy:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>To our subsidiaries and affiliates.</li>
            <li>To contractors, service providers, and other third parties we use to support our business.</li>
            <li>To comply with any court order, law, or legal process.</li>
            <li>To enforce or apply our terms of use and other agreements.</li>
            <li>To protect the rights, property, or safety of our business, our users, or others.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">5. Data Security</h2>
          <p className="mb-4">
            We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. The safety and security of your information also depends on you. Where you have chosen a password for access to certain parts of our website, you are responsible for keeping this password confidential.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">6. Your Rights</h2>
          <p className="mb-4">
            You can review and change your personal information by logging into the website and visiting your account profile page. You may also contact us directly to request access to, correct, or delete any personal information that you have provided to us.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">7. Children Under the Age of 13</h2>
          <p className="mb-4">
            Our website is not intended for children under 13 years of age. No one under age 13 may provide any information to the website. We do not knowingly collect personal information from children under 13.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">8. Changes to Our Privacy Policy</h2>
          <p className="mb-4">
            It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you through a notice on the website home page.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">9. Contact Information</h2>
          <p className="mb-4">
            To ask questions or comment about this privacy policy and our privacy practices, contact us at: info@latinmixmasters.com
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

export default PrivacyPolicy;
