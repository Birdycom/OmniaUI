{{-- File: resources/views/components/message/list.blade.php | Map: props + demo conversation -> .oc-message-list -> dividers and <x-oc::message> rows
     Column of messages and dividers. Props: items (array: <x-oc::message> props, or ['divider' => …, 'system' => ?]; demo
     conversation when empty), log (role="log", default true), label. Slot: default replaces the items. --}}
@props([
    'items' => [
        ['divider' => 'Tuesday 14 October'],
        ['sender' => 'Lisa Verbeke', 'avatar' => 'LV', 'time' => '09:12', 'datetime' => '2026-10-14T09:12', 'label' => 'Lisa Verbeke, 09:12', 'text' => 'Morning Tom! The worktop supplier sent two samples for Villa Dewitte.'],
        ['sender' => 'Lisa Verbeke', 'avatar' => 'LV', 'time' => '09:13', 'datetime' => '2026-10-14T09:13', 'label' => 'Lisa Verbeke, 09:13', 'continued' => true, 'id' => 'oc-message-demo-question',
            'html' => '<p>Which finish should we order?</p><ul><li><strong>Calacatta</strong> matt, 20 mm</li><li><strong>Nero Marquina</strong> polished, 12 mm</li></ul><p>Details are on the <a href="#supplier-sheet">supplier sheet</a>.</p>'],
        ['direction' => 'out', 'avatar' => 'TP', 'time' => '09:20', 'datetime' => '2026-10-14T09:20', 'label' => 'You, 09:20', 'status' => 'read', 'statusIcon' => true,
            'quote' => ['href' => '#oc-message-demo-question', 'sender' => 'Lisa Verbeke', 'text' => 'Which finish should we order? Calacatta matt, 20 mm or Nero Marquina polished, 12 mm'],
            'text' => 'Calacatta matt. The client wants the lighter look next to the oak fronts.',
            'actions' => [['name' => 'reply', 'label' => 'Reply to this message'], ['name' => 'delete', 'label' => 'Delete this message', 'destructive' => true]]],
        ['divider' => 'Lisa Verbeke marked this question as answered', 'system' => true],
    ],
    'log' => true,
    'label' => 'Conversation with Lisa Verbeke',
])
<div {{ $attributes->class(['oc-message-list']) }}{!! $log ? ' role="log" aria-label="'.e($label).'"' : '' !!}>
    @if ($slot->isEmpty())
        @foreach ($items as $m)
            @if (isset($m['divider']))
                <x-oc::message.divider :system="$m['system'] ?? false">{{ $m['divider'] }}</x-oc::message.divider>
            @else
                <x-oc::message :direction="$m['direction'] ?? 'in'" :sender="$m['sender'] ?? null" :avatar="$m['avatar'] ?? null" :time="$m['time'] ?? null" :datetime="$m['datetime'] ?? null"
                    :status="$m['status'] ?? null" :status-label="$m['statusLabel'] ?? null" :status-icon="$m['statusIcon'] ?? false" :continued="$m['continued'] ?? false" :quote="$m['quote'] ?? null"
                    :text="$m['text'] ?? null" :html="$m['html'] ?? null" :attachments="$m['attachments'] ?? []" :actions="$m['actions'] ?? []" :label="$m['label'] ?? null" :id="$m['id'] ?? null" />
            @endif
        @endforeach
    @else
        {{ $slot }}
    @endif
</div>
