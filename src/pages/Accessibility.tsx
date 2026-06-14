export default function Accessibility() {
  return (
    <div className="flex-1 w-full px-4 py-8 md:py-12 space-y-8 text-neutral-300">
      <div>
        <h1 className="text-3xl font-bold text-neutral-50 mb-2">Accessibility Statement</h1>
        <p className="text-sm text-neutral-500">Last Updated: June 2026</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Our Commitment</h2>
          <p>
            We aim to make the game usable and accessible by as many people as possible, regardless of technology or ability. We are actively working to increase the accessibility and usability of our game.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Continuous Improvement</h2>
          <p>
            Please note that our accessibility improvements may continue over time as we add new features and refine existing ones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-neutral-100">Contact & Feedback</h2>
          <p>
            If you experience any difficulty in accessing any part of this game, or if you need assistance, please contact us. We welcome your feedback on the accessibility of the game.
          </p>
          <p>
            You can report accessibility issues at:{' '}
            <a href="mailto:glyph.creat.ve@gmail.com" className="text-blue-400 hover:text-blue-300 underline">glyph.creat.ve@gmail.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
