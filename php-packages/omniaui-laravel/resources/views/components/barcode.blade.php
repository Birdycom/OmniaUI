{{-- OmniaUI barcode: drawn as SVG by barcode.js (npx omniaui copy-js barcode). Props: value, format (auto|EAN13|EAN8|UPC|CODE128),
     digits (true), size (md|hero|compact). --}}
@props(['value' => '', 'format' => 'auto', 'digits' => true, 'size' => 'md'])
<figure {{ $attributes->class(['oc-barcode', 'oc-barcode--'.$size => $size !== 'md']) }} data-value="{{ $value }}" @if($format !== 'auto') data-format="{{ $format }}" @endif @unless($digits) data-digits="false" @endunless>
    <figcaption class="oc-barcode__digits">{{ $value }}</figcaption>
</figure>
