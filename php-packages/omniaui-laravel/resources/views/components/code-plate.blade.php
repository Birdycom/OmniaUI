{{-- File: resources/views/components/code-plate.blade.php | Map: props -> figure.oc-code-plate (slot: the code) -> caption on the plate
     OmniaUI code plate: a QR code or barcode (slot) on its own white plate, with a caption on the plate (also on a photo
     or print). Props: caption, mode (test|live|both: caption colors; both without caption shows the two words), size (sm),
     test / live (the words). --}}
@props(['caption' => null, 'mode' => null, 'size' => 'md', 'test' => 'Test', 'live' => 'Live'])
<figure {{ $attributes->class(['oc-code-plate', 'oc-code-plate--sm' => $size === 'sm'])->merge(array_filter(['data-mode' => $mode])) }}>
    {{ $slot }}
@if ($caption)
    <figcaption class="oc-code-plate__caption">{{ $caption }}</figcaption>
@elseif ($mode === 'both')
    <figcaption class="oc-code-plate__caption"><span>{{ $test }}</span><span>{{ $live }}</span></figcaption>
@endif
</figure>
