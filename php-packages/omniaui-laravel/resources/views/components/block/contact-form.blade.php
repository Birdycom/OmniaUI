{{-- OmniaCSS block: contact-form - Contact form in a panel next to a column of contact cards, with field errors, a busy state and a thank-you result. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API: .oc-block-contact-form > .oc-block-contact-form-layout > .oc-panel.oc-panel--glow (.oc-result | title, intro, .oc-alert, form.oc-form.oc-form--filled)
     + .oc-block-contact-form-cards (.oc-block-contact-card).
     Blade: <x-oc::block.contact-form :action="route('contact.send')" :subjects="['project' => 'A new project', 'support' => 'Support']" :cards="$cards" :sent="session('sent')" />
     Props: action, title, intro, subjects (value => label; empty = no subject field), cards (list of ['title', 'icon' (webicon), 'lines' => [[text, href|null]]]),
     sent (shows the result), submit, note, successTitle, successText, again (label), againHref, errorText.
     Errors and old values come from Laravel ($errors, old()); $errors->first('form') is the message above the form.
     Slots: fields (own fields), note, success (own result). Attributes merge onto the section.
     Script (optional): /js/oc-contact-form.js sends with fetch when the route answers JSON ({ sent } / { sent: false, errors }). --}}
@props([
    'action' => '',
    'title' => 'Send us a message',
    'intro' => null,
    'subjects' => [],
    'cards' => [],
    'sent' => false,
    'submit' => 'Send message',
    'note' => null,
    'successTitle' => 'Thank you, your message was sent',
    'successText' => null,
    'again' => 'Send another message',
    'againHref' => '#contact-form',
    'errorText' => 'Please check the fields in red.',
])
@php
    $errorBag = $errors ?? new \Illuminate\Support\ViewErrorBag;
    $fieldError = fn (string $name) => $errorBag->first($name);
    $invalid = fn (string $name) => $errorBag->has($name) ? 'aria-invalid="true" aria-describedby="err-'.$name.'"' : '';
    $alert = $errorBag->first('form') ?: ($errorBag->any() ? $errorText : '');
@endphp
<section {{ $attributes->merge(['class' => 'oc-block-contact-form', 'aria-label' => 'Contact']) }}>
    <div class="oc-block-contact-form-layout" data-contact-root>
        <div class="oc-panel oc-panel--glow" id="contact-form">
            <div class="oc-result" role="status" tabindex="-1" data-contact-success @if (! $sent) hidden @endif>
                @if (isset($success) && trim((string) $success) !== '')
                    {{ $success }}
                @else
                    <span class="oc-icon-tile oc-icon-tile--sm oc-accent--green" aria-hidden="true"><iconify-icon icon="mdi:check"></iconify-icon></span>
                    <h2 class="oc-result__title">{{ $successTitle }}</h2>
                    @if ($successText)
                        <p class="oc-result__text">{{ $successText }}</p>
                    @endif
                    <div class="oc-result__actions">
                        <a class="oc-btn oc-btn--outline" href="{{ $againHref }}" data-contact-again>{{ $again }}</a>
                    </div>
                @endif
            </div>

            <div data-contact-body @if ($sent) hidden @endif>
                @if ($title)
                    <h2 class="oc-block-contact-form-title">{{ $title }}</h2>
                @endif
                @if ($intro)
                    <p class="oc-block-contact-form-intro">{{ $intro }}</p>
                @endif
                <p class="oc-alert oc-alert--danger" role="alert" data-contact-alert @if ($alert === '') hidden @endif>{{ $alert }}</p>

                <form class="oc-form oc-form--filled" method="post" action="{{ $action }}" novalidate data-contact-form>
                    @csrf
                    <div class="oc-honeypot" aria-hidden="true">
                        <label for="contact-website">Leave this field empty</label>
                        <input type="text" id="contact-website" name="website" tabindex="-1" autocomplete="off">
                    </div>

                    @if (isset($fields) && trim((string) $fields) !== '')
                        {{ $fields }}
                    @else
                        <div class="oc-field-group oc-field-group--row">
                            <div class="oc-field">
                                <label class="oc-field-label" for="contact-name">Name</label>
                                <input class="oc-input" type="text" id="contact-name" name="name" required maxlength="100" autocomplete="name" value="{{ old('name') }}" {!! $invalid('name') !!}>
                                @if ($fieldError('name'))<p class="oc-field-error" id="err-name">{{ $fieldError('name') }}</p>@endif
                            </div>
                            <div class="oc-field">
                                <label class="oc-field-label" for="contact-email">E-mail</label>
                                <input class="oc-input" type="email" id="contact-email" name="email" required maxlength="254" autocomplete="email" value="{{ old('email') }}" {!! $invalid('email') !!}>
                                @if ($fieldError('email'))<p class="oc-field-error" id="err-email">{{ $fieldError('email') }}</p>@endif
                            </div>
                        </div>
                        <div @class(['oc-field-group', 'oc-field-group--row' => count($subjects) > 0])>
                            <div class="oc-field">
                                <label class="oc-field-label" for="contact-phone">Phone <span class="oc-field-label__hint">(optional)</span></label>
                                <input class="oc-input" type="tel" id="contact-phone" name="phone" maxlength="40" autocomplete="tel" inputmode="tel" value="{{ old('phone') }}" {!! $invalid('phone') !!}>
                                @if ($fieldError('phone'))<p class="oc-field-error" id="err-phone">{{ $fieldError('phone') }}</p>@endif
                            </div>
                            @if (count($subjects) > 0)
                                <div class="oc-field">
                                    <label class="oc-field-label" for="contact-subject">What is it about?</label>
                                    <select class="oc-select" id="contact-subject" name="subject" required {!! $invalid('subject') !!}>
                                        <option value="">Choose a subject</option>
                                        @foreach ($subjects as $value => $label)
                                            <option value="{{ $value }}" @selected(old('subject', request('subject')) === (string) $value)>{{ $label }}</option>
                                        @endforeach
                                    </select>
                                    @if ($fieldError('subject'))<p class="oc-field-error" id="err-subject">{{ $fieldError('subject') }}</p>@endif
                                </div>
                            @endif
                        </div>
                        <div class="oc-field">
                            <label class="oc-field-label" for="contact-message">Your message</label>
                            <textarea class="oc-input oc-textarea" id="contact-message" name="message" rows="6" required maxlength="5000" {!! $invalid('message') !!}>{{ old('message') }}</textarea>
                            @if ($fieldError('message'))<p class="oc-field-error" id="err-message">{{ $fieldError('message') }}</p>@endif
                        </div>
                    @endif

                    <div class="oc-form-actions">
                        <button class="oc-btn oc-btn--lg" type="submit" data-contact-submit><span data-contact-label>{{ $submit }}</span></button>
                        @if (isset($note) && trim((string) $note) !== '')
                            <p class="oc-form-note">{{ $note }}</p>
                        @endif
                    </div>
                </form>
            </div>
        </div>

        @if (count($cards) > 0)
            <div class="oc-block-contact-form-cards">
                @foreach ($cards as $card)
                    <article class="oc-block-contact-card">
                        @if (! empty($card['icon']))
                            <span class="oc-icon-tile oc-icon-tile--sm" aria-hidden="true"><iconify-icon icon="{{ $card['icon'] }}"></iconify-icon></span>
                        @endif
                        <h3 class="oc-block-contact-title">{{ $card['title'] }}</h3>
                        @foreach ($card['lines'] ?? [] as [$text, $href])
                            @if ($href)
                                <a class="oc-block-contact-line" href="{{ $href }}">{{ $text }}</a>
                            @else
                                <p class="oc-block-contact-line">{{ $text }}</p>
                            @endif
                        @endforeach
                    </article>
                @endforeach
            </div>
        @endif
    </div>
</section>
