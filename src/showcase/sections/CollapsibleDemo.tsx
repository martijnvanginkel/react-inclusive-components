import { Collapsible } from '../../lib';

export function CollapsibleDemo() {
  return (
    <>
      <p className="note">
        A heading-wrapped <code>&lt;button&gt;</code> with <code>aria-expanded</code>. Collapsed
        content is unmounted, so keyboard users skip past it entirely.
      </p>

      <div className="stack">
        <Collapsible label="Shipping" defaultOpen>
          <p>Ships within 2 business days. Free over $50.</p>
        </Collapsible>

        <Collapsible label="Returns">
          <p>Free returns within 30 days. Items must be unused and in original packaging.</p>
        </Collapsible>

        <Collapsible label="Warranty">
          <p>All products carry a 2-year manufacturer warranty covering defects.</p>
        </Collapsible>
      </div>
    </>
  );
}
