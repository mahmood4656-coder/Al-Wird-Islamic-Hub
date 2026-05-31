import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, Copy, Check, Wallet, Coins, Smartphone } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAutoTriggered?: boolean;
}

export default function DonationModal({ isOpen, onClose, isAutoTriggered = false }: DonationModalProps) {
  const [copied, setCopied] = useState(false);
  const accountNumber = '03025785117';

  // If auto-triggered on mount, save timestamp so it doesn't auto-appear again for 5 days
  useEffect(() => {
    if (isOpen && isAutoTriggered) {
      localStorage.setItem('islamic_app_last_donation_prompt', String(Date.now()));
    }
  }, [isOpen, isAutoTriggered]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = accountNumber;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        console.error('Failed to copy', e);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 overflow-y-auto" role="dialog" aria-modal="true">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-stone/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 md:p-8 text-left align-middle shadow-2xl border border-brand-border transition-all"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-brand-stone hover:bg-brand-light-gray hover:text-brand-text transition cursor-pointer"
                title="بند کریں / Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Heart Accent Decoration */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green mb-5">
                <Heart className="w-7 h-7 fill-brand-green/20 text-brand-green animate-pulse" />
              </div>

              {/* Content in Urdu (RTL) */}
              <div className="text-center space-y-4" dir="rtl">
                <h3 className="text-2xl font-bold text-brand-text font-serif leading-tight">
                  اپیل برائے مالی تعاون
                </h3>
                
                <p className="text-brand-stone text-sm leading-relaxed font-sans max-w-lg mx-auto">
                  محترم قارئین و سامعین، اس اسلامی آڈیو پراجیکٹ کو مکمل طور پر 
                  <strong className="text-brand-green"> مفت اور بغیر کسی اشتہار کے </strong> 
                  چلانے کے لیے مسلسل ماہانہ اخراجات آتے ہیں۔ اس مبارک تعلیمی و دعوتی پراجیکٹ کے اخراجات کو پورا کرنے اور اسے مستقل جاری رکھنے کے لیے آپ کے مالی تعاون کی اشد ضرورت ہے۔
                </p>

                <p className="text-brand-stone text-xs leading-normal font-sans border-t border-brand-border pt-3">
                  (Dear users, keeping this Islamic audio application completely ad-free and free for everyone incurs real server &amp; development expenses. Please generously consider donating to help support and cover the continuing costs.)
                </p>

                {/* Account details card */}
                <div className="bg-brand-light-gray/70 border border-brand-border rounded-2xl p-4 md:p-5 mt-4 space-y-4 text-right">
                  <div className="flex items-center justify-between border-b border-brand-border pb-2">
                    <span className="text-xs font-bold text-brand-stone flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-brand-green" /> تفصیلاتِ اکاؤنٹ (Account Details)
                    </span>
                    <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-2.5 py-1 rounded-full border border-brand-green/20">
                      Pakistan Mobile Wallets
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Payment methods */}
                    <div className="space-y-1">
                      <span className="text-xs text-brand-stone block font-bold">بینک / سروس:</span>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                        <span className="text-sm font-bold text-brand-text">Easypaisa / JazzCash</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-brand-stone block font-bold">اکاؤنٹ ہولڈر کا نام:</span>
                      <span className="text-sm font-bold text-brand-text">Mehmood Ghafoor (محمود غفور)</span>
                    </div>
                  </div>

                  {/* Copy Account number wrapper */}
                  <div className="pt-2">
                    <span className="text-xs text-brand-stone block font-bold mb-1.5">اکاؤنٹ نمبر (ایزی‌پیسہ اور جیزکیش):</span>
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-brand-border p-1.5 pl-3" dir="ltr">
                      <div className="flex items-center gap-2 flex-grow">
                        <Smartphone className="w-4 h-4 text-brand-stone" />
                        <span className="font-mono text-base font-bold text-brand-text tracking-wider">{accountNumber}</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          copied
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-brand-green text-white hover:bg-brand-green/90 border-transparent shadow-sm'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>کاپی ہو گیا</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>نمبر کاپی کریں</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center font-serif text-[#8A8E82] text-xs pt-2">
                  جزاکم اللہ خیرا۔ اللہ تعالی آپ کے جان و مال میں برکتیں عطا فرمائے۔ آمین۔
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5" dir="rtl">
                <button
                  onClick={onClose}
                  className="w-full sm:w-1/2 px-5 py-3 rounded-xl border border-brand-border text-xs font-bold text-brand-stone hover:bg-brand-light-gray hover:text-brand-text transition cursor-pointer"
                >
                  پھر یاد دلائیں (Remind Me Later)
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-1/2 bg-brand-green text-white px-5 py-3 rounded-xl text-xs font-bold shadow-sm hover:bg-brand-green/90 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4" />
                  <span>میں نے تعاون کر دیا ہے / بند کریں</span>
                </button>
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
