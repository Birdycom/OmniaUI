{{-- File: resources/views/components/prose.blade.php | Map: props -> wrapper with size modifiers -> default slot (demo article when empty)
     OmniaUI prose: typography for long-form CMS, blog and help text written without classes. Props: size (compact|sm|md|lg), full (no max
     width), as (article|div|section). Slot: the text (put class="oc-prose-lead" on the intro); the snippet demo when empty. --}}
@props(['size' => 'md', 'full' => false, 'as' => 'article'])
<{{ $as }} {{ $attributes->class(['oc-prose', 'oc-prose--'.$size => $size !== 'md', 'oc-prose--full' => $full]) }}>
    @if (! $slot->isEmpty())
        {{ $slot }}
    @else
  <h1>Planning a kitchen renovation</h1>
  <p class="oc-prose-lead">A new kitchen takes eight to twelve weeks from the first visit to the last cabinet handle. This guide explains every step, so you know what to expect and when we need you.</p>
  <h2>Before the first visit</h2>
  <p>Collect a few photos of kitchens you like and measure the room roughly. Exact measurements are not needed yet: our site manager does that during the visit. Read the <a href="#checklist">preparation checklist</a> if you want to be fully ready.</p>
  <ul>
    <li>The <strong>budget range</strong> you have in mind, including appliances</li>
    <li>Which walls, doors and windows can move, and which cannot
      <ul><li>Load-bearing walls need a structural engineer</li><li>Moving a window needs a permit in most towns</li></ul>
    </li>
    <li>Appliances you want to keep</li>
  </ul>
  <figure>
    <div class="oc-media-art oc-media-art--6" role="img" aria-label="Kitchen with oak fronts and a light stone worktop"></div>
    <figcaption>Villa Dewitte: oak fronts with a Calacatta matt worktop, finished in October 2026.</figcaption>
  </figure>
  <h3>From design to installation</h3>
  <ol>
    <li>Site visit and measurements (week 1)</li>
    <li>Design and quote, with two revision rounds (weeks 2–3)</li>
    <li>Order and production of the cabinets (weeks 4–9)</li>
    <li>Installation, worktop and finishing (weeks 10–11)</li>
  </ol>
  <blockquote>
    <p>The planning was clear from day one. We always knew who was coming and when, and the kitchen was ready a week early.</p>
    <footer>— Ann Dewitte, client in Ghent</footer>
  </blockquote>
  <h2>Worktop materials compared</h2>
  <table>
    <caption>Prices per running metre, 60 cm deep, installed.</caption>
    <thead><tr><th>Material</th><th>Thickness</th><th>Heat resistant</th><th>Price</th></tr></thead>
    <tbody>
      <tr><td>Compact laminate</td><td>12 mm</td><td>Up to 180 °C</td><td>€ 290</td></tr>
      <tr><td>Quartz composite</td><td>20 mm</td><td>Up to 150 °C</td><td>€ 540</td></tr>
      <tr><td>Natural stone</td><td>20 mm</td><td>Yes</td><td>€ 720</td></tr>
    </tbody>
  </table>
  <h3>Sharing your floor plan</h3>
  <p>Upload a PDF or a photo in the client portal, or send it by e-mail. Press <kbd>Ctrl</kbd> + <kbd>V</kbd> in the chat to paste a screenshot. Files are stored as <code>project-id/plans/</code> and only your project team can see them.</p>
  <pre><code>Project:   2026-114 Villa Dewitte
Room:      Kitchen, ground floor
Wall A:    412 cm (window at 160 cm)
Wall B:    298 cm (door at the left)</code></pre>
  <hr>
  <p><small>Lead times are an estimate. <mark>Natural stone</mark> can take two weeks longer in summer.</small></p>
    @endif
</{{ $as }}>
