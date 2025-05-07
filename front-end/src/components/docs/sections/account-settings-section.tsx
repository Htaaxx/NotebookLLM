"use client"

import { motion } from "framer-motion"
import { fadeIn, staggerContainer } from "@/lib/motion-utils"
import { User, Lock, CreditCard, Bell, Shield, HelpCircle } from "lucide-react"
import { Anton } from "next/font/google"

// Initialize Anton font
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

export function AccountSettingsSection() {
  return (
    <motion.div variants={staggerContainer(0.1, 0.1)} initial="hidden" animate="show" className="space-y-12">
      <motion.div variants={fadeIn("up", 0.1)}>
        <h1 className={`${anton.className} text-5xl font-bold mb-6 text-[#86AB5D]`}>ACCOUNT SETTINGS</h1>
        <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Learn how to manage your NoteUS account settings, subscription, and preferences.
        </p>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.2)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>
            ACCESSING ACCOUNT SETTINGS
          </h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <p className="text-gray-700 mb-6 text-lg">
                You can access your account settings at any time by clicking on your profile icon in the top-right
                corner of the screen and selecting "Profile" from the dropdown menu.
              </p>

              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md mb-8 relative overflow-hidden">
                {/*  p-6 rounded-[30px] border-0 shadow-md mb-8 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Profile Settings</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    In the profile settings section, you can update your personal information:
                  </p>
                  <ul className="list-disc pl-8 space-y-2 text-gray-700">
                    <li>Display name</li>
                    <li>Email address</li>
                    <li>Language preferences</li>
                    <li>Profile picture</li>
                    <li>Notification settings</li>
                  </ul>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Profile Settings"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#E48D44]/10 p-6 rounded-[30px] border-0 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <h4 className="font-bold flex items-center mb-4 text-[#E48D44] text-xl">
                    <HelpCircle className="w-6 h-6 mr-3" />
                    Quick Tip
                  </h4>
                  <p className="text-gray-700 text-lg">
                    Keeping your email address up-to-date is important for account recovery and receiving important
                    notifications about your account. We recommend setting up two-factor authentication for added
                    security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.3)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>SECURITY SETTINGS</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="space-y-8">
                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-xl text-[#3A5A40]">Password Management</h4>
                    </div>
                    <p className="text-gray-600 mb-4 text-lg">
                      You can update your password and manage your account security:
                    </p>
                    <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                      <li>Go to Account Settings &gt; Security</li>
                      <li>Click "Change Password"</li>
                      <li>Enter your current password</li>
                      <li>Enter and confirm your new password</li>
                      <li>Click "Update Password" to save changes</li>
                    </ol>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=150&width=400"
                        alt="Password Management"
                        className="rounded-lg w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                  {/* Decorative element */}
                  <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-bold text-xl text-[#3A5A40]">Two-Factor Authentication</h4>
                    </div>
                    <p className="text-gray-600 mb-4 text-lg">
                      For added security, we recommend enabling two-factor authentication (2FA):
                    </p>
                    <ol className="list-decimal pl-8 space-y-2 text-gray-700">
                      <li>Go to Account Settings &gt; Security</li>
                      <li>Click "Enable Two-Factor Authentication"</li>
                      <li>Choose your preferred 2FA method (authenticator app or SMS)</li>
                      <li>Follow the on-screen instructions to complete setup</li>
                      <li>Save your backup codes in a secure location</li>
                    </ol>
                    <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <img
                        src="/placeholder.svg?height=150&width=400"
                        alt="Two-Factor Authentication"
                        className="rounded-lg w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.4)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>SUBSCRIPTION MANAGEMENT</h2>

          {/* Decorative element */}
          <div className="absolute top-[-20px] right-[-30px] w-20 h-20 bg-[#86AB5D] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg relative">
            {/* Decorative top corner */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E48D44] opacity-5 rounded-bl-full"></div>

            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md mb-8 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#86AB5D] opacity-10 rounded-tl-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#E48D44] rounded-full flex items-center justify-center mr-4">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Managing Your Subscription</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">You can view and manage your subscription details:</p>
                  <ul className="list-disc pl-8 space-y-2 text-gray-700">
                    <li>Current plan and billing cycle</li>
                    <li>Upgrade or downgrade your plan</li>
                    <li>Update payment methods</li>
                    <li>View billing history and download invoices</li>
                    <li>Cancel or pause your subscription</li>
                  </ul>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Subscription Management"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-bold mb-3 text-xl text-[#3A5A40]">Upgrading Your Plan</h4>
                  <p className="text-gray-600 mb-4">To upgrade to a premium plan:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Go to Account Settings &gt; Subscription</li>
                    <li>Click "Upgrade Plan"</li>
                    <li>Select your desired plan</li>
                    <li>Choose billing frequency (monthly/annual)</li>
                    <li>Complete payment information</li>
                    <li>Confirm your upgrade</li>
                  </ol>
                </motion.div>

                <motion.div
                  className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <h4 className="font-bold mb-3 text-xl text-[#3A5A40]">Canceling Your Subscription</h4>
                  <p className="text-gray-600 mb-4">To cancel your subscription:</p>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                    <li>Go to Account Settings &gt; Subscription</li>
                    <li>Click "Cancel Subscription"</li>
                    <li>Select a reason for cancellation</li>
                    <li>Confirm cancellation</li>
                    <li>Your access will continue until the end of your billing period</li>
                  </ol>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeIn("up", 0.5)}>
        <div className="relative">
          <h2 className={`${anton.className} text-3xl font-semibold mb-6 text-[#E48D44]`}>NOTIFICATION PREFERENCES</h2>

          {/* Decorative element */}
          <div className="absolute top-[-30px] left-[-20px] w-16 h-16 bg-[#E48D44] rounded-full opacity-20"></div>

          <div className="bg-white border-0 rounded-[40px] overflow-hidden shadow-lg">
            <div className="p-8" style={{ fontFamily: "'Quicksand', sans-serif" }}>
              <div className="bg-[#F2F5DA] p-6 rounded-[30px] border-0 shadow-md relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#E48D44] opacity-10 rounded-br-full"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-[#86AB5D] rounded-full flex items-center justify-center mr-4">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-bold text-xl text-[#3A5A40]">Managing Notifications</h4>
                  </div>
                  <p className="text-gray-600 mb-4 text-lg">
                    You can customize which notifications you receive and how you receive them:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <h5 className="font-bold text-lg mb-3 text-[#86AB5D]">Notification Types</h5>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Account updates</li>
                        <li>Security alerts</li>
                        <li>Study reminders</li>
                        <li>New features and updates</li>
                        <li>Marketing communications</li>
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                      <h5 className="font-bold text-lg mb-3 text-[#E48D44]">Delivery Methods</h5>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Email notifications</li>
                        <li>In-app notifications</li>
                        <li>Push notifications (mobile app)</li>
                        <li>SMS notifications (premium only)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 bg-white p-4 rounded-[20px] border border-[#86AB5D]/20">
                    <img
                      src="/placeholder.svg?height=150&width=400"
                      alt="Notification Settings"
                      className="rounded-lg w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
