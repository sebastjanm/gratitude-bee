// Impressum page with legal publisher information
// Required legal disclosure page, especially for German/EU compliance

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';

export default function ImpressumScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#333" size={24} />
        </TouchableOpacity>
        <Info color="#FF8C42" size={28} />
        <Text style={styles.title}>Impressum</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: January 15, 2024</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal Information</Text>
          <Text style={styles.sectionText}>
            This page contains legally required information about the publisher and operator of the Gratitude Bee application 
            in accordance with applicable laws and regulations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publisher & Operator</Text>
          <Text style={styles.companyName}>Gratitude Bee Technologies Ltd.</Text>
          <Text style={styles.contactInfo}>123 Love Street</Text>
          <Text style={styles.contactInfo}>Heart City, HC 12345</Text>
          <Text style={styles.contactInfo}>United Kingdom</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.contactLabel}>Email:</Text>
          <Text style={styles.contactValue}>contact@gratitudebee.app</Text>
          
          <Text style={styles.contactLabel}>Phone:</Text>
          <Text style={styles.contactValue}>+44 20 1234 5678</Text>
          
          <Text style={styles.contactLabel}>Support:</Text>
          <Text style={styles.contactValue}>support@gratitudebee.app</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Registration</Text>
          <Text style={styles.contactLabel}>Company Registration Number:</Text>
          <Text style={styles.contactValue}>GB12345678</Text>
          
          <Text style={styles.contactLabel}>VAT Number:</Text>
          <Text style={styles.contactValue}>GB123456789</Text>
          
          <Text style={styles.contactLabel}>Registered Office:</Text>
          <Text style={styles.contactValue}>123 Love Street, Heart City, HC 12345, United Kingdom</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsible for Content</Text>
          <Text style={styles.contactLabel}>Managing Director:</Text>
          <Text style={styles.contactValue}>Jane Smith</Text>
          
          <Text style={styles.contactLabel}>Technical Director:</Text>
          <Text style={styles.contactValue}>John Doe</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Regulatory Body</Text>
          <Text style={styles.sectionText}>
            This company is registered with and regulated by the appropriate authorities in the United Kingdom 
            for software development and mobile application services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispute Resolution</Text>
          <Text style={styles.sectionText}>
            The European Commission provides a platform for online dispute resolution (ODR): 
          </Text>
          <Text style={styles.linkText}>https://ec.europa.eu/consumers/odr/</Text>
          <Text style={styles.sectionText}>
            We are not willing or obliged to participate in dispute resolution proceedings before 
            a consumer arbitration board.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.sectionText}>
            All content, trademarks, logos, and intellectual property displayed in this application are 
            the property of Gratitude Bee Technologies Ltd. or its licensors and are protected by copyright, 
            trademark, and other intellectual property laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liability Notice</Text>
          <Text style={styles.sectionText}>
            Although we check the content of our application carefully, we cannot accept responsibility for 
            the content of external links. The operators of such external sites are solely responsible for their content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Protection Officer</Text>
          <Text style={styles.contactLabel}>Data Protection Contact:</Text>
          <Text style={styles.contactValue}>privacy@gratitudebee.app</Text>
          <Text style={styles.sectionText}>
            For questions regarding data protection and privacy, please contact our Data Protection Officer 
            using the email address above.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This impressum is provided in compliance with legal requirements and is subject to change. 
            Please check this page regularly for updates.
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: { 
    padding: 8, 
    marginRight: 12 
  },
  title: { 
    fontSize: 24, 
    fontFamily: 'Inter-Bold', 
    color: '#333', 
    marginLeft: 8 
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
    marginBottom: 12 
  },
  sectionText: { 
    fontSize: 16, 
    fontFamily: 'Inter-Regular', 
    color: '#666', 
    lineHeight: 24,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#FF8C42',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginTop: 8,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 4,
  },
  contactInfo: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 24,
    marginBottom: 2,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#FF8C42',
    lineHeight: 24,
    marginBottom: 8,
    textDecorationLine: 'underline',
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