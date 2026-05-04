import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | Brandvertise',
  description: 'Acceptable use rules for Brandvertise AI, including synthetic media and safety expectations.',
}

export default function AcceptableUsePage() {
  return (
    <article className="space-y-6 text-[#374151]">
      <h1 className="text-2xl font-semibold text-[#111111]">Acceptable Use Policy</h1>
      <p className="text-sm text-[#6B7280]">Draft for publication — internal and legal review recommended.</p>

      <section>
        <h2 className="text-lg font-semibold text-[#111111]">1. Purpose</h2>
        <p className="mt-2 leading-relaxed">
          Brandvertise provides AI-assisted tools for lawful brand and marketing content. You must not use the Services
          to create, solicit, or distribute material that violates applicable law or this policy.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#111111]">2. Prohibited uses</h2>
        <p className="mt-2 leading-relaxed">You may not use the Services to:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            Produce or distribute <strong className="text-[#111111]">non-consensual intimate imagery</strong> or
            sexualized depictions of real people without their meaningful consent, including “undressing,” voyeuristic
            content, or similar harms.
          </li>
          <li>
            Create <strong className="text-[#111111]">deceptive synthetic media</strong> (including deepfakes)
            intended to mislead about what a real person said or did, or to commit fraud, harassment, or coordinated
            disinformation.
          </li>
          <li>
            Engage in <strong className="text-[#111111]">child sexual exploitation</strong> or sexualization of
            minors.
          </li>
          <li>
            Generate content that incites or glorifies <strong className="text-[#111111]">serious real-world violence</strong> or
            terrorism.
          </li>
          <li>
            Conduct <strong className="text-[#111111]">harassment</strong>, hate campaigns, or discrimination tied to
            real-world harm, or violate others’ intellectual property beyond what you have rights to use.
          </li>
          <li>
            Distribute <strong className="text-[#111111]">malware</strong>, operate scams, or send bulk unsolicited spam.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#111111]">3. Your content and rights</h2>
        <p className="mt-2 leading-relaxed">
          You are responsible for rights to logos, product imagery, and any identifiable people you reference or upload.
          We may refuse generation, remove outputs, or restrict accounts that appear to violate this policy or applicable
          law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#111111]">4. Enforcement</h2>
        <p className="mt-2 leading-relaxed">
          We may block requests, remove stored posts or assets, suspend or terminate accounts, and preserve records as
          required for safety and legal compliance. Automated filters are not a guarantee of legality; you remain
          responsible for your use.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#111111]">5. Reporting</h2>
        <p className="mt-2 leading-relaxed">
          Concerns about misuse can be reported via{' '}
          <a href="/legal/report-content" className="font-medium text-[#111111] underline">
            Report content
          </a>
          . We aim to acknowledge reports within 72 hours and prioritize high-risk categories.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#111111]">6. Changes</h2>
        <p className="mt-2 leading-relaxed">
          We may update this policy. Material updates may require renewed acceptance in the product. Continued use after
          notice may constitute acceptance where permitted by law.
        </p>
      </section>
    </article>
  )
}
