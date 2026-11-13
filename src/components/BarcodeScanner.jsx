import { useEffect, useState } from 'react'
import { Modal, Button, Form, InputGroup, Alert } from 'react-bootstrap'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const READER_ID = 'barcode-reader'

// Pop-up for finding a snack by barcode: point the camera at the
// package, or type the number printed under the barcode.
// onFound(code) is called with the barcode as a string.
export default function BarcodeScanner({ show, onHide, onFound }) {
  const [useCamera, setUseCamera] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [typed, setTyped] = useState('')

  // Start the camera when the user turns it on, and ALWAYS stop it again
  // when the pop-up closes (the cleanup function) – otherwise the camera
  // light would stay on.
  useEffect(() => {
    if (!show || !useCamera) return
    const scanner = new Html5Qrcode(READER_ID, {
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ],
      verbose: false,
    })
    let running = false

    scanner
      .start(
        { facingMode: 'environment' }, // the back camera on phones
        { fps: 10, qrbox: { width: 260, height: 140 } },
        (decodedText) => {
          onFound(decodedText)
          onHide()
        },
        () => {} // called for every frame without a barcode – ignore
      )
      .then(() => { running = true })
      .catch(() => {
        setCameraError('Could not start the camera. Allow camera access, or type the barcode instead.')
        setUseCamera(false)
      })

    return () => {
      if (running) scanner.stop().catch(() => {})
    }
  }, [show, useCamera, onFound, onHide])

  function handleSubmit(e) {
    e.preventDefault()
    const code = typed.replace(/\D/g, '') // keep only digits
    if (code) {
      onFound(code)
      onHide()
    }
  }

  return (
    <Modal show={show} onHide={onHide} onExited={() => { setUseCamera(false); setCameraError('') }} centered contentClassName="scanner-modal">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title className="arcade-label">FIND BY BARCODE</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {useCamera ? (
          <div id={READER_ID} className="barcode-reader" />
        ) : (
          <Button variant="warning" className="w-100 mb-3" onClick={() => setUseCamera(true)}>
            📷 Scan with camera
          </Button>
        )}
        {cameraError && <Alert variant="warning" className="small">{cameraError}</Alert>}

        <Form onSubmit={handleSubmit} className="mt-3">
          <Form.Label htmlFor="barcode-input" className="small">…or type the numbers under the barcode</Form.Label>
          <InputGroup>
            <Form.Control
              id="barcode-input"
              inputMode="numeric"
              placeholder="e.g. 6416453074064"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
            <Button type="submit" variant="outline-warning">Find</Button>
          </InputGroup>
        </Form>
      </Modal.Body>
    </Modal>
  )
}
