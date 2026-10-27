{{-- File: resources/views/components/doc-viewer/media.blade.php | Map: doc -> iframe (pdf) / video / img / placeholder art
     Preview inside <x-oc::doc-viewer>: props doc (one item of its items) and alt (aria-label / alt / iframe title). --}}
@props(['doc' => [], 'alt' => ''])
@if (empty($doc['src']))
    <div @class(['oc-media-art', 'oc-media-art--'.($doc['art'] ?? '') => isset($doc['art'])]) role="img" aria-label="{{ $alt }}"></div>
@elseif (($doc['type'] ?? 'pdf') === 'video')
    <video src="{{ $doc['src'] }}" controls preload="metadata" aria-label="{{ $alt }}"></video>
@elseif (($doc['type'] ?? 'pdf') === 'image')
    <img src="{{ $doc['src'] }}" alt="{{ $alt }}">
@else
    <iframe src="{{ $doc['src'] }}#toolbar=0&view=FitH" title="{{ $alt }}" loading="lazy"></iframe>
@endif
