import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Award, 
  Star, 
  Navigation, 
  Stethoscope, 
  CheckCircle2, 
  ExternalLink,
  Clock,
  DollarSign,
  Filter,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Doctor } from '../../types/doctor';
import { doctorsApi, DoctorFilterParams } from '../../api/doctors';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface DoctorDirectoryProps {
  onSelectDoctorForReview?: (doctor: Doctor) => void;
  pendingAssessmentId?: string;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  onSelectDoctorForReview,
  pendingAssessmentId
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState<boolean>(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: DoctorFilterParams = {};
      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedCity !== 'All') params.city = selectedCity;
      if (selectedArea !== 'All') params.area = selectedArea;
      if (selectedSpecialty !== 'All') params.specialty = selectedSpecialty;
      if (userLocation) {
        params.user_lat = userLocation.lat;
        params.user_lon = userLocation.lon;
      }

      const res = await doctorsApi.getDoctors(params);
      setDoctors(res.doctors);
      setTotal(res.total);
    } catch (err: any) {
      showToast('Could not load doctors list. Please check server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedCity, selectedArea, selectedSpecialty, userLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
        setLocating(false);
        showToast('Location detected! Doctors sorted by nearest distance.', 'success');
      },
      (err) => {
        setLocating(false);
        // Default to Karachi Clifton coordinates for demo
        setUserLocation({ lat: 24.8138, lon: 67.0300 });
        showToast('Location access denied. Using Karachi coordinates for proximity demo.', 'info');
      },
      { timeout: 10000 }
    );
  };

  const getGoogleMapsUrl = (doc: Doctor) => {
    const query = encodeURIComponent(`${doc.full_name} ${doc.hospital_affiliation} ${doc.clinic_address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const getWhatsAppUrl = (phone?: string, docName?: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`Assalam-o-Alaikum ${docName}, I found your profile on Dermalytics Skin & Hair Health Platform. I would like to inquire about a consultation.`);
    return `https://wa.me/${cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : cleanPhone}?text=${msg}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-teal-800 text-white p-8 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-sky-300" />
            <span>PMDC-Verified Pakistani Dermatologists & Trichologists</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Find Top Skin & Hair Specialists Near You
          </h1>

          <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
            Connect with certified dermatologists across Karachi (Clifton, Stadium Rd, Gulshan, PECHS, North Nazimabad), Lahore, and Islamabad. Schedule clinical visits, get direct WhatsApp guidance, or request an official second opinion on your AI scans.
          </p>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>PMDC Certified</span>
            </span>
            <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Second-Opinion Reviews</span>
            </span>
            <span className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-sky-300" />
              <span>Real-Time Distance Sorting</span>
            </span>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, hospital (e.g. Aga Khan, Dow, Liaquat), or specialty..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition flex items-center justify-center space-x-2 ${
              userLocation
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Navigation className={`w-4 h-4 ${locating ? 'animate-spin' : userLocation ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{locating ? 'Locating...' : userLocation ? 'Nearest to Me' : 'Sort by Proximity'}</span>
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-500 font-bold mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setSelectedArea('All');
            }}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="All">All Cities</option>
            <option value="Karachi">Karachi</option>
            <option value="Lahore">Lahore</option>
            <option value="Islamabad">Islamabad</option>
          </select>

          {/* Area Filter (when Karachi is selected) */}
          {selectedCity === 'Karachi' && (
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="All">All Karachi Areas</option>
              <option value="Clifton">Clifton</option>
              <option value="Stadium Road">Stadium Road</option>
              <option value="Gulshan-e-Iqbal">Gulshan-e-Iqbal</option>
              <option value="PECHS">PECHS</option>
              <option value="North Nazimabad">North Nazimabad</option>
            </select>
          )}

          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="All">All Specialties</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Trichologist">Trichologist (Hair)</option>
            <option value="Dermato-Oncologist">Dermato-Oncologist (Lesions)</option>
            <option value="Pediatric Dermatologist">Pediatric Dermatologist</option>
          </select>

          <span className="ml-auto text-slate-400 font-medium">
            Found <strong>{total}</strong> verified specialist{total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No doctors match your filter criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try resetting your city, area, or specialty filters to see all available specialists across Pakistan.
          </p>
          <button
            onClick={() => {
              setSelectedCity('All');
              setSelectedArea('All');
              setSelectedSpecialty('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-sky-50 text-sky-700 rounded-xl text-xs font-bold hover:bg-sky-100 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between space-y-5 group hover:border-sky-300"
            >
              {/* Doctor Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-sky-600/20">
                      {doc.full_name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-sky-700 transition">
                          {doc.full_name}
                        </h3>
                        {doc.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
                        PMDC #{doc.pmdc_number}
                      </span>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-xs font-black text-amber-800">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{doc.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Qualifications & Specialty Tags */}
                <div>
                  <p className="text-xs text-slate-600 font-semibold">{doc.qualifications}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {doc.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location & Hospital Info */}
                <div className="space-y-1.5 pt-2 text-xs text-slate-600 border-t border-slate-100">
                  <div className="flex items-start space-x-2">
                    <Award className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                    <span className="font-bold text-slate-800">{doc.hospital_affiliation}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-500 line-clamp-1">{doc.clinic_address}</span>
                  </div>
                  {doc.distance_km !== undefined && doc.distance_km !== null && (
                    <div className="flex items-center space-x-1.5 text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                      <Navigation className="w-3 h-3" />
                      <span>{doc.distance_km.toFixed(1)} km away from you</span>
                    </div>
                  )}
                </div>

                {/* Consultation Fee & Hours */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fee</span>
                    <span className="text-slate-900 font-extrabold text-sm">
                      PKR {doc.consultation_fee.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telehealth</span>
                    <span className={`text-[11px] font-bold ${doc.is_available_online ? 'text-teal-700' : 'text-slate-400'}`}>
                      {doc.is_available_online ? '● Online Available' : '○ Clinic Only'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`tel:${doc.phone}`}
                    className="flex items-center justify-center space-x-1 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                    title="Call Clinic"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                  <a
                    href={getWhatsAppUrl(doc.phone, doc.full_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition"
                    title="WhatsApp Consultation"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={getGoogleMapsUrl(doc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-1 py-2 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition"
                    title="Open in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Maps</span>
                  </a>
                </div>

                {onSelectDoctorForReview && (
                  <button
                    onClick={() => onSelectDoctorForReview(doc)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-sky-200" />
                    <span>Request Scan Review from {doc.full_name.split(' ')[1] || doc.full_name}</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
