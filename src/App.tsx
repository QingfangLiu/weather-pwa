import { useEffect, useState } from 'react'
import MapView from './components/MapView'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import './styles.css'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onRegistered() {
    // SW ready
  },
  onNeedRefresh() {},
  onOfflineReady() {}
})

export default function App() {
  const online = useOnlineStatus()
  const [notifPermission, setNotifPermission] = useState(Notification.permission)

  useEffect(() => {
    setNotifPermission(Notification.permission)
  }, [])

  const requestNotif = async () => {
    if (!('Notification' in window)) return alert('Notifications not supported in this browser.')
    const permission = await Notification.requestPermission()
    setNotifPermission(permission)
    if (permission !== 'granted') return

    // Show a local test notification via the service worker (no push yet)
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg && reg.showNotification) {
      reg.showNotification('Test Alert: Severe Thunderstorm', {
        body: 'Take shelter indoors away from windows.',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        // @ts-ignore
        vibrate: [150, 50, 150],
        tag: 'test-alert',
        renotify: true
      })
    } else {
      // Fallback if SW not yet ready
      new Notification('Test Alert: Severe Thunderstorm', {
        body: 'Take shelter indoors away from windows.',
        icon: '/icons/icon-192.png',
        // @ts-ignore
        vibrate: [150, 50, 150]
      })
    }
  }

  return (
    <div className="app">
      {!online && <div className="banner">You’re offline — showing cached info</div>}

      <header className="header">
        <div className="row">
          <strong>WxWarn MVP</strong>
          <span className="badge">PWA</span>
          <button className="button secondary" onClick={() => updateSW()}>
            Check for updates
          </button>
          <button className="button" onClick={requestNotif}>
            {notifPermission === 'granted' ? 'Send test alert' : 'Enable notifications'}
          </button>
        </div>
      </header>

      <main>
        <MapView />
      </main>

      <footer className="footer">
        <div className="row" role="contentinfo">
          <span className="badge">Demo data</span>
          <span className="badge">Works offline</span>
        </div>
      </footer>
    </div>
  )
}
