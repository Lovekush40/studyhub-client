import AnnouncementsSection from "../components/Announcements/AnnouncementsSection";
import ReviewsSection from "../components/Reviews/ReviewsSection";

import { Link } from "react-router-dom";
import { BookOpen, Users, BarChart3, ChevronRight, ShieldCheck, Zap } from "lucide-react";
import StickyAnnouncementBar from "../components/Announcements/StickyAnnouncementBar";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();
  const COACHING_NAME = "Lakshya Academy";

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-in fade-in duration-500">
      <StickyAnnouncementBar />

      {/* Hero Section */}
      <section className="relative flex-1 px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[var(--color-primary)]/10 to-transparent rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="flex flex-col items-start">

            <div className="mb-6 px-3 py-1 rounded-full bg-[var(--color-bg-alt)] border text-sm text-[var(--color-primary)]">
              Classes 9–12 | CBSE • JEE • NEET
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--color-text)] leading-tight">
              <span className="text-[var(--color-primary)]">
                {COACHING_NAME}
              </span>
              : Turning Aspirations into Achievements<br />
              
            </h1>

            <p className="mt-4 text-lg text-[var(--color-text-muted)] max-w-xl">
              Join {COACHING_NAME} and boost your performance with structured tests,
              expert teachers, and real-time progress tracking.
            </p>

            {/* CTA */}
            <div className="flex gap-4 mt-8 animate-in slide-in-from-bottom-6 duration-700 delay-300">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-lg hover:brightness-110 shadow-lg shadow-[var(--color-primary)]/25 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-lg hover:brightness-110 shadow-lg shadow-[var(--color-primary)]/25 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary)]"
                >
                  Student Login
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 text-center w-full max-w-md">
              <div>
                <p className="text-2xl font-bold text-[var(--color-primary)]">500+</p>
                <p className="text-sm text-[var(--color-text-muted)]">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-primary)]">95%</p>
                <p className="text-sm text-[var(--color-text-muted)]">Success Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--color-primary)]">10+</p>
                <p className="text-sm text-[var(--color-text-muted)]">Years Exp.</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=2070&auto=format&fit=crop"
              alt="Coaching Class"
              className="rounded-2xl shadow-lg border"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-[var(--color-bg-alt)] border-t">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">
              Why Choose {COACHING_NAME}?
            </h2>
            <p className="text-[var(--color-text-muted)] mt-2">
              Everything you need to succeed in exams.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {[
              {
                title: "Daily Practice Tests",
                icon: Zap,
                desc: "Regular tests based on CBSE, JEE & NEET pattern.",
              },
              {
                title: "Performance Reports",
                icon: BarChart3,
                desc: "Track your marks, rank and improvement.",
              },
              {
                title: "Expert Faculty",
                icon: Users,
                desc: "Learn from experienced teachers.",
              },
              {
                title: "Structured Courses",
                icon: BookOpen,
                desc: "Well-organized syllabus for 9–12 classes.",
              },
              {
                title: "Secure System",
                icon: ShieldCheck,
                desc: "Safe and role-based student access.",
              },
              {
                title: "Online Test Series",
                icon: Zap,
                desc: "Give tests easily via Google Forms.",
              },
            ].map((f, i) => (
              <div key={f.title} className="p-6 border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] shadow-sm hover:border-[var(--color-primary)] transition-all">
                <f.icon className="w-6 h-6 text-[var(--color-primary)] mb-3" />
                
                <h3 className="font-semibold text-lg text-[var(--color-text)]">
                  {f.title}
                </h3>
                
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {f.desc}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>
      <section className="py-12 bg-gray-50 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4">
          <AnnouncementsSection />
        </div>
      </section>

      <ReviewsSection />

      <section className="py-16 text-center bg-white">
        <h2 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Share Your Experience</h2>
        <Link
          to="/write-review"
          className="inline-block bg-[var(--color-primary)] text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-md mt-4"
        >
          Write a Review
        </Link>
      </section>

    </div>
  );
}