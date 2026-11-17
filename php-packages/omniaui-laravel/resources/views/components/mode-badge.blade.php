{{-- File: resources/views/components/mode-badge.blade.php | Map: props -> span.oc-mode-badge[data-mode] ("both" as two parts)
     OmniaUI mode badge: test / live at a glance in fixed colors. Props: mode (test|live|both), size (sm|md|lg),
     test / live (the words, translate them). Slot: replaces the text. --}}
@props(['mode' => 'test', 'size' => 'md', 'test' => 'Test', 'live' => 'Live'])
<span {{ $attributes->class(['oc-mode-badge', 'oc-mode-badge--'.$size => $size !== 'md'])->merge(['data-mode' => $mode]) }}>
@if (! $slot->isEmpty())
{{ $slot }}
@elseif ($mode === 'both')
<span>{{ $test }}</span><span>{{ $live }}</span>
@else
{{ $mode === 'live' ? $live : $test }}
@endif
</span>
