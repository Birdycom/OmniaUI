{{-- File: resources/views/components/section-header.blade.php | Map: props -> div.oc-section-header (title, source / scss / file / version badges, description) -> slot
     OmniaUI section header: title and badges on one row, the description below. Every part is optional and takes no space when left out.
     Props: title, as (heading tag, default h2), source, scss, file, version, description. Slot: extra content after the description. --}}
@props(['title' => null, 'as' => 'h2', 'source' => null, 'scss' => null, 'file' => null, 'version' => null, 'description' => null])
@php($tag = in_array($as, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div'], true) ? $as : 'h2')
<div {{ $attributes->class(['oc-section-header']) }}>
    @if ($title !== null && $title !== '')
        <{{ $tag }} class="oc-section-header__title">{{ $title }}</{{ $tag }}>
    @endif
    @if ($source)
        <x-oc::badge-source class="oc-section-header__badge-source">{{ $source }}</x-oc::badge-source>
    @endif
    @if ($scss)
        <x-oc::badge-source kind="scss" class="oc-section-header__badge-scss">{{ $scss }}</x-oc::badge-source>
    @endif
    @if ($file)
        <x-oc::badge-source kind="file" class="oc-section-header__badge-file">{{ $file }}</x-oc::badge-source>
    @endif
    @if ($version)
        <x-oc::version-badge class="oc-section-header__badge-version">{{ $version }}</x-oc::version-badge>
    @endif
    @if ($description)
        <p class="oc-section-header__desc">{{ $description }}</p>
    @endif
    {{ $slot }}
</div>
