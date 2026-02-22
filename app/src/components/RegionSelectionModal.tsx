import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, GraduationCap, BookOpen, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { UserPreferences } from '@/types';
import { REGIONS, SCHOOL_LEVELS, DEPARTMENTS } from '@/data/constants';

interface RegionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
}

export function RegionSelectionModal({ isOpen, onClose, onComplete }: RegionSelectionModalProps) {
  const [step, setStep] = useState<'region' | 'country' | 'school' | 'department'>('region');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSchoolLevel, setSelectedSchoolLevel] = useState('');

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setStep('country');
  };

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setStep('school');
  };

  const handleSchoolSelect = (level: string) => {
    setSelectedSchoolLevel(level);
    setStep('department');
  };

  const handleDepartmentSelect = (dept: string) => {
    const preferences: UserPreferences = {
      region: selectedRegion,
      country: selectedCountry,
      schoolLevel: selectedSchoolLevel,
      department: dept,
    };
    onComplete(preferences);
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('region');
    setSelectedRegion('');
    setSelectedCountry('');
    setSelectedSchoolLevel('');
    onClose();
  };

  const handleBack = () => {
    if (step === 'country') {
      setStep('region');
      setSelectedCountry('');
    } else if (step === 'school') {
      setStep('country');
      setSelectedSchoolLevel('');
    } else if (step === 'department') {
      setStep('school');
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'region': return 'Select Your Region';
      case 'country': return 'Select Your Country';
      case 'school': return 'Select School Level';
      case 'department': return 'Select Department';
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 'region': return <MapPin className="h-6 w-6" />;
      case 'country': return <MapPin className="h-6 w-6" />;
      case 'school': return <GraduationCap className="h-6 w-6" />;
      case 'department': return <BookOpen className="h-6 w-6" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              {/* Glass Card */}
              <div className="relative backdrop-blur-2xl bg-white/95 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {step !== 'region' && (
                      <Button
                        onClick={handleBack}
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-100"
                      >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                      </Button>
                    )}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-500 flex items-center justify-center text-white">
                      {getStepIcon()}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{getStepTitle()}</h2>
                  </div>
                  <Button
                    onClick={resetAndClose}
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {step === 'region' && (
                      <motion.div
                        key="region"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-4"
                      >
                        {REGIONS.map((region) => (
                          <motion.button
                            key={region.region}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRegionSelect(region.region)}
                            className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-300 hover:shadow-lg transition-all text-center group"
                          >
                            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                              {region.region === 'Europe' && '🇪🇺'}
                              {region.region === 'America' && '🌎'}
                              {region.region === 'Gulf' && '🏜️'}
                              {region.region === 'Africa' && '🌍'}
                              {region.region === 'Asia' && '🌏'}
                              {region.region === 'Oceania' && '🦘'}
                            </div>
                            <h3 className="font-semibold text-gray-900">{region.region}</h3>
                            <p className="text-sm text-gray-500 mt-1">{region.countries.length} countries</p>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}

                    {step === 'country' && (
                      <motion.div
                        key="country"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <p className="text-gray-600 mb-4">
                          Selected region: <span className="font-medium text-emerald-700">{selectedRegion}</span>
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                          {REGIONS.find(r => r.region === selectedRegion)?.countries.map((country) => (
                            <motion.button
                              key={country}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCountrySelect(country)}
                              className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left flex items-center justify-between group"
                            >
                              <span className="font-medium text-gray-900">{country}</span>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === 'school' && (
                      <motion.div
                        key="school"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <p className="text-gray-600 mb-4">
                          Selected country: <span className="font-medium text-emerald-700">{selectedCountry}</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {SCHOOL_LEVELS.map((level) => (
                            <motion.button
                              key={level}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSchoolSelect(level)}
                              className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all text-center group"
                            >
                              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                                {level === 'Primary' && '🎒'}
                                {level === 'Middle' && '📚'}
                                {level === 'High' && '🎓'}
                                {level === 'University' && '🏛️'}
                              </div>
                              <h3 className="font-semibold text-gray-900">{level}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {DEPARTMENTS[level]?.length || 0} departments
                              </p>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {step === 'department' && (
                      <motion.div
                        key="department"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <p className="text-gray-600 mb-4">
                          Selected level: <span className="font-medium text-emerald-700">{selectedSchoolLevel}</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                          {DEPARTMENTS[selectedSchoolLevel]?.map((dept) => (
                            <motion.button
                              key={dept}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleDepartmentSelect(dept)}
                              className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left flex items-center justify-between group"
                            >
                              <span className="font-medium text-gray-900">{dept}</span>
                              <Check className="h-4 w-4 text-gray-400 group-hover:text-green-500" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Progress Indicator */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-center gap-2">
                    {['region', 'country', 'school', 'department'].map((s, index) => (
                      <div key={s} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          step === s 
                            ? 'bg-emerald-600' 
                            : ['region', 'country', 'school', 'department'].indexOf(step) > index
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`} />
                        {index < 3 && (
                          <div className={`w-8 h-px ${
                            ['region', 'country', 'school', 'department'].indexOf(step) > index
                              ? 'bg-green-500'
                              : 'bg-gray-300'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
