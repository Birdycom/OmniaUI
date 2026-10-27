{{-- OmniaUI block: faq - FAQ section: eyebrow, title, lead and an exclusive accordion on native details name (no JavaScript). Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/faq.html | Map: section.oc-block-faq -> inner -> head -> .oc-accordion (details name) -> more line
     Class API: .oc-block-faq (modifier --split: head left, questions right), -inner, -head, -title, -lead,
       -list (on the .oc-accordion), -more. Items: details.oc-accordion-item name="…" + summary.oc-accordion-trigger + .oc-accordion-content
     Blade: <x-oc::block.faq> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, lead, more, default.
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null, 'more' => null])
<section {{ $attributes->merge(['class' => 'oc-block-faq', 'aria-labelledby' => 'oc-faq-title']) }}>
  <div class="oc-block-faq-inner">
    <div class="oc-block-faq-head">
      <p class="oc-eyebrow">
          @if (isset($eyebrow) && trim((string) $eyebrow) !== '')
              {{ $eyebrow }}
          @else
          FAQ
          @endif
      </p>
      <h2 class="oc-block-faq-title" id="oc-faq-title">
          @if (isset($title) && trim((string) $title) !== '')
              {{ $title }}
          @else
          Frequently asked questions
          @endif
      </h2>
      <p class="oc-block-faq-lead">
          @if (isset($lead) && trim((string) $lead) !== '')
              {{ $lead }}
          @else
          Everything you need to know before you start. Can't find your answer? Just ask.
          @endif
      </p>
    </div>
    <div class="oc-accordion oc-block-faq-list">
        @if (! $slot->isEmpty())
            {{ $slot }}
        @else
      <details class="oc-accordion-item" name="oc-faq" open>
        <summary class="oc-accordion-trigger">Can I try it for free?</summary>
        <div class="oc-accordion-content">Yes. Every plan starts with a 30-day trial. No credit card needed.</div>
      </details>
      <details class="oc-accordion-item" name="oc-faq">
        <summary class="oc-accordion-trigger">Can I switch plans later?</summary>
        <div class="oc-accordion-content">Any time. Upgrades apply at once; downgrades start at the next billing period.</div>
      </details>
      <details class="oc-accordion-item" name="oc-faq">
        <summary class="oc-accordion-trigger">Where is my data stored?</summary>
        <div class="oc-accordion-content">In data centers inside the European Union, with daily encrypted backups.</div>
      </details>
      <details class="oc-accordion-item" name="oc-faq">
        <summary class="oc-accordion-trigger">Do you offer support?</summary>
        <div class="oc-accordion-content">E-mail support is included in every plan. Pro plans also get phone support.</div>
      </details>
        @endif
    </div>
    <p class="oc-block-faq-more">
        @if (isset($more) && trim((string) $more) !== '')
            {{ $more }}
        @else
        Still have questions? <a class="oc-link-arrow" href="#contact">Contact us</a>
        @endif
    </p>
  </div>
</section>
