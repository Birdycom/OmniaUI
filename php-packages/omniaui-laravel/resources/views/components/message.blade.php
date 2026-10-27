{{-- File: resources/views/components/message.blade.php | Map: props -> article (avatar, bubble: sender, quote, text, attachments, meta; actions)
     OmniaUI chat bubble. Props: direction (in|out), sender, avatar (initials), time, datetime, status (sent|read|failed), statusLabel,
     statusIcon (double check), continued (follows the same sender), quote (['href' => ?, 'sender' => …, 'text' => …]), text (one
     escaped paragraph), html (trusted markup), attachments (array: file chips = <x-oc::attachment> props; 'kind' => 'image' | 'thumb'
     for previews), actions (array of ['name' => …, 'label' => …, 'icon' => reply|delete, 'destructive' => ?]), label (aria-label), id.
     Slot: default = text markup. No JavaScript. --}}
@props(['direction' => 'in', 'sender' => null, 'avatar' => null, 'time' => null, 'datetime' => null, 'status' => null, 'statusLabel' => null, 'statusIcon' => false,
    'continued' => false, 'quote' => null, 'text' => null, 'html' => null, 'attachments' => [], 'actions' => [], 'label' => null, 'id' => null])
@php
    $icons = ['reply' => 'M9 14 4 9l5-5M4 9h10a6 6 0 0 1 6 6v4', 'delete' => 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6'];
    // Meta line in one piece, so no whitespace ends up between the time and the status.
    $meta = ($time ? '<time'.($datetime ? ' datetime="'.e($datetime).'"' : '').'>'.e($time).'</time>' : '')
        .($status ? '<span class="oc-message__status'.($status !== 'sent' ? ' oc-message__status--'.e($status) : '').'">'
            .($statusIcon ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12.5 7 17.5 18 6.5M13 16.5l1 1L22.5 9"/></svg>' : '')
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
                <button type="button" @class(['oc-message__action', 'oc-message__action--destructive' => $a['destructive'] ?? false]) aria-label="{{ $a['label'] }}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{{ $icons[$a['icon'] ?? $a['name']] ?? $icons['reply'] }}"/></svg></button>
            @endforeach
        </div>
    @endif
</article>
