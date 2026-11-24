{{-- File: resources/views/components/decimal-input.blade.php | Map: props -> locale separators + currency symbol -> value formatting
     -> input (optionally inside a unit frame, or 0.17.1: the affix frame with a currency or percent symbol)
     OmniaUI decimal input. Props: unit (text after the value), start (left-aligned), error, pattern (default: the decimal
     notation of the locale, like 1.234,56), locale (0.17.1, default nl-BE), decimals (0.17.1: default 2, or those of the
     currency), currency (0.17.1: ISO code like EUR: its symbol in the frame, before or after the value as the locale writes it),
     percent (0.17.1: "%" after the value; the value is the number you see, 21 = 21 %), group-class (class of the frame).
     Attributes (name, value, id, wire:model ...) go to the input. A numeric value (int or float) is formatted in the locale
     (1234.5 -> 1.234,50); a string value is shown as it is.
     0.18.0: allow-negative (true: the pattern takes a leading minus; false: a numeric value is shown without sign;
     not set: the pattern of 0.17 without minus, unchanged), integer (whole numbers:
     0 decimals, no decimal mark in the pattern, inputmode numeric). A numeric value is rounded half away from zero. --}}
@props(['unit' => null, 'start' => false, 'error' => false, 'pattern' => null, 'locale' => 'nl-BE', 'decimals' => null, 'currency' => null, 'percent' => false, 'groupClass' => null,
    'allowNegative' => null, 'integer' => false])
@php
    $intl = class_exists(\NumberFormatter::class);
    // Decimal and group separator of the locale (nl-BE: "," and ".").
    if ($intl) {
        $nf = new \NumberFormatter($locale, \NumberFormatter::DECIMAL);
        $dec = $nf->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL);
        $grp = $nf->getSymbol(\NumberFormatter::GROUPING_SEPARATOR_SYMBOL);
    } else {
        $comma = ! preg_match('/^(en|ja|zh|ko|he|th)(-|_|$)/i', (string) $locale);
        [$dec, $grp] = $comma ? [',', str_starts_with((string) $locale, 'fr') ? "\u{202F}" : '.'] : ['.', ','];
    }
    // Currency: symbol, side and decimals.
    $symbol = null;
    $before = false;
    $digits = $decimals;
    if ($currency) {
        $code = strtoupper((string) $currency);
        if ($intl) {
            $cf = new \NumberFormatter($locale.'@currency='.$code, \NumberFormatter::CURRENCY);
            $symbol = $cf->getSymbol(\NumberFormatter::CURRENCY_SYMBOL);
            $sample = $cf->formatCurrency(1, $code);
            $before = mb_strpos($sample, $symbol) < mb_strpos($sample, '1');
            $digits ??= $cf->getAttribute(\NumberFormatter::FRACTION_DIGITS);
        } else {
            $symbol = ['EUR' => '€', 'USD' => '$', 'GBP' => '£', 'JPY' => '¥', 'CHF' => 'CHF'][$code] ?? $code;
            $before = ! str_starts_with((string) $locale, 'fr') && ! str_starts_with((string) $locale, 'de');
        }
    } elseif ($percent) {
        $symbol = '%';
    }
    $digits = $integer ? 0 : (int) ($digits ?? 2);
    // Pattern for the browser check: digits with group marks, then up to $digits decimals (nl-BE: [0-9.]*(,[0-9]{1,2})?).
    $groupChar = in_array($grp, ["\u{202F}", "\u{00A0}"], true) ? ' ' : $grp;
    $pattern ??= ($allowNegative === true ? '-?' : '').'[0-9'.$groupChar.']*'.($digits > 0 ? '('.($dec === '.' ? '\.' : $dec).'[0-9]{1,'.$digits.'})?' : '');
    // A numeric value is written in the locale; a string (old input, already formatted) stays as it is.
    $value = $attributes->get('value');
    if (is_int($value) || is_float($value)) {
        $number = round((float) $value, $digits, PHP_ROUND_HALF_UP);
        $attributes = $attributes->except('value')->merge(['value' => number_format($allowNegative === false ? abs($number) : $number, $digits, $dec, $grp)]);
    }
    $input = $attributes->class(['oc-input', 'oc-decimal-input', 'oc-decimal-input--start' => $start])->merge(['type' => 'text', 'inputmode' => $integer ? 'numeric' : 'decimal', 'pattern' => $pattern, 'aria-invalid' => $error ? 'true' : null]);
@endphp
@if ($symbol)
    <div @class(['oc-input-group', 'oc-input-group--affix', 'oc-input-group--error' => $error, (string) $groupClass => filled($groupClass)]) @if ($currency) data-currency="{{ strtoupper($currency) }}" @endif>
        @if ($before)
            <span class="oc-input-addon" aria-hidden="true">{{ $symbol }}</span>
        @endif
        <input {{ $input }}>
        @unless ($before)
            <span class="oc-input-addon" aria-hidden="true">{{ $symbol }}</span>
        @endunless
    </div>
@elseif ($unit)
    <div @class(['oc-decimal-field', (string) $groupClass => filled($groupClass)])>
        <input {{ $input }}>
        <span class="oc-decimal-field-unit">{{ $unit }}</span>
    </div>
@else
    <input {{ $input }}>
@endif
