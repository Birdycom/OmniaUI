{{-- OmniaCSS block: wizard-dialog - Modal wizard: stepper rail on the left, step content and navigation footer. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     Class API: dialog.oc-modal > .oc-modal-content.oc-modal-content--xl > .oc-block-wizard (.oc-block-wizard-rail with ol.oc-stepper, .oc-block-wizard-main with
     .oc-modal-header, .oc-block-wizard-step and .oc-modal-footer).
     Blade: <x-oc::block.wizard-dialog id="setup" :steps="['Company', 'Invoicing', 'Team']" :current="2" trigger="Open setup wizard">
     Props: id, title, description, steps (list of labels), current (1-based), trigger (label of the opening button), label, back, next, closedby.
     Slots: rail (replaces the generated stepper), default (step content), footer (replaces Back/Next). Attributes merge onto the dialog. --}}
@props([
    'id' => 'oc-wizard',
    'title' => null,
    'description' => null,
    'steps' => [],
    'current' => 1,
    'trigger' => null,
    'label' => 'Setup steps',
    'back' => 'Back',
    'next' => 'Next',
    'closedby' => 'closerequest',
])
@if ($trigger)
    <button class="oc-btn" type="button" command="show-modal" commandfor="{{ $id }}">{{ $trigger }}</button>
@endif
<dialog {{ $attributes->class(['oc-modal'])->merge(['id' => $id, 'closedby' => $closedby, 'aria-labelledby' => $id.'-title']) }}>
    <div class="oc-modal-content oc-modal-content--xl">
        <div class="oc-block-wizard">
            <div class="oc-block-wizard-rail">
                @if (isset($rail) && trim((string) $rail) !== '')
                    {{ $rail }}
                @else
                    <ol class="oc-stepper" aria-label="{{ $label }}">
                        @foreach ($steps as $i => $step)
                            @php($state = ($i + 1) < $current ? 'done' : (($i + 1) === (int) $current ? 'active' : 'upcoming'))
                            <li><button @class(['oc-stepper-item', 'oc-stepper-item--done' => $state === 'done', 'oc-stepper-item--active' => $state === 'active']) type="button" @if ($state === 'active') aria-current="step" @endif @if ($state === 'upcoming') disabled @endif><span class="oc-stepper-label">{{ $step }}</span></button></li>
                        @endforeach
                    </ol>
                @endif
            </div>
            <div class="oc-block-wizard-main">
                @if ($title || $description)
                    <div class="oc-modal-header">
                        @if ($title)
                            <h2 class="oc-modal-title" id="{{ $id }}-title">{{ $title }}</h2>
                        @endif
                        @if ($description)
                            <p class="oc-modal-description">{{ $description }}</p>
                        @endif
                    </div>
                @endif
                <div class="oc-block-wizard-step">{{ $slot }}</div>
                <div class="oc-modal-footer">
                    @if (isset($footer) && trim((string) $footer) !== '')
                        {{ $footer }}
                    @else
                        <button class="oc-btn oc-btn--outline" type="button">{{ $back }}</button>
                        <button class="oc-btn" type="button">{{ $next }}</button>
                    @endif
                </div>
            </div>
        </div>
    </div>
</dialog>
