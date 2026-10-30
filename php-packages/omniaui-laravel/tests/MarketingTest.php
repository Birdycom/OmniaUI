<?php

// File: tests/MarketingTest.php
// Map: components (timeline, marquee, product-mark, project-card, link-arrow, stack-list, fact-list, next-teaser, price-card) -> blocks
// Group D (marketing): Blade components and block views render the same classes as the HTML snippets.

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use PHPUnit\Framework\Attributes\DataProvider;

class MarketingTest extends TestCase
{
    public function test_timeline_items_and_current(): void
    {
        $html = $this->render('<x-oc::timeline size="lg" :items="$items" />', ['items' => [
            ['date' => '2012', 'datetime' => '2012', 'title' => 'Start'],
            ['date' => 'Today', 'text' => 'Now', 'current' => true],
        ]]);

        $this->assertElement($html, 'ol', 'oc-timeline oc-timeline--lg');
        $this->assertElement($html, 'time', 'oc-timeline__date', ['datetime' => '2012'], '2012');
        $this->assertElement($html, 'li', 'oc-timeline__item oc-timeline__item--current');
    }

    public function test_marquee_renders_items_twice(): void
    {
        $html = $this->render('<x-oc::marquee :items="[\'A\', \'B\']" speed="slow" label="Tech" />');

        $this->assertElement($html, 'div', 'oc-marquee oc-marquee--slow', ['aria-label' => 'Tech']);
        $this->assertSame(4, substr_count($html, 'class="oc-marquee__item"'));
        $this->assertSame(2, substr_count($html, 'aria-hidden="true"'));
    }

    public function test_product_mark_link_arrow_and_stack_list(): void
    {
        $this->assertElement($this->render('<x-oc::product-mark size="xl" accent="green">X</x-oc::product-mark>'), 'span', 'oc-product-mark oc-product-mark--xl oc-accent--green', ['aria-hidden' => 'true'], 'X');
        $this->assertElement($this->render('<x-oc::link-arrow href="/b" direction="back">Back</x-oc::link-arrow>'), 'a', 'oc-link-arrow oc-link-arrow--back', ['href' => '/b'], 'Back');
        $stack = $this->render('<x-oc::stack-list neutral :items="[\'PHP\', [\'label\' => \'Web\', \'icon\' => \'*\']]" />');
        $this->assertElement($stack, 'ul', 'oc-stack-list oc-stack-list--neutral');
        $this->assertStringContainsString('<span class="oc-stack-list__icon" aria-hidden="true">*</span>Web', $stack);
    }

    public function test_project_card_fact_list_and_next_teaser(): void
    {
        $card = $this->render('<x-oc::project-card href="/p" name="One" type="Website" class="oc-accent--green" />');
        $this->assertElement($card, 'a', 'oc-project-card oc-accent--green', ['href' => '/p']);
        $this->assertElement($card, 'span', 'oc-project-card__more', [], 'View project');

        $facts = $this->render('<x-oc::fact-list stacked :items="[\'Platform\' => \'Web\']" />');
        $this->assertElement($facts, 'dl', 'oc-fact-list oc-fact-list--stacked');
        $this->assertStringContainsString('<div><dt>Platform</dt><dd>Web</dd></div>', $facts);

        $next = $this->render('<x-oc::next-teaser href="/n" name="Acme Design" tagline="Line" />');
        $this->assertElement($next, 'span', 'oc-next-teaser__label', [], 'Next product');
        $this->assertElement($next, 'span', 'oc-next-teaser__name', [], 'Acme Design');
    }

    public function test_price_card_toggle_prices_and_features(): void
    {
        $html = $this->render(
            '<x-oc::price-card name="Pro" group="g1" :monthly="[\'amount\' => \'12\']" :yearly="[\'amount\' => \'115\', \'was\' => \'144\']" default-period="yearly" :features="[\'A\', [\'label\' => \'B\', \'excluded\' => true]]"><a class="oc-btn oc-price-card__cta" href="#">Go</a></x-oc::price-card>'
        );

        $this->assertSame(2, substr_count($html, 'name="g1"'));
        $this->assertMatchesRegularExpression('/value="yearly"\s+checked/', $html);
        $this->assertElement($html, 'p', 'oc-price-card__price oc-price-card__price--yearly');
        $this->assertElement($html, 'li', 'oc-price-card__feature oc-price-card__feature--excluded', [], 'B');
        $this->assertStringContainsString('oc-price-card__cta', $html);
    }

    /** @return array<string, array{string, string}> */
    public static function blocks(): array
    {
        return [
            'faq' => ['faq', 'oc-block-faq'],
            'about-timeline' => ['about-timeline', 'oc-block-about oc-accent--blue'],
            'contact-grid' => ['contact-grid', 'oc-block-contact'],
            'hero-orbit' => ['hero-orbit', 'oc-block-orbit oc-section-pad'],
            'profile-header' => ['profile-header', 'oc-block-profile oc-accent--violet'],
            'portfolio-grid' => ['portfolio-grid', 'oc-block-portfolio oc-section-pad'],
        ];
    }

    #[DataProvider('blocks')]
    public function test_block_renders_snippet_and_merges_class(string $name, string $root): void
    {
        $html = $this->render("<x-oc::block.{$name} class=\"mine\" />");
        $this->assertStringContainsString('class="'.$root.' mine"', $html);

        $custom = $this->render("<x-oc::block.{$name}><p>Custom</p></x-oc::block.{$name}>");
        $this->assertStringContainsString('<p>Custom</p>', $custom);
    }

    public function test_link_row_renders_links_with_noopener_on_external_ones(): void
    {
        $html = $this->render(<<<'BLADE'
            <x-oc::link-row tone="accent" size="sm" :links="[['href' => '/docs', 'label' => 'Docs'], ['href' => 'https://github.com/acme/app', 'label' => 'Source']]" />
            BLADE);
        $this->assertStringContainsString('class="oc-link-row oc-link-row--accent oc-link-row--sm"', $html);
        $this->assertMatchesRegularExpression('#<a href="/docs"\s*>Docs</a>#', $html);
        $this->assertMatchesRegularExpression('#<a href="https://github.com/acme/app"\s+rel="noopener"\s*>Source</a>#', $html);
    }
}
