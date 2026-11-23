<?php

// File: config/omniacss.php | Map: source -> cdn -> public -> vite -> packages -> blade prefix -> webicons

return [

    /*
    |--------------------------------------------------------------------------
    | Stylesheet source used by the @omniacss directive
    |--------------------------------------------------------------------------
    |
    | vite   - your own Vite entry (resources/css/app.css imports the packages)
    | cdn    - jsDelivr links to the minified @birdycom/* builds
    | public - files copied to public/<public.path> (omniacss:install --source=public)
    |
    */
    'source' => env('OMNIACSS_SOURCE', 'vite'),

    /*
    |--------------------------------------------------------------------------
    | Packages to load
    |--------------------------------------------------------------------------
    |
    | core       - utilities and tokens (@birdycom/omniacss)
    | components - component CSS (@birdycom/omniaui)
    | blocks     - page block CSS (@birdycom/omniaui-blocks)
    |
    */
    'packages' => [
        'core' => true,
        'components' => true,
        'blocks' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Version used for CDN links (npm version or range)
    |--------------------------------------------------------------------------
    */
    'version' => env('OMNIACSS_VERSION', '0.17.1'),

    'cdn' => [
        'base' => 'https://cdn.jsdelivr.net/npm',
    ],

    'public' => [
        // Relative to public/. Used for asset('<path>/<file>.min.css').
        'path' => 'vendor/omniacss',
    ],

    'vite' => [
        // Entry that imports the OmniaCSS packages.
        'entries' => ['resources/css/app.css'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Blade
    |--------------------------------------------------------------------------
    |
    | prefix - component prefix: <x-oc::button>. Published components
    |          (omniacss:publish-components) are used as <x-oc.button>.
    |
    */
    'prefix' => 'oc',

    /*
    |--------------------------------------------------------------------------
    | Webicons (<x-oc::webicon name="mdi:home" />)
    |--------------------------------------------------------------------------
    |
    | Inline SVG from files on disk, never fetched. Looked up in this order:
    | files - subset files made with "npx omniaui webicons --scan resources --out resources/webicons.json"
    |         (fast: only the icons you use), or whole Iconify JSON sets
    | path  - the folder with the Iconify sets, <path>/<set>/icons.json (default: node_modules/@iconify-json)
    | then the small built-in set of OmniaUI (check, chevrons, close, theme icons, a few flags).
    |
    */
    'webicons' => [
        'files' => [],
        'path' => env('OMNIACSS_WEBICONS_PATH'),
    ],

];
