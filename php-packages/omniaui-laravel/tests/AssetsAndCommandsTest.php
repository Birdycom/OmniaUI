<?php

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use Illuminate\Filesystem\Filesystem;
use Omniacss\Laravel\Assets;

class AssetsAndCommandsTest extends TestCase
{
    private string $tmp;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tmp = sys_get_temp_dir().'/omniacss-'.bin2hex(random_bytes(4));
        (new Filesystem)->makeDirectory($this->tmp, 0777, true);
        $this->app->setBasePath($this->tmp);
        (new Filesystem)->makeDirectory($this->tmp.'/resources', 0777, true);
        (new Filesystem)->makeDirectory($this->tmp.'/config', 0777, true);
    }

    protected function tearDown(): void
    {
        (new Filesystem)->deleteDirectory($this->tmp);

        parent::tearDown();
    }

    public function test_cdn_directive_outputs_link_tags(): void
    {
        config()->set('omniacss.source', 'cdn');
        config()->set('omniacss.packages.blocks', true);
        config()->set('omniacss.version', '0.4.0');

        $html = $this->render('@omniacss');

        $this->assertStringContainsString('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@birdycom/omniacss@0.4.0/dist/omnia.starter.min.css">', $html);
        $this->assertStringContainsString('@birdycom/omniaui@0.4.0/dist/components.min.css', $html);
        $this->assertStringContainsString('@birdycom/omniaui-blocks@0.4.0/dist/blocks.min.css', $html);
    }

    public function test_directive_argument_overrides_source_and_public_uses_asset_path(): void
    {
        config()->set('omniacss.source', 'cdn');
        config()->set('omniacss.packages.blocks', false);

        $html = $this->render("@omniacss('public')");

        $this->assertStringContainsString('vendor/omniacss/omnia.starter.min.css', $html);
        $this->assertStringContainsString('vendor/omniacss/components.min.css', $html);
        $this->assertStringNotContainsString('blocks.min.css', $html);
        $this->assertStringNotContainsString('jsdelivr', $html);
    }

    public function test_unknown_source_throws(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        Assets::render('nope');
    }

    public function test_install_dry_run_changes_nothing(): void
    {
        file_put_contents($this->tmp.'/vite.config.js', '');
        file_put_contents($this->tmp.'/package.json', json_encode(['devDependencies' => ['vite' => '^6.0.0']], JSON_PRETTY_PRINT));

        $this->artisan('omniacss:install', ['--dry-run' => true])
            ->expectsOutputToContain('would add @birdycom/omniacss, @birdycom/omniaui')
            ->assertSuccessful();

        $this->assertStringNotContainsString('@omniacss', file_get_contents($this->tmp.'/package.json'));
        $this->assertFileDoesNotExist($this->tmp.'/resources/css/app.css');
    }

    public function test_install_adds_dependencies_and_css_imports(): void
    {
        file_put_contents($this->tmp.'/vite.config.js', '');
        file_put_contents($this->tmp.'/package.json', json_encode(['devDependencies' => ['vite' => '^6.0.0']], JSON_PRETTY_PRINT));
        mkdir($this->tmp.'/resources/css', 0777, true);
        file_put_contents($this->tmp.'/resources/css/app.css', "body { margin: 0; }\n");

        $this->artisan('omniacss:install', ['--blocks' => true])->assertSuccessful();

        $package = json_decode(file_get_contents($this->tmp.'/package.json'), true);
        $this->assertSame('^'.\Omniacss\Laravel\OmniacssServiceProvider::VERSION, $package['devDependencies']['@birdycom/omniacss']);
        $this->assertArrayHasKey('@birdycom/omniaui', $package['devDependencies']);
        $this->assertArrayHasKey('@birdycom/omniaui-blocks', $package['devDependencies']);

        $css = file_get_contents($this->tmp.'/resources/css/app.css');
        $this->assertStringStartsWith('@import "@birdycom/omniacss";', $css);
        $this->assertStringContainsString('@import "@birdycom/omniaui-blocks";', $css);
        $this->assertStringContainsString('body { margin: 0; }', $css);

        // running again is idempotent
        $this->artisan('omniacss:install', ['--blocks' => true])->expectsOutputToContain('already present')->assertSuccessful();
        $this->assertSame(1, substr_count(file_get_contents($this->tmp.'/resources/css/app.css'), '@birdycom/omniacss'));
    }

    public function test_publish_components_copies_files(): void
    {
        $this->artisan('omniacss:publish-components', ['names' => ['button', 'accordion', 'block.hero']])->assertSuccessful();

        $base = $this->tmp.'/resources/views/components/oc';
        $this->assertFileExists($base.'/button.blade.php');
        $this->assertFileExists($base.'/accordion.blade.php');
        $this->assertFileExists($base.'/accordion/item.blade.php');
        $this->assertFileExists($base.'/block/hero.blade.php');
        $this->assertFileDoesNotExist($base.'/card.blade.php');
    }

    public function test_publish_all_and_unknown_name(): void
    {
        $this->artisan('omniacss:publish-components', ['--all' => true])->assertSuccessful();
        $this->assertFileExists($this->tmp.'/resources/views/components/oc/block/app-shell.blade.php');

        $this->artisan('omniacss:publish-components', ['names' => ['does-not-exist']])->assertFailed();
    }
}
