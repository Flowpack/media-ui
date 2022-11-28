import { ReactSelector } from 'testcafe-react-selectors';

class Page {
    public collectionTree: Selector;
    public thumbnails: Selector;
    public assetCollections: Selector;
    public pagination: Selector;
    public paginationItems: Selector;
    public assetCount: Selector;
    public tags: Selector;
    public sortOrder: Selector;
    public sortingButton: Selector;
    public sortingSelection: Selector;
    public lightbox: Selector;
    public currentSelection: Selector;
    public tagSelection: Selector;
    public assetInspector: Selector;
    public inspectorActions: Selector;
    public assetSourceList: Selector;

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
        this.paginationItems = this.pagination.findReact('PaginationItem');

        // Sorting
        this.sortOrder = ReactSelector('SortOrderSelector');
        this.sortingSelection = this.sortOrder.findReact('SelectBox');
        this.sortingButton = this.sortOrder.findReact('IconButton');

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
        return this.thumbnails.nth(0);
    }
}

export default new Page();
