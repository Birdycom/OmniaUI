{{-- File: resources/views/components/doc-viewer.blade.php | Map: props + demo items -> grid of cards (bar, frame) -> one <dialog> per card
     OmniaUI doc viewer, no JavaScript: the buttons open the full-screen dialog with command="show-modal" commandfor,
     closedby="any" closes it. Props: id (prefix for dialog ids), items (array of ['label' => …, 'meta' => ?, 'src' => ?,
     'type' => pdf|video|image, 'id' => ?, 'alt' => ?, 'art' => ?, 'download' => ?, 'open' => bar|frame, 'fullscreen' => ?];
     no src = placeholder art), openText, downloadText. Attributes merge onto .oc-doc-viewer-grid. --}}
@props([
    'id' => 'oc-doc-viewer',
    'items' => [
        ['label' => 'Brochure 2026', 'meta' => 'PDF · 2.4 MB', 'alt' => 'First page of Brochure 2026', 'art' => 2, 'download' => '#brochure.pdf'],
        ['label' => 'Site visit', 'meta' => '1:42', 'type' => 'video', 'alt' => 'Video still: site visit', 'art' => 5],
    ],
    'openText' => 'Click for full screen',
    'downloadText' => 'Download',
])
@php
    $docs = [];
    foreach (array_values($items) as $i => $doc) {
        $type = $doc['type'] ?? 'pdf';
        $full = ($doc['fullscreen'] ?? true) !== false;
        $docs[] = $doc + [
            'type' => $type,
            'dialog' => $doc['id'] ?? $id.'-'.($i + 1),
            'full' => $full,
            'frame' => $full && ($doc['open'] ?? ($type === 'video' ? 'frame' : 'bar')) === 'frame',
        ];
    }
@endphp
<div {{ $attributes->class(['oc-doc-viewer-grid']) }}>
    @foreach ($docs as $doc)
        <figure @class(['oc-doc-viewer', 'oc-doc-viewer--video' => $doc['type'] === 'video', 'oc-doc-viewer--image' => $doc['type'] === 'image'])>
            <figcaption class="oc-doc-viewer__bar">
                <span class="oc-doc-viewer__label">{{ $doc['label'] }}</span>
                @if (! empty($doc['meta']))
                    <span class="oc-doc-viewer__meta">{{ $doc['meta'] }}</span>
                @endif
                @if ($doc['full'] && ! $doc['frame'])
                    <button type="button" class="oc-doc-viewer__expand" command="show-modal" commandfor="{{ $doc['dialog'] }}" aria-label="Open {{ $doc['label'] }} full screen">&#10530;</button>
                @endif
            </figcaption>
            <div class="oc-doc-viewer__frame">
                <x-oc::doc-viewer.media :doc="$doc" :alt="$doc['alt'] ?? $doc['label']" />
                @if ($doc['frame'])
                    <button type="button" class="oc-doc-viewer__open" command="show-modal" commandfor="{{ $doc['dialog'] }}">{{ $openText }}</button>
                @endif
            </div>
        </figure>
    @endforeach
</div>
@foreach ($docs as $doc)
    @if ($doc['full'])
        <dialog @class(['oc-doc-viewer-dialog', 'oc-doc-viewer-dialog--video' => $doc['type'] === 'video']) id="{{ $doc['dialog'] }}" closedby="any" aria-labelledby="{{ $doc['dialog'] }}-title">
            <div class="oc-doc-viewer-dialog__bar">
                <h2 class="oc-doc-viewer-dialog__title" id="{{ $doc['dialog'] }}-title">{{ $doc['label'] }}</h2>
                @if (! empty($doc['download']))
                    <div class="oc-doc-viewer-dialog__actions">
                        <a class="oc-btn oc-btn--outline oc-btn--sm" href="{{ $doc['download'] }}" download>{{ $downloadText }}</a>
                        <button type="button" class="oc-doc-viewer-dialog__close" command="close" commandfor="{{ $doc['dialog'] }}" aria-label="Close">&#10005;</button>
                    </div>
                @else
                    <button type="button" class="oc-doc-viewer-dialog__close" command="close" commandfor="{{ $doc['dialog'] }}" aria-label="Close">&#10005;</button>
                @endif
            </div>
            <div class="oc-doc-viewer-dialog__body">
                <x-oc::doc-viewer.media :doc="$doc" :alt="$doc['type'] === 'video' ? $doc['label'].' video' : $doc['label']" />
            </div>
        </dialog>
    @endif
@endforeach
