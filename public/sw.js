self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {title: 'New Update', body: 'Check your commute!' };

    event.waitUntil(
        self.ServiceWorkerRegistration.showNotification(data.title, {
            body: data.body,
        })
    );
});