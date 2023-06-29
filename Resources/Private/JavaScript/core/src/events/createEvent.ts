import PubSub from 'pubsub-js';

/**
 * Wraps the used pubsub library and exposes the methods we need
 */
export function createEvent<Payload = any>(topic: Topic): MediaEvent<Payload> {
    const event: any = (payload: Payload) => {
        event.publish(payload);
    };
    /**
     * Subscribe to the event
     * @returns a token which can be used to unsubscribe
     */
    event.subscribe = (subscriber: Subscriber<Payload>): Token => {
        return PubSub.subscribe(topic, subscriber);
    };
    /**
     * Unsubscribe from the event
     * @param subscriber a function which was previously subscribed or a token which was returned by `subscribe`
     */
    event.unsubscribe = (subscriber: Subscriber<Payload> | Token) => {
        PubSub.unsubscribe(subscriber);
    };
    /**
     * Publish event and call all subscribers with payload
     * @returns true if the event has been published to at least one subscriber
     */
    event.publish = (payload: Payload): boolean => {
        return PubSub.publish(topic, payload);
    };
    return event;
}
