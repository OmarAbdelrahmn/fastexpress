"use client";
import React, { useState, useEffect } from 'react';
import {
  Menu, X, Phone, Mail, MapPin, ArrowLeft,
  Truck, Globe, BarChart3, ShieldCheck, Clock,
  Users, Building2, Zap, Search, Send, UserCheck
} from 'lucide-react';

export default function ComprehensiveLandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const revealElements = document.querySelectorAll('.reveal-on-scroll');
      revealElements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < window.innerHeight - 100) {
          element.classList.add('is-visible');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  const navLinks = [
    { name: 'الرئيسية', href: '#home' },
    { name: 'من نحن', href: '#about' },
    { name: 'خدماتنا', href: '#services' },
    { name: 'كيف نعمل', href: '#process' },
    { name: 'شركاؤنا', href: '#partners' },
    { name: 'تواصل معنا', href: '#contact' },
    { name: 'دخول الادمن', href: '/admin/login' },
    { name: 'دخول المشرفين', href: '/member/login' }
  ];

  const services = [
    {
      icon: <Truck className="w-12 h-12" />,
      title: "إدارة الأسطول",
      desc: "نوفر دراجات نارية حديثة موديل السنة مع صيانة دورية شاملة.",
      details: ["دراجات 2023-2026", "صيانة فورية ومجانية", "مركبات بديلة"]
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "وقود مدفوع",
      desc: "شراكة استراتيجية مع الدريس لتوفير الوقود بشكل مجاني للكباتن.",
      details: ["شريحة بنزين ذكية", "تغطية كافة المحطات", "تتبع الاستهلاك"]
    },
    {
      icon: <Building2 className="w-12 h-12" />,
      title: "سكن وإعاشة",
      desc: "سكن مؤثث ونظيف مع وجبات يومية لضمان راحة الكابتن.",
      details: ["سكن مكيف ومجهز", "خدمات غسيل وتنظيف", "وجبات غذائية"]
    },
    {
      icon: <ShieldCheck className="w-12 h-12" />,
      title: "رعاية شاملة",
      desc: "نتكفل بكافة الرسوم الحكومية والتأمين الطبي للكابتن.",
      details: ["إصدار الإقامات والرخص", "تأمين طبي شامل", "تغطية الحوادث"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden scroll-smooth" dir="rtl">

      {/* 1. Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-xl py-3' : 'bg-transparent py-4 lg:py-6'}`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            {/* Logo Restored to Larger Size as per user correction */}
            <div className={`${isScrolled ? 'bg-gray-100' : 'bg-gradient-to-tr from-white to-white'} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-all ${isScrolled ? 'w-8 h-8' : 'w-10 h-10 md:w-12 md:h-12'}`}>
              <img src="/2.png" alt="ES Logo" className={`object-contain ${isScrolled ? 'w-7 h-7 ' : 'w-8 h-8 md:w-10 md:h-10'}`} />
            </div>
            <div className="block">
              <h1 className={`font-black tracking-tight transition-colors leading-tight ${isScrolled ? 'text-blue-900 text-base' : 'text-blue-900 lg:text-white text-lg md:text-xl'}`}>Express Service</h1>
              <p className="text-[8px] md:text-[10px] font-bold text-orange-500 tracking-widest uppercase">Third Party Logistics</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link, i) => (
              <a key={i} href={link.href} className={`text-xs xl:text-sm font-bold uppercase tracking-wider hover:text-orange-500 transition-colors ${isScrolled ? 'text-slate-600' : 'text-slate-200'} relative group`}>
                {link.name}
                <span className="absolute -bottom-2 right-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
            <a href="#contact" className="bg-orange-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 transform hover:-translate-y-0.5 text-xs xl:text-sm">
              احصل على عرض سعر
            </a>
          </div>

          <button className="lg:hidden text-orange-500 p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`fixed inset-0 bg-blue-900/98 backdrop-blur-xl z-40 transition-transform duration-500 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link, i) => (
              <a key={i} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-white hover:text-orange-500 transition-colors">
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <header id="home" className="relative w-full min-h-[90vh] lg:min-h-screen flex items-center pt-24 lg:pt-20 overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-900 to-transparent"></div>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full mb-12 lg:mb-0">
          <div className="space-y-6 lg:space-y-8 reveal-on-scroll text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-blue-200 font-medium border border-white/10 text-xs md:text-sm mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              حلول لوجستية متكاملة 3PL
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight">
              نغير مفهوم <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-orange-600">
                السرعة والكفاءة
              </span>
            </h1>
            <p className="text-base md:text-xl text-blue-100 max-w-xl leading-relaxed mx-auto lg:mx-0">
              شريكك الاستراتيجي في إدارة سلاسل الإمداد. نقدم تقنيات متطورة وبنية تحتية قوية لضمان وصول منتجاتك إلى عملائك في الوقت المحدد.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start">
              <a href="#services" className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all flex items-center justify-center gap-2 group w-full sm:w-auto">
                ابدأ الآن
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              </a>
              <a href="#about" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all w-full sm:w-auto text-center">
                تعرف علينا
              </a>
            </div>

            <div className="pt-8 border-t border-white/10 flex gap-8 justify-center lg:justify-start">
              <div>
                <div className="text-2xl md:text-3xl font-black text-white">700+</div>
                <div className="text-blue-300 text-xs md:text-sm">مركبة</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-black text-white">6K+</div>
                <div className="text-blue-300 text-xs md:text-sm">طلبات يومياً</div>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] sm:h-[500px] lg:h-[600px] flex items-center justify-center perspective-1000 mt-8 lg:mt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-md lg:max-w-2xl animate-float">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
              <img src="/2.png" alt="Logistics Dashboard" className="w-[90%] md:w-[70%] h-auto drop-shadow-2xl relative z-10" />

              {/* Floating Cards - "Logo" (Icons) Made Smaller Here */}

              {/* Top Right */}
              <div className="flex absolute top-4 md:top-10 -right-5 bg-white/10 backdrop-blur-xl border border-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl text-white animate-float-delayed shadow-2xl z-20 hover:scale-105 transition-transform">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-green-500/20 p-1 md:p-1.5 rounded-lg text-green-400">
                    <ShieldCheck className="w-3 h-3 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs md:text-sm">مؤمنة بالكامل</div>
                    <div className="text-[8px] md:text-[10px] text-blue-200">حماية 100%</div>
                  </div>
                </div>
              </div>
              {/* Top Left */}
              <div className="flex absolute top-24 -left-2 bg-white/10 backdrop-blur-xl border border-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl text-white animate-float shadow-2xl z-20 hover:scale-105 transition-transform" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-purple-500/20 p-1 md:p-1.5 rounded-lg text-purple-400">
                    <Users className="w-3 h-3 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs md:text-sm">كباتن محترفين</div>
                    <div className="text-[8px] md:text-[10px] text-blue-200">+500 كابتن</div>
                  </div>
                </div>
              </div>

              {/* Bottom Right */}
              <div className="flex absolute bottom-10 md:bottom-32 -right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl text-white animate-float shadow-2xl z-20 hover:scale-105 transition-transform" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-orange-500/20 p-1 md:p-1.5 rounded-lg text-orange-400">
                    <Clock className="w-3 h-3 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs md:text-sm">تسليم في الموعد</div>
                    <div className="text-[8px] md:text-[10px] text-blue-200">دقة 99.9%</div>
                  </div>
                </div>
              </div>
              {/* Bottom Left */}
              <div className="flex absolute bottom-24 -left-1 bg-white/10 backdrop-blur-xl border border-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl text-white animate-float-delayed shadow-2xl z-20 hover:scale-105 transition-transform" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-blue-500/20 p-1 md:p-1.5 rounded-lg text-blue-400">
                    <MapPin className="w-3 h-3 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-xs md:text-sm">تغطية شاملة</div>
                    <div className="text-[8px] md:text-[10px] text-blue-200">داخل جدة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. About Section */}
      <section id="about" className="py-16 lg:py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <div className="w-full lg:w-1/2 reveal-on-scroll order-2 lg:order-1">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-100 rounded-full blur-2xl -z-10"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-100 h-48 lg:h-64 rounded-2xl"></div>
                  <div className="bg-blue-100 h-48 lg:h-64 rounded-2xl mt-8 lg:mt-12"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-xl max-w-[250px] lg:max-w-sm text-center border border-slate-50">
                    <div className="text-4xl lg:text-5xl font-black text-blue-600 mb-2">15+</div>
                    <div className="text-base lg:text-lg font-bold text-slate-800">سنوات من التميز</div>
                    <p className="text-slate-500 text-xs lg:text-sm mt-2">نخدم كبرى الشركات في  جدة</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-6 reveal-on-scroll order-1 lg:order-2 text-center lg:text-right">
              <span className="text-orange-600 font-bold tracking-wider">من نحن</span>
              <h2 className="text-3xl lg:text-5xl font-black text-blue-900 leading-tight">شريكك الموثوق للنمو والتوسع</h2>
              <p className="text-base lg:text-lg text-slate-600 leading-relaxed">
                تأسست Express Service لتكون الذراع اللوجستي الأقوى للشركات. نحن نجمع بين الخبرة البشرية والتقنية الحديثة لنقدم حلولاً تتجاوز مجرد النقل والتخزين. نحن نبني جسوراً من الثقة بينك وبين عملائك.
              </p>

              <div className="space-y-4 pt-4 text-right">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1"><Building2 size={24} /></div>
                  <div>
                    <h4 className="font-bold text-lg">بنية تحتية متكاملة</h4>
                    <p className="text-slate-500">مستودعات مجهزة ومراكز فرز آلية.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-orange-100 p-2 rounded-lg text-orange-600 mt-1"><Users size={24} /></div>
                  <div>
                    <h4 className="font-bold text-lg">فريق خبراء</h4>
                    <p className="text-slate-500">كوادر مدربة لإدارة أصعب التحديات اللوجستية.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Company Overview Section (Replaces Services) */}
      <section id="services" className="py-24 bg-slate-50 relative">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-16 reveal-on-scroll">
            <span className="text-orange-600 font-bold tracking-wider">لماذا نحن؟</span>
            <h2 className="text-4xl lg:text-5xl font-black text-blue-900 mt-2">محرك أعمالك اللوجستي</h2>
            <p className="text-slate-600 mt-4 text-lg">نقدم منظومة عمل متكاملة تجمع بين التقنية، الأصول، والكوادر البشرية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* 1. Tech Core (Large - Left) */}
            <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 lg:p-10 relative overflow-hidden group reveal-on-scroll text-white flex flex-col justify-between shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/10 text-blue-300">
                  <Zap size={32} />
                </div>
                <h3 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">تقنية تقود <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">المستقبل</span></h3>
                <p className="text-blue-100/80 text-lg leading-relaxed max-w-md">
                  نمتلك منصة تقنية خاصة تربط كافة أطراف العملية اللوجستية في الوقت الفعلي. لوحة تحكم ذكية، تتبع مباشر، وتحليلات أداء دقيقة.
                </p>
              </div>

              <div className="mt-8 relative h-[300px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 bg-slate-900/50 z-10"></div>
                {/* Abstract UI representation */}
                <div className="absolute inset-4 bg-slate-950/90 backdrop-blur-md rounded-xl p-4 flex flex-col gap-3 font-mono text-xs overflow-hidden border border-white/10 shadow-inner">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] animate-pulse"></span>
                      <span className="text-white font-bold uppercase tracking-wider text-[10px]">Live Operations</span>
                    </div>
                    <span className="text-blue-200 font-medium">14:02:35</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-500/20 rounded-lg p-2 border border-blue-400/30">
                      <div className="text-blue-100 text-[10px] font-medium">Active Riders</div>
                      <div className="text-xl font-black text-white">1,245</div>
                    </div>
                    <div className="bg-orange-500/20 rounded-lg p-2 border border-orange-400/30">
                      <div className="text-orange-100 text-[10px] font-medium">Pending Orders</div>
                      <div className="text-xl font-black text-white">85</div>
                    </div>
                  </div>

                  <div className="space-y-2 mt-1">
                    {[
                      { id: "#8291", status: "Delivered", loc: "Al-Rawdah", time: "2m ago" },
                      { id: "#8292", status: "In Transit", loc: "Al-Safa", time: "5m ago" },
                      { id: "#8293", status: "Pickup", loc: "Al-Naseem", time: "8m ago" },
                    ].map((order, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] text-white bg-white/10 p-2 rounded hover:bg-white/20 transition-colors cursor-default">
                        <span className="font-bold text-blue-300">{order.id}</span>
                        <span className="text-slate-200">{order.loc}</span>
                        <span className={`font-bold ${order.status === "Delivered" ? "text-green-400" : "text-orange-400"}`}>{order.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl reveal-on-scroll relative overflow-hidden group hover:bg-slate-50 transition-colors">
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl group-hover:bg-orange-200 transition-colors"></div>

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                    <Truck size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">أسطولنا الضخم</h3>
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                    500+ مركبة مملوكة بالكامل. من الدراجات النارية وحتى الشاحنات المبردة، جاهزة لخدمتكم.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-xl reveal-on-scroll relative overflow-hidden group hover:bg-slate-50 transition-colors">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">الوقود الذكي</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    شراكة استراتيجية مع <span className="font-bold text-blue-700">الدريس</span> لتوفير نظام تعبئة وقود ذكي ومراقبة الاستهلاك رقمياً.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-1 bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 border border-blue-100 shadow-xl reveal-on-scroll hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded-full uppercase">Active</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">تغطية جغرافية</h3>
              <p className="text-slate-500 text-xs">نصل إلى كل حي وشارع في مدينة جدة والمناطق المحيطة.</p>
            </div>

            <div className="md:col-span-1 bg-slate-900 text-white rounded-3xl p-6 shadow-xl reveal-on-scroll relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur text-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <h3 className="text-xl font-black mb-2">مستودعات </h3>
                <p className="text-slate-400 text-xs line-clamp-3">
                  مساحات تخزين آمنة تدار بأنظمة العالمية لضمان دقة المخزون وسرعة التحضير.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="process" className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-orange-500 rounded-full opacity-5 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-blue-600 rounded-full opacity-5 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16 reveal-on-scroll">
            <h2 className="text-4xl lg:text-5xl font-black mb-4">منظومة دعم متكاملة</h2>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              لا نكتفي بتعيين المهام، بل نبني بيئة عمل شاملة. نتولى عنك كافة التفاصيل التشغيلية واللوجستية لتتفرغ للإنتاج.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 lg:gap-8 relative mb-20">
            <div className="hidden md:block absolute top-14 left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-600 via-orange-500 to-blue-600 -z-10 rounded-full opacity-30"></div>

            {[
              {
                icon: <Truck />,
                title: "أسطول حديث",
                desc: "دراجات نارية جديدة ومجهزة بالكامل للعمل الشاق",
                color: "blue"
              },
              {
                icon: <Zap />,
                title: "وقود وصيانة",
                desc: "شراكة مع الدريس لتوفير الوقود والصيانة الدورية",
                color: "orange"
              },
              {
                icon: <Building2 />,
                title: "سكن وإعاشة",
                desc: "مجمعات سكنية مريحة مع خدمات إعاشة متكاملة",
                color: "blue"
              },
              {
                icon: <ShieldCheck />,
                title: "أمان وحماية",
                desc: "تأمين طبي شامل وتغطية ضد الحوادث والأعطال",
                color: "green"
              },
              {
                icon: <UserCheck />,
                title: "إدارة شاملة",
                desc: "إصدار الرخص، الإقامات، وكافة الإجراءات الحكومية",
                color: "blue"
              }
            ].map((step, idx) => (
              <div key={idx} className="relative text-center reveal-on-scroll" style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className={`w-24 h-24 lg:w-28 lg:h-28 mx-auto bg-gradient-to-br ${step.color === 'orange' ? 'from-orange-500 to-orange-600' :
                  step.color === 'green' ? 'from-green-500 to-green-600' :
                    'from-blue-700 to-blue-800'
                  } rounded-2xl rotate-3 flex items-center justify-center border-4 border-white/10 mb-6 shadow-2xl relative z-10 group hover:rotate-0 hover:scale-110 transition-all duration-300`}>
                  <div className="text-white transform -rotate-3 group-hover:rotate-0 transition-transform">
                    {React.cloneElement(step.icon, { size: 36 })}
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-slate-700">
                    {idx + 1}
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 hover:bg-white/10 transition-all min-h-[140px] flex flex-col justify-center">
                  <h3 className="text-lg lg:text-xl font-bold mb-2 text-white">{step.title}</h3>
                  <p className="text-blue-200 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-gradient-to-br from-blue-950 to-blue-900 p-8 rounded-3xl border border-white/10 relative overflow-hidden group reveal-on-scroll">
              <div className="absolute top-0 right-0 p-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/30 transition-all"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-right">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/40">
                  <Search className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">إدارة العمليات الميدانية</h3>
                  <p className="text-blue-200 leading-relaxed mb-4">
                    نظام تقني متطور لمتابعة حالة الأسطول، مواقع السائقين، وجدولة الصيانات بشكل آلي لضمان استمرارية العمل دون توقف.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {["تتبع GPS مباشر", "أتمتة الصيانة", "دعم فني 24/7"].map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-800/50 rounded-lg text-xs text-blue-200 border border-blue-700/50">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-950 to-orange-900 p-8 rounded-3xl border border-white/10 relative overflow-hidden group reveal-on-scroll" style={{ transitionDelay: '200ms' }}>
              <div className="absolute top-0 right-0 p-32 bg-orange-600/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-600/30 transition-all"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-right">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-600/40">
                  <Building2 className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">الرعاية والسكن</h3>
                  <p className="text-orange-200 leading-relaxed mb-4">
                    نؤمن بأن راحة الكابتن هي أساس كفاءته. لذلك نوفر مساكن مؤثثة بالكامل مع خدمات النظافة والإعاشة، بالإضافة لبرامج ترفيهية.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {["سكن مفروش", "خدمات غسيل", "وجبات يومية"].map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-800/50 rounded-lg text-xs text-orange-200 border border-orange-700/50">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="partners" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-50/80 blur-3xl mix-blend-multiply"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-orange-50/80 blur-3xl mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-20 reveal-on-scroll">
            <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-orange-600 font-bold text-xs tracking-widest uppercase mb-4 shadow-sm border border-orange-200">
              Trusted by Leaders
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
              نحن المحرك الخفي <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-900">لأكبر العلامات التجارية</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-100 -z-0 rounded-full opacity-60"></span>
              </span>
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              شراكات استراتيجية مبنية على الثقة والأداء العالي. نساهم يومياً في نجاح آلاف الطلبات لشركائنا المميزين.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { name: "Hunger Station", color: "from-yellow-400 to-amber-500", shadow: "shadow-amber-300/20", icon: "🍔", stats: "2K+ طلب يومياً" },
              { name: "Keta", color: "from-red-500 to-red-600", shadow: "shadow-red-300/20", icon: "🍱", stats: "تغطية شاملة" },
              { name: "Amazon", color: "from-slate-700 to-slate-900", shadow: "shadow-slate-400/20", icon: "🛒", stats: "شريك لوجستي" },
              { name: "Ninja", color: "from-green-500 to-emerald-600", shadow: "shadow-green-300/20", icon: "🥷", stats: "توصيل سريع" },
            ].map((partner, idx) => (
              <div key={idx} className="group relative bg-white rounded-[2rem] p-6 text-center hover:-translate-y-2 transition-all duration-500 hover:shadow-xl border border-slate-100 reveal-on-scroll" style={{ transitionDelay: `${idx * 100}ms` }}>
                <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-br ${partner.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>

                <div className="relative z-10 bg-white rounded-[1.5rem] p-6 h-full flex flex-col items-center justify-center gap-4 border border-slate-50 shadow-sm group-hover:border-transparent transition-colors">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${partner.color} flex items-center justify-center text-4xl shadow-lg ${partner.shadow} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <span className="filter drop-shadow-md">{partner.icon}</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-900 transition-colors mb-1">{partner.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-orange-500 transition-colors">
                      <CheckCircle size={12} className="text-green-500" />
                      <span>{partner.stats}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-slate-100 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-slate-600 text-sm">عقود موثقة</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-slate-600 text-sm">دعم مخصص 24/7</span>
            </div>
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-slate-600 text-sm">تقارير أداء شهرية</span>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 lg:py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden grid lg:grid-cols-2">
            <div className="p-8 lg:p-16 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
              <span className="text-orange-400 font-bold tracking-wider mb-2 block">تواصل معنا</span>
              <h2 className="text-3xl lg:text-4xl font-black mb-6">لنبدأ العمل معاً</h2>
              <p className="text-blue-100 mb-8 lg:mb-12 text-sm lg:text-base">فريقنا جاهز للإجابة على استفساراتك وتقديم الحلول الأنسب لأعمالك.</p>

              <div className="space-y-6 lg:space-y-8">
                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Phone className="text-orange-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base lg:text-lg">اتصل بنا</h4>
                    <p className="text-blue-200 text-base lg:text-lg" dir="ltr">+966 50 000 0000</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Mail className="text-orange-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base lg:text-lg">راسلنا</h4>
                    <p className="text-blue-200 text-base lg:text-lg">info@expressservice.sa</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 lg:gap-6">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <MapPin className="text-orange-400" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base lg:text-lg">زرنا</h4>
                    <p className="text-blue-200 text-sm lg:text-base">طريق الملك فهد، الرياض، المملكة العربية السعودية</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 lg:mt-16 pt-8 border-t border-white/10">
                <p className="text-xs lg:text-sm text-blue-300">ساعات العمل: الأحد - الخميس 8:00 ص - 6:00 م</p>
              </div>
            </div>

            <div className="p-8 lg:p-16 bg-white">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">الاسم الكامل</label>
                    <input type="text" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">البريد الإلكتروني</label>
                    <input type="email" className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الموضوع</label>
                  <select className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all">
                    <option>استفسار عام</option>
                    <option>طلب عرض سعر</option>
                    <option>خدمات النقل</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">الرسالة</label>
                  <textarea rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all"></textarea>
                </div>
                <button type="button" className="w-full h-14 bg-blue-900 text-white rounded-xl font-bold text-lg hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1">
                  إرسال الرسالة
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-12 lg:py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/2.png" alt="ES Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-xl font-black text-white">Express Service</span>
            </div>
            <p className="leading-relaxed mb-6 text-sm">
              نحن نقود التحول في قطاع الخدمات اللوجستية من خلال تبني تقنيات المستقبل ومعايير الجودة العالمية.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Globe size={18} /></div>
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"><Mail size={18} /></div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">خدماتنا</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-orange-500 transition-colors">النقل البري</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">التجارة الإلكترونية</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">الميل الأخير</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">الشركة</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-orange-500 transition-colors">من نحن</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">الوظائف</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">الأخبار</a></li>
              <li><a href="#" className="hover:text-orange-500 transition-colors">سياسة الخصوصية</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">النشرة البريدية</h4>
            <p className="text-sm mb-4">اشترك ليصلك كل جديد في عالم اللوجستيات</p>
            <div className="flex gap-2">
              <input type="email" placeholder="بريدك الإلكتروني" className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 w-full focus:outline-none focus:border-blue-600" />
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 transition-colors">
                <ArrowLeft size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-900 text-center text-sm">
          جميع الحقوق محفوظة © 2025 Express Service
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 5s ease-in-out infinite 1s; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>

    </div>
  );
}

function CheckCircle(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}