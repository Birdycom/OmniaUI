{{-- File: resources/views/components/carousel/item.blade.php | Map: props -> div.oc-carousel-item (role group, slide; numbered by the carousel)
     OmniaUI carousel slide (0.17.0). Props: id (default a generated one; the fallback dot links to it). Inside
     <x-oc::carousel> the slide gets aria-label "2 of 4" (the data-oc-slide marker is replaced by the carousel). --}}
@props(['id' => null])
@php($id = $id ?: 'oc-slide-'.substr(md5(uniqid('', true)), 0, 8))
<div {{ $attributes->class(['oc-carousel-item'])->merge(['id' => $id, 'role' => 'group', 'aria-roledescription' => 'slide']) }} data-oc-slide>{{ $slot }}</div>
