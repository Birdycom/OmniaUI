{{-- OmniaCSS sidebar. Props: label, collapsed (icon only), right, floating, dark (stays dark in the light theme). Slots: default = content (use <x-oc::sidebar.group> / <x-oc::sidebar.item>), header, footer. --}}
@props(['label' => 'Main navigation', 'collapsed' => false, 'right' => false, 'floating' => false, 'dark' => false])
<aside {{ $attributes->class(['oc-sidebar', 'oc-sidebar--collapsed' => $collapsed, 'oc-sidebar--right' => $right, 'oc-sidebar--floating' => $floating, 'oc-sidebar--dark' => $dark])->merge(['aria-label' => $label]) }}>
    @if (isset($header) && trim((string) $header) !== '')
        <div class="oc-sidebar-header">{{ $header }}</div>
    @endif
    <div class="oc-sidebar-content">{{ $slot }}</div>
    @if (isset($footer) && trim((string) $footer) !== '')
        <div class="oc-sidebar-footer">{{ $footer }}</div>
    @endif
</aside>
