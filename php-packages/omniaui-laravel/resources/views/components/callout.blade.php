{{-- OmniaUI callout: a text on the left (slot) and an action on the right (slot "action"). --}}
<div {{ $attributes->class(['oc-callout']) }}>
    <div class="oc-callout__text">{{ $slot }}</div>
    @isset($action)
        <div class="oc-callout__action">{{ $action }}</div>
    @endisset
</div>
