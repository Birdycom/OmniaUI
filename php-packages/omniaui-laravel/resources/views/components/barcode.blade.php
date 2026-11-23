{{-- OmniaUI barcode: drawn as SVG by barcode.js (npx omniaui copy-js barcode). Props: value, format (auto|EAN13|EAN8|UPC|CODE128),
     digits (true), size (md|hero|compact), variant (plate|bare: no white plate and border, for inside a card),
     groupDigits (true: EAN-13 1 6 6, EAN-8 4 4, UPC-A 1 5 5 1), fallback (0.17.1: "code128" draws an EAN/UPC value with a
     wrong check digit as Code 128 instead of an error). --}}
@props(['value' => '', 'format' => 'auto', 'digits' => true, 'size' => 'md', 'variant' => 'plate', 'groupDigits' => true, 'fallback' => null])
<figure {{ $attributes->class(['oc-barcode', 'oc-barcode--'.$size => $size !== 'md', 'oc-barcode--bare' => $variant === 'bare']) }} data-value="{{ $value }}" @if($format !== 'auto') data-format="{{ $format }}" @endif @unless($digits) data-digits="false" @endunless @unless($groupDigits) data-group="false" @endunless @if($fallback) data-fallback="{{ $fallback }}" @endif>
    <figcaption class="oc-barcode__digits">{{ $value }}</figcaption>
</figure>
