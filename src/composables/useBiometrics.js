import { NativeBiometric } from 'capacitor-native-biometric'

export function useBiometrics() {
  const isAvailable = async () => {
    const result = await NativeBiometric.isAvailable()
    return result.isAvailable
  }

  const authenticate = async () => {
    const result = await NativeBiometric.verifyIdentity({
      reason: 'Authenticate to access SecuriTea',
      title: 'Biometric Authentication',
    })

    return result.verified
  }

  return { isAvailable, authenticate }
}
