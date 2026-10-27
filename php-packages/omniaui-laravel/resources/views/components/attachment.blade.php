{{-- File: resources/views/components/attachment.blade.php | Map: props -> type / extension -> a[download] or div chip (icon, name, size, remove)
     OmniaUI file chip. Props: name, size (or the error text), type (pdf|doc|sheet|zip|image; from the extension when empty),
     ext (icon text; default the extension, e.g. XLS), href (download link; ignored when removable), image (preview in the icon tile),
     state (uploading|error), progress (0-100), removable, removeLabel. No JavaScript: removing a file is up to your app. --}}
@props(['name' => '', 'size' => null, 'type' => null, 'ext' => null, 'href' => null, 'image' => null, 'state' => null, 'progress' => 0, 'removable' => false, 'removeLabel' => null])
@php
    $extension = str_contains($name, '.') ? strtolower(pathinfo($name, PATHINFO_EXTENSION)) : '';
    $types = ['pdf' => 'pdf', 'doc' => 'doc', 'docx' => 'doc', 'odt' => 'doc', 'rtf' => 'doc', 'txt' => 'doc', 'xls' => 'sheet', 'xlsx' => 'sheet', 'csv' => 'sheet', 'ods' => 'sheet',
        'zip' => 'zip', 'rar' => 'zip', '7z' => 'zip', 'gz' => 'zip', 'jpg' => 'image', 'jpeg' => 'image', 'png' => 'image', 'gif' => 'image', 'webp' => 'image', 'heic' => 'image', 'avif' => 'image'];
    $type ??= $types[$extension] ?? null;
    $ext ??= preg_replace('/^(DOC|XLS|PPT)X$/', '$1', strtoupper($extension));
    $uploading = $state === 'uploading';
    $link = $href && ! $removable;
    $tag = $link ? 'a' : 'div';
    $attrs = $attributes->class(['oc-attachment', 'oc-attachment--'.$type => $type, 'oc-attachment--'.$state => $state]);
    if ($link) {
        $attrs = $attrs->merge(['href' => $href, 'download' => true]);
    }
    if ($uploading) {
        $attrs = $attrs->merge(['style' => '--oc-attachment-progress:'.$progress.'%']);
    }
@endphp
<{{ $tag }} {{ $attrs }}>
    <span class="oc-attachment__icon" aria-hidden="true">@if ($image)<img src="{{ $image }}" alt="">@else{{ $ext }}@endif</span>
    <span class="oc-attachment__body">
        <span class="oc-attachment__name">{{ $name }}</span>
        @if ($uploading)
            <span class="oc-attachment__size" role="status">{{ $size ?? 'Uploading… '.$progress.'%' }}</span>
        @elseif ($size)
            <span class="oc-attachment__size">{{ $size }}</span>
        @endif
    </span>
    @if ($removable)
        <button type="button" class="oc-attachment__remove" aria-label="{{ $removeLabel ?? ($uploading ? 'Cancel upload of '.$name : 'Remove '.$name) }}">&#10005;</button>
    @endif
</{{ $tag }}>
