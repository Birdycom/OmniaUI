{{-- File: resources/views/components/lightbox.blade.php | Map: props -> thumbnails -> <dialog> (bar, track of slides)
     OmniaUI lightbox on a native <dialog>, no JavaScript needed. Props: id (required), images (array of
     ['src' => ?, 'alt' => …, 'caption' => ?, 'thumb' => ?]; no src = placeholder art), title, label, thumbnails (default true).
     Thumbnails open the dialog with command="show-modal"; prev / next are links to the slide ids. A small script
     (printed once per page) opens at the clicked photo and keeps #slide out of the address. --}}
@props(['id', 'images' => [], 'title' => null, 'label' => 'Photo viewer', 'thumbnails' => true])
@php
    $count = count($images);
    // Slide id with wrap-around, so "previous" of the first photo is the last one.
    $slide = fn ($i) => $id.'-'.((($i % max($count, 1)) + $count) % max($count, 1) + 1);
@endphp
@if ($thumbnails)
    <div class="oc-lightbox-thumbs">
        @foreach ($images as $i => $img)
            <button type="button" class="oc-lightbox-thumb" command="show-modal" commandfor="{{ $id }}" data-oc-lightbox-slide="{{ $slide($i) }}" aria-label="Open photo {{ $i + 1 }}: {{ $img['alt'] }}">
                @if (! empty($img['thumb'] ?? $img['src'] ?? null))
                    <img src="{{ $img['thumb'] ?? $img['src'] }}" alt="{{ $img['alt'] }}">
                @else
                    <span class="oc-media-art"></span>
                @endif
            </button>
        @endforeach
    </div>
@endif
<dialog {{ $attributes->class(['oc-lightbox', 'oc-lightbox--single' => $count === 1])->merge(['id' => $id, 'closedby' => 'any', 'aria-label' => $label]) }}>
    <div class="oc-lightbox__bar">
        @if ($title)
            <h2 class="oc-lightbox__title">{{ $title }}</h2>
        @else
            <span></span>
        @endif
        <button type="button" class="oc-lightbox__close" command="close" commandfor="{{ $id }}" aria-label="Close">&#10005;</button>
    </div>
    <div class="oc-lightbox__track" tabindex="0" autofocus aria-label="Photos, use the arrow keys">
        @foreach ($images as $i => $img)
            <figure class="oc-lightbox__slide" id="{{ $slide($i) }}">
                <div class="oc-lightbox__media">
                    @if (! empty($img['src']))
                        <img src="{{ $img['src'] }}" alt="{{ $img['alt'] }}">
                    @else
                        <div class="oc-media-art" role="img" aria-label="{{ $img['alt'] }}"></div>
                    @endif
                </div>
                @if ($count > 1)
                    <a class="oc-lightbox__nav oc-lightbox__nav--prev" href="#{{ $slide($i - 1) }}" aria-label="Previous photo">&#8592;</a>
                    <a class="oc-lightbox__nav oc-lightbox__nav--next" href="#{{ $slide($i + 1) }}" aria-label="Next photo">&#8594;</a>
                @endif
                <figcaption class="oc-lightbox__caption">
                    @if ($count > 1)
                        <span class="oc-lightbox__counter">{{ $i + 1 }} / {{ $count }}</span>
                    @endif
                    {{ $img['caption'] ?? $img['alt'] }}
                </figcaption>
            </figure>
        @endforeach
    </div>
</dialog>
@once
    <script>
    // Optional, printed once per page: open the viewer at the clicked thumbnail, let prev / next scroll without
    // putting #slide in the address (without JavaScript they are plain links), and remove that hash on close.
    document.addEventListener("command", (e) => {
      const id = e.source?.dataset.ocLightboxSlide;
      if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" }));
    }, true);
    document.addEventListener("click", (e) => {
      const nav = e.target.closest?.("dialog.oc-lightbox a.oc-lightbox__nav");
      const slide = nav && document.getElementById(decodeURIComponent(nav.hash.slice(1)));
      if (!slide) return;
      e.preventDefault();
      slide.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "nearest", inline: "center" });
    });
    document.addEventListener("close", (e) => {
      const slide = e.target.matches?.("dialog.oc-lightbox") && location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (slide && e.target.contains(slide)) history.replaceState(history.state, "", location.pathname + location.search);
    }, true);
    </script>
@endonce
