// Privacy Policy page with comprehensive data protection content
// Created as a separate route accessible from Profile > Legal section

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Shield } from 'lucide-react-native';

export default function PrivacyScreen() {
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
            <Shield color="#FF8C42" size={28} />
            <Text style={styles.title}>Privacy Policy</Text>
          </View>
          {/* Empty view for spacing, consistent with profile header structure */}
          <View />
        </View>
        <Text style={styles.subtitle}>How we handle your data</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 15, 2024</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.sectionText}>
            Gratitude Bee ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          
          <Text style={styles.subsectionTitle}>Personal Information</Text>
          <Text style={styles.sectionText}>We may collect the following personal information:</Text>
          <Text style={styles.bulletPoint}>• Display name and profile information</Text>
          <Text style={styles.bulletPoint}>• Email address for account creation</Text>
          <Text style={styles.bulletPoint}>• Device information and identifiers</Text>
          <Text style={styles.bulletPoint}>• Usage data and analytics</Text>

          <Text style={styles.subsectionTitle}>Relationship Data</Text>
          <Text style={styles.sectionText}>The core of our service involves:</Text>
          <Text style={styles.bulletPoint}>• Appreciation messages and badges sent/received</Text>
          <Text style={styles.bulletPoint}>• Favor requests and responses</Text>
          <Text style={styles.bulletPoint}>• Communication between connected partners</Text>
          <Text style={styles.bulletPoint}>• Usage patterns and engagement metrics</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.sectionText}>We use your information to:</Text>
          <Text style={styles.bulletPoint}>• Provide and maintain our service</Text>
          <Text style={styles.bulletPoint}>• Enable communication with your partner</Text>
          <Text style={styles.bulletPoint}>• Send notifications and reminders</Text>
          <Text style={styles.bulletPoint}>• Improve app functionality and user experience</Text>
          <Text style={styles.bulletPoint}>• Provide customer support</Text>
          <Text style={styles.bulletPoint}>• Ensure security and prevent fraud</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing and Disclosure</Text>
          <Text style={styles.sectionText}>
            We do not sell your personal information. We may share your information only in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With your connected partner (relationship data only)</Text>
          <Text style={styles.bulletPoint}>• With service providers who assist in app operations</Text>
          <Text style={styles.bulletPoint}>• When required by law or legal process</Text>
          <Text style={styles.bulletPoint}>• To protect rights, property, or safety</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </Text>
          <Text style={styles.bulletPoint}>• Encryption of data in transit and at rest</Text>
          <Text style={styles.bulletPoint}>• Regular security assessments</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication</Text>
          <Text style={styles.bulletPoint}>• Secure cloud infrastructure</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          <Text style={styles.sectionText}>
            We retain your personal information for as long as necessary to provide our services and fulfill the purposes 
            outlined in this Privacy Policy. You may request deletion of your account and associated data at any time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.sectionText}>Depending on your location, you may have the following rights:</Text>
          <Text style={styles.bulletPoint}>• Access to your personal information</Text>
          <Text style={styles.bulletPoint}>• Correction of inaccurate data</Text>
          <Text style={styles.bulletPoint}>• Deletion of your personal information</Text>
          <Text style={styles.bulletPoint}>• Data portability</Text>
          <Text style={styles.bulletPoint}>• Opt-out of certain processing activities</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cookies and Tracking</Text>
          <Text style={styles.sectionText}>
            Our app may use cookies and similar tracking technologies to enhance user experience, analyze usage patterns, 
            and provide personalized content. You can manage cookie preferences in your device settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.sectionText}>
            Our app may integrate with third-party services for analytics, authentication, and infrastructure. 
            These services have their own privacy policies, which we encourage you to review.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
            information from children under 13. If you become aware that a child has provided us with personal information, 
            please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to Privacy Policy</Text>
          <Text style={styles.sectionText}>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
            the new Privacy Policy in the app and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@gratitudebee.app</Text>
          <Text style={styles.contactInfo}>Address: 123 Love Street, Heart City, HC 12345</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data practices.
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
  subsectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF8C42',
    marginTop: 12,
    marginBottom: 6,
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