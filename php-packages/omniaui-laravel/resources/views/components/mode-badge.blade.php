{{-- File: resources/views/components/mode-badge.blade.php | Map: props -> span.oc-mode-badge[data-mode] ("both" as two parts)
     OmniaUI mode badge: test / live at a glance in fixed colors. Props: mode (test|live|both|staging|offline; the last two
     since 0.18.0), size (sm|md|lg), test / live / staging / offline (the words, translate them). Slot: replaces the text. --}}
@props(['mode' => 'test', 'size' => 'md', 'test' => 'Test', 'live' => 'Live', 'staging' => 'Staging', 'offline' => 'Offline'])
<span {{ $attributes->class(['oc-mode-badge', 'oc-mode-badge--'.$size => $size !== 'md'])->merge(['data-mode' => $mode]) }}>
@if (! $slot->isEmpty())
{{ $slot }}
@elseif ($mode === 'both')
<span>{{ $test }}</span><span>{{ $live }}</span>
@else
{{ ['live' => $live, 'staging' => $staging, 'offline' => $offline][$mode] ?? $test }}
@endif
</span>
