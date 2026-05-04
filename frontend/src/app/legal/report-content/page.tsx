import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Report content | Brandvertise',
  description: 'How to report abusive or unlawful content related to Brandvertise.',
}

const REPORT_EMAIL = 'compliance@brandvertise.ai'

export default function ReportContentPage() {
  return (
    <article className="max-w-none space-y-6">
      <h1 className="text-2xl font-semibold text-[#111111]">Report content</h1>
      <p className="text-[#374151]">
        If you believe someone is using Brandvertise to create unlawful synthetic media, harassment, intellectual
        property violations, or other abuse, contact us with as much detail as you can safely provide.
      </p>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold text-[#111111]">How to report</h2>
        <p className="mt-2 text-sm text-[#374151]">
          Email{' '}
          <a href={`mailto:${REPORT_EMAIL}`} className="font-medium text-[#111111] underline">
            {REPORT_EMAIL}
          </a>{' '}
          (replace with your production mailbox before launch). Include:
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#374151]">
          <li>Description of the issue and why it violates policy or law</li>
          <li>Approximate time (UTC), URLs, or post IDs if available</li>
          <li>Whether you are the affected party or reporting on behalf of someone else</li>
        </ul>
      </section>

      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-base font-semibold text-[#111111]">What we do next</h2>
        <p className="mt-2 text-sm text-[#374151]">
          We aim to acknowledge reports within <strong>72 hours</strong> and triage by severity. High-risk matters (for
          example non-consensual intimate imagery) are prioritized for faster review. We may suspend accounts, remove
          content, and preserve records consistent with our internal playbook and legal obligations.
        </p>
      </section>

      <p className="text-xs text-[#6B7280]">
        Law enforcement and preservation requests should be directed through your published legal contact after counsel
        review.
      </p>
    </article>
  )
}
