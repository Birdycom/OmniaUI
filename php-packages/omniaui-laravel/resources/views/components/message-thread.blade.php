{{-- File: resources/views/components/message-thread.blade.php | Map: props + demo -> section (header: back slot, heading, people, badge, menu)
     -> scroll (<x-oc::message.list>) -> footer (composer slot / form / note) -> busy overlay -> one-time script
     OmniaUI message thread. Props: id (required), title, project (bold part of the meta line), meta, participants (array of
     ['initials' => …, 'name' => ?]), status (['label' => …, 'variant' => ?]; empty array hides it), menu (array of ['label' => …,
     'destructive' => ?] or ['separator' => true]; empty array hides it), messages (items of <x-oc::message.list>), scrollLabel, live,
     busy, busyTitle (empty = no overlay), busyText, note (text instead of a composer), action, method (post adds @csrf), placeholder,
     composerLabel, inline, tools (attach, emoji), hint, plain. Slots: default (replaces the messages), back, composer.
     The script appends a typed message as an outgoing bubble and sends with Ctrl/Cmd + Enter (skipped when the submit event was
     already handled with preventDefault, and inside the chat-inbox block, which has its own script). --}}
@props([
    'id', 'title' => 'Kitchen worktop: which finish?', 'project' => 'Project 1', 'meta' => 'Customer 1 → Customer 6 · 14 Oct 2026',
    'participants' => [['initials' => 'C1', 'name' => 'Customer 1'], ['initials' => 'C6', 'name' => 'Customer 6']],
    'status' => ['label' => 'Urgent', 'variant' => 'destructive'],
    'menu' => [['label' => 'Mark as unread'], ['label' => 'Move to archive'], ['separator' => true], ['label' => 'Delete conversation', 'destructive' => true]],
    'messages' => [
        ['divider' => 'Tuesday 14 October'],
        ['sender' => 'Customer 1', 'avatar' => 'C1', 'time' => '09:12', 'datetime' => '2026-10-14T09:12', 'text' => 'The supplier dropped off two worktop samples at the workshop. Photo attached.',
            'attachments' => [['kind' => 'image', 'href' => '#samples.jpg', 'alt' => 'Two worktop samples on the workbench', 'art' => 6, 'caption' => 'samples.jpg · 2.1 MB']]],
        ['sender' => 'Customer 1', 'avatar' => 'C1', 'time' => '09:13', 'datetime' => '2026-10-14T09:13', 'continued' => true,
            'html' => '<p>Which one should we order: <strong>Calacatta matt</strong> or <strong>Nero Marquina polished</strong>? The cutting slot is Friday.</p>'],
        ['direction' => 'out', 'avatar' => 'C6', 'time' => '09:20', 'datetime' => '2026-10-14T09:20', 'status' => 'read', 'text' => "Calacatta matt, 20 mm. I'll send the updated quote to the client today.",
            'attachments' => [['name' => 'Quote kitchen Project 1 v2.pdf', 'size' => '1.2 MB', 'href' => '#quote.pdf']], 'actions' => [['name' => 'delete', 'label' => 'Delete this message', 'destructive' => true]]],
        ['divider' => 'Today'],
        ['sender' => 'Customer 1', 'avatar' => 'C1', 'time' => '10:02', 'datetime' => '2026-10-24T10:02', 'text' => 'Client signed. Can you confirm the edge profile before 16:00?'],
    ],
    'scrollLabel' => 'Messages', 'live' => true, 'busy' => false, 'busyTitle' => 'Sending message…', 'busyText' => 'Please wait, do not close this conversation.',
    'note' => null, 'action' => '#', 'method' => null, 'placeholder' => 'Type your reply…', 'composerLabel' => 'Reply', 'inline' => false,
    'tools' => ['attach', 'emoji'], 'hint' => 'Ctrl + Enter to send', 'plain' => false,
])
<section {{ $attributes->class(['oc-message-thread', 'oc-message-thread--plain' => $plain])->merge(['aria-labelledby' => $id.'-title', 'aria-busy' => $busy ? 'true' : null]) }}>
    <header class="oc-message-thread__header">
        {{ $back ?? '' }}
        <div class="oc-message-thread__heading">
            <h3 class="oc-message-thread__title" id="{{ $id }}-title">{{ $title }}</h3>
            @if ($project || $meta)
                <p class="oc-message-thread__meta">@if ($project)<strong>{{ $project }}</strong>@endif{{ $project && $meta ? ' · ' : '' }}{{ $meta }}</p>
            @endif
        </div>
        @if ($participants)
            <div class="oc-avatar-group oc-message-thread__people" aria-label="{{ count($participants) }} participants">@foreach ($participants as $p)<span class="oc-avatar"{!! empty($p['name']) ? '' : ' title="'.e($p['name']).'"' !!}>{{ $p['initials'] }}</span>@endforeach</div>
        @endif
        @if ($status || $menu)
            <div class="oc-message-thread__actions">
                @if ($status)
                    <span @class(['oc-badge', 'oc-badge--'.($status['variant'] ?? '') => ! empty($status['variant'])])>{{ $status['label'] }}</span>
                @endif
                @if ($menu)
                    <button type="button" class="oc-message-thread__icon-btn" popovertarget="{{ $id }}-menu" aria-label="Conversation actions"><svg data-icon="mdi:dots-vertical" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"/></svg></button>
                    <div class="oc-dropdown-menu" id="{{ $id }}-menu" popover role="menu">
                        @foreach ($menu as $m)
                            @if (! empty($m['separator']))
                                <div class="oc-dropdown-separator" role="separator"></div>
                            @else
                                <button type="button" @class(['oc-dropdown-item', 'oc-dropdown-item--destructive' => $m['destructive'] ?? false]) role="menuitem">{{ $m['label'] }}</button>
                            @endif
                        @endforeach
                    </div>
                @endif
            </div>
        @endif
    </header>
    <div class="oc-message-thread__scroll" tabindex="0" role="log" aria-label="{{ $scrollLabel }}"{!! $live ? ' aria-live="polite"' : '' !!}>
        @if ($slot->isEmpty())
            <x-oc::message.list :items="$messages" :log="false" />
        @else
            <div class="oc-message-list">{{ $slot }}</div>
        @endif
    </div>
    <div class="oc-message-thread__footer">
        @if ($note)
            <p class="oc-message-thread__note">{{ $note }}</p>
        @elseif (isset($composer) && trim((string) $composer) !== '')
            {{ $composer }}
        @else
            <form @class(['oc-chat-composer', 'oc-chat-composer--inline' => $inline]) action="{{ $action }}"{!! $method ? ' method="'.e($method).'"' : '' !!} aria-label="{{ $composerLabel }}">
                @if ($method && strtolower($method) !== 'get')
                    @csrf
                @endif
                <label class="oc-visually-hidden" for="{{ $id }}-input">Message</label>
                <textarea class="oc-chat-composer__input" id="{{ $id }}-input" name="message" rows="1" placeholder="{{ $placeholder }}" required></textarea>
                <div class="oc-chat-composer__bar">
                    @if ($tools)
                        <div class="oc-chat-composer__tools">
                            @if (in_array('attach', $tools, true))
                                <button type="button" class="oc-chat-composer__tool" aria-label="Attach a file"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 6v11.5a4 4 0 0 1-4 4a4 4 0 0 1-4-4V5a2.5 2.5 0 0 1 2.5-2.5A2.5 2.5 0 0 1 13.5 5v10.5a1 1 0 0 1-1 1a1 1 0 0 1-1-1V6H10v9.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5V5a4 4 0 0 0-4-4a4 4 0 0 0-4 4v12.5a5.5 5.5 0 0 0 5.5 5.5a5.5 5.5 0 0 0 5.5-5.5V6z"/></svg></button>
                            @endif
                            @if (in_array('emoji', $tools, true))
                                <button type="button" class="oc-chat-composer__tool" aria-label="Insert emoji"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 12a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8a8 8 0 0 0 8-8m2 0a10 10 0 0 1-10 10A10 10 0 0 1 2 12A10 10 0 0 1 12 2a10 10 0 0 1 10 10m-12-3.5c0 .8-.7 1.5-1.5 1.5S7 9.3 7 8.5S7.7 7 8.5 7s1.5.7 1.5 1.5m7 0c0 .8-.7 1.5-1.5 1.5S14 9.3 14 8.5S14.7 7 15.5 7s1.5.7 1.5 1.5m-5 9.73c-1.75 0-3.29-.73-4.19-1.81L9.23 14c.45.72 1.52 1.23 2.77 1.23s2.32-.51 2.77-1.23l1.42 1.42c-.9 1.08-2.44 1.81-4.19 1.81"/></svg></button>
                            @endif
                        </div>
                    @endif
                    @if ($hint)
                        <span class="oc-chat-composer__hint">{{ $hint }}</span>
                    @endif
                    <button type="submit" class="oc-chat-composer__send" aria-label="Send"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2 21l21-9L2 3v7l15 2l-15 2z"/></svg></button>
                </div>
            </form>
        @endif
    </div>
    @if ($busyTitle)
        <div class="oc-message-thread__busy" role="status">
            <span class="oc-spinner oc-spinner--lg" aria-hidden="true"></span>
            <strong>{{ $busyTitle }}</strong>
            @if ($busyText)
                <span>{{ $busyText }}</span>
            @endif
        </div>
    @endif
</section>
@once
    <script>
        // Optional: append the typed message as an outgoing bubble (demo behaviour; an app posts the form instead).
        document.addEventListener("submit", (e) => {
            const form = e.target.closest(".oc-message-thread form.oc-chat-composer");
            if (!form || e.defaultPrevented || form.closest(".oc-block-chat-inbox")) return;
            e.preventDefault();
            const thread = form.closest(".oc-message-thread"), field = form.querySelector("textarea"), text = field.value.trim();
            if (!text) return;
            thread.setAttribute("aria-busy", "true");
            setTimeout(() => {
                const list = thread.querySelector(".oc-message-list"), last = list.lastElementChild;
                const msg = document.createElement("article");
                msg.className = "oc-message oc-message--out" + (last?.matches(".oc-message--out") ? " oc-message--continued" : "");
                msg.innerHTML = '<span class="oc-avatar oc-message__avatar"></span><div class="oc-message__bubble"><div class="oc-message__text"><p></p></div><p class="oc-message__meta"><time></time><span class="oc-message__status">Sent</span></p></div>';
                msg.querySelector(".oc-avatar").textContent = list.querySelector(".oc-message--out .oc-avatar")?.textContent || "Me";
                msg.querySelector("p").textContent = text;
                msg.querySelector("time").textContent = new Date().toTimeString().slice(0, 5);
                list.append(msg);
                field.value = "";
                thread.removeAttribute("aria-busy");
                field.focus();
            }, 600);
        });
        document.addEventListener("keydown", (e) => {
            if (e.defaultPrevented || e.key !== "Enter" || !(e.ctrlKey || e.metaKey) || !e.target.matches(".oc-message-thread .oc-chat-composer__input")) return;
            e.preventDefault();
            e.target.form.requestSubmit();
        });
    </script>
@endonce
