import React from 'react';
import { 
  Building, 
  Mail, 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  Heart, 
  ChevronRight, 
  ExternalLink,
  Info
} from 'lucide-react';

export default function AboutInfoHub() {
  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto text-left">
      {/* Hero Banner Area */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 font-arabic text-8xl pointer-events-none select-none">
          الْوِرْدُ
        </div>
        
        <span className="text-[10px] font-black uppercase text-brand-green font-mono tracking-widest bg-brand-green/10 px-3 py-1 rounded-full">
          About &amp; Legals • معلومات و قانونی سرگرمیاں
        </span>
        
        <h2 className="text-2xl font-black text-brand-text mt-4 flex items-center gap-2">
          <span>Al-Wird Islamic Portal Shield</span>
        </h2>
        
        <p className="text-xs text-brand-stone mt-2 leading-relaxed max-w-2xl">
          Designed and maintained as an authentic <strong>Sadqa-e-Jariya (صدقہ جاریہ)</strong> digital gift for the global Muslim community. This application provides dual-linguistic guidance (English and Urdu) for noble Quranic recitation, authentic defensive Azkar shields, Prophetic Dua equations, and offline-compatible audio streams.
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
            ✓ 100% Ad-Free for Preservation
          </span>
          <span className="text-[10.5px] font-bold text-brand-green bg-brand-green/5 px-2.5 py-1 rounded-lg border border-brand-green/10">
            ✓ No Tracking &amp; Privacy First
          </span>
          <span className="text-[10.5px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            ✓ Offline Audio Support
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Contact and Host Organisation */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 border-b border-brand-border pb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-brand-stone uppercase tracking-wider font-mono block">Developer &amp; Host Organisation</span>
              <h3 className="text-sm font-black text-brand-text">Punjab Laboratories &amp; Genetic Centre</h3>
            </div>
          </div>

          <p className="text-xs text-brand-stone leading-relaxed">
            Developed and maintained by <strong>Punjab Laboratories &amp; Genetic Centre</strong>. Our mission is to combine genetic diagnostics excellence with premium digital public assets.
          </p>

          <div className="space-y-2.5 pt-2">
            {/* Organisation Detail */}
            <div className="flex items-start gap-3 p-3 bg-brand-light-gray/40 rounded-xl border border-brand-border/50">
              <Building className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-brand-text block">Punjab Laboratories &amp; Genetic Centre</span>
                <span className="text-[10.5px] text-brand-stone">Diagnostic Precision &amp; Spiritual Support services.</span>
              </div>
            </div>

            {/* Email Address */}
            <a 
              href="mailto:plgenetics1@gmail.com" 
              className="flex items-center justify-between p-3 bg-brand-light-gray/40 hover:bg-brand-green/5 hover:border-brand-green/20 rounded-xl border border-brand-border/50 transition cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <div className="text-xs text-left">
                  <span className="font-bold text-brand-text block">Official Inquiry Email</span>
                  <span className="text-[10.5px] text-brand-stone font-mono">plgenetics1@gmail.com</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-brand-stone/60 group-hover:text-brand-green group-hover:translate-x-0.5 transition" />
            </a>

            {/* WhatsApp Link Contact */}
            <a 
              href="https://wa.me/923134656654" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between p-3 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 rounded-xl transition cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-left">
                  <span className="font-bold text-emerald-800 focus:text-emerald-950 block">Direct WhatsApp Helpline</span>
                  <span className="text-[10.5px] text-emerald-600 font-bold font-mono">+92-3134656654</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600/50 group-hover:text-emerald-700 transition" />
            </a>
          </div>
        </div>

        {/* Right Side: Legal Disclaimer */}
        <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 border-b border-brand-border pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-bold text-brand-stone uppercase tracking-wider font-mono block">Important Caution</span>
              <h3 className="text-sm font-black text-brand-text">Spiritual &amp; Medical Disclaimer</h3>
            </div>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-brand-stone">
            <p>
              <strong>1. Authenticity:</strong> All Qur'anic verses (Ayat) and Prophetic Duas (Supplications) are sourced directly from authenticated Tafsirs (e.g. Ibn Katheer) and established collections (Sahih Al-Bukhari, Sahih Muslim, Hisnul Muslim).
            </p>
            <p>
              <strong>2. Spiritual Formulas (Wazaif):</strong> Recitation metrics provided (e.g., 100x Durood-e-Pak, defensive wird counts) are aimed purely for spiritual purification and mental resilience.
            </p>
            <p>
              <strong>3. Clinical Treatment Notice:</strong> Islamic prayers serve as a powerful metaphysical shield and spiritual accelerator; they do not replace standard clinical, biological, or genetic medical protocols. For any genetic research, health checkups, or general physical issues, please consult direct specialists such as <strong>Punjab Laboratories &amp; Genetic Centre</strong> or your localized healthcare provider.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy Panel */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-brand-border pb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-brand-stone uppercase tracking-wider font-mono block">Regulatory Compliance</span>
            <h3 className="text-sm font-black text-brand-text">Google Play Compliant Privacy Policy</h3>
          </div>
        </div>

        <div className="text-xs text-brand-stone space-y-4 leading-relaxed">
          <p>
            This privacy policy ("Policy") describes the absolute data privacy standards of the <strong>Al-Wird Islamic Hub</strong> mobile and web application. Designed for direct simplicity and zero harvesting.
          </p>

          <div className="space-y-3 bg-brand-light-gray/30 p-4 rounded-2xl border border-brand-border/45">
            <div>
              <strong className="text-brand-text block mb-0.5">1. Zero Cloud Data Collection &amp; Registration</strong>
              <span>We do not require user account registration, login verification, or profile creations. Your spiritual progress, completed Tasbih session histories, and Favorites arrays remain 100% inside your physical device's Secure Local Sandboxes (LocalStorage/Preferences).</span>
            </div>
            
            <div>
              <strong className="text-brand-text block mb-0.5">2. Geolocation/GPS Lookup Is Purely Local</strong>
              <span>To calculate highly accurate Islamic prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha), Al-Wird offers localized city coordinates. Any manual coordinate retrieval is computed entirely on-device, or directly passed locally to coordinate mathematical state equations. Absolute GPS logs are never gathered, sold, or shared.</span>
            </div>

            <div>
              <strong className="text-brand-text block mb-0.5">3. Local File Caching (Downloads)</strong>
              <span>Our audio downloading utility caches recitative files locally inside the application drawer (using browser local file storage or device direct paths). No central servers collect statistics on what tracks you stream or preserve.</span>
            </div>

            <div>
              <strong className="text-brand-text block mb-0.5">4. Third-Party Audits &amp; Advertising</strong>
              <span>To preserve the sanctity and pure focus of spiritual remembrance, the app is 100% ad-free. No telemetry SDKs (AdMob, Facebook Audience Network, or other data commercialization layers) are integrated.</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10.5px]">
            <span>Last Updated: May 30, 2026</span>
            <div className="flex gap-4">
              <span>Contact Officer: <strong>Mahmood</strong></span>
              <a href="mailto:plgenetics1@gmail.com" className="text-brand-green font-bold hover:underline">plgenetics1@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* Intention statement banner */}
      <div className="bg-[#FAFBF9] border border-brand-green/20 rounded-3xl p-5 text-center flex flex-col items-center justify-center space-y-2 select-none">
        <Heart className="w-5 h-5 text-brand-green fill-brand-green animate-pulse" />
        <span className="font-arabic text-sm font-bold text-brand-green">إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ</span>
        <p className="text-xs font-black text-brand-text">"Actions are judged by their intentions."</p>
        <p className="text-[11px] text-brand-stone">May Allah SWT accept this humble service as a continuous Sadqa Jariya. Developed and maintained by Punjab Laboratories &amp; Genetic Centre. Ameen.</p>
      </div>
    </div>
  );
}
