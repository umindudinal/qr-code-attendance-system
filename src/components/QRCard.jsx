const QRCard = ({ qrUrl, expiresAt }) => {
  return (
    <div className="card qr-card">
      <div className="qr-card__meta">
        <h3>Your QR Badge</h3>
        <p>Present this code at the scanner to mark attendance.</p>
        {expiresAt && <p className="qr-card__expires">Refreshes {expiresAt}</p>}
      </div>
      <div className="qr-card__image">
        {qrUrl ? <img src={qrUrl} alt="User QR code" /> : <div className="qr-card__empty" />}
      </div>
    </div>
  )
}

export default QRCard
