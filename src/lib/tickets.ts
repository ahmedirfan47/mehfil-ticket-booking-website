import QRCode from "qrcode";

/**
 * Render a ticket's qr_token to a PNG data URL. The token (not the public code)
 * is what staff scanners read, so a leaked printed code can't be used to forge
 * a scan. Generated on demand — nothing about the QR is stored.
 */
export async function generateQRDataUrl(qrToken: string): Promise<string> {
  return QRCode.toDataURL(qrToken, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
    color: { dark: "#14101F", light: "#FFFFFF" },
  });
}