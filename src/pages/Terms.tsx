export default function Terms() {
  return (
    <div className="flex-1 w-full px-4 py-8 md:py-12 space-y-8 text-neutral-300">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">Terms of Service</h1>
        <p className="text-sm text-neutral-500">Last Updated: June 2026</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Acceptance</h2>
          <p>
            By accessing or using the game, you agree to be bound by these Terms. Using the game means the user accepts these terms. If you disagree with any part of the terms then you may not access the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Permitted Use</h2>
          <p>Users may:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Play the game for personal use</li>
          </ul>
          <p className="mt-2">Users may not:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Disrupt the service</li>
            <li>Exploit bugs</li>
            <li>Attempt unauthorized access</li>
            <li>Reverse engineer the application</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Ownership</h2>
          <p>
            All game assets, code, branding, visuals, and audio are owned by the creator unless otherwise stated.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Service Availability</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>The game may change over time</li>
            <li>Features may be added, modified, or removed</li>
            <li>Availability is not guaranteed</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Limitation of Liability</h2>
          <p>
            In no event shall the creator, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Age Guidance</h2>
          <p className="italic border-l-4 border-neutral-700 pl-4 py-1 text-neutral-400">
            This game is intended for general audiences and is suitable for users approximately 10 years of age and older.
          </p>
        </section>
      </div>
    </div>
  );
}
