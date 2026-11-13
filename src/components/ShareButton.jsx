import { useEffect, useState } from 'react'
import { Button, Modal, Spinner, Alert } from 'react-bootstrap'
import { createShareImage } from '../game/shareCard.js'

// "Share result" button: draws a result card image and lets the user
// share it (phones), download it, or copy a text version.
export default function ShareButton({ winner, loser, finisherName, turns, hpLeft }) {
  const [show, setShow] = useState(false)
  const [blob, setBlob] = useState(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const text = finisherName
    ? `${winner.name} finished ${loser.name} with ${finisherName} in Snack Fighter! 💀`
    : `${winner.name} K.O.'d ${loser.name} in ${turns} turns in Snack Fighter! 🥊`

  async function open() {
    setShow(true)
    setError('')
    try {
      const image = await createShareImage({ winner, loser, finisherName, turns, hpLeft })
      setBlob(image)
      setUrl(URL.createObjectURL(image))
    } catch {
      setError('Could not create the image. You can still copy the text.')
    }
  }

  // Free the memory used by the image URL when it is no longer needed.
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  const file = blob ? new File([blob], 'snack-fighter-result.png', { type: 'image/png' }) : null
  const canShareFile = file && navigator.canShare?.({ files: [file] })

  async function share() {
    try {
      await navigator.share({ files: [file], text })
    } catch {
      // The user closed the share sheet – nothing to do.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      setError('Copying is blocked in this browser.')
    }
  }

  return (
    <>
      <Button variant="outline-info" size="sm" onClick={open}>📤 Share result</Button>
      <Modal show={show} onHide={() => setShow(false)} centered contentClassName="scanner-modal">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title className="arcade-label">SHARE YOUR VICTORY</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {!url && !error && <Spinner animation="border" role="status" />}
          {url && <img src={url} alt={text} className="img-fluid rounded mb-3" />}
          {error && <Alert variant="warning" className="small">{error}</Alert>}
          <div className="d-flex flex-wrap justify-content-center gap-2">
            {canShareFile && <Button variant="warning" onClick={share}>Share…</Button>}
            {url && <Button as="a" href={url} download="snack-fighter-result.png" variant="outline-warning">Download image</Button>}
            <Button variant="outline-light" onClick={copy}>{copied ? '✓ Copied' : 'Copy text'}</Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}
