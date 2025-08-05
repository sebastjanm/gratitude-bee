// Impressum page with legal publisher information
// Required legal disclosure page, especially for German/EU compliance

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout, ComponentStyles } from '@/utils/design-system';

export default function ImpressumScreen() {
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
              <ArrowLeft color={Colors.textSecondary} size={Layout.iconSize.lg} />
            </TouchableOpacity>
            <Info color={Colors.primary} size={Layout.iconSize.xl} />
            <Text style={styles.title}>Impressum</Text>
          </View>
          {/* Empty view for spacing, consistent with profile header structure */}
          <View />
        </View>
        <Text style={styles.subtitle}>Legal publisher information</Text>
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
    backgroundColor: Colors.background
  },
  fixedHeaderContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { padding: Spacing.sm, marginRight: Spacing.sm, marginLeft: -Spacing.sm },
  title: { ...ComponentStyles.text.h2, marginLeft: Spacing.md },
  subtitle: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    paddingHorizontal: Layout.screenPadding,
  },
  content: { 
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  lastUpdated: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  section: { 
    marginBottom: Spacing.lg 
  },
  sectionTitle: { 
    ...ComponentStyles.text.h3,
    marginBottom: Spacing.md 
  },
  sectionText: { 
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  companyName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  contactLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  contactValue: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  contactInfo: {
    ...ComponentStyles.text.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  linkText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary,
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    marginBottom: Spacing.sm,
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  footerText: {
    ...ComponentStyles.text.caption,
    textAlign: 'center',
  },
}); 