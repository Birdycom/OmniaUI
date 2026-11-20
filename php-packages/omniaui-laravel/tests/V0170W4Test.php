<?php

// File: tests/V0170W4Test.php
// Map: 0.17.0 W4 blocks: site header / footer + topbar -> route blocks (route progress, step view, route steps, type picker)
//      -> marketing blocks (showcase, hero-code, product-grid, about-timeline, portfolio-grid, contact-grid) -> hero orbit + auth split

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

class V0170W4Test extends TestCase
{
    public function test_site_header_defaults_stay_the_snippet(): void
    {
        $html = $this->render('<x-oc::block.site-header />');
        $this->assertStringContainsString('<header class="oc-site-header">', $html);
        $this->assertStringContainsString('<button class="oc-site-header__toggle" popovertarget="site-nav" aria-label="Menu">&#9776;</button>', $html);
        $this->assertStringContainsString('Start a project', $html);
        $this->assertStringNotContainsString('oc-site-header__actions', $html);
        $this->assertStringNotContainsString('oc-site-header__progress', $html);
    }

    public function test_site_header_actions_progress_variant_and_brand_mark(): void
    {
        $html = $this->render('<x-oc::block.site-header variant="center" progress nav-id="nav-1" brand-href="#" :brand-mark="[\'name\' => \'Company\', \'accent\' => \'1\', \'tagline\' => \'Software & IT\', \'label\' => \'Company 1, home\']"><x-slot:brand-icon><svg class="oc-brand-mark__icon"></svg></x-slot:brand-icon><x-slot:nav><a href="#product">Product</a></x-slot:nav><x-slot:actions><a class="oc-btn oc-btn--sm" href="#">Start free</a></x-slot:actions></x-oc::block.site-header>');

        $this->assertElement($html, 'header', 'oc-site-header oc-site-header--center');
        $this->assertElement($html, 'a', 'oc-brand-mark', ['href' => '#', 'aria-label' => 'Company 1, home']);
        $this->assertStringContainsString('<svg class="oc-brand-mark__icon"></svg>', $html);
        $this->assertElement($html, 'span', 'oc-brand-mark__tagline', [], 'Software & IT');
        $this->assertStringNotContainsString('oc-site-header__brand', $html);
        $this->assertElement($html, 'nav', 'oc-site-header__nav', ['id' => 'nav-1']);
        $this->assertStringContainsString('popovertarget="nav-1"', $html);
        $this->assertElement($html, 'div', 'oc-site-header__actions', [], 'Start free');
        $this->assertElement($html, 'span', 'oc-site-header__progress', ['aria-hidden' => 'true']);
    }

    public function test_site_header_menu_icon_as_webicon(): void
    {
        $html = $this->render('<x-oc::block.site-header menu-icon="mdi:menu" variant="dark" />');
        $this->assertElement($html, 'header', 'oc-site-header oc-site-header--dark');
        $this->assertMatchesRegularExpression('/<button class="oc-site-header__toggle"[^>]*>\s*<(svg|iconify-icon)[^>]*(data-webicon|icon)="mdi:menu"/', $html);
        $this->assertStringNotContainsString('&#9776;', $html);
    }

    public function test_site_footer_defaults_and_default_slot_stay(): void
    {
        $html = $this->render('<x-oc::block.site-footer />');
        $this->assertStringContainsString('Built with OmniaCSS', $html);
        $this->assertStringContainsString('<footer class="oc-site-footer">', $html);
        $own = $this->render('<x-oc::block.site-footer variant="dark"><p>Mine</p></x-oc::block.site-footer>');
        $this->assertStringContainsString('<footer class="oc-site-footer oc-site-footer--dark"> <p>Mine</p> </footer>', $own);
    }

    public function test_site_footer_from_props_with_social_more_legal_and_build(): void
    {
        $html = $this->render(<<<'BLADE'
<x-oc::block.site-footer style="--oc-footer-cols: 1.5fr repeat(4, 1fr)" :brand-mark="['name' => 'Company', 'accent' => '1', 'label' => 'Company 1, home']" about="Business apps from one team."
    :social="[['label' => 'LinkedIn', 'href' => '#', 'icon' => 'mdi:linkedin']]"
    :columns="[['title' => 'Projects', 'links' => [['label' => 'Customer 1', 'href' => '#']], 'more' => [['title' => 'Tools', 'links' => [['label' => 'Tool 1', 'href' => '#']]]]], ['title' => 'Contact', 'lines' => [['label' => 'info@company1.example', 'href' => 'mailto:info@company1.example'], ['label' => 'Street 1']]]]"
    copyright="© 2026 Company 1" :legal="[['label' => 'Terms', 'href' => '#'], ['label' => 'Privacy', 'href' => '#']]" build="build 2026.11.02" />
BLADE);
        $this->assertElement($html, 'footer', 'oc-site-footer', ['style' => null]);
        $this->assertStringContainsString('style="--oc-footer-cols: 1.5fr repeat(4, 1fr);"', $html);
        $this->assertElement($html, 'a', 'oc-brand-mark oc-brand-mark--sm', ['aria-label' => 'Company 1, home']);
        $this->assertElement($html, 'ul', 'oc-site-footer__social', ['aria-label' => 'Social media']);
        $this->assertStringContainsString('aria-label="LinkedIn"', $html);
        $this->assertElement($html, 'h2', 'oc-site-footer__title oc-site-footer__subtitle', [], 'Tools');
        $this->assertStringContainsString('<address class="oc-site-footer__list"><a href="mailto:info@company1.example">info@company1.example</a> <span>Street 1</span> </address>', $html);
        $this->assertElement($html, 'ul', 'oc-site-footer__legal');
        $this->assertElement($html, 'li', 'oc-site-footer__build', [], 'build 2026.11.02');
        $this->assertStringNotContainsString('Built with OmniaCSS', $html);
        $this->assertSame(1, substr_count($html, '<span>'.'© 2026 Company 1'.'</span>'));
    }

    public function test_site_footer_center_variant(): void
    {
        $html = $this->render('<x-oc::block.site-footer variant="center" brand="Company 1" about="Web apps." :row="[[\'label\' => \'Product\', \'href\' => \'#\'], [\'label\' => \'Blog\', \'href\' => \'#\']]" :social="[[\'label\' => \'GitHub\', \'href\' => \'#\', \'icon\' => \'mdi:github\']]" copyright="© 2026 Company 1" />');
        $this->assertElement($html, 'footer', 'oc-site-footer oc-site-footer--center');
        $this->assertStringNotContainsString('oc-site-footer__grid', $html);
        $this->assertElement($html, 'ul', 'oc-site-footer__row');
        $this->assertElement($html, 'div', 'oc-site-footer__bottom', [], '© 2026 Company 1');
        $this->assertMatchesRegularExpression('/<\/ul> <ul class="oc-site-footer__social"/', $html);
    }

    public function test_site_footer_newsletter_posts_with_csrf(): void
    {
        $html = $this->render('<x-oc::block.site-footer variant="dark" brand="Company 1" :newsletter="[\'action\' => \'/subscribe\', \'placeholder\' => \'info@company1.example\', \'id\' => \'ft-mail\']" :social="[[\'label\' => \'LinkedIn\', \'href\' => \'#\', \'icon\' => \'mdi:linkedin\']]" />');
        $this->assertElement($html, 'form', 'oc-site-footer__signup', ['action' => '/subscribe', 'method' => 'post']);
        $this->assertStringContainsString('name="_token"', $html);
        $this->assertElement($html, 'label', 'oc-visually-hidden', ['for' => 'ft-mail'], 'E-mail');
        $this->assertElement($html, 'input', 'oc-input', ['id' => 'ft-mail', 'type' => 'email', 'name' => 'email', 'placeholder' => 'info@company1.example']);
        $this->assertStringContainsString('<div style="margin-block-start:1.25rem"><ul class="oc-site-footer__social"', $html);
    }

    public function test_site_footer_newsletter_takes_form_and_input_attributes(): void
    {
        $html = $this->render('<x-oc::block.site-footer brand="Company 1" :newsletter="[\'attributes\' => [\'wire:submit\' => \'subscribe\'], \'inputAttributes\' => [\'wire:model\' => \'email\']]" />');
        $this->assertElement($html, 'form', 'oc-site-footer__signup', ['wire:submit' => 'subscribe']);
        $this->assertElement($html, 'input', 'oc-input', ['type' => 'email', 'wire:model' => 'email']);
        $this->assertStringNotContainsString('name="_token"', $html);
    }

    public function test_topbar(): void
    {
        $html = $this->render('<x-oc::topbar id="tb" brand="Company 1" logo="mdi:lightning-bolt" :links="[[\'label\' => \'Product\', \'href\' => \'#\', \'current\' => true], [\'label\' => \'GitHub\', \'href\' => \'#\', \'icon\' => \'mdi:github\']]"><x-slot:actions><a class="oc-btn oc-btn--sm" href="#">Get started</a></x-slot:actions></x-oc::topbar>');
        $this->assertElement($html, 'header', 'oc-topbar oc-topbar--collapsible');
        $this->assertElement($html, 'span', 'oc-topbar-logo', ['aria-hidden' => 'true']);
        $this->assertElement($html, 'input', 'oc-topbar-toggle', ['id' => 'tb', 'type' => 'checkbox', 'aria-label' => 'Toggle menu']);
        $this->assertElement($html, 'label', 'oc-topbar-burger', ['for' => 'tb', 'aria-hidden' => 'true']);
        $this->assertElement($html, 'ul', 'oc-navmenu oc-navmenu--site');
        $this->assertElement($html, 'a', 'oc-navmenu-link', ['aria-current' => 'page'], 'Product');
        $this->assertElement($html, 'a', 'oc-navmenu-link', ['aria-label' => 'GitHub']);
        $this->assertElement($html, 'div', 'oc-topbar-actions', [], 'Get started');
    }

    public function test_topbar_modifiers_and_strip(): void
    {
        $html = $this->render('<x-oc::topbar brand="Company 1" variant="brand" center plain class="oc-accent--violet" :collapsible="false"><x-slot:strip><span>info@company1.example</span></x-slot:strip></x-oc::topbar>');
        $this->assertStringStartsWith('<div class="oc-topbar-strip"><span>info@company1.example</span></div>', $html);
        $this->assertElement($html, 'header', 'oc-topbar oc-topbar--brand oc-topbar--center oc-topbar--plain oc-accent--violet');
        $this->assertStringNotContainsString('oc-topbar-toggle', $html);
    }

    public function test_route_progress_takes_score_bar_next_and_steps(): void
    {
        $html = $this->render('<x-oc::block.route-progress title="Route 1" meta="Team 1" :score="80" :done="5" :total="6" title-id="rp-finish" list-label="Route steps"
            :next="[\'tone\' => \'finish\', \'icon\' => \'mdi:flag-checkered\', \'title\' => \'The finish is open\', \'sub\' => \'Check in\', \'meta\' => \'350 m\', \'attributes\' => [\'wire:click\' => \'finish\']]"
            :steps="[[\'name\' => \'Old gate\', \'sub\' => \'Right answer\', \'value\' => \'+20\', \'state\' => \'done\'], [\'name\' => \'Market square\', \'state\' => \'wrong\'], [\'name\' => \'Finish\', \'state\' => \'current\', \'marker\' => \'mdi:flag-checkered\', \'markerLabel\' => \'Finish\']]" />');

        $this->assertElement($html, 'section', 'oc-block-route-progress', ['aria-labelledby' => 'rp-finish']);
        $this->assertElement($html, 'h2', 'oc-block-route-progress-title', ['id' => 'rp-finish'], 'Route 1');
        $this->assertStringContainsString('<b>80</b><span>points</span>', $html);
        $this->assertStringContainsString('<span>5 of 6 steps done</span><span>83%</span>', $html);
        $this->assertStringContainsString('aria-valuenow="5" aria-valuemin="0" aria-valuemax="6"', $html);
        $this->assertStringContainsString('style="width: 83%"', $html);
        $this->assertElement($html, 'button', 'oc-block-route-progress-next oc-block-route-progress-next--finish', ['wire:click' => 'finish', 'type' => 'button']);
        $this->assertElement($html, 'span', 'oc-block-route-progress-next-meta', [], '350 m');
        $this->assertElement($html, 'ol', 'oc-block-route-progress-list', ['aria-label' => 'Route steps']);
        $this->assertElement($html, 'li', 'oc-block-route-progress-item oc-block-route-progress-item--done');
        $this->assertElement($html, 'li', 'oc-block-route-progress-item oc-block-route-progress-item--done oc-block-route-progress-item--wrong');
        $this->assertElement($html, 'li', 'oc-block-route-progress-item oc-block-route-progress-item--current');
        $this->assertElement($html, 'button', 'oc-block-route-progress-link', ['aria-current' => 'step']);
        $this->assertStringContainsString('<span class="oc-block-route-progress-marker">2</span>', $html);
        $this->assertStringNotContainsString('Walk to step 3', $html);
        $this->assertStringNotContainsString('River bridge', $html);
    }

    public function test_route_progress_false_hides_parts_and_bar_uses_progress_label(): void
    {
        $html = $this->render('<x-oc::block.route-progress :meta="false" :score="false" :next="false" :done="0" :total="4" progress-label="Not started" :steps="[]" />');

        $this->assertStringNotContainsString('oc-block-route-progress-meta', $html);
        $this->assertStringNotContainsString('oc-block-route-progress-score', $html);
        $this->assertStringNotContainsString('oc-block-route-progress-next', $html);
        $this->assertStringContainsString('<span>Not started</span><span>0%</span>', $html);
        $this->assertStringNotContainsString('Old gate', $html);
    }

    public function test_step_view_without_picture_and_with_a_question_array(): void
    {
        $html = $this->render('<x-oc::block.step-view title="Town hall" :number="3" place="Market street 1" task="Find the year." :blocks="false" title-id="sv"
            :question="[\'kicker\' => \'Question\', \'text\' => \'Which year?\', \'options\' => [\'1890\', \'1910\'], \'value\' => 1, \'name\' => \'answer\', \'hint\' => \'One try\', \'inputAttributes\' => [\'wire:model\' => \'picked\'], \'sendAttributes\' => [\'wire:click\' => \'send\']]"><p>Text</p></x-oc::block.step-view>');

        $this->assertElement($html, 'figure', 'oc-block-step-view-picture oc-block-step-view-picture--empty', ['data-number' => '3']);
        $this->assertStringNotContainsString('viewBox="0 0 320 180"', $html); // no picture (icons are inline SVG webicons)
        $this->assertElement($html, 'figcaption', 'oc-block-step-view-badges');
        $this->assertStringNotContainsString('oc-block-step-view-blocks', $html);
        $this->assertStringContainsString('Find the year.', $html);
        $this->assertElement($html, 'p', 'oc-block-step-view-ask', ['id' => 'sv-ask'], 'Which year?');
        $this->assertElement($html, 'input', 'oc-radio', ['name' => 'answer', 'value' => '1', 'wire:model' => 'picked', 'checked' => null]);
        $this->assertElement($html, 'button', 'oc-btn oc-btn--lg oc-block-step-view-send', ['wire:click' => 'send'], 'Send answer');
        $this->assertElement($html, 'p', 'oc-block-step-view-hint', [], 'One try');
    }

    public function test_step_view_result_locks_and_marks_the_answers(): void
    {
        $html = $this->render('<x-oc::block.step-view title="Old gate" :back="false" :distance="false" :picture="false" :question="$q" />', [
            'q' => ['text' => 'Which year?', 'options' => ['1890', '1910', '1930'], 'result' => ['picked' => 2, 'correct' => 1], 'feedback' => new \Illuminate\Support\HtmlString('<div class="oc-alert oc-alert--danger" role="status">Not quite</div>')],
        ]);

        $this->assertStringNotContainsString('oc-block-step-view-top', $html);
        $this->assertStringNotContainsString('oc-block-step-view-picture', $html);
        $this->assertElement($html, 'div', 'oc-block-step-view-question', ['data-answered' => null]);
        $this->assertElement($html, 'label', 'oc-radio-item oc-radio-item--card', ['data-result' => 'correct']);
        $this->assertElement($html, 'label', 'oc-radio-item oc-radio-item--card', ['data-result' => 'wrong']);
        $this->assertStringContainsString('<span class="oc-visually-hidden"> Correct</span>', $html);
        $this->assertSame(3, substr_count($html, 'disabled'));
        $this->assertStringContainsString('<div class="oc-alert oc-alert--danger" role="status">Not quite</div>', $html);
        $this->assertStringNotContainsString('Send answer', $html);
    }

    public function test_route_steps_locked_with_steps_array(): void
    {
        $html = $this->render('<x-oc::block.route-steps title="Steps of Route 1" count="2 steps" locked locked-label="Order locked during the live round" :search="false" :actions="false" selected="l1" :steps="$steps" />', [
            'steps' => [
                ['id' => 'l1', 'name' => 'Old gate', 'meta' => ['Question', '20 points'], 'badges' => ['Counts', ['label' => 'Team', 'tone' => 'info']], 'status' => '2 problems', 'statusTone' => 'destructive', 'statusTooltip' => 'No location set.'],
                ['id' => 'l2', 'name' => 'Finish', 'numbered' => false, 'icon' => 'mdi:flag-checkered', 'color' => 'var(--color-forestgreen-60)', 'status' => 'Ready', 'statusTone' => 'success', 'attributes' => ['wire:click' => "select('l2')"]],
            ],
        ]);

        $this->assertElement($html, 'section', 'oc-block-route-steps oc-block-route-steps--locked');
        $this->assertElement($html, 'span', 'oc-block-route-steps-lock', [], 'Order locked during the live round');
        $this->assertStringNotContainsString('<div class="oc-block-route-steps-tools"', $html);
        $this->assertStringNotContainsString('oc-block-route-steps-menu', $html);
        $this->assertStringNotContainsString('<div class="oc-block-route-steps-foot"', $html);
        $this->assertElement($html, 'button', 'oc-sortable-row-grip', ['aria-label' => 'Move Old gate', 'disabled' => null]);
        $this->assertElement($html, 'button', 'oc-block-route-steps-main', ['aria-current' => 'true']);
        $this->assertElement($html, 'button', 'oc-block-route-steps-main', ['wire:click' => "select('l2')"]);
        $this->assertElement($html, 'span', 'oc-block-route-steps-status oc-tooltip oc-tooltip--left', ['data-tooltip' => 'No location set.', 'tabindex' => '0']);
        $this->assertElement($html, 'span', 'oc-badge oc-badge--info', [], 'Team');
        $this->assertElement($html, 'span', 'oc-block-route-steps-thumb', ['style' => '--oc-step-color: var(--color-forestgreen-60)']);
        $this->assertElement($html, 'span', 'oc-badge oc-badge--success oc-block-route-steps-status', [], 'Ready');
        $this->assertStringNotContainsString('Welcome', $html);
    }

    public function test_route_steps_kinds_and_menu_without_move_items_when_locked(): void
    {
        $html = $this->render('<x-oc::block.route-steps title="S" locked :kinds="[[\'value\' => \'step\', \'label\' => \'Steps\']]" :steps="[[\'id\' => \'a\', \'name\' => \'A\', \'kind\' => \'step\']]" />');

        $this->assertElement($html, 'input', 'oc-input oc-block-route-steps-search', ['placeholder' => 'Search steps']);
        $this->assertStringContainsString('value="all" checked> All', $html);
        $this->assertStringContainsString('value="step" > Steps', $html);
        $this->assertStringContainsString('data-action="duplicate"', $html);
        $this->assertStringNotContainsString('data-action="up"', $html);
    }

    public function test_type_picker_options_array_in_pick_mode(): void
    {
        $html = $this->render('<x-oc::block.type-picker title="Add a block" :text="false" name="type" :categories="[[\'value\' => \'media\', \'label\' => \'Media\']]" :options="$options"><x-slot:footer><button class="oc-btn">Add</button></x-slot:footer></x-oc::block.type-picker>', [
            'options' => [
                ['value' => 'question', 'label' => 'Question', 'disabled' => true],
                ['value' => 'image', 'label' => 'Image', 'hint' => 'A photo', 'category' => 'media', 'preview' => new \Illuminate\Support\HtmlString('<b>Mini</b>')],
            ],
        ]);

        $this->assertStringNotContainsString('oc-block-type-picker-text', $html);
        $this->assertElement($html, 'input', 'oc-block-type-picker-input', ['name' => 'type', 'value' => 'question', 'disabled' => null]);
        $this->assertElement($html, 'input', 'oc-block-type-picker-input', ['name' => 'type', 'value' => 'image', 'checked' => null]);
        $this->assertStringContainsString('<span class="oc-block-type-picker-preview" aria-hidden="true"><b>Mini</b></span>', $html);
        $this->assertStringContainsString('name="type-cat" value="media"', $html);
        $this->assertElement($html, 'button', 'oc-btn', [], 'Add');
        $this->assertStringNotContainsString('Add block', $html);
        $this->assertStringNotContainsString('Code to scan', $html);
    }

    public function test_type_picker_action_mode(): void
    {
        $html = $this->render('<x-oc::block.type-picker mode="action" title="Add to Step 1" :search="false" draggable title-id="pick" :options="$options" />', [
            'options' => [
                ['value' => 'text', 'label' => 'Text', 'category' => 'content', 'attributes' => ['wire:click' => "add('text')"]],
                ['value' => 'question', 'label' => 'Question', 'disabledReason' => 'This step already has a question', 'attributes' => ['wire:click' => "add('question')"]],
            ],
        ]);

        $this->assertElement($html, 'section', 'oc-block-type-picker oc-block-type-picker--action', ['aria-labelledby' => 'pick']);
        $this->assertElement($html, 'div', 'oc-block-type-picker-grid', ['role' => 'group', 'aria-label' => 'Block type']);
        $this->assertElement($html, 'button', 'oc-block-type-picker-item', ['data-value' => 'text', 'draggable' => 'true', 'wire:click' => "add('text')"]);
        $this->assertElement($html, 'button', 'oc-block-type-picker-item', ['data-value' => 'question', 'aria-disabled' => 'true', 'aria-describedby' => 'pick-type-question-reason']);
        $this->assertStringNotContainsString("add('question')", $html);
        $this->assertElement($html, 'span', 'oc-block-type-picker-reason', ['id' => 'pick-type-question-reason'], 'This step already has a question');
        $this->assertStringNotContainsString('<fieldset class="oc-block-type-picker-grid"', $html);
        $this->assertStringNotContainsString('<div class="oc-block-type-picker-foot"', $html);
        $this->assertStringNotContainsString('<div class="oc-block-type-picker-tools"', $html);
    }

    public function test_without_props_the_snippet_content_stays(): void
    {
        $this->assertStringContainsString('<b>40</b><span>points</span>', $this->render('<x-oc::block.route-progress />'));
        $this->assertStringContainsString('aria-label="Town hall seen from the square"', $this->render('<x-oc::block.step-view />'));
        $steps = $this->render('<x-oc::block.route-steps />');
        $this->assertStringContainsString('7 steps · 4 count', $steps);
        $this->assertStringNotContainsString('oc-block-route-steps-lock', $steps);
        $picker = $this->render('<x-oc::block.type-picker />');
        $this->assertStringContainsString('Code to scan', $picker);
        $this->assertStringNotContainsString('oc-block-type-picker--action', $picker);
    }

    public function test_showcase_builds_cards_from_projects(): void
    {
        $html = $this->render('<x-oc::block.showcase eyebrow="Work" title="Websites" card-min="26rem" :projects="$projects" />', ['projects' => [
            ['href' => '/work/1', 'accent' => 'green', 'background' => 'linear-gradient(135deg, var(--color-green-40), var(--color-teal-80))', 'pill' => 'Website with CMS', 'name' => 'Project 1', 'summary' => 'Garden', 'more' => 'View the project'],
            ['href' => '/work/2', 'tag' => 'Custom website', 'name' => 'Project 2', 'image' => '/shot.png', 'imageAlt' => 'Shot 2'],
        ]]);

        $this->assertStringContainsString('style="--oc-card-min: 26rem;"', $html);
        $this->assertElement($html, 'a', 'oc-product-card oc-accent--green p-0 overflow-hidden', ['href' => '/work/1']);
        $this->assertElement($html, 'a', 'oc-product-card p-0 overflow-hidden', ['href' => '/work/2']);
        $this->assertStringContainsString('style="background: linear-gradient(135deg, var(--color-green-40), var(--color-teal-80))"', $html);
        $this->assertElement($html, 'span', 'oc-pill oc-pill--accent justify-self-start', [], 'Custom website');
        $this->assertStringContainsString('<img src="/shot.png" alt="Shot 2">', $html);
        $this->assertStringNotContainsString('Garden design', $html);
        $this->assertSame(2, substr_count($html, 'class="oc-product-card '));
    }

    public function test_showcase_hides_the_eyebrow_with_false(): void
    {
        $html = $this->render('<x-oc::block.showcase :eyebrow="false" :projects="[]" />');

        $this->assertStringNotContainsString('oc-eyebrow', $html);
        $this->assertStringContainsString('Websites made to measure.', $html);
        $this->assertStringNotContainsString('oc-product-card', $html);
    }

    public function test_hero_code_takes_code_tiles_and_actions(): void
    {
        $html = $this->render('<x-oc::block.hero-code eyebrow="Dev" code-title="app.ts" code="const a = 1 < 2;" :tiles="$tiles" :code-dark="false"><x-slot:title>Build <span class="oc-text-gradient">fast</span></x-slot:title><x-slot:actions><a class="oc-btn" href="/go">Go</a></x-slot:actions></x-oc::block.hero-code>', [
            'tiles' => [['glyph' => 'A', 'accent' => 'cyan', 'style' => 'inset: 0']],
        ]);

        $this->assertStringContainsString('<p class="oc-eyebrow">Dev</p>', $html);
        $this->assertStringContainsString('Build <span class="oc-text-gradient">fast</span>', $html);
        $this->assertStringContainsString('<a class="oc-btn" href="/go">Go</a>', $html);
        $this->assertStringNotContainsString('View our software', $html);
        $this->assertStringContainsString('<span class="oc-code-window__title">app.ts</span>', $html);
        $this->assertStringContainsString('<pre class="oc-code-window__body">const a = 1 &lt; 2;</pre>', $html);
        $this->assertElement($html, 'span', 'oc-icon-tile oc-icon-tile--float oc-accent--cyan absolute', ['style' => 'inset: 0'], 'A');
        $this->assertSame(1, substr_count($html, 'oc-icon-tile--float'));
        $this->assertElement($html, 'div', 'oc-code-window');
        // the lead keeps the snippet text
        $this->assertStringContainsString('From a modular ERP', $html);
    }

    public function test_hero_code_default_keeps_the_dark_window_and_three_tiles(): void
    {
        $html = $this->render('<x-oc::block.hero-code />');
        $this->assertElement($html, 'div', 'oc-code-window oc-code-window--dark');
        $this->assertSame(3, substr_count($html, 'oc-icon-tile--float'));

        $html = $this->render('<x-oc::block.hero-code :lead="false" :tiles="[]" />');
        $this->assertStringNotContainsString('oc-icon-tile', $html);
        $this->assertStringNotContainsString('oc-lead', $html);
        $this->assertStringContainsString("'erp'", $html);
    }

    public function test_product_grid_builds_cards_with_glyph_or_webicon(): void
    {
        $html = $this->render('<x-oc::block.product-grid eyebrow="Software" title="Products" :products="$products" />', ['products' => [
            ['href' => '/p1', 'accent' => 'green', 'icon' => '◆', 'pill' => 'Own product', 'name' => 'Product 1', 'tagline' => 'ERP', 'summary' => 'All in one.', 'more' => 'Discover Product 1'],
            ['href' => '/p2', 'accent' => 'cyan', 'icon' => 'mdi:package-variant', 'tag' => 'Tool', 'name' => 'Product 2'],
        ]]);

        $this->assertElement($html, 'a', 'oc-product-card oc-accent--green', ['href' => '/p1']);
        $this->assertStringContainsString('<span class="oc-icon-tile" aria-hidden="true">◆</span>', $html);
        $this->assertMatchesRegularExpression('/<span class="oc-icon-tile" aria-hidden="true">\s*<(svg|iconify-icon)/', $html);
        $this->assertElement($html, 'span', 'oc-pill', [], 'Tool');
        $this->assertElement($html, 'h3', 'oc-product-card__name', [], 'Product 2');
        $this->assertSame(1, substr_count($html, 'oc-product-card__tagline'));
        $this->assertStringNotContainsString('OmniaCSS', $html);
    }

    public function test_about_timeline_accent_reverse_image_and_rows(): void
    {
        $html = $this->render('<x-oc::block.about-timeline reverse accent="green" timeline-accent title-id="about-rev" eyebrow="Our story" title="Small team" badge="40 projects" text="Most clients stay." image="/team.jpg" image-alt="Team" :timeline="$timeline" />', ['timeline' => [
            ['date' => '2016', 'title' => 'First client', 'text' => 'A web shop.'],
            ['date' => '2026', 'dateTime' => '2026', 'text' => 'Team of eight.', 'current' => true],
        ]]);

        $this->assertStringContainsString('class="oc-block-about oc-accent--green oc-block-about--reverse" aria-labelledby="about-rev"', $html);
        $this->assertStringContainsString('id="about-rev"', $html);
        $this->assertStringContainsString('<figure class="oc-block-about-media">', $html);
        $this->assertStringContainsString('<img src="/team.jpg" alt="Team" loading="lazy">', $html);
        $this->assertStringContainsString('<p>Most clients stay.</p>', $html);
        $this->assertStringNotContainsString('You talk directly', $html);
        $this->assertElement($html, 'ol', 'oc-timeline oc-timeline--accent');
        $this->assertElement($html, 'h3', 'oc-timeline__title', [], 'First client');
        $this->assertStringContainsString('<time class="oc-timeline__date" datetime="2026">2026</time>', $html);
        $this->assertStringContainsString('oc-timeline__item oc-timeline__item--current', $html);
    }

    public function test_about_timeline_text_slot_with_paragraphs_and_no_accent(): void
    {
        $html = $this->render('<x-oc::block.about-timeline :accent="false" :badge="false"><x-slot:text><p>One.</p><p>Two.</p></x-slot:text></x-oc::block.about-timeline>');

        $this->assertStringContainsString('class="oc-block-about"', $html);
        $this->assertStringNotContainsString('oc-block-about-badge', $html);
        $this->assertStringContainsString('<p>One.</p><p>Two.</p>', $html);
        $this->assertStringNotContainsString('<p> <p>', $html);
        $this->assertStringContainsString('Company 1 is founded', $html);
    }

    public function test_portfolio_grid_two_without_eyebrow_and_lead_with_muted_link(): void
    {
        $html = $this->render('<x-oc::block.portfolio-grid two title-id="cases-title" title="Case studies" :eyebrow="false" :lead="false" link="All cases" link-href="#cases" link-tone="muted" :projects="$projects" />', ['projects' => [
            ['href' => '#c1', 'name' => 'Customer 4', 'type' => 'Platform', 'meta' => 'Healthcare', 'accent' => 'cyan', 'imageAlt' => 'Customer 4, screenshot', 'more' => 'Read the case'],
            ['href' => '#c2', 'name' => 'Customer 5', 'accent' => 'red'],
        ]]);

        $this->assertStringContainsString('class="oc-block-portfolio oc-block-portfolio--two oc-section-pad" aria-labelledby="cases-title"', $html);
        $this->assertStringNotContainsString('oc-eyebrow', $html);
        $this->assertStringNotContainsString('oc-block-portfolio-lead', $html);
        $this->assertElement($html, 'a', 'oc-link-arrow oc-link-arrow--muted', ['href' => '#cases'], 'All cases');
        $this->assertElement($html, 'a', 'oc-project-card oc-accent--cyan', ['href' => '#c1']);
        $this->assertStringContainsString('aria-label="Customer 4, screenshot"', $html);
        $this->assertElement($html, 'span', 'oc-project-card__more', [], 'Read the case');
        $this->assertElement($html, 'a', 'oc-project-card oc-accent--red', ['href' => '#c2']);
        $this->assertStringNotContainsString('Customer 1', $html);
    }

    public function test_portfolio_grid_hides_the_link_with_false(): void
    {
        $html = $this->render('<x-oc::block.portfolio-grid :link="false" />');

        $this->assertStringNotContainsString('oc-link-arrow', $html);
        $this->assertStringContainsString('Customer 1', $html);
    }

    public function test_contact_grid_plain_with_cards_and_only_a_title(): void
    {
        $html = $this->render('<x-oc::block.contact-grid plain title="Reach the right team" title-id="plain-title" :eyebrow="false" :lead="false" :cards="$cards" />', ['cards' => [
            ['title' => 'Sales', 'lines' => [['text' => 'sales@company1.example', 'href' => 'mailto:sales@company1.example'], ['text' => 'Quotes.']]],
            ['title' => 'Office', 'address' => true, 'icon' => 'mdi:map-marker-outline', 'accent' => 'orange', 'lines' => [['text' => 'Company 1'], ['text' => 'Main Street 1']]],
            ['title' => 'Phone', 'icon' => '☎', 'accent' => 'green', 'lines' => [['text' => '+32 3 000 00 00', 'href' => 'tel:+3230000000']]],
        ]]);

        $this->assertStringContainsString('class="oc-block-contact oc-block-contact--plain" aria-labelledby="plain-title"', $html);
        $this->assertStringNotContainsString('oc-eyebrow', $html);
        $this->assertStringNotContainsString('oc-block-contact-lead', $html);
        $this->assertElement($html, 'h2', 'oc-block-contact-heading', ['id' => 'plain-title'], 'Reach the right team');
        $this->assertElement($html, 'a', 'oc-block-contact-line', ['href' => 'mailto:sales@company1.example']);
        $this->assertElement($html, 'p', 'oc-block-contact-line', [], 'Quotes.');
        $this->assertElement($html, 'address', 'oc-block-contact-card');
        $this->assertElement($html, 'span', 'oc-block-contact-title', [], 'Office');
        $this->assertElement($html, 'span', 'oc-block-contact-line', [], 'Main Street 1');
        $this->assertElement($html, 'span', 'oc-product-mark oc-product-mark--sm oc-product-mark--soft oc-accent--green', ['aria-hidden' => 'true'], '☎');
        $this->assertStringNotContainsString('Opening hours', $html);
    }

    public function test_contact_grid_without_head(): void
    {
        $html = $this->render('<x-oc::block.contact-grid :eyebrow="false" :title="false" :lead="false" :cards="[]" />');

        $this->assertStringNotContainsString('oc-block-contact-head', $html);
        $this->assertStringNotContainsString('aria-labelledby', $html);
        $this->assertStringContainsString('<div class="oc-block-contact-grid"> </div>', $html);
    }

    public function test_hero_orbit_floating_marks_and_wider_copy(): void
    {
        $html = $this->render('<x-oc::block.hero-orbit split-lead float :marks="[[\'glyph\' => \'A\', \'accent\' => \'green\'], [\'glyph\' => \'B\', \'accent\' => \'blue\']]" code-title="company.ts" code="export const company = 1;" />');

        $this->assertElement($html, 'div', 'oc-container oc-split oc-split--lead');
        $this->assertElement($html, 'div', 'oc-block-orbit-visual oc-block-orbit-visual--float');
        $this->assertStringContainsString('<span class="oc-block-orbit-mark"><span class="oc-product-mark oc-product-mark--sm oc-accent--green">A</span></span>', $html);
        $this->assertSame(2, substr_count($html, 'class="oc-block-orbit-mark"'));
        $this->assertStringNotContainsString('--oc-orbit-angle', $html);
        $this->assertElement($html, 'span', 'oc-code-window__title', [], 'company.ts');
        $this->assertStringContainsString('<pre class="oc-code-window__body">export const company = 1;</pre>', $html);
        $this->assertStringNotContainsString('products.php', $html);
    }

    public function test_hero_orbit_soft_marks_start_angle_h2_and_center_mark(): void
    {
        $html = $this->render('<x-oc::block.hero-orbit :heading-level="2" duration="30s" soft-marks mark-size="md" :start-angle="45" :marks="[[\'glyph\' => \'A\', \'accent\' => \'green\'], [\'glyph\' => \'B\', \'accent\' => \'orange\'], [\'glyph\' => \'C\', \'accent\' => \'cyan\'], [\'glyph\' => \'D\', \'accent\' => \'violet\', \'angle\' => 300]]" :center-mark="[\'glyph\' => \'E\', \'accent\' => \'blue\']"><x-slot:title>Every module</x-slot:title></x-oc::block.hero-orbit>');

        $this->assertStringNotContainsString('<h1', $html);
        $this->assertElement($html, 'h2', 'oc-display oc-display--md', [], 'Every module');
        $this->assertElement($html, 'div', 'oc-block-orbit-visual', ['style' => '--oc-orbit-duration: 30s;']);
        $this->assertStringContainsString('style="--oc-orbit-angle: 45deg;"><span class="oc-product-mark oc-product-mark--soft oc-accent--green">A</span>', $html);
        $this->assertStringContainsString('style="--oc-orbit-angle: 135deg;"', $html);
        $this->assertStringContainsString('style="--oc-orbit-angle: 300deg;"', $html);
        $this->assertElement($html, 'span', 'oc-block-orbit-center oc-product-mark oc-product-mark--xl oc-accent--blue', ['aria-hidden' => 'true', 'style' => 'inline-size: var(--oc-mark-size);'], 'E');
        $this->assertStringNotContainsString('oc-code-window', $html);
    }

    public function test_hero_orbit_center_slot_wins_over_center_mark(): void
    {
        $html = $this->render('<x-oc::block.hero-orbit :center-mark="[\'glyph\' => \'E\']"><x-slot:center>Mine</x-slot:center></x-oc::block.hero-orbit>');

        $this->assertStringContainsString('<div class="oc-code-window oc-block-orbit-center"> Mine </div>', $html);
        $this->assertStringNotContainsString('oc-product-mark--xl', $html);
    }

    public function test_hero_orbit_false_leaves_out_eyebrow_lead_and_actions(): void
    {
        $html = $this->render('<x-oc::block.hero-orbit :eyebrow="false" :lead="false" :actions="false"><x-slot:title>Every module</x-slot:title></x-oc::block.hero-orbit>');

        $this->assertStringNotContainsString('oc-eyebrow', $html);
        $this->assertStringNotContainsString('oc-lead', $html);
        $this->assertStringNotContainsString('oc-btn', $html);
        $this->assertStringContainsString('Every module', $html);
    }

    public function test_auth_split_photo_and_logo_href(): void
    {
        $html = $this->render('<x-oc::block.auth-split photo="/img/team.webp" logo-href="/" />');

        $this->assertElement($html, 'aside', 'oc-block-authsplit-brand oc-block-authsplit-brand--photo', ['style' => "--oc-authsplit-photo: url('/img/team.webp')"]);
        $this->assertElement($html, 'a', 'oc-block-authsplit-logo', ['href' => '/']);
    }

    public function test_auth_split_form_attributes_for_livewire(): void
    {
        $html = $this->render('<x-oc::block.auth-split :form="[\'wire:submit\' => \'login\', \'novalidate\' => true]" />');

        $this->assertStringContainsString('<form class="oc-block-authsplit-card" action="#" method="post" wire:submit="login" novalidate="novalidate">', $html);
        $this->assertStringContainsString('name="_token"', $html);
    }

    public function test_auth_split_form_can_switch_to_get_without_csrf(): void
    {
        $html = $this->render('<x-oc::block.auth-split :form="[\'method\' => \'get\', \'action\' => \'/search\']" />');

        $this->assertStringContainsString('<form class="oc-block-authsplit-card" action="/search" method="get">', $html);
        $this->assertStringNotContainsString('name="_token"', $html);
    }
}
