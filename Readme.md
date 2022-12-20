Neos Media UI
-------------

This package contains the new interface to manage media in Neos CMS (7.3+).

During the initial development the package will be in the Flowpack namespace and will
later replace `neos/media-browser`. Having two modules allows us to currently install
them both and be able to test them without losing features.

If you want to use Neos, please have a look at the [Neos documentation](http://neos.readthedocs.org/en/stable/).

## Installation

Run the following command to install it:

    composer require flowpack/media-ui 
    
### What changes?

This package will currently add a second media backend module called `Media (new)` and a new 
media selection screen for asset and image editors.
The old media module will still be available until this package replaces it completely with a later, major
release of Neos.

#### Disabling the old Media module

If you don't need the old Media module, you can disable it in `Settings.yaml`:

```yaml
Neos:
  Neos:
    modules:
      management:
        submodules:
          media:
            # Disable the default media module and use the new media ui
            enabled: false
          mediaui:
            # Moves the new module to top
            position: start
```
    
#### Disabling the new media selection

If you want to use this package in a real project you might want to 
disable the new media selection if it doesn't work as expected.
You can do this by adding the following setting to your `Settings.yaml`:
          
```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        Flowpack.Media.Ui:
          useNewMediaSelection: false
``` 

#### Hierarchical asset collections

This package will enable a hierarchical asset collection structure via AOP (until the feature is in the Neos core).
With this feature you can add a collection in another collection or assign existing ones to another and
this way create a structure comparable with folders in your computer's file system.

It is recommended to enable the feature flag `limitToSingleAssetCollectionPerAsset` (see below) for a better experience - 
see below. 

## Optional features

### Limit assets to be only assigned to one AssetCollection

By limiting assets to only be in one collection you can enforce a more folder-like experience:

```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        Flowpack.Media.Ui:
          # Only allow a single asset collection selection per asset to treat collection like folders
          limitToSingleAssetCollectionPerAsset: true
```

### Fast asset usage calculation & unused assets view
           
The default asset usage in Neos is very slow as it is calculated when at runtime. For that it checks 
your whole project where an asset might be used. For the new Media UI, a new method has been implemented via the package 
[Flowpack.Neos.AssetUsage](https://github.com/Flowpack/Flowpack.Neos.AssetUsage).

The package provides a service that stores all asset usage references in a database table (other storages can be implemented).
After installing the package and its peer dependencies, you should therefore update the usage reference index:

    ./flow assetusage:update

You have to do this only once for each instance of the application, f.e. dev / staging / production. 
Afterwards the index will automatically be kept up-to-date. Make sure you run the command manually again after you run imports or
change the content repository in any other unusual way. This will clean up any outdated usage.
                                                                                
You can now enable the feature via the following setting:

```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        Flowpack.Media.Ui:
          queryAssetUsage: true
```

Now the "delete" action for assets will be disabled if an asset is in use, and the filter dropdown contains a new item "Unused". 
Selecting it will switch the main view to show all unused assets.

### Customise usage details

The usage calculation mechanism in Neos already supports custom usage providers via the `AssetUsageStrategyInterface`.
If your strategy implements this interface, the Media UI will show the usages separately for each strategy.

By also implementing the `UsageDetailsProviderInterface` you can provide a custom label for the strategy
and also custom headers and values for each entry.

### Show similar assets

This package provides a `SimilarAssetStrategyInterface`. 
Other packages can implement this interface and provide a list of
other assets based on a given asset.

Example for this could be perceptually similar images or assets with similar filenames.

Given that you installed a package with a strategy, enable the feature in the ui with the following setting:

```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        Flowpack.Media.Ui:
          showSimilarAssets: true
```

### Disable asset redirect checkbox

If you don't want to or can't use the automatic generation of redirects for assets, you can disable it with the following setting:

```yaml
Neos:
  Neos:
    Ui:
      frontendConfiguration:
        Flowpack.Media.Ui:
          createAssetRedirectsOption: false
```

### Add additional field to the upload dialog

You can add additional fields to the upload dialog to add property data while uploading a file. Add the moment the fields title, caption and copyright notice can be used. 
This additional the fields can be configured to be required for the upload. See the following settings example:


```yaml
Flowpack:
  Media:
    Ui:
      upload:
        properties:
          copyrightNotice:
            show: true
            required: true
          title:
            show: true
            required: false
          caption:
            show: true
            required: false
```
    
## Architecture

### API / GraphQL

This module introduces a GraphQL API for the Neos Media system.
The API is open and can be reused for custom apps. A valid Neos backend user is required to access it,
but you can define custom policies and an authentication provider to allow access without a user 
and f.e. use a token based authentication.

The API is public and will be stable with the 1.0.0 release.
Until then, changes might still happen.

#### Schema

The GraphQL schema can be found [here](Resources/Private/GraphQL/schema.root.graphql). 

### Interface

This module uses React for the implementation of the UI. Currently, all components are built with hooks and
integrate with other plugins via hooks.
This gives a lot of flexibility for future extensions and during the current prototype phase of this package.

### State management

#### Query variables

Query related state variables are stored via GraphQL Mutations in the Apollo Client Cache.
Some of those variables are then persisted into the localstorage of the browser.

#### Resolved query result state

The MediaUI provider currently stores the results in its state and provides them to
all child components via provider values.
This will probably be changed to only set shared states that all components can access.

#### Component states

Component state should be stored with React hooks.

#### Shared component states

The shared component states are current implemented via React Recoil atoms and selectors.
See the `state` folders in the various modules in `Resources/Private/JavaScript` for examples.

Those should be used every time multiple components share a state that is not relevant for
the GraphQL queries.

## Fund the development

We need your help to develop this package. You can find supporter badges on the official [Neos funding site](https://shop.neos.io/neosfunding/onetime-badges/).

## Contributing

To start with development, make sure you have `nvm` and `yarn` installed and run the following command in the package's folder:

```console
yarn
```
    
### Running the standalone dev server without Neos

The dev server allows to run the module without a Neos instance.
This is also the basis for running most tests and implementing new features.

```console
yarn dev
```
    
Enter `localhost:8000` in your browser, and you will have a running media ui instance without Neos.

### Building the module assets

This will create a production build of the module assets.

```console
yarn build
```
    
### Recompile files during development

The following command will recompile and reload the media module when changes to the scripts happen:

```console
yarn watch
```
    
#### Only watch the backend module code

```console
yarn watch:module
```
    
#### Only watch the UI plugin

```console
yarn watch:editor
```

### Check for code quality

Run the following command to verify the TypeScript files:

```console
yarn lint
```
    
### Run e2e tests

First start the dev server via `yarn dev` and the run the following command to execute all end-to-end tests: 

```console
yarn e2e
```    

The test configuration is defined in `.testcaferc.json`.

To use a different browser, you can define it when running the tests:

```console
yarn test firefox
```

Check out the [Testcafe documentation](https://testcafe.io/documentation/402828/guides/intermediate-guides/browsers#browser-support) for more information and supported browsers.

### Run phpstan for codestyle checks

First, make sure you have [phpstan](https://phpstan.org) installed.

If the package is installed in a Neos distribution:

```console
composer run codestyle
```
    
If the package is standalone

```console
composer run codestyle:ci
``` 

### Run PHPUnit for unit tests

If the package is installed in a Neos distribution:

```console
composer run test
```
    
If the package is standalone

```console
composer run test:ci
``` 
    
### Other development hints

#### Before you commit

Please don't add the compiled frontend assets to your commits/PRs.

We will build the assets when a new release is due.

If you want to build the assets for a release, use the following command to prevent cache issues:

```console
yarn build:no-cache
```

#### Register additional icons

Font Awesome icons are registered in `Resources/Private/JavaScript/src/lib/FontAwesome`.
This way the bundle size is kept to a minimum.

#### Patches

Several [patches](patches) are applied during installation via [patch-package](https://github.com/ds300/patch-package).
Additional patches can be generated and stored there with the same tool if necessary.

#### Connection between the backend module and UI plugin

The codebase is 99% reused between the backend module and the asset selection in the Neos UI.
Make sure changes work in both worlds or provide a compatibility layer in the corresponding initialisation.
    
### Development helpers

* [Extension](https://github.com/apollographql/apollo-client-devtools) for debugging GraphQL schema and queries in the browser
* [Plugin](https://plugins.jetbrains.com/plugin/8097-js-graphql) for code completion and helpers in PHPStorm

## License

See [license](LICENSE).
