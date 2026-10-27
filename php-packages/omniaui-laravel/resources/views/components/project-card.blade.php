{{-- File: resources/views/components/project-card.blade.php | Map: props -> a.oc-project-card -> frame (bar + shot) -> body
     OmniaUI project card. Props: href, name, type, meta, more (default "View project"), image, imageAlt, flat.
     Without image the preview is an accent gradient (add class="oc-accent--green" etc.). --}}
@props(['href' => '#', 'name' => null, 'type' => null, 'meta' => null, 'more' => 'View project', 'image' => null, 'imageAlt' => '', 'flat' => false])
<a {{ $attributes->class(['oc-project-card', 'oc-project-card--flat' => $flat])->merge(['href' => $href]) }}>
    <span class="oc-project-card__frame">
        <span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span>
        @if ($image)
            <img class="oc-project-card__shot" src="{{ $image }}" alt="{{ $imageAlt }}" loading="lazy">
        @elseif ($imageAlt)
            <span class="oc-project-card__shot" role="img" aria-label="{{ $imageAlt }}"></span>
        @else
            <span class="oc-project-card__shot" aria-hidden="true"></span>
        @endif
    </span>
    <span class="oc-project-card__body">
        @if ($type)
            <span class="oc-project-card__type">{{ $type }}</span>
        @endif
        <span class="oc-project-card__name">{{ $name ?? $slot }}</span>
        @if ($meta)
            <span class="oc-project-card__meta">{{ $meta }}</span>
        @endif
        @if ($more)
            <span class="oc-project-card__more">{{ $more }}</span>
        @endif
    </span>
</a>
