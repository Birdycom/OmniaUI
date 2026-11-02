{{-- OmniaUI price. Props: amount and old (numbers are formatted with currency + locale, strings shown as they are),
     discount ("-20%"), note ("excl. VAT"), alt ("€ 180,29 incl. VAT"), currency (EUR), locale (nl_BE), size (sm|md|lg),
     sale, inline, end. Needs the intl extension for number formatting; without it "€ 149,00" style is used. --}}
@props(['amount' => 0, 'old' => null, 'discount' => null, 'note' => null, 'alt' => null, 'currency' => 'EUR', 'locale' => 'nl_BE',
    'size' => 'md', 'sale' => false, 'inline' => false, 'end' => false])
@php
    $format = function ($v) use ($currency, $locale) {
        if (! is_numeric($v)) return (string) $v;
        if (class_exists(\NumberFormatter::class)) {
            return (new \NumberFormatter($locale, \NumberFormatter::CURRENCY))->formatCurrency((float) $v, $currency);
        }
        return ($currency === 'EUR' ? '€ ' : $currency.' ').number_format((float) $v, 2, ',', '.');
    };
@endphp
<div {{ $attributes->class(['oc-price', 'oc-price--'.$size => $size !== 'md', 'oc-price--sale' => $sale, 'oc-price--inline' => $inline, 'oc-price--end' => $end]) }}>
    <div class="oc-price__main">
        <span class="oc-price__amount">{{ $format($amount) }}</span>
        @if ($old !== null)<s class="oc-price__old">{{ $format($old) }}</s>@endif
        @if ($discount)<span class="oc-badge oc-badge--destructive">{{ $discount }}</span>@endif
    </div>
    @if ($note)<span class="oc-price__note">{{ $note }}</span>@endif
    @if ($alt)<span class="oc-price__alt">{{ $alt }}</span>@endif
</div>
