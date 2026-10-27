{{-- File: resources/views/components/chat-composer.blade.php | Map: props -> form -> label + textarea -> bar (tools slot, hint, send)
     OmniaUI chat composer. Props: action, method (default post), name (field name, default message), id, placeholder, label,
     hint, inline, disabled. Slot: tools (.oc-chat-composer__tool buttons). Add @csrf yourself inside the default slot. --}}
@props(['action' => '#', 'method' => 'post', 'name' => 'message', 'id' => null, 'placeholder' => 'Write a message…', 'label' => 'Message', 'hint' => null, 'inline' => false, 'disabled' => false])
@php($id = $id ?: 'oc-chat-'.substr(md5(uniqid('', true)), 0, 6))
<form {{ $attributes->class(['oc-chat-composer', 'oc-chat-composer--inline' => $inline])->merge(['action' => $action, 'method' => $method]) }}>
    {{ $slot }}
    <label class="oc-visually-hidden" for="{{ $id }}">{{ $label }}</label>
    <textarea class="oc-chat-composer__input" id="{{ $id }}" name="{{ $name }}" rows="1" placeholder="{{ $placeholder }}" required @disabled($disabled)></textarea>
    <div class="oc-chat-composer__bar">
        @if (isset($tools) && trim((string) $tools) !== '')
            <div class="oc-chat-composer__tools">{{ $tools }}</div>
        @endif
        @if ($hint)
            <span class="oc-chat-composer__hint">{{ $hint }}</span>
        @endif
        <button type="submit" class="oc-chat-composer__send" aria-label="Send" @disabled($disabled)>&#10148;</button>
    </div>
</form>
