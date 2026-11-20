{{-- File: resources/views/components/version-banner.blade.php | Map: chip (role=status) -> dot -> long text -> short text -> reload link or button
     OmniaUI version banner: "new version available - reload". Needs @birdycom/omniaui CSS.
     Props: version (shown in the text), short (text below 40rem; empty = none, the long text stays), action (link label),
            href (link of the action; default the current page), button (the action is a <button type="button"> instead of a link),
            action-attributes (extra attributes for the action, e.g. ['wire:click' => 'install'] or ['onclick' => '…']),
            tone (warning|info|success), floating (fixed bottom end), hidden (start hidden; your script removes it when a new build is found).
     Slot: default = long text (falls back to "New version ({version}) available - reload the page"). --}}
@props(['version' => null, 'short' => 'New version', 'action' => 'Reload', 'href' => '', 'button' => false, 'actionAttributes' => [], 'tone' => 'warning', 'floating' => false, 'hidden' => false])
@php($actionAttrs = new \Illuminate\View\ComponentAttributeBag((array) $actionAttributes))
<div {{ $attributes->class([
    'oc-version-banner',
    'oc-version-banner--'.$tone => in_array($tone, ['info', 'success'], true),
    'oc-version-banner--floating' => $floating,
])->merge(['role' => 'status']) }} @if ($hidden) hidden @endif>
    <span class="oc-version-banner-dot" aria-hidden="true"></span>
    <span class="oc-version-banner-text">@if (! $slot->isEmpty()){{ $slot }}@else New version{{ $version ? ' ('.$version.')' : '' }} available - reload the page @endif</span>
    @if (filled($short))
        <span class="oc-version-banner-short">{{ $short }}</span>
    @endif
    @if ($button)
        <button {{ $actionAttrs->class(['oc-version-banner-action'])->merge(['type' => 'button']) }}>{{ $action }}</button>
    @else
        <a {{ $actionAttrs->class(['oc-version-banner-action'])->merge(['href' => (string) $href]) }}>{{ $action }}</a>
    @endif
</div>
