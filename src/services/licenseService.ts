import CryptoJS from 'crypto-js'

export interface LicenseInfo {
  licenseKey: string
  domain: string
  expiryDate: string
  subscriptionType: 'monthly' | 'yearly'
  features: string[]
  isValid: boolean
  daysRemaining: number
}

export interface LicenseValidationResponse {
  valid: boolean
  license?: LicenseInfo
  error?: string
  warningDays?: number
}

class LicenseService {
  private readonly LICENSE_SERVER_URL = 'http://localhost:3001/api/license'
  private readonly ENCRYPTION_KEY = 'opillia-license-key-2024'
  private readonly STORAGE_KEY = 'app_license_data'
  private readonly DOMAIN_KEY = 'app_domain_binding'

  private currentLicense: LicenseInfo | null = null
  private validationInterval: number | null = null

  constructor() {
    this.initializeLicenseCheck()
  }

  // Initialize license checking on app start
  private async initializeLicenseCheck(): Promise<void> {
    try {
      // Check stored license first
      const storedLicense = this.getStoredLicense()
      if (storedLicense) {
        const validation = await this.validateLicense(storedLicense.licenseKey)
        if (validation.valid) {
          this.currentLicense = validation.license!
          this.startPeriodicValidation()
          return
        }
      }

      // If no valid stored license, show license input
      this.showLicenseModal()
    } catch (error) {
      console.error('License initialization failed:', error)
      this.showLicenseModal()
    }
  }

  // Validate license with server
  async validateLicense(licenseKey: string): Promise<LicenseValidationResponse> {
    try {
      const currentDomain = window.location.hostname
      const deviceFingerprint = await this.generateDeviceFingerprint()

      const response = await fetch(`${this.LICENSE_SERVER_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
          domain: currentDomain,
          fingerprint: deviceFingerprint,
          timestamp: Date.now()
        })
      })

      if (!response.ok) {
        throw new Error(`License validation failed: ${response.status}`)
      }

      const data = await response.json()

      if (data.valid) {
        // Encrypt and store license data
        this.storeLicense(data.license)
        this.bindToDomain(currentDomain)
        this.currentLicense = data.license
        this.startPeriodicValidation()
      }

      return data
    } catch (error) {
      console.error('License validation error:', error)
      return {
        valid: false,
        error: 'Unable to validate license. Please check your internet connection.'
      }
    }
  }

  // Generate device fingerprint for additional security
  private async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText('Device fingerprint', 2, 2)

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL(),
      webgl: this.getWebGLFingerprint()
    }

    return CryptoJS.SHA256(JSON.stringify(fingerprint)).toString()
  }

  private getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return 'no-webgl'

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    return debugInfo ?
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) :
      'unknown-renderer'
  }

  // Encrypt and store license data locally
  private storeLicense(license: LicenseInfo): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify(license),
        this.ENCRYPTION_KEY
      ).toString()
      localStorage.setItem(this.STORAGE_KEY, encrypted)
    } catch (error) {
      console.error('Failed to store license:', error)
    }
  }

  // Decrypt and retrieve stored license
  private getStoredLicense(): LicenseInfo | null {
    try {
      const encrypted = localStorage.getItem(this.STORAGE_KEY)
      if (!encrypted) return null

      const decrypted = CryptoJS.AES.decrypt(encrypted, this.ENCRYPTION_KEY)
      const licenseData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

      // Check if license is expired
      if (new Date(licenseData.expiryDate) < new Date()) {
        this.clearStoredLicense()
        return null
      }

      return licenseData
    } catch (error) {
      console.error('Failed to retrieve license:', error)
      this.clearStoredLicense()
      return null
    }
  }

  // Bind license to current domain
  private bindToDomain(domain: string): void {
    const domainHash = CryptoJS.SHA256(domain + this.ENCRYPTION_KEY).toString()
    localStorage.setItem(this.DOMAIN_KEY, domainHash)
  }

  // Check if current domain matches bound domain
  private isDomainValid(): boolean {
    try {
      const storedHash = localStorage.getItem(this.DOMAIN_KEY)
      if (!storedHash) return false

      const currentDomain = window.location.hostname
      const currentHash = CryptoJS.SHA256(currentDomain + this.ENCRYPTION_KEY).toString()

      return storedHash === currentHash
    } catch (error) {
      return false
    }
  }

  // Start periodic license validation (every 6 hours)
  private startPeriodicValidation(): void {
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
    }

    this.validationInterval = window.setInterval(async () => {
      if (this.currentLicense) {
        const validation = await this.validateLicense(this.currentLicense.licenseKey)
        if (!validation.valid) {
          this.handleLicenseExpired()
        } else if (validation.warningDays && validation.warningDays <= 7) {
          this.showExpiryWarning(validation.warningDays)
        }
      }
    }, 6 * 60 * 60 * 1000) // 6 hours
  }

  // Handle license expiration
  private handleLicenseExpired(): void {
    this.clearStoredLicense()
    this.currentLicense = null
    this.showLicenseExpiredModal()
    this.disableApp()
  }

  // Show license input modal
  private showLicenseModal(): void {
    // This will be implemented in the Vue component
    window.dispatchEvent(new CustomEvent('show-license-modal'))
  }

  // Show license expired modal
  private showLicenseExpiredModal(): void {
    window.dispatchEvent(new CustomEvent('show-license-expired-modal'))
  }

  // Show expiry warning
  private showExpiryWarning(daysRemaining: number): void {
    window.dispatchEvent(new CustomEvent('show-license-warning', {
      detail: { daysRemaining }
    }))
  }

  // Disable app functionality
  private disableApp(): void {
    // Add overlay to prevent app usage
    const overlay = document.createElement('div')
    overlay.id = 'license-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
      text-align: center;
    `
    overlay.innerHTML = `
      <div>
        <h2>License Expired</h2>
        <p>Your license has expired. Please renew to continue using the application.</p>
        <button onclick="window.location.reload()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        ">Reload & Enter License</button>
      </div>
    `
    document.body.appendChild(overlay)
  }

  // Clear stored license data
  private clearStoredLicense(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.DOMAIN_KEY)
  }

  // Public methods
  public getCurrentLicense(): LicenseInfo | null {
    return this.currentLicense
  }

  public isLicenseValid(): boolean {
    return this.currentLicense !== null &&
           this.isDomainValid() &&
           new Date(this.currentLicense.expiryDate) > new Date()
  }

  public async activateLicense(licenseKey: string): Promise<LicenseValidationResponse> {
    return await this.validateLicense(licenseKey)
  }

  public deactivateLicense(): void {
    this.clearStoredLicense()
    this.currentLicense = null
    if (this.validationInterval) {
      clearInterval(this.validationInterval)
      this.validationInterval = null
    }
  }

  public getDaysRemaining(): number {
    if (!this.currentLicense) return 0
    const now = new Date()
    const expiry = new Date(this.currentLicense.expiryDate)
    const diffTime = expiry.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Check if specific feature is available
  public hasFeature(feature: string): boolean {
    return this.currentLicense?.features.includes(feature) || false
  }

  // Get subscription renewal URL
  public getRenewalUrl(): string {
    const domain = window.location.hostname
    const licenseKey = this.currentLicense?.licenseKey || ''
    return `http://localhost:3001/api/license/renew?domain=${domain}&license=${licenseKey}`
  }
}

export const licenseService = new LicenseService()
