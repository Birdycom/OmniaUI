{{-- File: resources/views/components/terminal-log.blade.php | Map: props -> frame -> bar (dots, title, status) -> body (lines + prompt)
     OmniaUI terminal log (always dark). Props: lines (array of ['level' => info|success|warn|error|debug, 'message' => …,
     'time' => ?, 'label' => ?]), title, status ("Live" + pulsing dot), prompt (text, or true for an empty prompt), height, label.
     Slot: extra lines (your own <p class="oc-terminal-log__line …"> markup). --}}
@props(['lines' => [], 'title' => null, 'status' => null, 'prompt' => false, 'height' => null, 'label' => 'Log output'])
<div {{ $attributes->class(['oc-terminal-log'])->merge($height ? ['style' => '--oc-terminal-log-height: '.$height] : []) }}>
    <div class="oc-terminal-log__bar">
        <i></i><i></i><i></i>
        @if ($title)
            <span class="oc-terminal-log__title">{{ $title }}</span>
        @endif
        @if ($status)
            <span class="oc-terminal-log__status">{{ $status }}</span>
        @endif
    </div>
    <div class="oc-terminal-log__body" role="log" aria-live="polite" aria-label="{{ $label }}" tabindex="0">
        @foreach ($lines as $line)
            <p class="oc-terminal-log__line oc-terminal-log__line--{{ $line['level'] }}">
                @if (! empty($line['time']))
                    <time class="oc-terminal-log__time">{{ $line['time'] }}</time>
                @endif
                <span class="oc-terminal-log__level">{{ $line['label'] ?? ($line['level'] === 'success' ? 'ok' : $line['level']) }}</span>
                <span class="oc-terminal-log__msg">{{ $line['message'] }}</span>
            </p>
        @endforeach
        {{ $slot }}
        @if ($prompt !== false && $prompt !== null)
            <p class="oc-terminal-log__prompt">{{ $prompt === true ? '' : $prompt }}</p>
        @endif
    </div>
</div>
