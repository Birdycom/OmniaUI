{{-- File: resources/views/components/version-banner.blade.php | Map: chip (role=status) -> dot -> long text -> short text -> reload link
     OmniaUI version banner: "new version available - reload". Needs @birdycom/omniaui CSS.
     Props: version (shown in the text), short (text below 40rem), action (link label), tone (warning|info|success),
            floating (fixed bottom end), hidden (start hidden; your script removes it when a new build is found).
     Slot: default = long text (falls back to "New version ({version}) available - reload the page"). --}}
@props(['version' => null, 'short' => 'New version', 'action' => 'Reload', 'tone' => 'warning', 'floating' => false, 'hidden' => false])
<div {{ $attributes->class([
    'oc-version-banner',
    'oc-version-banner--'.$tone => in_array($tone, ['info', 'success'], true),
    'oc-version-banner--floating' => $floating,
])->merge(['role' => 'status']) }} @if ($hidden) hidden @endif>
    <span class="oc-version-banner-dot" aria-hidden="true"></span>
    <span class="oc-version-banner-text">@if (! $slot->isEmpty()){{ $slot }}@else New version{{ $version ? ' ('.$version.')' : '' }} available - reload the page @endif</span>
    <span class="oc-version-banner-short">{{ $short }}</span>
    <a class="oc-version-banner-action" href="">{{ $action }}</a>
</div>
