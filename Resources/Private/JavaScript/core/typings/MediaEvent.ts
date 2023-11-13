type Topic = string;
type Token = string;
type Subscriber<A> = (topic: Topic, payload: A) => void;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface MediaEvent<E> {
    (payload: E): E;
    subscribe(subscriber: Subscriber<E>): Token;
    unsubscribe(subscriber: Subscriber<E> | Token): void;
    publish(payload: E): boolean;
}
