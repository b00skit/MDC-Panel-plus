import { Layout } from '@/components/layout/layout';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Terms of Service"
          description="Last updated: August 08, 2025"
        />
        <Card>
          <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-6 space-y-4">
            <p>
              Please read these terms and conditions carefully before using
              Our Service.
            </p>

            <h2 className="font-bold text-xl">Interpretation and Definitions</h2>
            <h3 className="font-semibold">Interpretation</h3>
            <p>
              The words of which the initial letter is capitalized have
              meanings defined under the following conditions. The following
              definitions shall have the same meaning regardless of whether
              they appear in singular or in plural.
            </p>
            <h3 className="font-semibold">Definitions</h3>
            <p>For the purposes of these Terms and Conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Country</strong> refers to: San Andreas
              </li>
              <li>
                <strong>We</strong> (referred to as either "the Developer", "We",
                "Us" or "Our" in this Agreement) refers to booskit.dev.
              </li>
              <li>
                <strong>Device</strong> means any device that can access the
                Service such as a computer, a cellphone or a digital tablet.
              </li>
              <li>
                <strong>Service</strong> refers to the Website.
              </li>
              <li>
                <strong>Website</strong> refers to MDC Panel+, accessible
                from your current URL.
              </li>
              <li>
                <strong>You</strong> means the individual accessing or using
                the Service, or the developer, or other legal entity on behalf
                of which such individual is accessing or using the Service, as
                applicable.
              </li>
            </ul>

            <h2 className="font-bold text-xl">Acknowledgment</h2>
            <p>
              These are the Terms and Conditions governing the use of this
              Service and the agreement that operates between You and the
              Company. These Terms and Conditions set out the rights and
              obligations of all users regarding the use of the Service.
            </p>
            <p>
              Your access to and use of the Service is conditioned on Your
              acceptance of and compliance with these Terms and Conditions.
              These Terms and Conditions apply to all visitors, users and
              others who access or use the Service.
            </p>
            <p>
              By accessing or using the Service You agree to be bound by these
              Terms and Conditions. If You disagree with any part of these
              Terms and Conditions then You may not access the Service.
            </p>
            <p>
              Your access to and use of the Service is also conditioned on
              Your acceptance of and compliance with the Privacy Policy of the
              Company. Our Privacy Policy describes Our policies and
              procedures on the collection, use and disclosure of Your
              personal information when You use the Application or the Website
              and tells You about Your privacy rights and how the law protects
              You. Please read Our Privacy Policy carefully before using Our
              Service.
            </p>
            
            <h2 className="font-bold text-xl">User Conduct</h2>
            <p>You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Service, the services or the general business of the developer.</p>
            <ul className="list-disc pl-6 space-y-2">
                <li>To harass, abuse, or threaten others or otherwise violate any person's legal rights.</li>
                <li>To violate any intellectual property rights of the Developer or any third party.</li>
                <li>To upload or otherwise disseminate any computer viruses or other software that may damage the property of another.</li>
                <li>To perpetrate any fraud.</li>
            </ul>

            <h2 className="font-bold text-xl">"AS IS" and "AS AVAILABLE" Disclaimer</h2>
            <p>
              The Service is provided to You "AS IS" and "AS AVAILABLE" and
              with all faults and defects without warranty of any kind. To the
              maximum extent permitted under applicable law, the Developer, on
              its own behalf and on behalf of its Affiliates and its and
              their respective licensors and service providers, expressly
              disclaims all warranties, whether express, implied, statutory
              or otherwise, with respect to the Service, including all implied
              warranties of merchantability, fitness for a particular purpose,
              title and non-infringement, and warranties that may arise out of
              course of dealing, course of performance, usage or trade
              practice.
            </p>

            <h2 className="font-bold text-xl">Governing Law</h2>
            <p>
              The laws of the Country, excluding its conflicts of law rules,
              shall govern this Terms and Your use of the Service. Your use of
              the Application may also be subject to other local, state,
              national, or international laws.
            </p>

            <h2 className="font-bold text-xl">Disputes Resolution</h2>
            <p>
              If You have any concern or dispute about the Service, You agree
              to first try to resolve the dispute informally by contacting the
              Company.
            </p>

            <h2 className="font-bold text-xl">Changes to These Terms and Conditions</h2>
            <p>
              We reserve the right, at Our sole discretion, to modify or
              replace these Terms at any time. We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
            </p>
            <p>
              By continuing to access or use Our Service after those revisions
              become effective, You agree to be bound by the revised terms.
              If You do not agree to the new terms, in whole or in part,
              please stop using the website and the Service.
            </p>

            <h2 className="font-bold text-xl">Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, You
              can contact us via the site administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
