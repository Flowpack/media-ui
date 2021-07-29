Neos Media Ui
-------------

This package contains the new interface to manage media in Neos CMS (5.2+).

During the initial development the package will be in the Flowpack namespace and will
later replace `neos/media-browser`. Having two modules allows us currently to install
them both and be able to test them without losing features.

If you want to use Neos, please have a look at the [Neos documentation](http://neos.readthedocs.org/en/stable/).

## Installation

Run the following command to install it:

    composer require flowpack/media-ui 
    
### What changes?

This package will currently add a second media backend module called `Media (new)` and a new 
media selection screen for asset and image editors.
The old media module will still be available until this package replaces it completely with Neos 8.0 (planned).
    
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

## Optional features

### Fast asset usage calculation & unused assets view
           
The default asset usage in Neos is very slow as it is calculated when required. For that it checks 
your whole project where an asset might be used. For the new media ui a new method has been implemented via the package 
[Flowpack.Neos.AssetUsage](https://github.com/Flowpack/Flowpack.Neos.AssetUsage).


The package provides a service that stores all asset usage references in a database table (other storages can be implemented).
After you install the package and its peer dependencies you should therefore update the usage reference index:

    ./flow assetusage:update

You have to do this only once for each instance of the application, f.e. dev / staging / production. 
Afterwards the index will be automatically be kept up-to-date. Make sure you run the command manually again after you run imports or
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
    
### choose assets by rendering media selection iFrame

In Flow applications or "traditional" Neos modules which are not implemented with React, you still sometimes
need to choose assets. The Media UI provides an extra entry point to allow this. The process works roughly as follows:

1) You open an iFrame, where you display the `IFrameMediaChooser` Controller.

2) The user can pick an image.

3) When the image is chosen, a JavaScript callback function in your outer frame (at location `window.NeosMediaBrowserCallbacks.assetChosen`)
   is called.


**How to set this up in detail?**

1) You need to grant the `Flowpack.Media.Ui:IframeMediaChooser` privilegeTarget if you want to use this feature.
   Add the following to your `Policy.yaml`, and adjust the role names as you need it for your use-case:
   
   ```yaml
   roles:
    'Neos.Neos:AbstractEditor':
      privileges:
        -
          privilegeTarget: 'Flowpack.Media.Ui:IframeMediaChooser'
          permission: GRANT
   ```

2) Define the callback function `window.NeosMediaBrowserCallbacks.assetChosen(assetId)`:

   ```js
   window.NeosMediaBrowserCallbacks = {
       assetChosen: (assetId) => {
           // do whatever you need to do here
       }
   }
   ```

3) Open the `IFrameMediaChooser` controller in an iframe. To generate the URL to open,
   you can use the following `UriBuilder` invocation:
   
   ```php
   return $uriBuilder->uriFor('index', [], 'IframeMediaChooser', 'Flowpack.Media.Ui');
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

This module uses React for the implementation of the UI. Currently all components are built with hooks and
integrate with other plugins via hooks.
This gives a lot of flexibility for future extensions and during the current prototype phase of this package.

### State management

#### Query variables

Query related state variables are stored via GraphQL Mutations in the Apollo Client Cache.
Some of those variables are then persisted into the localstorage of the browser.

#### Resolved query result state

The MediaUI provider currently stores the results in its state and provides them to
all child components via provider values.
This will be probably changed to only set shared states than all components can access.

#### Component states

Component state should be stored with React hooks.

#### Shared component states

The shared component states are current implemented via React Recoil atoms and selectors.
See the `state` folders in the various modules in `Resources/Private/JavaScript` for examples.

Those should be used every time multiple components share a state that is not relevant for
the GraphQL queries.

## Fund the development

We need your help to develop this package. You can find supporter badges on the official [Neos funding site](https://neosfunding.sandstorm.de/en).

## Contributing

To start with development make sure you have `nvm` and `yarn` installed and run the following command in the packages folder:

    yarn
    
### Running the standalone dev server without Neos

The dev server allows to run the module without a Neos instance.
This is also the basis for running most tests and implementing new features.

    yarn dev
    
Enter `localhost:8000` in your browser and you will have a running media ui instance without neos.

### Building the module assets

This will create a production build of the module assets.

    yarn build
    
### Recompile files during development

The following command will recompile and reload the media module when changes to the scripts happen:

    yarn watch
    
#### Only watch the backend module code

    yarn watch:module
    
#### Only watch the UI plugin

    yarn watch:editor

### Check for code quality

Run the following command to verify the TypeScript files:

    yarn lint
    
### Run e2e tests

First start the dev server via `yarn dev` and the run the following command to execute all end-to-end tests: 

    yarn e2e

The test configuration is defined in `.testcaferc.json`. Change the options there if you want to use
a different browser or make some other changes.

### Run phpstan for codestyle checks

First make sure you have [phpstand](https://phpstan.org) installed.

When the package is installed in a Neos distribution:

    phpstan analyse --autoload-file ../../Libraries/autoload.php
    
When the package is standalone

    composer run phpstan 
    
### Other development hints

#### Register additional icons

Font Awesome icons are registered in `Resources/Private/JavaScript/src/lib/FontAwesome`.
This way the bundle size is kept to a minimum.

#### Patches

Several [patches](patches) are applied during installation via [patch-package](https://github.com/ds300/patch-package).
Additional patches can be generated and stored there with the same tool if necessary.

#### Connection between the backend module and UI plugin

The codebase is 99% reused between the backend module and the asset selection in the Neos UI.
Make sure changes work in both worlds or provide a compatiblity layer in the corresponding initialisation.
    
### Development helpers

* [Extension](https://github.com/apollographql/apollo-client-devtools) for debugging GraphQL schema and queries in the browser
* [Plugin](https://plugins.jetbrains.com/plugin/8097-js-graphql) for code completion and helpers in PHPStorm

## License

See [license](LICENSE).
