{{-- OmniaUI block: step-view - One step of a route or course as the visitor sees it: picture with badges, title, place, text, task, the content blocks (tip, note, link, countdown) and a question. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/step-view.html | Map: top row -> picture + badges -> title, place, text -> task -> blocks (tip, note, link, countdown) -> question (kicker, text, answers, send, hint)
     Class API (modifiers are extra classes / attributes on the same element):
       .oc-block-step-view: Frame (container query: answers in two columns from 34rem)
       .oc-block-step-view-top: Back button and the distance
       figure.oc-block-step-view-picture: img or svg; modifier --empty + data-number: a flat surface with the step number. -badges: solid badges on top
       .oc-block-step-view-title / -place / -text: Heading, place line (icon + text) and the text of the step
       .oc-block-step-view-task: What to do here (accent bar)
       .oc-block-step-view-blocks: The content blocks, built from free components: details.oc-collapsible (tip), .oc-alert (note), .oc-btn (link) and
       .oc-block-step-view-countdown: -countdown-label + -countdown-time; --oc-step-view-left = width of the bar; modifiers --low, --done
       .oc-block-step-view-question: -kicker, -ask, fieldset.oc-block-step-view-answers (.oc-radio-item--card, equal heights), -send, -hint
     No JavaScript: your app runs the countdown (time text + --oc-step-view-left) and sends the answer.
     Blade: <x-oc::block.step-view> - attributes merge onto the root element. Written by hand (0.17.0), prop names as in the React block.
     Props and slots (a slot wins over its prop; left out = the snippet content; false = left out of the block):
       back, distance (top row; both false: no top row), picture (img or svg), number (without picture: a flat surface with
       this number), badges, title, place, task, blocks, question, title-id ('oc-stepview-title').
       question as an array: kicker, text, options (list of strings), value (index of the checked answer), name, sendLabel, hint,
       result ['picked' => i, 'correct' => i] (locks the answers and marks them), feedback (shown in place of the send button once
       there is a result), resultLabels ['correct' => .., 'wrong' => ..], inputAttributes (on every radio, e.g. wire:model),
       sendAttributes (on the send button, e.g. wire:click). Default slot: the text of the step.
--}}
@props([
    'title' => null, 'blocks' => null, 'question' => null, 'back' => null, 'distance' => null, 'picture' => null, 'number' => null,
    'badges' => null, 'place' => null, 'task' => null, 'titleId' => 'oc-stepview-title',
])
@php
    $filled = fn ($v) => $v !== null && $v !== false && trim((string) $v) !== '';
    $bag = fn ($a) => new \Illuminate\View\ComponentAttributeBag(is_array($a) ? $a : []);
@endphp
<article {{ $attributes->merge(['class' => 'oc-block-step-view', 'aria-labelledby' => $titleId]) }}>
  @if ($back === false && $distance === false)
  @elseif ($back !== null || $distance !== null)
  <div class="oc-block-step-view-top">
    @if ($filled($back)){{ $back }}@elseif ($back === false)<span></span>@else<button class="oc-btn oc-btn--ghost oc-btn--sm" type="button"><iconify-icon icon="mdi:arrow-left" aria-hidden="true"></iconify-icon> All steps</button>@endif
    @if ($filled($distance)){{ $distance }}@elseif ($distance !== false)<span class="oc-badge oc-badge--outline">12 m away</span>@endif
  </div>
  @else
  <div class="oc-block-step-view-top">
    <button class="oc-btn oc-btn--ghost oc-btn--sm" type="button"><iconify-icon icon="mdi:arrow-left" aria-hidden="true"></iconify-icon> All steps</button>
    <span class="oc-badge oc-badge--outline">12 m away</span>
  </div>
  @endif
  @if ($picture === false && $number === null)
  @elseif ($filled($picture) || ($picture === null && $number !== null) || $badges !== null)
  <figure @class(['oc-block-step-view-picture', 'oc-block-step-view-picture--empty' => ! $filled($picture) && $number !== null]) @if (! $filled($picture) && $number !== null) data-number="{{ $number }}" @endif>
    @if ($filled($picture)){{ $picture }}@elseif ($number === null)<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Town hall seen from the square"><rect width="320" height="180" class="oc-block-art-sky"/><circle cx="262" cy="42" r="18" class="oc-block-art-sun"/><rect x="92" y="62" width="136" height="96" class="oc-block-art-wall"/><path d="M84 66 160 24l76 42z" class="oc-block-art-roof"/><rect x="150" y="34" width="20" height="30" class="oc-block-art-roof"/><rect x="110" y="84" width="18" height="24" class="oc-block-art-sky"/><rect x="151" y="84" width="18" height="24" class="oc-block-art-sky"/><rect x="192" y="84" width="18" height="24" class="oc-block-art-sky"/><rect x="146" y="120" width="28" height="38" class="oc-block-art-roof"/><rect y="158" width="320" height="22" class="oc-block-art-land"/></svg>@endif
    @if ($filled($badges))<figcaption class="oc-block-step-view-badges">{{ $badges }}</figcaption>@elseif ($badges !== false)<figcaption class="oc-block-step-view-badges"><span class="oc-badge oc-badge--info">Step 3</span><span class="oc-badge oc-badge--outline">20 points</span></figcaption>@endif
  </figure>
  @else
  <figure class="oc-block-step-view-picture">
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Town hall seen from the square"><rect width="320" height="180" class="oc-block-art-sky"/><circle cx="262" cy="42" r="18" class="oc-block-art-sun"/><rect x="92" y="62" width="136" height="96" class="oc-block-art-wall"/><path d="M84 66 160 24l76 42z" class="oc-block-art-roof"/><rect x="150" y="34" width="20" height="30" class="oc-block-art-roof"/><rect x="110" y="84" width="18" height="24" class="oc-block-art-sky"/><rect x="151" y="84" width="18" height="24" class="oc-block-art-sky"/><rect x="192" y="84" width="18" height="24" class="oc-block-art-sky"/><rect x="146" y="120" width="28" height="38" class="oc-block-art-roof"/><rect y="158" width="320" height="22" class="oc-block-art-land"/></svg>
    <figcaption class="oc-block-step-view-badges"><span class="oc-badge oc-badge--info">Step 3</span><span class="oc-badge oc-badge--outline">20 points</span></figcaption>
  </figure>
  @endif
  <h2 class="oc-block-step-view-title" id="{{ $titleId }}">
      @if (isset($title) && trim((string) $title) !== '')
          {{ $title }}
      @else
      Town hall
      @endif
  </h2>
  @if ($place !== false)
  <p class="oc-block-step-view-place"><iconify-icon icon="mdi:map-marker-outline" aria-hidden="true"></iconify-icon> {{ $filled($place) ? $place : 'Market street 1' }}</p>
  @endif
  <div class="oc-block-step-view-text">
      @if (! $slot->isEmpty())
          {{ $slot }}
      @else
      <p>The town hall stands on the north side of the square. Look at the stone above the main door.</p>
      @endif
  </div>
  @if ($task !== false)
  <p class="oc-block-step-view-task"><iconify-icon icon="mdi:target" aria-hidden="true"></iconify-icon> {{ $filled($task) ? $task : 'Find the year carved above the door.' }}</p>
  @endif
  @if ($blocks !== false)
  <div class="oc-block-step-view-blocks">
      @if (isset($blocks) && trim((string) $blocks) !== '')
          {{ $blocks }}
      @else
    <details class="oc-collapsible oc-collapsible--dense">
      <summary><span class="oc-collapsible-title">Tip</span></summary>
      <div class="oc-collapsible-content">The year is written in Roman numerals.</div>
    </details>
    <div class="oc-alert oc-alert--warning" role="note"><p class="oc-alert-description">Mind the traffic when you cross to the door.</p></div>
    <a class="oc-btn oc-btn--outline" href="https://example.com/town-hall" target="_blank" rel="noopener noreferrer">More about the town hall <iconify-icon icon="mdi:open-in-new" aria-hidden="true"></iconify-icon></a>
    <div class="oc-block-step-view-countdown" role="timer" aria-label="Time left" style="--oc-step-view-left: 62%"><span class="oc-block-step-view-countdown-label">Time left</span><b class="oc-block-step-view-countdown-time">0:56</b></div>
      @endif
  </div>
  @endif
  @if ($question === false)
  @elseif (is_array($question))
  @php
      $result = $question['result'] ?? null;
      $askId = $titleId.'-ask';
      $group = $question['name'] ?? $titleId.'-answer';
      $mark = function (int $i) use ($result) {
          if (! is_array($result)) {
              return null;
          }

          return $i === (int) $result['correct'] ? 'correct' : ($i === (int) $result['picked'] ? 'wrong' : null);
      };
      $checked = $question['value'] ?? (is_array($result) ? $result['picked'] : null);
  @endphp
  <div class="oc-block-step-view-question" @if (is_array($result)) data-answered @endif>
    @isset($question['kicker'])<span class="oc-block-step-view-kicker">{{ $question['kicker'] }}</span>@endisset
    <p class="oc-block-step-view-ask" id="{{ $askId }}">{{ $question['text'] ?? '' }}</p>
    <fieldset class="oc-block-step-view-answers" aria-labelledby="{{ $askId }}">
      @foreach ($question['options'] ?? [] as $i => $option)
      <label class="oc-radio-item oc-radio-item--card" @if ($mark($i)) data-result="{{ $mark($i) }}" @endif><input {{ $bag($question['inputAttributes'] ?? [])->merge(['class' => 'oc-radio', 'type' => 'radio', 'name' => $group, 'value' => $i]) }} @checked($checked !== null && (int) $checked === $i) @disabled(is_array($result))><span>{{ $option }}</span>@if ($mark($i))<span class="oc-visually-hidden"> {{ $mark($i) === 'correct' ? ($question['resultLabels']['correct'] ?? 'Correct') : ($question['resultLabels']['wrong'] ?? 'Wrong') }}</span>@endif</label>
      @endforeach
    </fieldset>
    @if (is_array($result))
    {{ $question['feedback'] ?? '' }}
    @else
    <button {{ $bag($question['sendAttributes'] ?? [])->merge(['class' => 'oc-btn oc-btn--lg oc-block-step-view-send', 'type' => 'button']) }}>{{ $question['sendLabel'] ?? 'Send answer' }}</button>
    @endif
    @isset($question['hint'])<p class="oc-block-step-view-hint">{{ $question['hint'] }}</p>@endisset
  </div>
  @else
  <div class="oc-block-step-view-question">
      @if (isset($question) && trim((string) $question) !== '')
          {{ $question }}
      @else
    <span class="oc-block-step-view-kicker">Question · 20 points</span>
    <p class="oc-block-step-view-ask" id="oc-stepview-ask">In which year was the town hall built?</p>
    <fieldset class="oc-block-step-view-answers" aria-labelledby="oc-stepview-ask">
      <label class="oc-radio-item oc-radio-item--card"><input class="oc-radio" type="radio" name="oc-stepview-answer" value="a"><span>1890</span></label>
      <label class="oc-radio-item oc-radio-item--card"><input class="oc-radio" type="radio" name="oc-stepview-answer" value="b"><span>1910</span></label>
      <label class="oc-radio-item oc-radio-item--card"><input class="oc-radio" type="radio" name="oc-stepview-answer" value="c"><span>1930</span></label>
      <label class="oc-radio-item oc-radio-item--card"><input class="oc-radio" type="radio" name="oc-stepview-answer" value="d"><span>1950</span></label>
    </fieldset>
    <button class="oc-btn oc-btn--lg oc-block-step-view-send" type="button">Send answer</button>
    <p class="oc-block-step-view-hint">One try: your first answer counts.</p>
      @endif
  </div>
  @endif
</article>
