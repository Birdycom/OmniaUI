<?php

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use Illuminate\Support\Facades\Blade;
use PHPUnit\Framework\Attributes\DataProvider;

class BlocksTest extends TestCase
{
    public function test_hero_block_renders_default_markup_and_merges_class(): void
    {
        $html = $this->render('<x-oc::block.hero class="my-hero" />');

        $this->assertStringContainsString('class="oc-block-hero my-hero"', $html);
        $this->assertStringContainsString('class="oc-block-hero-badge"', $html);
        $this->assertStringContainsString('Build faster with OmniaCSS', $html);
    }

    public function test_hero_named_slots_override_defaults(): void
    {
        $html = $this->render('<x-oc::block.hero><x-slot:title>Custom title</x-slot:title><x-slot:actions><a class="oc-btn" href="/x">Go</a></x-slot:actions></x-oc::block.hero>');

        $this->assertStringContainsString('Custom title', $html);
        $this->assertStringNotContainsString('Build faster with OmniaCSS', $html);
        $this->assertStringContainsString('<a class="oc-btn" href="/x">Go</a>', $html);
        $this->assertStringNotContainsString('View docs', $html);
        // untouched slots keep the snippet content
        $this->assertStringContainsString('New in v0.1.6', $html);
    }

    public function test_app_shell_uses_height_prop_and_default_slot(): void
    {
        $html = $this->render('<x-oc::block.app-shell height="30rem"><h1>Page</h1></x-oc::block.app-shell>');

        $this->assertStringContainsString('class="oc-block-shell"', $html);
        $this->assertStringContainsString('style="--oc-block-shell-height: 30rem"', $html);
        $this->assertStringContainsString('<main class="oc-block-shell-content"> <h1>Page</h1> </main>', $html);
        $this->assertStringContainsString('<aside class="oc-sidebar "', $html);
    }

    public function test_app_shell_sidebar_slot_replaces_the_default_sidebar(): void
    {
        $html = $this->render('<x-oc::block.app-shell><x-slot:sidebar><nav id="mine"></nav></x-slot:sidebar></x-oc::block.app-shell>');

        $this->assertStringContainsString('<nav id="mine"></nav>', $html);
        $this->assertStringNotContainsString('OmniaDesk', $html);
    }

    public function test_form_page_posts_with_csrf(): void
    {
        $html = $this->render('<x-oc::block.form-page action="/save" />');

        $this->assertStringContainsString('class="oc-block-formpage"', $html);
        $this->assertStringContainsString('action="/save"', $html);
        $this->assertStringContainsString('method="post"', $html);
        $this->assertStringContainsString('name="_token"', $html);
    }

    public function test_data_table_slots(): void
    {
        $html = $this->render('<x-oc::block.data-table><x-slot:title>Invoices</x-slot:title></x-oc::block.data-table>');

        $this->assertStringContainsString('class="oc-card oc-block-datatable"', $html);
        $this->assertMatchesRegularExpression('/>\s*Invoices\s*</', $html);
        $this->assertStringContainsString('class="oc-table-wrap"', $html);
    }

    public function test_wizard_dialog_builds_stepper_from_props(): void
    {
        $html = $this->render('<x-oc::block.wizard-dialog id="w" :steps="[\'A\', \'B\']" :current="2" trigger="Open">Step</x-oc::block.wizard-dialog>');

        $this->assertStringContainsString('commandfor="w">Open</button>', $html);
        $this->assertStringContainsString('class="oc-modal-content oc-modal-content--xl"', $html);
        $this->assertStringContainsString('oc-stepper-item oc-stepper-item--active', $html);
        $this->assertStringContainsString('<div class="oc-block-wizard-step">Step</div>', $html);
    }

    #[DataProvider('allBlocks')]
    public function test_every_block_renders_with_its_root_class(string $name, string $rootClass): void
    {
        $html = $this->render("<x-oc::block.{$name} />");

        $this->assertStringContainsString($rootClass, $html);
        $this->assertDoesNotMatchRegularExpression('/\{\{|@@|@if|@endif|@else/', $html);
    }

    /** Without slots a block renders the packages/blocks snippet markup unchanged (whitespace aside). */
    #[DataProvider('snippetBlocks')]
    public function test_block_matches_its_snippet(string $name): void
    {
        $snippet = file_get_contents(dirname(__DIR__, 3)."/packages/blocks/blocks/{$name}.html");
        $snippet = preg_replace('/^<!--.*?-->/s', '', $snippet);
        $snippet = str_replace(' style="--oc-block-shell-height: 30rem"', '', $snippet);

        $strip = fn (string $html): string => preg_replace('/\s+/', '', $html);

        $this->assertSame($strip($snippet), $strip(Blade::render("<x-oc::block.{$name} />")));
    }

    public static function snippetBlocks(): array
    {
        $out = [];
        foreach (self::allBlocks() as $name => $_) {
            // form blocks add a CSRF field, the wizard builds its stepper from props
            if (! in_array($name, ['form-page', 'auth-split', 'wizard-dialog'], true)) {
                $out[$name] = [$name];
            }
        }

        return $out;
    }

    public static function allBlocks(): array
    {
        $roots = [
            'wizard-dialog' => 'oc-block-wizard',
        ];
        $source = dirname(__DIR__, 3).'/packages/blocks/blocks';
        $out = [];

        foreach (glob(dirname(__DIR__).'/resources/views/components/block/*.blade.php') as $file) {
            $name = basename($file, '.blade.php');
            $root = $roots[$name] ?? null;

            if ($root === null) {
                $snippet = is_file("{$source}/{$name}.html") ? file_get_contents("{$source}/{$name}.html") : '';
                $root = preg_match('/^<[a-z]+ class="([^"\s]+)/m', preg_replace('/^<!--.*?-->/s', '', $snippet), $m) ? $m[1] : 'oc-';
            }

            $out[$name] = [$name, $root];
        }

        return $out;
    }
}
