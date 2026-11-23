{{-- File: resources/views/components/version-badge.blade.php | Map: kind -> span.oc-badge-version | -mdi
     OmniaUI version badge: the small "since v0.17.0" pill next to a title. Props: kind (version = since which version, green;
     mdi = which version of an icon set). Slot: the text. --}}
@props(['kind' => 'version'])
<span {{ $attributes->class([$kind === 'mdi' ? 'oc-badge-version-mdi' : 'oc-badge-version']) }}>{{ $slot }}</span>
