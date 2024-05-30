import { type Metadata } from "next";
import React from "react";
import { Link } from "~/components/ui/Link";
import { getURL } from "~/utils/utils";

const meta = {
  title: "Playportal | Terms and Conditions",
  description:
    "The type-beat video creation tool for music producers. Upload your beats, an optional image, and we'll render it into a video on our servers. Stay consistent with your uploads and grow your audience on YouTube, Instagram, and TikTok.",
  icons: [{ rel: "icon", url: "/playportal.svg" }],
  favicon: "/playportal.svg",
  robots: "follow, index",
  url: getURL(),
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: "origin-when-cross-origin",
    keywords: [
      "playportal",
      "type beat",
      "beat stars",
      "drum kits",
      "midi kits",
      "free drum kits",
      "free vsts",
      "loop kits",
      "tunestotube",
      "producer tools",
      "tunestotube alternative",
      "upload audio to youtube",
      "upload mp3 to youtube",
      "upload wav to youtube",
    ],
    authors: [{ name: "Playportal", url: "https://playportal.app" }],
    creator: "Playportal",
    publisher: "Playportal",
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      siteName: meta.title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@playportal",
      creator: "@playportal",
      title: meta.title,
      description: meta.description,
      images: [meta.favicon],
    },
  };
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex  flex-col items-center leading-7">
      <div className="landing-bg-gradient pointer-events-none absolute top-0 h-[2450px] w-full " />

      <div className="mt-10 flex max-w-[650px] flex-col items-center space-y-12 px-[18px] py-10">
        <div className="text-left" id="privacy-policy">
          <h2 className="mb-4 text-4xl font-bold">Privacy Policy</h2>
          <p className=" leading-7 text-[#F3F3F3] ">
            Playportal is committed to protecting your privacy. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our application Playportal, including
            through our use of{" "}
            <Link
              className="underline"
              href={"https://www.youtube.com/t/terms"}
            >
              YouTube API Services
            </Link>
            . Please read this privacy policy carefully. If you do not agree
            with the terms of this privacy policy, please do not access the App.
          </p>
        </div>

        <div className="w-full space-y-4 text-left" id="information-collection">
          <h3 className="text-left  text-3xl font-semibold">
            1. Information We Collect
          </h3>
          <p>
            We collect information from and about users of our App, including:
          </p>

          <ul className="list-disc space-y-2 px-4">
            <li>
              <strong>Personal Data:</strong> We may collect personally
              identifiable information, such as your name, email address, and
              other information that you provide to us directly.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use the
              App, such as the features you use and the actions you take.
            </li>
            <li>
              <strong>Device Data:</strong> Information about your device,
              including IP address, browser type, operating system, and device
              identifiers.
            </li>
            <li>
              <strong>API Data:</strong> Information retrieved from YouTube API
              Services such as video details, YouTube channel names and avatars,
              and other authorized data.
            </li>
          </ul>
        </div>

        <div className="w-full space-y-4 text-left" id="information-use">
          <h3 className="text-left  text-3xl font-semibold">
            2. Use of Your Information
          </h3>
          <p>We use the information we collect for the following purposes:</p>

          <ul className="list-disc space-y-2 px-4">
            <li>
              Communicate with you directly to provide you with updates, and
              other information relating to Playportal, and for marketing and
              promotional purposes.
            </li>
            <li>Provide, operate, and maintain our App.</li>
            <li>Improve, personalize, and expand our App.</li>
            <li>Understand and analyze how you use our App.</li>
            <li>Develop new features and functionality.</li>
          </ul>
        </div>

        <div className="w-full space-y-4 text-left" id="information-sharing">
          <h3 className="text-left  text-3xl font-semibold">
            3. Sharing of Your Information
          </h3>
          <p>We may share your information with:</p>

          <ul className="list-disc space-y-2 px-4">
            <li>
              <strong>Service Providers:</strong> We may share your information
              with third-party vendors, service providers, contractors, or
              agents who perform services for us or on our behalf and require
              access to such information to do that work.
            </li>
          </ul>

          <ul className="list-disc space-y-2 px-4">
            <li>
              <strong>Business Transfers:</strong> We may share or transfer your
              information in connection with, or during negotiations of, any
              merger, sale of company assets, financing, or acquisition of all
              or a portion of our business to another company.
            </li>
          </ul>
        </div>

        <div className="w-full space-y-4 text-left" id="youtube-api">
          <h3 className="text-left  text-3xl font-semibold">
            4. Use of YouTube API Services
          </h3>
          <p>
            Our use of YouTube API Services is subject to YouTube{"'"}s Terms of
            Service, which you can view at{" "}
            <Link
              className="underline"
              href={"https://www.youtube.com/t/terms"}
            >
              YouTube Terms of Service.
            </Link>{" "}
            By using our App, you agree to be bound by YouTube{"'s"} Terms of
            Service.
          </p>
          <p>We collect and store the following data from the YouTube API:</p>

          <ul className="list-disc space-y-2 px-4">
            <li>YouTube Channel Titles</li>
            <li>YouTube Channel Avatars.</li>
            <li>YouTube Channel IDs.</li>
            <li>
              <Link
                className="underline"
                href={"https://oauth.net/2/access-tokens/"}
              >
                Securely encrypted access tokens{" "}
              </Link>
              used to authenticate your account with YouTube API Services when
              required
            </li>
          </ul>
          <p>
            You may revoke Playportal{"'s"} access to your YouTube account at
            any time through the account management panel in the dashboard. Upon
            revocation, we will immediately terminate the permissions granted to
            us and delete any stored data associated with your YouTube account.
            Additionally, you may revoke access granted to us directly through
            the{" "}
            <Link href={"https://security.google.com/settings"}>
              Google Security Settings page.
            </Link>
          </p>
          <p>
            In addition, our use of YouTube API Services is in accordance with
            the Google Privacy Policy. You can view the Google Privacy Policy at{" "}
            <Link
              href={"https://policies.google.com/privacy"}
              className="underline"
            >
              Google Privacy Policy.
            </Link>
          </p>
        </div>

        <div className="w-full space-y-4 text-left" id="cookies-and-tracking">
          <h3 className="text-left  text-3xl font-semibold">
            5. Cookies and Tracking Technologies
          </h3>
          <p>
            We and our third-party partners may use cookies and similar tracking
            technologies to collect and use information about your usage of the
            App and your preferences.
          </p>
        </div>

        <div className="w-full space-y-4 text-left" id="data-security">
          <h3 className="text-left  text-3xl font-semibold">
            6. Data Security
          </h3>
          <p>
            We use administrative, technical, and physical security measures to
            help protect your personal information. While we have taken
            reasonable steps to secure the personal information you provide to
            us, please be aware that despite our efforts, no security measures
            are perfect or impenetrable, and no method of data transmission can
            be guaranteed against any interception or other type of misuse.
          </p>
        </div>

        <div className="w-full space-y-4 text-left" id="data-retention">
          <h3 className="text-left  text-3xl font-semibold">
            7. Data Retention
          </h3>
          <p>
            We will retain your information for as long as your account is
            active or as needed to provide you services. You may request to
            delete your account or specific data by contacting us. For
            instructions on how users can revoke our access to their data via
            the Google security settings page, visit{" "}
            <Link href={"https://security.google.com/settings"}>
              Google Security Settings.
            </Link>
          </p>
        </div>

        <div className="w-full space-y-4 text-left" id="privacy-rights">
          <h3 className="text-left  text-3xl font-semibold">
            8. Your Privacy Rights
          </h3>
          <p>
            Depending on your location, you may have the following rights
            regarding your personal information:
          </p>

          <ul className="list-disc space-y-2 px-4">
            <li>
              <strong>The right to access:</strong> You have the right to
              request copies of your personal data.
            </li>
            <li>
              <strong>The right to rectification:</strong> You have the right to
              request that we correct any information you believe is innacurate
              or complete information you believe is incomplete.
            </li>
            <li>
              <strong>The right to erasure:</strong> You have the right to
              request that we erase your personal data, under certain
              conditions.
            </li>
            <li>
              <strong>The right to restrict processing:</strong> You have the
              right to request that we restrict the processing of your personal
              data, under certain conditions.
            </li>
            <li>
              <strong>The right to object to processing:</strong> You have the
              right to object to our processing of your personal data, under
              certain conditions.
            </li>
            <li>
              <strong>The right to data portability:</strong> You have the right
              to request that we transfer the data we have collected to another
              organization, or directly to you, under certain conditions.
            </li>
          </ul>
        </div>

        <div className="w-full space-y-4 text-left" id="privacy-policy-changes">
          <h3 className="text-left  text-3xl font-semibold">
            9. Changes to this Privacy Policy
          </h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </div>
        <div className="w-full space-y-4 text-left" id="contact">
          <h3 className="text-left  text-3xl font-semibold">10. Contact Us</h3>
          <p>
            If you have any questions about this Privacy policy, please feel
            free to contact us via email at:{" "}
            <strong>support@playportal.app</strong>{" "}
          </p>
        </div>
      </div>
    </div>
  );
}
