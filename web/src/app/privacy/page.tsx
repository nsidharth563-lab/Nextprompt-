import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy — NextPrompt" };

const CONTACT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@nextprompt.app";

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" updated="November 20, 2026">
      <p>
        This policy explains how NextPrompt (the website and the iOS and Android apps, together &quot;NextPrompt&quot;) handles your
        information. Short version: we don&apos;t require an account, we don&apos;t sell your data, we don&apos;t track you across
        other apps or websites, and we don&apos;t keep the photos and videos you analyze.
      </p>

      <h2>What we process</h2>
      <ul>
        <li>
          <strong>Photos and videos you choose.</strong> For videos, the app takes a few still frames on your device and sends only
          those frames. Frames are sent to our server to create your result and are not stored after the result is returned.
        </li>
        <li>
          <strong>Links and notes you enter</strong> (for example a video, website or app link). We fetch publicly available
          information from that link to create your result.
        </li>
        <li>
          <strong>Reports</strong> you send about a result (the reason, the link or file name, and a short summary of the result).
          We keep these to review and improve results.
        </li>
        <li>
          <strong>Technical data</strong> such as your IP address, used briefly in memory to prevent abuse (rate limiting), and
          standard server logs kept for security and debugging.
        </li>
      </ul>

      <h2>AI processing</h2>
      <p>
        To generate results, we send the frames, links, page content and notes to our AI provider, Anthropic, which processes
        them on our behalf under its commercial terms. Anthropic does not use this data to train its models. Results are
        produced by AI and may be inaccurate.
      </p>

      <h2>Data stored on your device</h2>
      <p>
        The app saves your results in a history on your device only. You can delete individual results, or clear all history in
        Settings. Deleting the app deletes this history.
      </p>

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>No advertising, no third-party analytics or tracking SDKs, and no selling or sharing of personal data.</li>
        <li>No account, so we don&apos;t collect your name, email or contacts.</li>
      </ul>

      <h2>Permissions</h2>
      <p>
        The app asks for camera access only when you choose to take a photo, and uses the system photo picker so it only sees
        the items you select. You can change permissions anytime in your device settings.
      </p>

      <h2>Children</h2>
      <p>NextPrompt is not directed to children under 13, and we do not knowingly collect information from them.</p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live (for example under GDPR or CCPA) you may have rights to access or delete information about
        you. Because we don&apos;t keep your media or require an account, we usually hold nothing that identifies you; contact us
        and we&apos;ll help.
      </p>

      <h2>Changes and contact</h2>
      <p>
        We&apos;ll post changes to this policy on this page. Questions: <a className="text-fuchsia-300" href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
    </LegalPage>
  );
}
