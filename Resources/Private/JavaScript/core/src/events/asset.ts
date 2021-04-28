import { createEvent } from './createEvent';
import { AssetIdentity } from '../interfaces';

const assetCreatedEvent = createEvent<AssetIdentity>('ASSET_CREATED');
const assetRemovedEvent = createEvent<AssetIdentity>('ASSET_REMOVED');
const assetUpdatedEvent = createEvent<AssetIdentity>('ASSET_UPDATED');

export { assetCreatedEvent, assetRemovedEvent, assetUpdatedEvent };
