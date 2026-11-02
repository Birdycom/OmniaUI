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
    <button type="button" class="oc-emoji-picker__trigger" popovertarget="{{ $id }}" aria-label="{{ $triggerLabel }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 12a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8m2 0a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10m-12-3.5c0 .8-.7 1.5-1.5 1.5S7 9.3 7 8.5S7.7 7 8.5 7s1.5.7 1.5 1.5m7 0c0 .8-.7 1.5-1.5 1.5S14 9.3 14 8.5S14.7 7 15.5 7s1.5.7 1.5 1.5m-5 9.73c-1.75 0-3.29-.73-4.19-1.81L9.23 14c.45.72 1.52 1.23 2.77 1.23s2.32-.51 2.77-1.23l1.42 1.42c-.9 1.08-2.44 1.81-4.19 1.81"/></svg></button>
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
