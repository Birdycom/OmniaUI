{{-- File: resources/views/components/section-block.blade.php | Map: props -> section.oc-section | .oc-docs-section -> <x-oc::section-header> -> oc-section-content -> oc-section-footer
     OmniaUI section block: a section card with a header (title, badges, description), the content and an optional footer.
     Props: title, title-as, source, scss, file, version, description, footer-title, footer-description, docs (section.oc-docs-section).
     Slots: default (content, in .oc-section-content), header (extra header content), footer (extra footer content). --}}
@props(['title' => null, 'titleAs' => 'h2', 'source' => null, 'scss' => null, 'file' => null, 'version' => null, 'description' => null, 'footerTitle' => null, 'footerDescription' => null, 'docs' => false])
@php
    $headerSlot = isset($header) && trim((string) $header) !== '' ? $header : null;
    $footerSlot = isset($footer) && trim((string) $footer) !== '' ? $footer : null;
    $hasHeader = $headerSlot || collect([$title, $source, $scss, $file, $version, $description])->filter(fn ($v) => $v !== null && $v !== '')->isNotEmpty();
@endphp
<section {{ $attributes->class([$docs ? 'oc-docs-section' : 'oc-section']) }}>
    @if ($hasHeader)
        <x-oc::section-header :title="$title" :as="$titleAs" :source="$source" :scss="$scss" :file="$file" :version="$version" :description="$description">{{ $headerSlot }}</x-oc::section-header>
    @endif
    @if (trim((string) $slot) !== '')
        <div class="oc-section-content">{{ $slot }}</div>
    @endif
    @if ($footerSlot || $footerTitle || $footerDescription)
        <div class="oc-section-footer">
            @if ($footerTitle)
                <h3 class="oc-section-footer__title">{{ $footerTitle }}</h3>
            @endif
            @if ($footerDescription)
                <p class="oc-section-footer__desc">{{ $footerDescription }}</p>
            @endif
            {{ $footerSlot }}
        </div>
    @endif
</section>
