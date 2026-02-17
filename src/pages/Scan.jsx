import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import { postJson } from '../api/client'
import AppShell from '../components/AppShell'
import Spinner from '../components/Spinner'

const SCANNER_ID = 'qr-scanner'

const Scan = () => {
  const scannerRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [lastScan, setLastScan] = useState(null)
  const processingRef = useRef(false)

  useEffect(() => {
    const startScanner = async () => {
      if (scannerRef.current) return
      setStatus('loading')
      const scanner = new Html5Qrcode(SCANNER_ID)
      scannerRef.current = scanner

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 260, height: 260 } },
          async (decodedText) => {
            if (processingRef.current) return
            processingRef.current = true
            setStatus('processing')
            try {
              const result = await postJson('/api/attendance/scan', { qrToken: decodedText })
              setMessage(result.message)
              setLastScan(result.attendance)
            } catch (err) {
              setMessage(err.message || 'Scan failed')
            } finally {
              processingRef.current = false
              setStatus('scanning')
            }
          },
          () => {}
        )
        setStatus('scanning')
      } catch (err) {
        setStatus('error')
        setMessage('Camera access was blocked. Please allow camera permissions.')
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current.clear()
        scannerRef.current = null
      }
    }
  }, [])

  return (
    <AppShell>
      <section className="scan-page">
        <div className="scan-card">
          <div className="scan-card__header">
            <h2>Live QR Scan</h2>
            <p className="muted">Point the camera at a user QR badge to validate attendance.</p>
          </div>
          <div className="scan-card__body">
            <div id={SCANNER_ID} className="scan-card__reader" />
            {status === 'loading' && <Spinner label="Starting camera" />}
            {status === 'error' ? (
              <p className="form__error">{message}</p>
            ) : (
              message && <p className="scan-card__message">{message}</p>
            )}
            {lastScan && (
              <div className="scan-card__result">
                <p>{lastScan.user?.name}</p>
                <span>{lastScan.dateKey}</span>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  )
}

export default Scan
