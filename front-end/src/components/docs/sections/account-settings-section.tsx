"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { User, Lock, CreditCard, Bell, Shield, HelpCircle } from "lucide-react"

export function AccountSettingsSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
        <p className="text-lg text-gray-700 mb-6">
          Learn how to manage your NoteUS account settings, subscription, and preferences.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <h2 className="text-xl font-semibold mb-4">Accessing Account Settings</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              You can access your account settings at any time by clicking on your profile icon in the top-right corner
              of the screen and selecting "Profile" from the dropdown menu.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Profile Settings</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                In the profile settings section, you can update your personal information:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Display name</li>
                <li>Email address</li>
                <li>Language preferences</li>
              </ul>
              <img
                src="/placeholder.svg?height=150&width=400"
                alt="Profile Settings"
                className="rounded-lg border w-full mt-3"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium mb-2 text-blue-800">Quick Tip</h4>
              <p className="text-sm text-gray-700">
                Keeping your email address up-to-date is important for account recovery and receiving important
                notifications about your account.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <Lock className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Password Management</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                You can update your password and manage your account security:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                <li>Go to Account Settings &gt; Security</li>
                <li>Click "Change Password"</li>
                <li>Enter your current password</li>
                <li>Enter and confirm your new password</li>
                <li>Click "Update Password" to save changes</li>
              </ol>
              <img
                src="/placeholder.svg?height=150&width=400"
                alt="Password Management"
                className="rounded-lg border w-full mt-3"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Two-Factor Authentication</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                For added security, we recommend enabling two-factor authentication (2FA):
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                <li>Go to Account Settings Security</li>
                <li>Click "Enable Two-Factor Authentication"</li>
                <li>Choose your preferred 2FA method (authenticator app or SMS)</li>
                <li>Follow the on-screen instructions to complete setup</li>
                <li>Save your backup codes in a secure location</li>
              </ol>
              <img
                src="/placeholder.svg?height=150&width=400"
                alt="Two-Factor Authentication"
                className="rounded-lg border w-full mt-3"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <h2 className="text-xl font-semibold mb-4">Subscription Management</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="flex items-center mb-3">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Managing Your Subscription</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">You can view and manage your subscription details:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                <li>Current plan and billing cycle</li>
                <li>Upgrade or downgrade your plan</li>
                <li>Update payment methods</li>
                <li>View billing history and download invoices</li>
                <li>Cancel or pause your subscription</li>
              </ul>
              <img
                src="/placeholder.svg?height=150&width=400"
                alt="Subscription Management"
                className="rounded-lg border w-full mt-3"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Upgrading Your Plan</h4>
                <p className="text-sm text-gray-600 mb-3">To upgrade to a premium plan:</p>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>Go to Account Settings Subscription</li>
                  <li>Click "Upgrade Plan"</li>
                  <li>Select your desired plan</li>
                  <li>Choose billing frequency (monthly/annual)</li>
                  <li>Complete payment information</li>
                  <li>Confirm your upgrade</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Canceling Your Subscription</h4>
                <p className="text-sm text-gray-600 mb-3">To cancel your subscription:</p>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>Go to Account Settings Subscription</li>
                  <li>Click "Cancel Subscription"</li>
                  <li>Select a reason for cancellation</li>
                  <li>Confirm cancellation</li>
                  <li>Your access will continue until the end of your billing period</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium">Managing Notifications</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                You can customize which notifications you receive and how you receive them:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Notification Types</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>Account updates</li>
                    <li>Security alerts</li>
                    <li>Study reminders</li>
                    <li>New features and updates</li>
                    <li>Marketing communications</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Delivery Methods</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                    <li>Email notifications</li>
                    <li>In-app notifications</li>
                    <li>Push notifications (mobile app)</li>
                    <li>SMS notifications (premium only)</li>
                  </ul>
                </div>
              </div>
              <img
                src="/placeholder.svg?height=150&width=400"
                alt="Notification Settings"
                className="rounded-lg border w-full mt-3"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.6)}>
        <h2 className="text-xl font-semibold mb-4">Account Data and Privacy</h2>
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Downloading Your Data</h4>
                <p className="text-sm text-gray-600 mb-3">You can request a copy of all your data:</p>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>Go to Account Settings Privacy</li>
                  <li>Click "Request Data Export"</li>
                  <li>Select which data you want to include</li>
                  <li>Submit your request</li>
                  <li>You'll receive an email when your data is ready to download</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Deleting Your Account</h4>
                <p className="text-sm text-gray-600 mb-3">If you wish to delete your account:</p>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>Go to Account Settings Privacy</li>
                  <li>Click "Delete Account"</li>
                  <li>Read the information about account deletion</li>
                  <li>Confirm your decision by entering your password</li>
                  <li>Your account and data will be permanently deleted</li>
                </ol>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <div className="flex items-center mb-2">
                <HelpCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-800">Important Note</h4>
              </div>
              <p className="text-sm text-gray-700">
                Account deletion is permanent and cannot be undone. All your documents, flashcards, quizzes, and other
                data will be permanently removed from our servers. We recommend downloading your data before deleting
                your account.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
