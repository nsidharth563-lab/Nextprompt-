import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms of Use — NextPrompt" };

const CONTACT = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@nextprompt.app";

export default function Terms() {
  return (
    <LegalPage title="Terms of Use" updated="November 20, 2026">
      <p>By using NextPrompt (the website and mobile apps) you agree to these terms.</p>

      <h2>What NextPrompt does</h2>
      <p>
        NextPrompt uses AI to suggest prompts, tools and steps for creating media, and to estimate whether a website or app was
        built with AI tools. Results are AI-generated suggestions and estimates. They can be wrong and are never proof of how
        something was made.
      </p>

      <h2>Your content and other people&apos;s rights</h2>
      <ul>
        <li>Only upload or link to content you have the right to use.</li>
        <li>
          Use the prompts to make your own original work. Don&apos;t use NextPrompt to copy someone else&apos;s brand, logo, text,
          artwork or likeness, to impersonate real people, or to infringe copyrights or trademarks.
        </li>
        <li>You are responsible for what you create with the prompts and with third-party platforms.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>
        Don&apos;t use NextPrompt for anything illegal, to create harmful or sexual content involving minors, to harass people, or
        to scan systems you aren&apos;t allowed to access. Don&apos;t attempt to overload, scrape or reverse-engineer the service.
      </p>

      <h2>Third-party platforms</h2>
      <p>
        We recommend tools made by other companies. We&apos;re not affiliated with them, and their own terms and prices apply.
      </p>

      <h2>No warranty</h2>
      <p>
        NextPrompt is provided &quot;as is&quot; without warranties of any kind. To the extent permitted by law, we are not liable for
        any indirect or consequential damages from using the service.
      </p>

      <h2>Changes</h2>
      <p>We may update the service and these terms. Continuing to use NextPrompt means you accept the updated terms.</p>

      <h2>Contact</h2>
      <p>
        <a className="text-fuchsia-300" href={`mailto:${CONTACT}`}>{CONTACT}</a>
      </p>
    </LegalPage>
  );
}
