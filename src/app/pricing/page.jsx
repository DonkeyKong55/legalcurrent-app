"use client";
import { useState } from "react";
import { Check, Zap, Crown, Building2, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";

const PricingCard = ({ plan, isPopular = false }) => (
  <div
    className={`relative bg-white dark:bg-[#1E1E1E] rounded-2xl border-2 ${
      isPopular
        ? "border-blue-600 shadow-xl scale-105"
        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    } transition-all duration-300 overflow-hidden`}
  >
    {isPopular && (
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium py-2 px-4 text-center">
        Most Popular Choice
      </div>
    )}

    <div className={`p-8 ${isPopular ? "pt-14" : ""}`}>
      {/* Plan Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${plan.iconBg}`}
        >
          <plan.icon size={24} className={plan.iconColor} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {plan.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-8">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            ${plan.price}
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            /{plan.period}
          </span>
        </div>
        {plan.originalPrice && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-gray-500 line-through">
              ${plan.originalPrice}
            </span>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
              Save ${plan.originalPrice - plan.price}
            </span>
          </div>
        )}
      </div>

      {/* Features */}
      <div className="space-y-4 mb-8">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
              <Check size={12} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
          isPopular
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
            : "bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900"
        }`}
      >
        <span>{plan.cta}</span>
        <ArrowRight size={16} />
      </button>

      {/* Additional Info */}
      {plan.note && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {plan.note}
        </p>
      )}
    </div>
  </div>
);

const FeatureComparison = () => {
  const features = [
    { name: "Daily Articles", premium: "20-30", team: "20-30" },
    { name: "AI Analysis", premium: "Premium", team: "Premium" },
    {
      name: "Search History",
      premium: "Unlimited",
      team: "Unlimited",
    },
    {
      name: "Download Articles",
      premium: "✅ PDF & Excel",
      team: "✅ PDF & Excel",
    },
    { name: "Mobile App", premium: "✅", team: "✅" },
    { name: "Advanced Filters", premium: "✅", team: "✅" },
    { name: "Bookmarks", premium: "✅", team: "✅" },
    { name: "Real-time Alerts", premium: "✅", team: "✅" },
    {
      name: "Team Members",
      premium: "1 user",
      team: "Up to 10 users",
    },
  ];

  return (
    <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 bg-gray-50 dark:bg-[#262626] border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Feature Comparison
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Compare what's included in each plan
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                Feature
              </th>
              <th className="text-center p-4 font-semibold text-blue-600 dark:text-blue-400">
                Premium
              </th>
              <th className="text-center p-4 font-semibold text-purple-600 dark:text-purple-400">
                Team
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0 ? "bg-gray-50 dark:bg-[#262626]" : ""
                }
              >
                <td className="p-4 text-gray-900 dark:text-white font-medium">
                  {feature.name}
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  {feature.premium}
                </td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                  {feature.team}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");

  const plans = [
    {
      name: "Premium",
      description: "For individual legal professionals",
      price: billingCycle === "monthly" ? 29 : 299,
      originalPrice: billingCycle === "monthly" ? null : null,
      period: billingCycle === "monthly" ? "month" : "year",
      icon: Crown,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      features: [
        "20-30 articles per day",
        "Premium AI insights & summaries",
        "Real-time alerts & notifications",
        "Unlimited search history",
        "Download articles (PDF & Excel)",
        "Advanced search filters",
        "Mobile app access",
        "Bookmark articles",
        "1 user account",
      ],
      cta: "Start Premium Trial",
      note: "30-day free trial",
    },
    {
      name: "Team",
      description: "For legal teams and small firms",
      price: billingCycle === "monthly" ? 58 : 599,
      originalPrice: billingCycle === "monthly" ? null : null,
      period: billingCycle === "monthly" ? "month" : "year",
      icon: Building2,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400",
      features: [
        "20-30 articles per day",
        "Premium AI insights & summaries",
        "Real-time alerts & notifications",
        "Unlimited search history",
        "Download articles (PDF & Excel)",
        "Advanced search filters",
        "Mobile app access",
        "Bookmark articles",
        "Up to 10 team members",
      ],
      cta: "Start Team Trial",
      note: "Perfect for teams of 2-10 users",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212]">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="true"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 font-[Inter]">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your legal practice. All plans include
            our AI-powered insights and comprehensive Australian legal news
            coverage.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-[#1E1E1E] rounded-full p-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full text-xs">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} isPopular={index === 0} />
          ))}
        </div>

        {/* Feature Comparison */}
        <FeatureComparison />

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes
                take effect immediately and are processed automatically.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Premium and Team plans include a 30-day free trial. No credit
                card required.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards and PayPal. All payments are
                processed automatically through secure payment gateways.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer student discounts?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we offer 50% off Premium plans for verified students and
                academic institutions.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
            Join thousands of legal professionals who rely on LegalCurrent for
            comprehensive, AI-powered legal news and insights.
          </p>
          <button className="bg-white text-blue-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 inline-flex items-center space-x-2">
            <span>Start Your Free Trial</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </main>
    </div>
  );
}
