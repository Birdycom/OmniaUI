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

    public function test_price_card_lifetime_option(): void
    {
        $html = $this->render(
            '<x-oc::price-card name="Pro" group="g2" :monthly="[\'amount\' => \'9.90\']" :yearly="[\'amount\' => \'99\']" :lifetime="[\'amount\' => \'249\', \'period\' => \'once\']" default-period="lifetime" />'
        );

        $this->assertSame(3, substr_count($html, 'name="g2"'));
        $this->assertMatchesRegularExpression('/value="lifetime"\s+checked/', $html);
        $this->assertDoesNotMatchRegularExpression('/value="monthly"\s+checked/', $html);
        $this->assertElement($html, 'p', 'oc-price-card__price oc-price-card__price--lifetime');
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

    public function test_feature_card_and_link_card(): void
    {
        $f = $this->render('<x-oc::feature-card title="Apps" icon="mdi:apps" accent="green" :level="2">Built for you.</x-oc::feature-card>');
        $this->assertElement($f, 'article', 'oc-feature-card');
        $this->assertElement($f, 'h2', 'oc-feature-card__title', [], 'Apps');
        $this->assertElement($f, 'span', 'oc-icon-tile oc-icon-tile--sm oc-accent--green');
        $l = $this->render('<x-oc::link-card href="/a" title="Agent 1" accent="violet" more="Read more">Reads invoices.</x-oc::link-card>');
        $this->assertElement($l, 'a', 'oc-link-card oc-accent--violet', ['href' => '/a']);
        $this->assertElement($l, 'span', 'oc-link-card__more', [], 'Read more');
    }

    public function test_brand_mark(): void
    {
        $html = $this->render('<x-oc::brand-mark name="Company" accent="1" tagline="Software" size="lg" aria-label="Company 1"><x-slot:icon><svg class="oc-brand-mark__icon"></svg></x-slot:icon></x-oc::brand-mark>');
        $this->assertElement($html, 'a', 'oc-brand-mark oc-brand-mark--lg', ['href' => '/', 'aria-label' => 'Company 1']);
        $this->assertElement($html, 'span', 'oc-brand-mark__accent', [], '1');
        $this->assertElement($html, 'span', 'oc-brand-mark__tagline', [], 'Software');
        $this->assertStringContainsString('class="oc-brand-mark__icon"', $html);
    }

    public function test_panel_and_result(): void
    {
        $this->assertElement($this->render('<x-oc::panel glow="end">X</x-oc::panel>'), 'div', 'oc-panel oc-panel--glow oc-panel--glow-end', [], 'X');
        $html = $this->render('<x-oc::result title="Sent" icon="mdi:check" accent="green" center>Thanks.<x-slot:actions><a href="#form">Again</a></x-slot:actions></x-oc::result>');
        $this->assertElement($html, 'div', 'oc-result oc-result--center', ['role' => 'status', 'tabindex' => '-1']);
        $this->assertElement($html, 'span', 'oc-icon-tile oc-icon-tile--sm oc-accent--green');
        $this->assertElement($html, 'p', 'oc-result__text', [], 'Thanks.');
        $this->assertElement($html, 'div', 'oc-result__actions');
    }

    public function test_contact_form_renders_fields_errors_cards_and_result(): void
    {
        // Laravel shares $errors with every view (ShareErrorsFromSession); the test does the same.
        view()->share('errors', (new \Illuminate\Support\ViewErrorBag)->put('default', new \Illuminate\Support\MessageBag(['email' => 'Fill in a valid e-mail address.'])));
        $html = $this->render(<<<'BLADE'
            <x-oc::block.contact-form action="/contact" class="mine" :subjects="['project' => 'A new project']" :cards="[['title' => 'Mail us', 'icon' => 'mdi:email-outline', 'lines' => [['info@company1.example', 'mailto:info@company1.example'], ['We answer within a day', null]]]]" />
            BLADE);
        view()->share('errors', new \Illuminate\Support\ViewErrorBag);

        $this->assertStringContainsString('class="oc-block-contact-form mine"', $html);
        $this->assertElement($html, 'form', 'oc-form oc-form--filled', ['action' => '/contact', 'method' => 'post']);
        $this->assertStringContainsString('name="_token"', $html);
        $this->assertElement($html, 'div', 'oc-honeypot', ['aria-hidden' => 'true']);
        $this->assertMatchesRegularExpression('/id="contact-email"[^>]*aria-invalid="true"/', $html);
        $this->assertElement($html, 'p', 'oc-field-error', ['id' => 'err-email'], 'Fill in a valid e-mail address.');
        $this->assertStringContainsString('Please check the fields in red.', $html);
        $this->assertMatchesRegularExpression('#<option value="project"\s*>A new project</option>#', $html);
        $this->assertElement($html, 'a', 'oc-block-contact-line', ['href' => 'mailto:info@company1.example'], 'info@company1.example');
        $this->assertMatchesRegularExpression('/data-contact-success\s+hidden/', $html);

        $sent = $this->render('<x-oc::block.contact-form action="/contact" sent success-text="We answer within a day." />');
        $this->assertMatchesRegularExpression('/data-contact-body\s+hidden/', $sent);
        $this->assertElement($sent, 'p', 'oc-result__text', [], 'We answer within a day.');
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
