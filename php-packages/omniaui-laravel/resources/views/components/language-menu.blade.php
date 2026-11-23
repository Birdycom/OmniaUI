{{-- File: resources/views/components/language-menu.blade.php | Map: props -> trigger (flag + code or name, or icon only) -> popover menu (flag, native name, code, check)
     OmniaUI language menu: button.oc-language-select opens .oc-dropdown-menu.oc-language-menu (popover API, no script).
     Props: options (value => ['label' => 'Nederlands', 'href' => '/nl/…', 'flag' => 'flag:nl-4x3', 'code' => 'NL']), value
     (current), show (code|name), compact (round icon-only trigger, the name as a tooltip), ghost, label ('Language'), id,
     flags ('auto': a flag from the language code when an option has none, en -> gb, nl-BE -> be). Flags and the globe are
     inline SVG (<x-oc::webicon>); nl, be, fr, de, gb, it and us are built in. --}}
@props(['options' => [], 'value' => null, 'show' => 'code', 'compact' => false, 'ghost' => false, 'label' => 'Language', 'id' => null, 'flags' => null])
@php($id = $id ?: 'oc-language-menu-'.substr(md5(uniqid('', true)), 0, 6))
@php($value = $value ?? array_key_first($options))
@php($cur = $options[$value] ?? [])
@php($name = $label.': '.($cur['label'] ?? $value))
@php($code = fn ($v, $o) => $o['code'] ?? strtoupper((string) $v))
@php($flagOf = fn ($v, $o) => ($o['flag'] ?? null) ?: ($flags === 'auto' ? \Omniacss\Laravel\Webicons::languageFlag((string) $v) : null))
@php($curFlag = $flagOf($value, $cur))
<button type="button" {{ $attributes->class(['oc-language-select', 'oc-language-select--ghost' => $ghost, 'oc-language-select--icon oc-tooltip oc-tooltip--bottom' => $compact])->merge(array_filter(['aria-label' => $name, 'data-tooltip' => $compact ? $name : null, 'popovertarget' => $id])) }}>
@if ($compact)
    @if ($curFlag)
    <span class="oc-language-flag" aria-hidden="true"><x-oc::webicon :name="$curFlag" bare fallback="iconify" /></span>
    @else
    <span class="oc-language-select-icon" aria-hidden="true"><x-oc::webicon name="mdi:web" bare fallback="iconify" /></span>
    @endif
@else
    @if ($curFlag)
    <span class="oc-language-flag" aria-hidden="true"><x-oc::webicon :name="$curFlag" bare fallback="iconify" /></span>
    @endif
    @if ($show === 'name')
    <span lang="{{ $value }}">{{ $cur['label'] ?? $value }}</span>
    @else
    <span class="oc-language-select-code">{{ $code($value, $cur) }}</span>
    @endif
@endif
</button>
<div class="oc-dropdown-menu oc-language-menu" id="{{ $id }}" popover aria-label="{{ $label }}">
@foreach ($options as $optionValue => $option)
    @php($tag = ! empty($option['href']) ? 'a' : 'button')
    @php($flag = $flagOf($optionValue, $option))
    <{{ $tag }} class="oc-dropdown-item" lang="{{ $optionValue }}" @if ($tag === 'a') href="{{ $option['href'] }}" hreflang="{{ $optionValue }}" @else type="button" value="{{ $optionValue }}" @endif @if ((string) $optionValue === (string) $value) aria-current="true" @endif>
        @if ($flag)<span class="oc-language-flag" aria-hidden="true"><x-oc::webicon :name="$flag" bare fallback="iconify" /></span>@endif
        <span>{{ $option['label'] ?? $optionValue }}</span>
        <span class="oc-language-menu-code" aria-hidden="true">{{ $code($optionValue, $option) }}</span>
    </{{ $tag }}>
@endforeach
</div>
