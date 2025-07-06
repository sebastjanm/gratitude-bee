import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Alert, Linking } from 'react-native';
import { X, CameraOff } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onCodeScanned: (code: string) => void;
}

export default function QRScannerModal({ visible, onClose, onCodeScanned }: QRScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setErrorMessage(null);
    }
  }, [visible]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      let inviteCode = '';
      if (data.includes('gratitudebee.app/invite/')) {
        const url = new URL(data);
        const pathParts = url.pathname.split('/');
        inviteCode = pathParts[pathParts.length - 1];
      } else {
        // Assume it's a raw code
        inviteCode = data;
      }

      if (inviteCode && inviteCode.length > 5) { // Basic validation
        onCodeScanned(inviteCode);
      } else {
        throw new Error('Not a valid GratitudeBee invite code.');
      }
    } catch (error) {
      setErrorMessage('Invalid QR Code. Please scan a valid invite code.');
      setTimeout(() => {
        setErrorMessage(null);
        setScanned(false);
      }, 3000);
    }
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <CameraOff color="#666" size={48} />
          <Text style={styles.permissionTitle}>Camera access required</Text>
          <Text style={styles.permissionText}>
            To connect with your partner via QR code, please grant camera access.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
           <TouchableOpacity style={[styles.permissionButton, styles.secondaryButton]} onPress={() => Linking.openSettings()}>
            <Text style={[styles.permissionButtonText, styles.secondaryButtonText]}>Open Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#666" size={24} />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="white" size={32} />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>Scan Partner's QR Code</Text>
          </View>
          <View style={styles.scannerFrame} />
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
          <Text style={styles.subtitle}>
            Position the QR code within the frame
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 4,
    borderColor: 'white',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF8F0',
  },
  permissionTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#FF8C42',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF8C42',
  },
  secondaryButtonText: {
    color: '#FF8C42',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 140,
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
}); 