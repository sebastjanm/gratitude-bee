// Terms & Conditions page with comprehensive legal content
// Created as a separate route accessible from Profile > Legal section

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, FileText } from 'lucide-react-native';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.fixedHeaderContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#333" size={24} />
            </TouchableOpacity>
            <FileText color="#FF8C42" size={28} />
            <Text style={styles.title}>Terms & Conditions</Text>
          </View>
          {/* Empty view for spacing, consistent with profile header structure */}
          <View />
        </View>
        <Text style={styles.subtitle}>The rules for using our app</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 15, 2024</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.sectionText}>
            By downloading, installing, or using Gratitude Bee ("the App"), you agree to be bound by these Terms and Conditions. 
            If you do not agree to these terms, please do not use the App.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.sectionText}>
            Gratitude Bee is a relationship enhancement application designed to help couples strengthen their bond through 
            appreciation sharing, favor requests, and positive communication tools.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. User Accounts and Registration</Text>
          <Text style={styles.sectionText}>
            To use certain features of the App, you must create an account. You are responsible for:
          </Text>
          <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account information</Text>
          <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
          <Text style={styles.bulletPoint}>• Providing accurate and complete information</Text>
          <Text style={styles.bulletPoint}>• Promptly updating your account information</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
          <Text style={styles.sectionText}>You agree not to use the App to:</Text>
          <Text style={styles.bulletPoint}>• Violate any applicable laws or regulations</Text>
          <Text style={styles.bulletPoint}>• Send harmful, abusive, or inappropriate content</Text>
          <Text style={styles.bulletPoint}>• Interfere with the App's security features</Text>
          <Text style={styles.bulletPoint}>• Reverse engineer or attempt to extract source code</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Privacy and Data Protection</Text>
          <Text style={styles.sectionText}>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. 
            By using the App, you consent to our data practices as described in our Privacy Policy.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
          <Text style={styles.sectionText}>
            The App and its original content, features, and functionality are owned by Gratitude Bee and are protected by 
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.sectionText}>
            In no event shall Gratitude Bee be liable for any indirect, incidental, special, consequential, or punitive 
            damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Termination</Text>
          <Text style={styles.sectionText}>
            We may terminate or suspend your account and access to the App immediately, without prior notice, for any 
            reason, including if you breach these Terms and Conditions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.sectionText}>
            We reserve the right to modify these terms at any time. We will notify users of any material changes via 
            the App or email. Continued use of the App after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Contact Information</Text>
          <Text style={styles.sectionText}>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: legal@gratitudebee.app</Text>
          <Text style={styles.contactInfo}>Address: 123 Love Street, Heart City, HC 12345</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Gratitude Bee, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF8F0'
  },
  fixedHeaderContainer: {
    backgroundColor: '#FFF8F0',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { padding: 8, marginRight: 8, marginLeft: -8 },
  title: { fontSize: 24, fontFamily: 'Inter-Bold', color: '#333', marginLeft: 12 },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  content: { 
    flex: 1,
    paddingHorizontal: 20,
  },
  lastUpdated: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    marginTop: 20,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontFamily: 'Inter-SemiBold', 
    color: '#333', 
    marginBottom: 8 
  },
  sectionText: { 
    fontSize: 16, 
    fontFamily: 'Inter-Regular', 
    color: '#666', 
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
    marginBottom: 4,
    paddingLeft: 16,
  },
  contactInfo: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#FF8C42',
    lineHeight: 24,
    marginTop: 4,
  },
  footer: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
}); 