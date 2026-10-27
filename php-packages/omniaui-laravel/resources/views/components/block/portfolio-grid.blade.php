{{-- OmniaUI block: portfolio-grid - Portfolio section: heading with an "all projects" link and a grid of project cards. Needs @birdycom/omniaui-blocks + @birdycom/omniaui CSS.
     File: packages/blocks/blocks/portfolio-grid.html | Map: section -> container -> head (eyebrow, title, lead, link) -> grid of .oc-project-card
     Class API: .oc-block-portfolio (modifier --two: wider cards), -head, -lead, -grid (--oc-portfolio-min sets the card width).
       Cards are the project-card component; give each an .oc-accent--* preset for its placeholder.
     Blade: <x-oc::block.portfolio-grid> - attributes merge onto the root element.
     Blade slots (each falls back to the snippet content when empty): eyebrow, title, lead, link, default.
--}}
@props(['eyebrow' => null, 'title' => null, 'lead' => null, 'link' => null])
<section {{ $attributes->merge(['class' => 'oc-block-portfolio oc-section-pad', 'aria-labelledby' => 'oc-portfolio-title']) }}>
  <div class="oc-container">
    <div class="oc-block-portfolio-head">
      <div>
        <p class="oc-eyebrow">
            @if (isset($eyebrow) && trim((string) $eyebrow) !== '')
                {{ $eyebrow }}
            @else
            Our work
            @endif
        </p>
        <h2 class="oc-display oc-display--md" id="oc-portfolio-title">
            @if (isset($title) && trim((string) $title) !== '')
                {{ $title }}
            @else
            Selected <span class="oc-text-gradient">projects</span>
            @endif
        </h2>
        <p class="oc-block-portfolio-lead">
            @if (isset($lead) && trim((string) $lead) !== '')
                {{ $lead }}
            @else
            Websites and apps we designed, built and still maintain.
            @endif
        </p>
      </div>
      <a class="oc-link-arrow" href="#projects">
          @if (isset($link) && trim((string) $link) !== '')
              {{ $link }}
          @else
          All projects
          @endif
      </a>
    </div>
    <div class="oc-block-portfolio-grid">
        @if (! $slot->isEmpty())
            {{ $slot }}
        @else
      <a class="oc-project-card oc-accent--green" href="#p1">
        <span class="oc-project-card__frame"><span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="oc-project-card__shot" role="img" aria-label="Northwind Bakery, screenshot"></span></span>
        <span class="oc-project-card__body"><span class="oc-project-card__type">Website</span><span class="oc-project-card__name">Northwind Bakery</span><span class="oc-project-card__meta">Food &amp; retail &middot; Antwerp</span><span class="oc-project-card__more">View project</span></span>
      </a>
      <a class="oc-project-card oc-accent--violet" href="#p2">
        <span class="oc-project-card__frame"><span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="oc-project-card__shot" role="img" aria-label="Fjord Interiors, screenshot"></span></span>
        <span class="oc-project-card__body"><span class="oc-project-card__type">Web app</span><span class="oc-project-card__name">Fjord Interiors</span><span class="oc-project-card__meta">Interior design &middot; Ghent</span><span class="oc-project-card__more">View project</span></span>
      </a>
      <a class="oc-project-card oc-accent--orange" href="#p3">
        <span class="oc-project-card__frame"><span class="oc-project-card__bar" aria-hidden="true"><i></i><i></i><i></i></span><span class="oc-project-card__shot" role="img" aria-label="Harbor Logistics, screenshot"></span></span>
        <span class="oc-project-card__body"><span class="oc-project-card__type">Desktop tool</span><span class="oc-project-card__name">Harbor Logistics</span><span class="oc-project-card__meta">Transport &middot; Rotterdam</span><span class="oc-project-card__more">View project</span></span>
      </a>
        @endif
    </div>
  </div>
</section>
