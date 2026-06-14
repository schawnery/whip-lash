export default function Contact() {
  return (
    <div className="flex-1 w-full px-4 py-8 md:py-12 space-y-8 text-neutral-300">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">Contact Us</h1>
        <p className="text-sm text-neutral-500">We'd love to hear from you.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <p>
            For support, feedback, or general inquiries, please email us at:{' '}
            <a href="mailto:glyph.creat.ve@gmail.com" className="text-blue-400 hover:text-blue-300 underline font-medium">glyph.creat.ve@gmail.com</a>
          </p>
        </section>

        {/* Future support form placeholder */}
        <section className="space-y-4 pt-8 border-t border-neutral-800">
          <h2 className="text-xl font-semibold text-neutral-100">Send a Message</h2>
          <div className="p-6 bg-neutral-900 rounded-lg border border-neutral-800 text-center text-neutral-500">
            <p>Support form coming soon.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
