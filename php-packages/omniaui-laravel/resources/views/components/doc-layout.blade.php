{{-- OmniaUI document layout: a side column (slot "aside", e.g. a table of contents) next to the text (slot).
     Props: end (side column on the right on a wide screen). --}}
@props(['end' => false])
<div {{ $attributes->class(['oc-doc-layout', 'oc-doc-layout--end' => $end]) }}>
    @isset($aside)
        <aside class="oc-doc-layout__aside">{{ $aside }}</aside>
    @endisset
    <div class="oc-doc-layout__main">{{ $slot }}</div>
</div>
