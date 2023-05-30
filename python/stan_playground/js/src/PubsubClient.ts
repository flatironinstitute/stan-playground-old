import PubNub from 'pubnub'

class PubsubClient {
    #pubnubClient: PubNub
    constructor(subscriptionInfo: any, onMessage: (message: any) => void) {
        if (subscriptionInfo.pubnubSubscribeKey) {
            this.#pubnubClient = new PubNub({
                subscribeKey: subscriptionInfo.pubnubSubscribeKey,
                userId: subscriptionInfo.pubnubUserId
            })
            this.#pubnubClient.addListener({
                status: (statusEvent) => {
                    if (statusEvent.category === "PNConnectedCategory") {
                        console.info("PubNub connected");
                    }
                },
                message: (messageEvent: any) => {
                    onMessage(messageEvent.message)
                }
            })
            this.#pubnubClient.subscribe({
                channels: [subscriptionInfo.pubnubChannel]
            })
        }
    }
    unsubscribe() {
        console.log('Unsubscribing from pubnub channel')
        this.#pubnubClient.unsubscribeAll()
    }
}

export default PubsubClient