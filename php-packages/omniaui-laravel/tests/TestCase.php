<?php

declare(strict_types=1);

namespace Omniacss\Laravel\Tests;

use DOMDocument;
use Illuminate\Support\Facades\Blade;
use Omniacss\Laravel\OmniacssServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected function getPackageProviders($app): array
    {
        return [OmniacssServiceProvider::class];
    }

    /** Renders a Blade string and collapses whitespace so assertions stay readable. */
    protected function render(string $blade, array $data = []): string
    {
        return trim(preg_replace('/\s+/', ' ', Blade::render($blade, $data)));
    }

    /**
     * Asserts that an element <tag> exists whose class attribute is exactly $class (order-sensitive)
     * and which carries every attribute in $attrs (null = attribute must exist, any value).
     *
     * @param  array<string, string|null>  $attrs
     */
    protected function assertElement(string $html, string $tag, string $class, array $attrs = [], ?string $text = null): void
    {
        $dom = new DOMDocument;
        @$dom->loadHTML('<?xml encoding="utf-8"?><body>'.$html.'</body>', LIBXML_NOERROR | LIBXML_NOWARNING);

        $seen = [];
        foreach ($dom->getElementsByTagName($tag) as $el) {
            $seen[] = $el->getAttribute('class');
            if ($el->getAttribute('class') !== $class) {
                continue;
            }
            foreach ($attrs as $name => $value) {
                if (! $el->hasAttribute($name) || ($value !== null && $el->getAttribute($name) !== $value)) {
                    continue 2;
                }
            }
            if ($text !== null && trim(preg_replace('/\s+/', ' ', $el->textContent)) !== $text) {
                continue;
            }

            $this->addToAssertionCount(1);

            return;
        }

        $this->fail("No <{$tag}> with class \"{$class}\" found (classes seen: ".implode(' | ', $seen).') in: '.$html);
    }
}
