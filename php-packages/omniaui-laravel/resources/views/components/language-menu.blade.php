{{-- File: resources/views/components/language-menu.blade.php | Map: props -> trigger (flag + code or name, or icon only) -> popover menu (flag, native name, code, check)
     OmniaUI language menu: button.oc-language-select opens .oc-dropdown-menu.oc-language-menu (popover API, no script).
     Props: options (value => ['label' => 'Nederlands', 'href' => '/nl/…', 'flag' => 'flag:nl-4x3', 'code' => 'NL']), value
     (current), show (code|name), compact (round icon-only trigger, the name as a tooltip), ghost, label ('Language'), id. --}}
@props(['options' => [], 'value' => null, 'show' => 'code', 'compact' => false, 'ghost' => false, 'label' => 'Language', 'id' => null])
@php($id = $id ?: 'oc-language-menu-'.substr(md5(uniqid('', true)), 0, 6))
@php($value = $value ?? array_key_first($options))
@php($cur = $options[$value] ?? [])
@php($name = $label.': '.($cur['label'] ?? $value))
@php($code = fn ($v, $o) => $o['code'] ?? strtoupper((string) $v))
<button type="button" {{ $attributes->class(['oc-language-select', 'oc-language-select--ghost' => $ghost, 'oc-language-select--icon oc-tooltip oc-tooltip--bottom' => $compact])->merge(array_filter(['aria-label' => $name, 'data-tooltip' => $compact ? $name : null, 'popovertarget' => $id])) }}>
@if ($compact)
    @if (! empty($cur['flag']))
    <span class="oc-language-flag" aria-hidden="true"><iconify-icon icon="{{ $cur['flag'] }}" aria-hidden="true"></iconify-icon></span>
    @else
    <span class="oc-language-select-icon" aria-hidden="true"><iconify-icon icon="mdi:web" aria-hidden="true"></iconify-icon></span>
    @endif
@else
    @if (! empty($cur['flag']))
    <span class="oc-language-flag" aria-hidden="true"><iconify-icon icon="{{ $cur['flag'] }}" aria-hidden="true"></iconify-icon></span>
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
    <{{ $tag }} class="oc-dropdown-item" lang="{{ $optionValue }}" @if ($tag === 'a') href="{{ $option['href'] }}" hreflang="{{ $optionValue }}" @else type="button" value="{{ $optionValue }}" @endif @if ((string) $optionValue === (string) $value) aria-current="true" @endif>
        @if (! empty($option['flag']))<span class="oc-language-flag" aria-hidden="true"><iconify-icon icon="{{ $option['flag'] }}" aria-hidden="true"></iconify-icon></span>@endif
        <span>{{ $option['label'] ?? $optionValue }}</span>
        <span class="oc-language-menu-code" aria-hidden="true">{{ $code($optionValue, $option) }}</span>
    </{{ $tag }}>
@endforeach
</div>
