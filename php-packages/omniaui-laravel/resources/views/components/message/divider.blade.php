{{-- File: resources/views/components/message/divider.blade.php | Map: props -> .oc-message-divider > span
     Date divider in a message list. Props: system (centred notice without lines, role="note"). Slot: the text. --}}
@props(['system' => false])
<div {{ $attributes->class(['oc-message-divider', 'oc-message-divider--system' => $system]) }}{!! $system ? ' role="note"' : '' !!}><span>{{ $slot }}</span></div>
