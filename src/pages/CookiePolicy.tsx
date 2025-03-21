
import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { Separator } from '@/components/ui/separator';

const CookiePolicy: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        <p className="text-sm text-gray mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <Separator className="mb-8" />
        
        <div className="prose prose-sm max-w-none">
          <h2 className="text-xl font-semibold mb-4">1. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are placed on your computer, smartphone, or other device when you visit our website. They allow our website to recognize your device and remember certain information about your visit, such as your preferences and actions. Cookies are widely used to make websites work more efficiently, as well as to provide information to the owners of the site.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">2. How We Use Cookies</h2>
          <p className="mb-4">
            LATINMIXMASTERS LLC uses cookies for a variety of reasons, including to:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Understand and save user preferences for future visits.</li>
            <li>Keep track of advertisements.</li>
            <li>Compile aggregate data about site traffic and site interactions.</li>
            <li>Improve our website and services to better serve you.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">3. Types of Cookies We Use</h2>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
            <p>These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and account access. You may disable these by changing your browser settings, but this may affect how the website functions.</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Performance and Analytics Cookies</h3>
            <p>These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us measure and improve the performance of our site.</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Functionality Cookies</h3>
            <p>These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</p>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Targeting and Advertising Cookies</h3>
            <p>These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</p>
          </div>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">4. How to Control Cookies</h2>
          <p className="mb-4">
            Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit www.aboutcookies.org or www.allaboutcookies.org.
          </p>
          <p className="mb-4">
            To opt out of being tracked by Google Analytics across all websites, visit http://tools.google.com/dlpage/gaoptout.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">5. Third-Party Cookies</h2>
          <p className="mb-4">
            In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site.
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the web for helping us to understand how you use the site and ways that we can improve your experience.</li>
            <li>From time to time we test new features and make subtle changes to the way that the site is delivered. When we are still testing new features, these cookies may be used to ensure that you receive a consistent experience whilst on the site.</li>
          </ul>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">6. Changes to This Cookie Policy</h2>
          <p className="mb-4">
            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
          </p>
          
          <h2 className="text-xl font-semibold mb-4 mt-8">7. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about our use of cookies, please contact us at: info@latinmixmasters.com
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

export default CookiePolicy;
