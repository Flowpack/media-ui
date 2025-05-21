import { Selector } from 'testcafe';
import { ReactSelector } from 'testcafe-react-selectors';

class Page {
    public collectionTree: Selector;
    public thumbnails: Selector;
    public assetCollections: Selector;
    public pagination: Selector;
    public assetCount: Selector;
    public tags: Selector;
    public sortOrder: Selector;
    public lightbox: Selector;
    public currentSelection: Selector;
    public tagSelection: Selector;
    public assetInspector: Selector;
    public inspectorActions: Selector;
    public assetSourceList: Selector;
    public assetsFilter: Selector;

    constructor() {
        // Collection tree
        this.collectionTree = ReactSelector('AssetCollectionTree');
        this.assetCollections = this.collectionTree.findReact('AssetCollectionTreeNode');
        this.tags = this.assetCollections.withText('All').findReact('TagTreeNode');

        // Asset sources
        this.assetSourceList = ReactSelector('AssetSourceList');

        // Main area
        this.thumbnails = ReactSelector('Thumbnail');
        this.lightbox = ReactSelector('ReactImageLightbox');

        // Bottom bar
        this.assetCount = ReactSelector('AssetCount');

        // Pagination
        this.pagination = ReactSelector('Pagination');

        // Sorting
        this.sortOrder = ReactSelector('SortOrderSelector');

        // Filtering
        this.assetsFilter = ReactSelector('AssetsFilter');

        // Right sidebar
        this.assetInspector = ReactSelector('AssetInspector');
        this.currentSelection = ReactSelector('CurrentSelection');
        this.tagSelection = this.assetInspector.findReact('TagSelectBox');
        this.inspectorActions = this.assetInspector.findReact('Actions');
    }

    public get firstThumbnail() {
        return this.thumbnails.nth(0);
    }

    public get firstCollection() {
        return this.assetCollections.nth(0);
    }

    public get paginationItems() {
        // FIXME: The ReactSelector does not work in the CI build, so we use a CSS selector as workaround for now
        return this.pagination.find('li');
    }

    public get sortingSelection() {
        return this.sortOrder.findReact('SelectBox');
    }

    public get sortingButton() {
        return this.sortOrder.findReact('IconButton');
    }

    public get assetTypeFilter() {
        return this.assetsFilter.findReact('AssetTypeFilter');
    }

    public get mediaTypeFilter() {
        return this.assetsFilter.findReact('MediaTypeFilter');
    }

    // FIXME: This is a workaround for issues with selecting elements inside a portal which is used by the UI react components for dropdowns
    public getDropdownElement(label: string): Selector {
        return Selector('ul[class*="dropDown__contents"]').find('[role="button"]').withText(label);
    }
}

export default new Page();
