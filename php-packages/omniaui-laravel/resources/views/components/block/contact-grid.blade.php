{{-- OmniaUI block: contact-grid - Contact section with info cards for e-mail, phone, address and opening hours. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/contact-grid.html | Map: section.oc-block-contact -> head -> grid -> cards (mark, title, lines)
     Class API: .oc-block-contact (modifier --plain: no card frames), -head, -heading, -lead, -grid, -card (article or address),
       -title, -line (p or a). Cards start with a product mark (.oc-product-mark--sm .oc-product-mark--soft).
     Blade: <x-oc::block.contact-grid> - attributes merge onto the root element. Written by hand (array props).
     Props (same names as BlockContactGrid in React): eyebrow, title, lead, plain (no card frames), title-id (default oc-contact-title),
       cards (list of ['title', 'lines' => [['text', 'href'?], ...], 'icon' (glyph or webicon name like mdi:email-outline), 'accent', 'address' (bool)]).
       Left out (null), every text shows the snippet content; :eyebrow="false", :title="false" and :lead="false" hide that part.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, lead, default (own cards).
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null, 'cards' => null, 'plain' => false, 'titleId' => 'oc-contact-title'])
@php($filled = fn ($v) => $v !== null && $v !== false && trim((string) $v) !== '')
<section {{ $attributes->merge(['class' => \Illuminate\Support\Arr::toCssClasses(['oc-block-contact', 'oc-block-contact--plain' => $plain])] + ($title !== false ? ['aria-labelledby' => $titleId] : [])) }}>
  @if ($eyebrow !== false || $title !== false || $lead !== false)
  <div class="oc-block-contact-head">
    @if ($eyebrow !== false)
    <p class="oc-eyebrow">
        @if ($filled($eyebrow))
            {{ $eyebrow }}
        @else
        Contact
        @endif
    </p>
    @endif
    @if ($title !== false)
    <h2 class="oc-block-contact-heading" id="{{ $titleId }}">
        @if ($filled($title))
            {{ $title }}
        @else
        Let's talk about your project
        @endif
    </h2>
    @endif
    @if ($lead !== false)
    <p class="oc-block-contact-lead">
        @if ($filled($lead))
            {{ $lead }}
        @else
        Mail, call or drop by. We answer every question within one working day.
        @endif
    </p>
    @endif
  </div>
  @endif
  <div class="oc-block-contact-grid">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @elseif (is_array($cards))
      @foreach ($cards as $card)
      @php($isAddress = ! empty($card['address']))
      <{{ $isAddress ? 'address' : 'article' }} class="oc-block-contact-card">
        @if (! empty($card['icon']))
        <span @class(['oc-product-mark oc-product-mark--sm oc-product-mark--soft', 'oc-accent--'.($card['accent'] ?? '') => ! empty($card['accent'])]) aria-hidden="true">@if (str_contains((string) $card['icon'], ':'))<x-oc::webicon :name="$card['icon']" bare fallback="iconify" />@else{{ $card['icon'] }}@endif</span>
        @endif
        <{{ $isAddress ? 'span' : 'h3' }} class="oc-block-contact-title">{{ $card['title'] ?? '' }}</{{ $isAddress ? 'span' : 'h3' }}>
        @foreach ($card['lines'] ?? [] as $line)
        @if (! empty($line['href']))
        <a class="oc-block-contact-line" href="{{ $line['href'] }}">{{ $line['text'] ?? '' }}</a>
        @else
        <{{ $isAddress ? 'span' : 'p' }} class="oc-block-contact-line">{{ $line['text'] ?? '' }}</{{ $isAddress ? 'span' : 'p' }}>
        @endif
        @endforeach
      </{{ $isAddress ? 'address' : 'article' }}>
      @endforeach
      @else
    <article class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--blue" aria-hidden="true"><x-oc::webicon name="mdi:email-outline" bare fallback="iconify" /></span>
      <h3 class="oc-block-contact-title">E-mail</h3>
      <a class="oc-block-contact-line" href="mailto:info@company1.example">info@company1.example</a>
      <p class="oc-block-contact-line">For quotes and questions.</p>
    </article>
    <article class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--green" aria-hidden="true"><x-oc::webicon name="mdi:phone-outline" bare fallback="iconify" /></span>
      <h3 class="oc-block-contact-title">Phone</h3>
      <a class="oc-block-contact-line" href="tel:+3230000000">+32 3 000 00 00</a>
      <p class="oc-block-contact-line">Monday to Friday.</p>
    </article>
    <address class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--orange" aria-hidden="true"><x-oc::webicon name="mdi:map-marker-outline" bare fallback="iconify" /></span>
      <span class="oc-block-contact-title">Office</span>
      <span class="oc-block-contact-line">Company 1</span>
      <span class="oc-block-contact-line">Main Street 1, 2000 Antwerp</span>
    </address>
    <article class="oc-block-contact-card">
      <span class="oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--violet" aria-hidden="true"><x-oc::webicon name="mdi:clock-outline" bare fallback="iconify" /></span>
      <h3 class="oc-block-contact-title">Opening hours</h3>
      <p class="oc-block-contact-line">Mon&ndash;Fri: 9:00 &ndash; 17:30</p>
      <p class="oc-block-contact-line">Sat&ndash;Sun: closed</p>
    </article>
      @endif
  </div>
</section>
