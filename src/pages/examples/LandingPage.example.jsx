import React, { useState } from 'react';
import StickyAnnouncementBar from '../../components/Announcements/StickyAnnouncementBar';
import AnnouncementsSection from '../../components/Announcements/AnnouncementsSection';
import ReviewsSection from '../../components/Reviews/ReviewsSection';
import ReviewSubmitModal from '../../components/Reviews/ReviewSubmitModal';

const LandingPageExample = () => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Global Announcement Bar at the top */}
      <StickyAnnouncementBar />

      {/* Main Content Area */}
      <main>
        {/* Hero Section Placeholder */}
        <section className="bg-blue-600 text-white py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Welcome to StudyHub Excellence
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Empowering students to achieve their highest potential through guided learning.
            </p>
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              Share Your Experience
            </button>
          </div>
        </section>

        {/* 2. Latest Updates / Announcements Section */}
        <section className="py-12 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-4">
            <AnnouncementsSection />
          </div>
        </section>

        {/* 3. Students Reviews Section */}
        <ReviewsSection />
      </main>

      {/* 4. Review Submission Modal */}
      <ReviewSubmitModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => alert('Thanks for your review! It will be published once approved.')}
      />
    </div>
  );
};

export default LandingPageExample;
