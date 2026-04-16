import { Selector } from 'testcafe';

class Page {
    public collectionTree: Selector;
    public collectionTreeToolbar: Selector;
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
    public clipboardToggle: Selector;
    public selectedThumbnails: Selector;
    public multiSelectionBadges: Selector;
    public multiSelectionClearButton: Selector;
    public titleInput: Selector;
    public captionInput: Selector;
    public copyrightInput: Selector;
    public applyButton: Selector;
    public confirmDialog: Selector;
    public collectionSelectBox: Selector;
    public tasksDropdownHeader: Selector;
    public tasksDropdownContents: Selector;

    constructor() {
        // Asset sources
        this.assetSourceList = Selector('.AssetSourceList_assetSourceList');

        // Collection tree
        this.collectionTree = Selector('.AssetCollectionTree_assetCollectionTree');
        this.collectionTreeToolbar = Selector('.AssetCollectionTree_toolbar');
        this.assetCollections = this.collectionTree.find('.AssetCollectionTreeNode');

        // Tags are nested elements under the "All" collection
        this.tags = this.assetCollections.withText('All').parent().find('.TagTreeNode');

        // Main area
        this.thumbnails = Selector('.Thumbnail_thumbnail');
        this.lightbox = Selector('.ril-outer'); // ReactImageLightbox uses this class

        // Bottom bar
        this.assetCount = Selector('.AssetCount_assetCount');
        this.clipboardToggle = Selector('.ClipboardToggle_clipboardToggle');

        // Pagination
        this.pagination = Selector('nav[class*="pagination"]');

        // Sorting
        this.sortOrder = Selector('.SortOrderSelector_sortingState');

        // Filtering
        this.assetsFilter = Selector('.AssetsFilter_assetsFilter');

        // Right sidebar
        this.assetInspector = Selector('.InspectorContainer_inspector');
        this.currentSelection = Selector('div[class*="currentSelection"]');
        this.tagSelection = this.assetInspector.find('.TagSelectBox_tagSelectBox');
        this.inspectorActions = this.assetInspector.find('.Actions_actions');

        // Multi-selection
        this.selectedThumbnails = Selector('.Thumbnail_selected');
        const multiSelectionWrapper = Selector('.CurrentMultiSelection_currentMultiSelection');
        this.multiSelectionBadges = multiSelectionWrapper.find('.CurrentMultiSelection_item');
        this.multiSelectionClearButton = multiSelectionWrapper.find('[title="Clear selection"]');

        // Property inspector
        this.titleInput = this.assetInspector.find('input[name="label"]');
        this.captionInput = this.assetInspector.find('textarea[name="caption"]');
        this.copyrightInput = this.assetInspector.find('textarea[name="copyrightNotice"]');
        this.applyButton = this.assetInspector.find('button').withText('Apply');
        this.confirmDialog = Selector('div[class*="dialog"]');
        this.collectionSelectBox = this.assetInspector.find('.collectionSelectBox');

        // Tasks dropdown
        this.tasksDropdownHeader = this.assetInspector.find('.Tasks_dropdownHeader');
        this.tasksDropdownContents = Selector('ul[class*="dropDown__contents"]');
    }

    public confirmDialogButton(label: string): Selector {
        return this.confirmDialog.find('button').withText(label);
    }

    public tasksDropdownItem(label: string): Selector {
        return this.tasksDropdownContents.find('li').withText(label);
    }

    public get firstThumbnail() {
        return this.thumbnails.nth(0);
    }

    public get firstThumbnailLabel() {
        return this.firstThumbnail.find('.AssetLabel_assetLabel');
    }

    public get firstCollection() {
        return this.assetCollections.nth(0);
    }

    public get paginationItems() {
        return this.pagination.find('li');
    }

    public get sortingSelection() {
        return this.sortOrder.find('div[class*="selectBox"]');
    }

    public get sortingButton() {
        return this.sortOrder.find('button');
    }

    public get assetTypeFilter() {
        return this.assetsFilter.find('.AssetsFilter_typeFilter');
    }

    public get mediaTypeFilter() {
        return this.assetsFilter.find('div[class*="mediaTypeFilter"]');
    }

    public getDropdownElement(label: string): Selector {
        return Selector('ul[class*="dropDown__contents"]').find('[role="button"]').withText(label);
    }

    public get createTagDialog(): Selector {
        return Selector('#CreateTagDialog');
    }
}

export default new Page();
