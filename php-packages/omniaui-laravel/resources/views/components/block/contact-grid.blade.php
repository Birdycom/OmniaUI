{{-- OmniaUI block: contact-grid - Contact section with info cards for e-mail, phone, address and opening hours. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/contact-grid.html | Map: section.oc-block-contact -> head -> grid -> cards (mark, title, lines)
     Class API: .oc-block-contact (modifier --plain: no card frames), -head, -heading, -lead, -grid, -card (article or address),
       -title, -line (p or a). Cards start with a product mark (.oc-product-mark--sm .oc-product-mark--soft).
     Blade: <x-oc::block.contact-grid> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, lead, default.
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null])
<section {{ $attributes->merge(['class' => 'oc-block-contact', 'aria-labelledby' => 'oc-contact-title']) }}>
  <div class="oc-block-contact-head">
    <p class="oc-eyebrow">
        @if (isset($eyebrow) && trim((string) $eyebrow) !== '')
            {{ $eyebrow }}
        @else
        Contact
        @endif
    </p>
    <h2 class="oc-block-contact-heading" id="oc-contact-title">
        @if (isset($title) && trim((string) $title) !== '')
            {{ $title }}
        @else
        Let's talk about your project
        @endif
    </h2>
    <p class="oc-block-contact-lead">
        @if (isset($lead) && trim((string) $lead) !== '')
            {{ $lead }}
        @else
        Mail, call or drop by. We answer every question within one working day.
        @endif
    </p>
  </div>
  <div class="oc-block-contact-grid">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
    <article class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--blue" aria-hidden="true">&#9993;</span>
      <h3 class="oc-block-contact-title">E-mail</h3>
      <a class="oc-block-contact-line" href="mailto:hello@example.com">hello@example.com</a>
      <p class="oc-block-contact-line">For quotes and questions.</p>
    </article>
    <article class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--green" aria-hidden="true">&#9742;</span>
      <h3 class="oc-block-contact-title">Phone</h3>
      <a class="oc-block-contact-line" href="tel:+3230000000">+32 3 000 00 00</a>
      <p class="oc-block-contact-line">Monday to Friday.</p>
    </article>
    <address class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--orange" aria-hidden="true">&#9873;</span>
      <span class="oc-block-contact-title">Office</span>
      <span class="oc-block-contact-line">Acme Software</span>
      <span class="oc-block-contact-line">Main Street 1, 2000 Antwerp</span>
    </address>
    <article class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--violet" aria-hidden="true">&#9719;</span>
      <h3 class="oc-block-contact-title">Opening hours</h3>
      <p class="oc-block-contact-line">Mon&ndash;Fri: 9:00 &ndash; 17:30</p>
      <p class="oc-block-contact-line">Sat&ndash;Sun: closed</p>
    </article>
      @endif
  </div>
</section>
