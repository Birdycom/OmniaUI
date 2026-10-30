{{-- File: resources/views/components/titlebar.blade.php | Map: props -> header.oc-titlebar -> __main (icon slot, title, subtitle) -> __actions (slot)
     OmniaUI title bar: drag area of a frameless desktop window; buttons in it stay clickable.
     Props: title, subtitle, bordered, size (sm|md). Slots: icon, default (x-oc::titlebar-button actions).
     Put it with <x-oc::titlebar-body> in a <div class="oc-titlebar-window"> for the hairline on scroll. --}}
@props(['title' => null, 'subtitle' => null, 'bordered' => false, 'size' => 'md'])
<header {{ $attributes->class(['oc-titlebar', 'oc-titlebar--bordered' => $bordered, 'oc-titlebar--sm' => $size === 'sm']) }}>
    <div class="oc-titlebar__main">
        @isset($icon)<span class="oc-titlebar__icon" aria-hidden="true">{{ $icon }}</span>@endisset
        @if ($title)<span class="oc-titlebar__title">{{ $title }}</span>@endif
        @if ($subtitle)<span class="oc-titlebar__subtitle">{{ $subtitle }}</span>@endif
    </div>
    @if (! $slot->isEmpty())
        <div class="oc-titlebar__actions">{{ $slot }}</div>
    @endif
</header>
