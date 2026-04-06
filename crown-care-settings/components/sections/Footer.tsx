// components/sections/Footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

interface Props {
  settings?: Record<string, string>;
}

export default function Footer({ settings = {} }: Props) {
  const year = new Date().getFullYear();
  const phone    = settings['company_phone']   || '(555) 123-4567';
  const email    = settings['company_email']   || 'info@crowncare.com';
  const address  = settings['company_address'] || 'Nationwide, United States';
  const facebook = settings['social_facebook']  || '#';
  const instagram= settings['social_instagram'] || '#';
  const twitter  = settings['social_twitter']   || '#';
  const copyright= settings['copyright_text']   || `© ${year} Crown Care Services. All rights reserved.`;

  return (
    <footer className="bg-navy-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logo-light.png"
                alt="Crown Care Services"
                width={400}
                height={124}
                className="h-28 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed font-body mb-6">
              Professional upholstery cleaning services that restore your furniture to its original beauty.
              Safe, effective, guaranteed.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { Icon: FiFacebook,  href: facebook,  label: 'Facebook' },
                { Icon: FiInstagram, href: instagram, label: 'Instagram' },
                { Icon: FiTwitter,   href: twitter,   label: 'Twitter' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href || '#'}
                  target={href && href !== '#' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gold-500/20 hover:text-gold-400 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4 text-gold-400">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                'Sofa Deep Cleaning',
                'Chair & Armchair Cleaning',
                'Mattress Sanitization',
                'Area Rug Cleaning',
                'Car Upholstery',
                'Office Furniture',
              ].map((s) => (
                <li key={s}>
                  <Link href="#services" className="text-white/50 hover:text-gold-400 transition-colors font-body">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4 text-gold-400">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '#about',        label: 'About Us' },
                { href: '#portfolio',    label: 'Portfolio' },
                { href: '#testimonials', label: 'Reviews' },
                { href: '#contact',      label: 'Contact' },
                { href: '/admin/login',  label: 'Admin' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-white/50 hover:text-gold-400 transition-colors font-body">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4 text-gold-400">Contact</h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <FiPhone className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <a href={`tel:${phone.replace(/\D/g, '')}`} className="text-white/50 hover:text-white transition-colors font-body">
                  {phone}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <FiMail className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <a href={`mailto:${email}`} className="text-white/50 hover:text-white transition-colors font-body">
                  {email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <span className="text-white/50 font-body">{address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/30 font-body">
          <p>{copyright}</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
