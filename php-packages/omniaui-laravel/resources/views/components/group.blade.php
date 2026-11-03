{{-- OmniaUI group (a section in a panel). Props: title, aside (status on the right), tone (busy|ok|warn|error), meta,
     level (2-4, default 2). Slot = the content. --}}
@props(['title' => '', 'aside' => null, 'tone' => null, 'meta' => null, 'level' => 2])
<section {{ $attributes->class(['oc-group']) }}>
    <header class="oc-group__head">
        <h{{ $level }} class="oc-group__title">{{ $title }}</h{{ $level }}>
        @if ($aside)
            <span class="oc-group__aside" @if($tone) data-tone="{{ $tone }}" @endif>{{ $aside }}</span>
        @endif
    </header>
    @if ($meta)
        <p class="oc-group__meta">{{ $meta }}</p>
    @endif
    {{ $slot }}
</section>
