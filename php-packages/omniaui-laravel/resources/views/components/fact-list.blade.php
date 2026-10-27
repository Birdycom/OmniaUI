{{-- File: resources/views/components/fact-list.blade.php | Map: props -> dl.oc-fact-list -> rows -> default slot
     OmniaUI fact list (variant of the definition list). Props: items (label => value), plain, compact, stacked, accent.
     Slot: default = extra <div><dt>…</dt><dd>…</dd></div> rows. --}}
@props(['items' => [], 'plain' => false, 'compact' => false, 'stacked' => false, 'accent' => false])
<dl {{ $attributes->class([
    'oc-fact-list',
    'oc-fact-list--plain' => $plain,
    'oc-fact-list--compact' => $compact,
    'oc-fact-list--stacked' => $stacked,
    'oc-fact-list--accent' => $accent,
]) }}>
    @foreach ($items as $label => $value)
        <div><dt>{{ $label }}</dt><dd>{{ $value }}</dd></div>
    @endforeach
    {{ $slot }}
</dl>
