{{-- OmniaUI block: portfolio-grid - Portfolio section: heading with an "all projects" link and a grid of project cards. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/portfolio-grid.html | Map: section -> container -> head (eyebrow, title, lead, link) -> grid of .oc-project-card
     Class API: .oc-block-portfolio (modifier --two: wider cards), -head, -lead, -grid (--oc-portfolio-min sets the card width).
       Cards are the project-card component; give each an .oc-accent--* preset for its placeholder.
     Blade: <x-oc::block.portfolio-grid> - attributes merge onto the root element. Written by hand (array props).
     Props (same names as BlockPortfolioGrid in React): eyebrow, title, lead, link (link text), link-href (default #projects),
       link-tone (default|accent|muted), two (wider cards), title-id (default oc-portfolio-title; also used for aria-labelledby),
       projects (list of ['href', 'name', 'type', 'meta', 'more', 'image', 'imageAlt', 'accent', 'flat', 'glow'], rendered with x-oc::project-card).
       Left out (null), every text shows the snippet content; :eyebrow="false", :lead="false" and :link="false" hide that part.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, lead, link (text of the link), default (own cards).
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null, 'link' => null, 'linkHref' => '#projects', 'linkTone' => 'default', 'two' => false, 'projects' => null, 'titleId' => 'oc-portfolio-title'])
@php($filled = fn ($v) => $v !== null && $v !== false && trim((string) $v) !== '')
<section {{ $attributes->merge(['class' => \Illuminate\Support\Arr::toCssClasses(['oc-block-portfolio', 'oc-block-portfolio--two' => $two, 'oc-section-pad']), 'aria-labelledby' => $titleId]) }}>
  <div class="oc-container">
    <div class="oc-block-portfolio-head">
      <div>
        @if ($eyebrow !== false)
        <p class="oc-eyebrow">
            @if ($filled($eyebrow))
                {{ $eyebrow }}
            @else
            Our work
            @endif
        </p>
        @endif
        <h2 class="oc-display oc-display--md" id="{{ $titleId }}">
            @if ($filled($title))
                {{ $title }}
            @else
            Selected projects
            @endif
        </h2>
        @if ($lead !== false)
        <p class="oc-block-portfolio-lead">
            @if ($filled($lead))
                {{ $lead }}
            @else
            Websites and apps we designed, built and still maintain.
            @endif
        </p>
        @endif
      </div>
      @if ($link !== false)
      <a @class(['oc-link-arrow', 'oc-link-arrow--'.$linkTone => in_array($linkTone, ['accent', 'muted'], true)]) href="{{ $linkHref }}">
          @if ($filled($link))
              {{ $link }}
          @else
          All projects
          @endif
      </a>
      @endif
    </div>
    <div class="oc-block-portfolio-grid">
        @if (! $slot->isEmpty())
            {{ $slot }}
        @elseif (is_array($projects))
            @foreach ($projects as $project)
            <x-oc::project-card
                :class="! empty($project['accent']) ? 'oc-accent--'.$project['accent'] : null"
                :href="$project['href'] ?? '#'"
                :name="$project['name'] ?? ''"
                :type="$project['type'] ?? null"
                :meta="$project['meta'] ?? null"
                :more="$project['more'] ?? 'View project'"
                :image="$project['image'] ?? null"
                :image-alt="$project['imageAlt'] ?? ''"
                :flat="! empty($project['flat'])"
                :glow="! empty($project['glow'])"
            />
            @endforeach
        @else
      <a class="oc-project-card oc-accent--green" href="#p1">
        <span class="oc-project-card__frame"><span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="oc-project-card__shot" role="img" aria-label="Customer 1, screenshot"></span></span>
        <span class="oc-project-card__body"><span class="oc-project-card__type">Website</span><span class="oc-project-card__name">Customer 1</span><span class="oc-project-card__meta">Food &amp; retail &middot; Antwerp</span><span class="oc-project-card__more">View project</span></span>
      </a>
      <a class="oc-project-card oc-accent--violet" href="#p2">
        <span class="oc-project-card__frame"><span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="oc-project-card__shot" role="img" aria-label="Customer 2, screenshot"></span></span>
        <span class="oc-project-card__body"><span class="oc-project-card__type">Web app</span><span class="oc-project-card__name">Customer 2</span><span class="oc-project-card__meta">Interior design &middot; Ghent</span><span class="oc-project-card__more">View project</span></span>
      </a>
      <a class="oc-project-card oc-accent--orange" href="#p3">
        <span class="oc-project-card__frame"><span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="oc-project-card__shot" role="img" aria-label="Customer 3, screenshot"></span></span>
        <span class="oc-project-card__body"><span class="oc-project-card__type">Desktop tool</span><span class="oc-project-card__name">Customer 3</span><span class="oc-project-card__meta">Transport &middot; Rotterdam</span><span class="oc-project-card__more">View project</span></span>
      </a>
        @endif
    </div>
  </div>
</section>
