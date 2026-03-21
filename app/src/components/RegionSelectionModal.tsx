import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, GraduationCap, BookOpen, ChevronRight, Check } from 'lucide-react';
import type { UserPreferences } from '@/types';
import { REGIONS, SCHOOL_LEVELS, DEPARTMENTS } from '@/data/constants';

interface RegionSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
}

const modalStyle: React.CSSProperties = {
  background: 'rgba(10,15,11,0.85)',
  backdropFilter: 'blur(32px) saturate(180%)',
  WebkitBackdropFilter: 'blur(32px) saturate(180%)',
  border: '1px solid rgba(34,197,94,0.15)',
  borderRadius: '24px',
  overflow: 'hidden',
  width: '100%',
  maxWidth: '600px',
  boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
};

const btnBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(34,197,94,0.1)',
  borderRadius: '14px',
  padding: '16px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  color: '#e8f5ec',
  fontFamily: 'inherit',
  textAlign: 'left' as const,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export function RegionSelectionModal({ isOpen, onClose, onComplete }: RegionSelectionModalProps) {
  const [step, setStep] = useState<'region' | 'country' | 'school' | 'department'>('region');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedSchoolLevel, setSelectedSchoolLevel] = useState('');

  const handleRegionSelect = (region: string) => { setSelectedRegion(region); setStep('country'); };
  const handleCountrySelect = (country: string) => { setSelectedCountry(country); setStep('school'); };
  const handleSchoolSelect = (level: string) => { setSelectedSchoolLevel(level); setStep('department'); };
  const handleDepartmentSelect = (dept: string) => {
    onComplete({ region: selectedRegion, country: selectedCountry, schoolLevel: selectedSchoolLevel, department: dept });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('region'); setSelectedRegion(''); setSelectedCountry(''); setSelectedSchoolLevel('');
    onClose();
  };

  const handleBack = () => {
    if (step === 'country') { setStep('region'); setSelectedCountry(''); }
    else if (step === 'school') { setStep('country'); setSelectedSchoolLevel(''); }
    else if (step === 'department') { setStep('school'); }
  };

  const stepTitles = { region: 'Select Your Region', country: 'Select Your Country', school: 'Select School Level', department: 'Select Department' };
  const stepIcons = { region: '🌍', country: '📍', school: '🎓', department: '📚' };
  const steps = ['region', 'country', 'school', 'department'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetAndClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50 }}
          />
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              style={modalStyle}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {step !== 'region' && (
                    <button onClick={handleBack} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#22c55e' }}>
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                  )}
                  <span style={{ fontSize: '22px' }}>{stepIcons[step]}</span>
                  <h2 style={{ fontFamily: 'inherit', fontSize: '18px', fontWeight: '800', color: '#e8f5ec', margin: 0 }}>{stepTitles[step]}</h2>
                </div>
                <button onClick={resetAndClose} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(134,239,172,0.6)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">

                  {step === 'region' && (
                    <motion.div key="region" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      {REGIONS.map((r) => (
                        <button key={r.region} onClick={() => handleRegionSelect(r.region)}
                          style={{ ...btnBase, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.3)'; }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.1)'; }}>
                          <span style={{ fontSize: '28px', marginBottom: '8px' }}>
                            {r.region === 'Europe' ? '🇪🇺' : r.region === 'America' ? '🌎' : r.region === 'Gulf' ? '🏜️' : r.region === 'Africa' ? '🌍' : r.region === 'Asia' ? '🌏' : '🦘'}
                          </span>
                          <span style={{ fontWeight: '700', fontSize: '14px', color: '#e8f5ec' }}>{r.region}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(134,239,172,0.5)', marginTop: '2px' }}>{r.countries.length} countries</span>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {step === 'country' && (
                    <motion.div key="country" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p style={{ fontSize: '13px', color: 'rgba(134,239,172,0.6)', marginBottom: '14px' }}>
                        Region: <span style={{ color: '#22c55e', fontWeight: '700' }}>{selectedRegion}</span>
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                        {REGIONS.find(r => r.region === selectedRegion)?.countries.map(country => (
                          <button key={country} onClick={() => handleCountrySelect(country)}
                            style={btnBase}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.3)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.1)'; }}>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{country}</span>
                            <ChevronRight className="h-4 w-4 text-emerald-500" style={{ flexShrink: 0 }} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 'school' && (
                    <motion.div key="school" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p style={{ fontSize: '13px', color: 'rgba(134,239,172,0.6)', marginBottom: '14px' }}>
                        Country: <span style={{ color: '#22c55e', fontWeight: '700' }}>{selectedCountry}</span>
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {SCHOOL_LEVELS.map(level => (
                          <button key={level} onClick={() => handleSchoolSelect(level)}
                            style={{ ...btnBase, flexDirection: 'column', alignItems: 'center', padding: '20px', textAlign: 'center' }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.3)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.1)'; }}>
                            <span style={{ fontSize: '26px', marginBottom: '8px' }}>
                              {level === 'Primary' ? '🎒' : level === 'Middle' ? '📚' : level === 'High' ? '🎓' : '🏛️'}
                            </span>
                            <span style={{ fontWeight: '700', fontSize: '14px', color: '#e8f5ec' }}>{level}</span>
                            <span style={{ fontSize: '11px', color: 'rgba(134,239,172,0.5)', marginTop: '2px' }}>{DEPARTMENTS[level]?.length || 0} depts</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 'department' && (
                    <motion.div key="department" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <p style={{ fontSize: '13px', color: 'rgba(134,239,172,0.6)', marginBottom: '14px' }}>
                        Level: <span style={{ color: '#22c55e', fontWeight: '700' }}>{selectedSchoolLevel}</span>
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '8px' }}>
                        {DEPARTMENTS[selectedSchoolLevel]?.map(dept => (
                          <button key={dept} onClick={() => handleDepartmentSelect(dept)}
                            style={btnBase}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(34,197,94,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.3)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.1)'; }}>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>{dept}</span>
                            <Check className="h-4 w-4 text-emerald-400" style={{ flexShrink: 0 }} />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 24px', borderTop: '1px solid rgba(34,197,94,0.08)' }}>
                {steps.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: step === s ? '#22c55e' : steps.indexOf(step) > i ? '#16a34a' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s', boxShadow: step === s ? '0 0 8px rgba(34,197,94,0.5)' : 'none' }} />
                    {i < 3 && <div style={{ width: '24px', height: '1px', background: steps.indexOf(step) > i ? '#16a34a' : 'rgba(255,255,255,0.1)', marginLeft: '4px', marginRight: '4px' }} />}
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
