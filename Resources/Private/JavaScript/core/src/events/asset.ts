import { createEvent } from './createEvent';

const assetCreatedEvent = createEvent<AssetIdentity>('ASSET_CREATED');
const assetRemovedEvent = createEvent<AssetIdentity>('ASSET_REMOVED');
const assetUpdatedEvent = createEvent<AssetIdentity>('ASSET_UPDATED');

export { assetCreatedEvent, assetRemovedEvent, assetUpdatedEvent };
