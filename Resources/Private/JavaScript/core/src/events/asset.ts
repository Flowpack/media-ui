import { createEvent } from './createEvent';
import { AssetIdentity } from '../interfaces';

const assetCreatedEvent = createEvent<AssetIdentity>('ASSET_CREATED');
const assetDeletedEvent = createEvent<AssetIdentity>('ASSET_DELETED');

export { assetCreatedEvent, assetDeletedEvent };
