{{-- OmniaUI barcode: drawn as SVG by barcode.js (npx omniaui copy-js barcode). Props: value, format (auto|EAN13|EAN8|UPC|CODE128),
     digits (true), size (md|hero|compact), variant (plate|bare: no white plate and border, for inside a card),
     groupDigits (true: EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1). --}}
@props(['value' => '', 'format' => 'auto', 'digits' => true, 'size' => 'md', 'variant' => 'plate', 'groupDigits' => true])
<figure {{ $attributes->class(['oc-barcode', 'oc-barcode--'.$size => $size !== 'md', 'oc-barcode--bare' => $variant === 'bare']) }} data-value="{{ $value }}" @if($format !== 'auto') data-format="{{ $format }}" @endif @unless($digits) data-digits="false" @endunless @unless($groupDigits) data-group="false" @endunless>
    <figcaption class="oc-barcode__digits">{{ $value }}</figcaption>
</figure>
