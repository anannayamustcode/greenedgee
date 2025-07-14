
import React, { useState } from 'react';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    feedbackType: '',
    rating: '',
    comments: '',
    suggestions: '',
    wouldRecommend: '',
    file: null as File | null,
    consent: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    alert('Thank you for your feedback!');
  };

  return (
    <div className="mt-15 bg-gray-50 min-h-screen px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">📝 Feedback Form</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-xl space-y-6"
      >
        {/* Row Field Component */}
        {[
          { label: "Name", name: "name", type: "text", placeholder: "Enter your name" },
          { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
          { label: "Order ID", name: "orderId", type: "text", placeholder: "Optional" }
        ].map(field => (
          <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-6" key={field.name}>
            <label className="w-40 font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name as keyof typeof formData] as string}
              placeholder={field.placeholder}
              onChange={handleChange}
              className="border rounded px-4 py-2 w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        ))}

        {/* Feedback Type */}
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-6">
          <label className="w-40 font-medium text-gray-700">Feedback Type</label>
          <select
            name="feedbackType"
            value={formData.feedbackType}
            onChange={handleChange}
            className="border rounded px-4 py-2 w-full shadow-sm"
          >
            <option value="">Select...</option>
            <option value="product">Product</option>
            <option value="delivery">Delivery</option>
            <option value="store">Store</option>
            <option value="support">Support</option>
            <option value="website">Website</option>
          </select>
        </div>

        {/* Rating */}
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-6">
          <label className="w-40 font-medium text-gray-700">Rating</label>
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="border rounded px-4 py-2 w-full shadow-sm"
          >
            <option value="">Select...</option>
            <option value="5">⭐⭐⭐⭐⭐</option>
            <option value="4">⭐⭐⭐⭐</option>
            <option value="3">⭐⭐⭐</option>
            <option value="2">⭐⭐</option>
            <option value="1">⭐</option>
          </select>
        </div>

        {/* Comments */}
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-6">
          <label className="w-40 font-medium text-gray-700">Comments</label>
          <textarea
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows={3}
            placeholder="Describe your experience"
            className="border rounded px-4 py-2 w-full shadow-sm resize-none"
          />
        </div>

        {/* Suggestions */}
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-6">
          <label className="w-40 font-medium text-gray-700">Suggestions</label>
          <textarea
            name="suggestions"
            value={formData.suggestions}
            onChange={handleChange}
            rows={2}
            placeholder="What can we improve?"
            className="border rounded px-4 py-2 w-full shadow-sm resize-none"
          />
        </div>

        {/* Recommendation */}
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-6">
          <label className="w-40 font-medium text-gray-700">Recommend Us?</label>
          <select
            name="wouldRecommend"
            value={formData.wouldRecommend}
            onChange={handleChange}
            className="border rounded px-4 py-2 w-full shadow-sm"
          >
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="maybe">Maybe</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* File Upload */}
        <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-6">
          <label className="w-40 font-medium text-gray-700">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        {/* Consent */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-sm text-gray-600">I agree to the terms & privacy policy</label>
        </div>

        <button
          type="submit"
          disabled={!formData.consent}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-sm transition disabled:opacity-50"
        >
          Submit Feedback
        </button>
      </form>

      {/* HELP SECTION */}
      <section className="bg-blue-50 mt-10 py-10 px-6 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hello,</h2>
        <p className="text-gray-700 mb-6">
          Choose a help topic or <a href="#" className="text-blue-600 underline">chat with us</a>
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
          {[
            { label: 'Edit my order', img: '📝' },
            { label: 'Track my order', img: '📦' },
            { label: 'Pickup & delivery', img: '🚗' },
            { label: 'Member benefits', img: '👕' },
          ].map(({ label, img }) => (
            <div key={label} className="flex flex-col items-center cursor-pointer hover:text-blue-600 transition">
              <div className="text-4xl mb-2 pointer-cursor">{img}</div>
              <span className="text-gray-700 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FeedbackForm;
