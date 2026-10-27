{{-- File: resources/views/components/emoji-picker.blade.php | Map: props + default groups -> trigger button -> popover panel -> groups (label + grid)
     OmniaUI emoji picker on the popover attribute. Props: id, target (selector of a field, for the optional insert script
     from snippets/emoji-picker.html), groups (['Label' => ['😀', …]]), inline (always visible), triggerLabel, label. --}}
@props(['id' => null, 'target' => null, 'groups' => null, 'inline' => false, 'triggerLabel' => 'Insert emoji', 'label' => 'Emoji'])
@php
    $id = $id ?: 'oc-emoji-'.substr(md5(uniqid('', true)), 0, 6);
    $groups = $groups ?? [
        'Smileys' => ['😀', '😃', '😄', '😁', '😂', '🙂', '😉', '😍', '🤔', '😎', '😢', '😴', '😯', '🥳', '😤', '🤗'],
        'Gestures' => ['👍', '👎', '👏', '🙌', '👋', '🙏', '✌️', '💪'],
        'Objects' => ['❤️', '⭐', '🔥', '🎉', '✅', '🚀', '💡', '☕'],
    ];
@endphp
@unless ($inline)
    <button type="button" class="oc-emoji-picker__trigger" popovertarget="{{ $id }}" aria-label="{{ $triggerLabel }}">🙂</button>
@endunless
<div {{ $attributes->class(['oc-emoji-picker', 'oc-emoji-picker--inline' => $inline])->merge(array_filter([
    'id' => $id,
    'aria-label' => $label,
    'role' => $inline ? 'group' : null,
    'data-oc-emoji-target' => $target,
])) }} @unless ($inline) popover @endunless>
    @foreach ($groups as $groupLabel => $emojis)
        @if (is_string($groupLabel))
            <p class="oc-emoji-picker__label">{{ $groupLabel }}</p>
        @endif
        <div class="oc-emoji-picker__grid">
            @foreach ($emojis as $emoji)
                <button type="button" class="oc-emoji-picker__item">{{ $emoji }}</button>
            @endforeach
        </div>
    @endforeach
</div>
