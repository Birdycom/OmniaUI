{{-- File: resources/views/components/message.blade.php | Map: props -> article (avatar, bubble: sender, quote, text, attachments, meta; actions)
     OmniaUI chat bubble. Props: direction (in|out), sender, avatar (initials), time, datetime, status (sent|read|failed), statusLabel,
     statusIcon (double check), continued (follows the same sender), quote (['href' => ?, 'sender' => …, 'text' => …]), text (one
     escaped paragraph), html (trusted markup), attachments (array: file chips = <x-oc::attachment> props; 'kind' => 'image' | 'thumb'
     for previews), actions (array of ['name' => …, 'label' => …, 'icon' => reply|delete, 'destructive' => ?]), label (aria-label), id.
     Slot: default = text markup. No JavaScript. --}}
@props(['direction' => 'in', 'sender' => null, 'avatar' => null, 'time' => null, 'datetime' => null, 'status' => null, 'statusLabel' => null, 'statusIcon' => false,
    'continued' => false, 'quote' => null, 'text' => null, 'html' => null, 'attachments' => [], 'actions' => [], 'label' => null, 'id' => null])
@php
    $icons = ['reply' => 'M8 9.8v.9l1.7.3c2.6.4 4.5 1.4 5.9 2.7c-1.7-.5-3.5-.8-5.6-.8H8v1.3L5.8 12zM10 5l-7 7l7 7v-4.1c5 0 8.5 1.6 11 5.1c-1-5-4-10-11-11', 'delete' => 'M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z'];
    // Meta line in one piece, so no whitespace ends up between the time and the status.
    $meta = ($time ? '<time'.($datetime ? ' datetime="'.e($datetime).'"' : '').'>'.e($time).'</time>' : '')
        .($status ? '<span class="oc-message__status'.($status !== 'sent' ? ' oc-message__status--'.e($status) : '').'">'
            .($statusIcon ? '<svg data-icon="mdi:check-all" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.41 13.41L6 19l1.41-1.42L1.83 12m20.41-6.42L11.66 16.17L7.5 12l-1.43 1.41L11.66 19l12-12M18 7l-1.41-1.42l-6.35 6.35l1.42 1.41z"/></svg>' : '')
            .e($statusLabel ?? ucfirst($status)).'</span>' : '');
    $thumbsOnly = $attachments && collect($attachments)->every(fn ($a) => ($a['kind'] ?? 'file') === 'thumb');
@endphp
<article {{ $attributes->class(['oc-message', 'oc-message--out' => $direction === 'out', 'oc-message--continued' => $continued])->merge(['id' => $id, 'aria-label' => $label]) }}>
    <span class="oc-avatar oc-message__avatar">{{ $avatar }}</span>
    <div class="oc-message__bubble">
        @if ($sender && ! $continued)
            <p class="oc-message__sender">{{ $sender }}</p>
        @endif
        @if ($quote)
            <a class="oc-message__quote" href="{{ $quote['href'] ?? '' }}"><strong>{{ $quote['sender'] }}</strong><span>{{ $quote['text'] }}</span></a>
        @endif
        @if ($html)
            <div class="oc-message__text">{!! $html !!}</div>
        @elseif ($text || ! $slot->isEmpty())
            <div class="oc-message__text">@if ($text)<p>{{ $text }}</p>@endif{{ $slot }}</div>
        @endif
        @if ($attachments)
            <div class="oc-message__attachments">
                @if ($thumbsOnly)
                    <div class="oc-attachment-list">
                        @foreach ($attachments as $a)
                            <x-oc::attachment.thumb as="span" :src="$a['src'] ?? null" :alt="$a['alt'] ?? ''" :art="$a['art'] ?? null" />
                        @endforeach
                    </div>
                @else
                    @foreach ($attachments as $a)
                        @if (($a['kind'] ?? 'file') === 'image')
                            <x-oc::attachment.image :href="$a['href'] ?? null" :src="$a['src'] ?? null" :alt="$a['alt'] ?? ''" :art="$a['art'] ?? null" :caption="$a['caption'] ?? null" />
                        @elseif (($a['kind'] ?? 'file') === 'thumb')
                            <x-oc::attachment.thumb as="span" :src="$a['src'] ?? null" :alt="$a['alt'] ?? ''" :art="$a['art'] ?? null" />
                        @else
                            <x-oc::attachment :name="$a['name']" :size="$a['size'] ?? null" :type="$a['type'] ?? null" :ext="$a['ext'] ?? null" :href="$a['href'] ?? null" :image="$a['image'] ?? null" :state="$a['state'] ?? null" :progress="$a['progress'] ?? 0" :removable="$a['removable'] ?? false" :remove-label="$a['removeLabel'] ?? null" />
                        @endif
                    @endforeach
                @endif
            </div>
        @endif
        @if ($time || $status)
            <p class="oc-message__meta">{!! $meta !!}</p>
        @endif
    </div>
    @if ($actions)
        <div class="oc-message__actions">
            @foreach ($actions as $a)
                <button type="button" @class(['oc-message__action', 'oc-message__action--destructive' => $a['destructive'] ?? false]) aria-label="{{ $a['label'] }}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="{{ $icons[$a['icon'] ?? $a['name']] ?? $icons['reply'] }}"/></svg></button>
            @endforeach
        </div>
    @endif
</article>
