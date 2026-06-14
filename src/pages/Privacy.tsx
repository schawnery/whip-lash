export default function Privacy() {
  return (
    <div className="flex-1 w-full px-4 py-8 md:py-12 space-y-8 text-neutral-300">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">Privacy Policy</h1>
        <p className="text-sm text-neutral-500">Last Updated: June 2026</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Overview</h2>
          <p>
            This Privacy Policy describes our policies and procedures on the collection, use and disclosure of your information when you use the service.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>No personal information is currently collected</li>
            <li>No accounts are required</li>
            <li>No advertising is used</li>
            <li>No analytics or tracking are currently used</li>
            <li>No user data is sold or shared</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Future Changes</h2>
          <p>
            Features may change in the future. This Privacy Policy may be updated if analytics, accounts, advertising, or other data collection methods are introduced. We will notify you of any changes by posting the new Privacy Policy on this page.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, you can contact us at:{' '}
            <a href="mailto:glyph.creat.ve@gmail.com" className="text-blue-400 hover:text-blue-300 underline">glyph.creat.ve@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
