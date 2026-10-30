{{-- File: resources/views/components/titlebar-body.blade.php | Map: div.oc-titlebar-body -> slot
     OmniaUI title bar body: the part of the window that scrolls; the title bar gets its hairline once it does. --}}
<div {{ $attributes->class(['oc-titlebar-body']) }}>{{ $slot }}</div>
