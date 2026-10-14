import React from 'react';
import {
  Filter,
  RotateCcw,
  Search,
  DollarSign,
  Award,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { FilterState, Subject, Gender, Language } from '../types/qari';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const handleGenderChange = (gender: 'all' | Gender) => {
    onFilterChange({ ...filters, gender });
  };

  const handleSubjectChange = (subject: 'all' | Subject) => {
    onFilterChange({ ...filters, subject });
  };

  const handleLanguageChange = (language: 'all' | Language) => {
    onFilterChange({ ...filters, language });
  };

  const handleCurrencyChange = (currency: 'USD' | 'PKR') => {
    // Adjust default price range boundaries based on currency
    const newMin = currency === 'PKR' ? 2500 : 10;
    const newMax = currency === 'PKR' ? 10000 : 35;
    onFilterChange({
      ...filters,
      currency,
      minPrice: newMin,
      maxPrice: newMax,
    });
  };

  const handleSanadToggle = () => {
    onFilterChange({ ...filters, sanadOnly: !filters.sanadOnly });
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handlePriceChange = (val: number) => {
    onFilterChange({ ...filters, maxPrice: val });
  };

  const maxSliderLimit = filters.currency === 'PKR' ? 12000 : 40;
  const minSliderLimit = filters.currency === 'PKR' ? 2000 : 10;
  const priceStep = filters.currency === 'PKR' ? 500 : 2;

  // Active filter count calculation
  let activeFilterCount = 0;
  if (filters.gender !== 'all') activeFilterCount++;
  if (filters.subject !== 'all') activeFilterCount++;
  if (filters.language !== 'all') activeFilterCount++;
  if (filters.sanadOnly) activeFilterCount++;
  if (filters.searchQuery.trim()) activeFilterCount++;
  if (filters.maxPrice < maxSliderLimit) activeFilterCount++;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <span>Filter &amp; Refine Tutors</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white">
                  {activeFilterCount} Active
                </span>
              )}
            </h2>
            <p className="text-[11px] text-gray-500">
              Showing <strong className="text-emerald-950 font-semibold">{totalResults}</strong> certified Quran instructors
            </p>
          </div>
        </div>

        {/* Currency & Sort Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Currency Toggle */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleCurrencyChange('USD')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filters.currency === 'USD'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyChange('PKR')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                filters.currency === 'PKR'
                  ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              PKR (Rs)
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleSortChange(e.target.value as FilterState['sortBy'])}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold text-xs focus:outline-emerald-600 cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated (★ 5.0)</option>
              <option value="experience">Most Experienced</option>
              <option value="price_low">Hourly Rate: Low to High</option>
              <option value="price_high">Hourly Rate: High to Low</option>
            </select>
          </div>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-700 hover:text-rose-900 hover:bg-rose-50 rounded-xl transition font-medium cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Chips & Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Gender Filter Buttons */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Tutor Gender
          </label>
          <div className="grid grid-cols-3 gap-1 bg-gray-100/90 p-1 rounded-xl font-medium">
            <button
              type="button"
              onClick={() => handleGenderChange('all')}
              className={`py-1.5 rounded-lg text-center transition cursor-pointer ${
                filters.gender === 'all'
                  ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('male')}
              className={`py-1.5 rounded-lg text-center transition cursor-pointer ${
                filters.gender === 'male'
                  ? 'bg-white text-emerald-950 font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => handleGenderChange('female')}
              className={`py-1.5 rounded-lg text-center transition cursor-pointer ${
                filters.gender === 'female'
                  ? 'bg-white text-pink-900 font-bold shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Female
            </button>
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Subject Focus
          </label>
          <select
            value={filters.subject}
            onChange={(e) => handleSubjectChange(e.target.value as 'all' | Subject)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-emerald-600 cursor-pointer"
          >
            <option value="all">All Subjects</option>
            <option value="Tajweed">Tajweed Rules</option>
            <option value="Nazra">Nazra Quran</option>
            <option value="Hifz">Hifz (Memorization)</option>
            <option value="Noorani Qaida">Noorani Qaida</option>
            <option value="Arabic Language">Arabic Language</option>
            <option value="Islamic Studies">Islamic Studies</option>
            <option value="Tafseer">Tafseer</option>
          </select>
        </div>

        {/* Language Filter */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
            Spoken Language
          </label>
          <select
            value={filters.language}
            onChange={(e) => handleLanguageChange(e.target.value as 'all' | Language)}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-emerald-600 cursor-pointer"
          >
            <option value="all">All Languages</option>
            <option value="English">English</option>
            <option value="Urdu">Urdu</option>
            <option value="Arabic">Arabic</option>
            <option value="Pashto">Pashto</option>
          </select>
        </div>

        {/* Price Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Max Rate:
            </label>
            <span className="font-bold text-emerald-900">
              {filters.currency === 'PKR'
                ? `Up to Rs ${filters.maxPrice.toLocaleString()}/hr`
                : `Up to $${filters.maxPrice}/hr`}
            </span>
          </div>
          <input
            type="range"
            min={minSliderLimit}
            max={maxSliderLimit}
            step={priceStep}
            value={filters.maxPrice}
            onChange={(e) => handlePriceChange(Number(e.target.value))}
            className="w-full accent-emerald-800 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>
              {filters.currency === 'PKR' ? `Rs ${minSliderLimit}` : `$${minSliderLimit}`}
            </span>
            <span>
              {filters.currency === 'PKR' ? `Rs ${maxSliderLimit}` : `$${maxSliderLimit}`}
            </span>
          </div>
        </div>
      </div>

      {/* Verification Filter Pill */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleSanadToggle}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
            filters.sanadOnly
              ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs font-bold'
              : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
          }`}
        >
          <Award className={`w-3.5 h-3.5 ${filters.sanadOnly ? 'text-amber-700' : 'text-gray-400'}`} />
          <span>Sanad Muttasil (Ijazah Chain) Only</span>
        </button>

        {/* Quick subject shortcuts */}
        <span className="text-gray-300 hidden sm:inline">|</span>
        <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">Quick filter:</span>
        <button
          type="button"
          onClick={() => handleSubjectChange(filters.subject === 'Tajweed' ? 'all' : 'Tajweed')}
          className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
            filters.subject === 'Tajweed'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tajweed Specialist
        </button>
        <button
          type="button"
          onClick={() => handleGenderChange(filters.gender === 'female' ? 'all' : 'female')}
          className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
            filters.gender === 'female'
              ? 'bg-pink-700 text-white font-bold'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Female Qaria Only
        </button>
        <button
          type="button"
          onClick={() => handleSubjectChange(filters.subject === 'Hifz' ? 'all' : 'Hifz')}
          className={`px-2.5 py-1 rounded-lg text-xs transition cursor-pointer ${
            filters.subject === 'Hifz'
              ? 'bg-emerald-800 text-white font-bold'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Hifz Memorization
        </button>
      </div>
    </div>
  );
};
